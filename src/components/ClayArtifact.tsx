"use client";

import { useState } from "react";
import claySnapshot from "@/data/clay-snapshot.json";

type ArtifactStageId = "scout" | "rank" | "draft" | "activate";

interface ArtifactStage {
  readonly id: ArtifactStageId;
  readonly label: string;
  readonly verb: string;
}

const stages: readonly ArtifactStage[] = [
  { id: "scout", label: "01", verb: "Scout" },
  { id: "rank", label: "02", verb: "Rank" },
  { id: "draft", label: "03", verb: "Draft" },
  { id: "activate", label: "04", verb: "Activate" },
] as const;

const researchSignals = [
  ["Tool surface", "How much internal infrastructure is already in place?", "0–4 pts"],
  ["Technical density", "Can this team build and operate its own agents?", "0 / 2 / 4 pts"],
  ["Incumbent lock-in", "Has Microsoft Copilot or Glean already won the layer?", "+2 if absent"],
  ["AI build risk", "Is the team actively building an internal agent platform?", "0 to −3 pts"],
] as const;

const executionSteps = [
  ["10", "Build-Risk accounts", "The highest-ranked accounts in the segment"],
  ["7", "Verified contacts", "One engineering or platform lead per account"],
  ["7", "Emails scheduled", "Personalized copy sent from a personal Gmail"],
  ["↺", "Reply loop", "Gmail → Zapier → Clay, with no manual logging"],
] as const;

const segmentDefinitions: Readonly<Record<string, string>> = {
  "Build-Risk": "No incumbent, but clear evidence of active internal AI building",
  Greenfield: "No incumbent and no strong signal that the company will build its own platform",
  Displacement: "Microsoft Copilot or Glean is already in place",
};

const maxSegmentCount = Math.max(
  ...claySnapshot.segments.map((segment) => segment.count),
);
const maxScoreCount = Math.max(
  ...claySnapshot.scoreDistribution.map((bucket) => bucket.count),
);

/** Renders an anonymized, interactive artifact generated from Shihua's Clay table. */
export function ClayArtifact() {
  const [activeStage, setActiveStage] = useState<ArtifactStageId>("scout");

  return (
    <div className="clay-artifact">
      <header className="artifact-header">
        <div>
          <p className="artifact-overline">API-generated artifact / GTM Draft Board</p>
          <h3>How 897 accounts became one deliberate outbound motion.</h3>
        </div>
        <div className="artifact-source">
          <span>Clay API source</span>
          <strong>{claySnapshot.source.tableName}</strong>
          <small>{claySnapshot.source.totalAccounts} accounts</small>
        </div>
      </header>

      <div className="artifact-stage-picker" role="group" aria-label="Explore the Clay workflow">
        {stages.map((stage) => (
          <button
            className={activeStage === stage.id ? "is-active" : ""}
            key={stage.id}
            type="button"
            onClick={() => setActiveStage(stage.id)}
            aria-pressed={activeStage === stage.id}
            aria-controls="artifact-stage-panel"
          >
            <span>{stage.label}</span>
            <strong>{stage.verb}</strong>
          </button>
        ))}
      </div>

      <div className="artifact-panel" id="artifact-stage-panel" aria-live="polite">
        {activeStage === "scout" ? (
          <div className="artifact-scout">
            <div className="artifact-scoreline">
              <div><strong>{claySnapshot.source.totalAccounts}</strong><span>accounts sourced</span></div>
              <span aria-hidden="true">→</span>
              <div><strong>4</strong><span>research lenses</span></div>
              <span aria-hidden="true">→</span>
              <div><strong>3</strong><span>buyer segments</span></div>
            </div>
            <ol className="signal-grid">
              {researchSignals.map(([name, question, scoring], index) => (
                <li key={name}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{name}</strong>
                  <p>{question}</p>
                  <small>{scoring}</small>
                </li>
              ))}
            </ol>
            <p className="artifact-callout">
              Each lens was researched by Claygent against public evidence.
            </p>
          </div>
        ) : null}

        {activeStage === "rank" ? (
          <div className="artifact-rank">
            <div className="ranking-copy">
              <p className="artifact-panel-label">Weighted scoring model</p>
              <h4>Who is ready to buy—and who is more likely to build?</h4>
              <p>
                Companies scored higher when they already had the tools and technical team to adopt AI,
                and when no competing platform was in place. They scored lower when the evidence suggested
                they were likely to build the whole system themselves.
              </p>
              <p>
                This ranking uses the {claySnapshot.classifiedAccounts} accounts that passed the ICP gates and
                completed all four research lenses. I held {claySnapshot.heldOutBeforeResearch} out before paid
                enrichment because they were outside the U.S. or below the company-size floor; another
                {` ${claySnapshot.missingResearchInputs} `}lacked a domain.
              </p>
              <div className="top-tier-stat">
                <strong>{claySnapshot.topTierAccounts}</strong>
                <span>accounts scored 8–10</span>
              </div>
            </div>
            <div className="score-chart" aria-label="Segmented account count by score from zero to ten">
              <ol>
                {[...claySnapshot.scoreDistribution].reverse().map((bucket) => (
                  <li key={bucket.score}>
                    <span className="score-count tabular">{bucket.count}</span>
                    <span className="score-track" aria-hidden="true">
                      <span style={{ height: `${Math.max(4, (bucket.count / maxScoreCount) * 100)}%` }} />
                    </span>
                    <strong className="tabular">{bucket.score}</strong>
                  </li>
                ))}
              </ol>
              <p>{claySnapshot.classifiedAccounts} accounts across 3 segments / score →</p>
            </div>
          </div>
        ) : null}

        {activeStage === "draft" ? (
          <div className="artifact-draft">
            <div className="segment-chart">
              <p className="artifact-panel-label">Market map / 3 segments</p>
              <p className="segment-rationale">
                I grouped accounts by the sales conversation each one required. An existing competitor meant
                Displacement. Without one, active internal AI work meant Build-Risk; otherwise the account was
                Greenfield. This made each segment actionable instead of merely descriptive.
              </p>
              <div className="segment-formula" aria-label="Segmentation formula">
                <p>Routing formula</p>
                <dl>
                  <div>
                    <dt>Incumbent found</dt>
                    <dd>Displacement</dd>
                  </div>
                  <div>
                    <dt>No incumbent + high build risk</dt>
                    <dd>Build-Risk</dd>
                  </div>
                  <div>
                    <dt>No incumbent + medium or low build risk</dt>
                    <dd>Greenfield</dd>
                  </div>
                </dl>
              </div>
              <ol>
                {claySnapshot.segments.map((segment) => (
                  <li key={segment.label}>
                    <div>
                      <span><strong>{segment.label}</strong><small>{segmentDefinitions[segment.label]}</small></span>
                      <strong className="tabular">{segment.count}</strong>
                    </div>
                    <span className="segment-track" aria-hidden="true">
                      <span style={{ width: `${(segment.count / maxSegmentCount) * 100}%` }} />
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <aside className="draft-card">
              <span className="draft-card-label">Initial board</span>
              <strong className="tabular">{claySnapshot.initialCohortSize}</strong>
              <p>accounts shortlisted: the 10 highest-ranked from each segment.</p>
              <ul>
                {claySnapshot.initialCohorts.map((cohort) => (
                  <li key={cohort.label}><span>{cohort.label}</span><strong>{cohort.count}</strong></li>
                ))}
              </ul>
            </aside>
          </div>
        ) : null}

        {activeStage === "activate" ? (
          <div className="artifact-activate">
            <div className="activation-heading">
              <p className="artifact-panel-label">Documented execution handoff</p>
              <h4>The table became a closed-loop send—not a spreadsheet graveyard.</h4>
            </div>
            <ol className="activation-flow">
              {executionSteps.map(([metric, name, detail]) => (
                <li key={name}>
                  <strong>{metric}</strong>
                  <div><span>{name}</span><small>{detail}</small></div>
                </li>
              ))}
            </ol>
            <div className="artifact-decision">
              <span>Operator adjustment</span>
              <p>Switched from LinkedIn to Apollo email when channel constraints changed, while keeping the voice direct, curious, and engineer-to-engineer.</p>
            </div>
          </div>
        ) : null}
      </div>

    </div>
  );
}
