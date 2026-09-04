import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const TABLE_ID = "t_0tkcwr9xPETdEqgSUfe";
const SEGMENT_FIELD_ID = "f_0tkgn5jaykvV7H4wZvC";

function runClay(args) {
  const output = execFileSync("clay", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  });

  return JSON.parse(output);
}

const table = runClay(["tables", "get", TABLE_ID]);
const segmentResult = runClay([
  "tables",
  "query-live",
  TABLE_ID,
  "--name",
  "portfolio-segment-counts",
  "--query",
  "SELECT {{Segment}}, COUNT(*) AS account_count GROUP BY {{Segment}} ORDER BY account_count DESC LIMIT 20",
]);

const scoreResult = runClay([
  "tables",
  "query-live",
  TABLE_ID,
  "--name",
  "portfolio-classified-score-distribution",
  "--query",
  "SELECT {{Score}} AS score, COUNT(*) AS account_count WHERE {{Segment}} != 'Unassigned - no lock-in data' GROUP BY score ORDER BY score DESC LIMIT 30",
]);

const cohortResult = runClay([
  "tables",
  "query-live",
  TABLE_ID,
  "--name",
  "portfolio-initial-cohort",
  "--query",
  "SELECT {{First 10}} AS cohort, COUNT(*) AS account_count GROUP BY cohort ORDER BY account_count DESC LIMIT 10",
]);
const unsegmentedGateResult = runClay([
  "tables",
  "query-live",
  TABLE_ID,
  "--name",
  "portfolio-unsegmented-gates",
  "--query",
  "SELECT {{Geo Disqualifier}}, {{Size Disqualifier}}, COUNT(*) WHERE {{Segment}} = 'Unassigned - no lock-in data' GROUP BY {{Geo Disqualifier}}, {{Size Disqualifier}}",
]);

function normalizeSegmentLabel(label) {
  if (label?.toLowerCase() === "build-risk") return "Build-Risk";
  return label;
}

const allSegmentResults = segmentResult.results.map((row) => ({
  label: normalizeSegmentLabel(row[SEGMENT_FIELD_ID] ?? "Research pending"),
  count: Number(row.account_count),
}));

const unsegmentedGateCounts = unsegmentedGateResult.results.map((row) => ({
  geoGate: row.f_0tkcxl8WPGVWe7jGPvD,
  sizeGate: row.f_0tkcyq2zC9U5KUftwWb,
  count: Number(row.count),
}));

const heldOutBeforeResearch = unsegmentedGateCounts
  .filter((group) => group.geoGate !== "Pass" || group.sizeGate !== "Pass")
  .reduce((total, group) => total + group.count, 0);

const missingResearchInputs = unsegmentedGateCounts
  .filter((group) => group.geoGate === "Pass" && group.sizeGate === "Pass")
  .reduce((total, group) => total + group.count, 0);

const segments = allSegmentResults.filter(
  (segment) => !segment.label.toLowerCase().startsWith("unassigned"),
);

const scoreDistribution = scoreResult.results.map((row) => ({
  score: Number(row.score),
  count: Number(row.account_count),
}));

const initialCohorts = cohortResult.results
  .filter((row) => row.cohort !== null)
  .map((row) => ({
    label: normalizeSegmentLabel(row.cohort),
    count: Number(row.account_count),
  }));

const classifiedAccounts = segments.reduce(
  (total, segment) => total + segment.count,
  0,
);

const topTierAccounts = scoreDistribution
  .filter((bucket) => bucket.score >= 8)
  .reduce((total, bucket) => total + bucket.count, 0);

const snapshot = {
  generatedAt: new Date().toISOString(),
  source: {
    tableId: TABLE_ID,
    tableName: table.name,
    totalAccounts: table.rowCount,
  },
  classifiedAccounts,
  heldOutBeforeResearch,
  missingResearchInputs,
  topTierAccounts,
  segments,
  scoreDistribution,
  initialCohorts,
  initialCohortSize: initialCohorts.reduce(
    (total, cohort) => total + cohort.count,
    0,
  ),
};

writeFileSync(
  resolve("src/data/clay-snapshot.json"),
  `${JSON.stringify(snapshot, null, 2)}\n`,
  "utf8",
);

console.log(
  `Wrote anonymized Clay snapshot: ${snapshot.source.totalAccounts} accounts, ${snapshot.classifiedAccounts} classified.`,
);
