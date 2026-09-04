"use client";

import { useState } from "react";
import { ClayArtifact } from "@/components/ClayArtifact";
import { ShotGame, type ShotId } from "@/components/ShotGame";

const projects = [
  {
    id: "clay",
    number: "01",
    type: "GTM system",
    title: "An End-to-End Prospecting Engine",
    summary:
      "A Clay AlphaForge build that moves from prospect definition to enriched, personalized outbound email in one operating system.",
    tags: ["Clay", "Prospecting", "Enrichment", "Email"],
    href: "#clay-case-study",
    cta: "Read the build",
  },
  {
    id: "sealed",
    number: "02",
    type: "Vibe-coded app",
    title: "Sealed",
    summary:
      "A friendly-betting app that lets two people lock equal stakes in a Solana vault and automatically pays the winner.",
    tags: ["Consumer app", "Solana", "Product", "Shipped"],
    href: "https://sealed-steel.vercel.app/",
    cta: "Open live app",
  },
  {
    id: "solana-agents",
    number: "03",
    type: "Vibe-coded app",
    title: "Solana Trading Agents",
    summary:
      "I adapted an equity-diligence agent fleet for Solana: specialist analysts evaluate market, social, news, fundamentals, and on-chain signals before debate and risk agents produce a buy, hold, or sell recommendation.",
    tags: ["LangGraph", "Solana", "Helius", "Multi-agent"],
    href: "https://github.com/shihuawu/solana-trading-agents",
    cta: "Inspect the code",
  },
] as const;

const operatingSystem = [
  ["01", "Find leverage", "Start with the bottleneck that changes the commercial outcome."],
  ["02", "Structure signals", "Turn scattered context into inputs an agent can reliably use."],
  ["03", "Design the system", "Connect models, tools, people, and guardrails into one workflow."],
  ["04", "Ship to production", "Move past the demo and put the system into the operating rhythm."],
  ["05", "Run the feedback loop", "Measure what happened, diagnose misses, and improve the play."],
] as const;

/** Renders Shihua Wu's single-page portfolio. */
export default function HomePage() {
  const [unlocked, setUnlocked] = useState<ReadonlySet<ShotId>>(new Set());

  function unlockProject(id: ShotId) {
    setUnlocked((current) => new Set(current).add(id));
  }

  return (
    <main>
      <a className="skip-link" href="#work">
        Skip to selected work
      </a>

      <header className="site-header page-shell">
        <a className="brand" href="#top" aria-label="Shihua Wu, home">
          <span className="brand-mark">SW</span>
          <span className="brand-role">AI-Native Operator</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#work">Work</a>
          <a href="#operating-system">Approach</a>
          <a href="#about">About</a>
        </nav>
      </header>

      <section className="hero page-shell" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span aria-hidden="true" /> Builder / operator / systems thinker</p>
          <h1>I build the first GTM engine—and the agents that run it.</h1>
          <p className="hero-deck">
            I&apos;m Shihua Wu, an AI-Native Operator who builds and operates
            production agent systems for companies standing up their first real
            go-to-market engine.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#shot-chart">Play to unlock the work</a>
            <a className="button button-secondary" href="#operating-system">See how I operate</a>
          </div>
        </div>

        <aside className="hero-report" aria-label="Operator scouting report">
          <div className="report-heading">
            <span>Scouting report</span>
            <span>2026</span>
          </div>
          <dl>
            <div><dt>Position</dt><dd>AI-Native Operator</dd></div>
            <div><dt>Specialty</dt><dd>Production agent systems</dd></div>
            <div><dt>Best stage</dt><dd>First real GTM engine</dd></div>
            <div><dt>Operating mode</dt><dd>Builder + operator</dd></div>
          </dl>
          <div className="report-footer">Strategy that ships. Systems that learn.</div>
        </aside>
      </section>

      <section className="shot-section" id="shot-chart">
        <div className="page-shell section-heading split-heading">
          <div>
            <p className="section-kicker">The shot chart</p>
            <h2>Three shots. Three real builds.</h2>
          </div>
          <p>
            Stop the meter in the orange window. Every make unlocks that
            project&apos;s story and link; misses reveal how I operate agent systems.
          </p>
        </div>
        <ShotGame unlocked={unlocked} onUnlock={unlockProject} />
      </section>

      <section className="work page-shell" id="work">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Selected work</p>
            <h2>Not a tool list. The systems I shipped.</h2>
          </div>
        </div>

        <div className="project-list">
          {projects.map((project) => {
            const isUnlocked = unlocked.has(project.id);

            return (
            <article
              className={`project-card ${isUnlocked ? "is-unlocked" : "is-locked"}`}
              id={`project-${project.id}`}
              key={project.id}
            >
              <div className="project-index">
                <span>{project.number}</span>
                <span>{project.type}</span>
              </div>
              <div className="project-body">
                <h3>{project.title}</h3>
                {isUnlocked ? (
                  <>
                    <p>{project.summary}</p>
                    <ul className="tag-list" aria-label={`${project.title} technologies`}>
                      {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
                    </ul>
                  </>
                ) : (
                  <div className="locked-copy">
                    <span aria-hidden="true">●</span>
                    <p>Locked. Make its shot above to reveal the build.</p>
                  </div>
                )}
              </div>
              {isUnlocked ? (
                <a
                  className="project-link"
                  href={project.href}
                  target={project.href.startsWith("http") ? "_blank" : undefined}
                  rel={project.href.startsWith("http") ? "noreferrer" : undefined}
                >
                  {project.cta}<span aria-hidden="true">↗</span>
                </a>
              ) : (
                <a className="project-link is-locked" href="#shot-chart">
                  Return to the court<span aria-hidden="true">↑</span>
                </a>
              )}
            </article>
          )})}
        </div>
      </section>

      {unlocked.has("clay") ? (
      <section className="clay-section page-shell" id="clay-case-study">
        <div className="case-study-header">
          <p className="section-kicker">Build 01 / Clay</p>
          <h2>From 897 accounts to one deliberate outbound motion.</h2>
          <p>
            Built during <a href="https://alpha-forge-clay.vercel.app/" target="_blank" rel="noreferrer">Clay AlphaForge</a> for
            a prospecting brief centered on <a href="https://dust.tt/" target="_blank" rel="noreferrer">Dust</a>,
            an enterprise platform for building AI agents grounded in company knowledge and connected to workplace tools.
          </p>
        </div>

        <ClayArtifact />
      </section>
      ) : null}

      <section className="operating-system" id="operating-system">
        <div className="page-shell operating-grid">
          <div className="operating-intro">
            <p className="section-kicker">My starting five</p>
            <h2>The operating loop I bring to a first GTM engine.</h2>
            <p>
              AI-native doesn&apos;t mean automating everything. It means designing
              the right division of labor between models, software, and operators.
            </p>
          </div>
          <ol className="operating-list">
            {operatingSystem.map(([number, title, description]) => (
              <li key={number}>
                <span>{number}</span>
                <div><h3>{title}</h3><p>{description}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="about page-shell" id="about">
        <p className="section-kicker">About the operator</p>
        <div className="about-grid">
          <h2>I&apos;m interested in the point where a promising AI demo becomes a system a team can actually run.</h2>
          <div>
            <p>
              My work sits between go-to-market strategy, growth operations, and
              applied AI. I translate a commercial problem into an agent workflow,
              put it into production, and stay close enough to the output to make
              the next version better.
            </p>
            <p>
              Basketball is the design language here because it matches how I
              work: read the floor, create the opening, take the shot, and learn
              from the result.
            </p>
            <a className="text-link" href="https://github.com/shihuawu" target="_blank" rel="noreferrer">
              Find me on GitHub <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </section>

      <footer className="site-footer page-shell">
        <span>Shihua Wu</span>
        <span>Built with Codex. Operated by a human.</span>
        <a href="#top">Back to top ↑</a>
      </footer>
    </main>
  );
}
