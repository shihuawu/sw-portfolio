"use client";

import { useEffect, useRef, useState } from "react";

export type ShotId = "clay" | "sealed" | "solana-agents";

interface ShotGameProps {
  readonly unlocked: ReadonlySet<ShotId>;
  readonly onUnlock: (id: ShotId) => void;
}

interface Shot {
  readonly id: ShotId;
  readonly label: string;
  readonly project: string;
  readonly targetMin: number;
  readonly targetMax: number;
  readonly x: string;
  readonly y: string;
}

const shots: readonly Shot[] = [
  { id: "clay", label: "Layup", project: "Clay prospecting engine", targetMin: 34, targetMax: 72, x: "50%", y: "22%" },
  { id: "sealed", label: "Mid-range", project: "Sealed", targetMin: 44, targetMax: 67, x: "25%", y: "51%" },
  { id: "solana-agents", label: "Three", project: "Solana Trading Agents", targetMin: 52, targetMax: 64, x: "77%", y: "73%" },
] as const;

const missInsights = [
  "A production agent needs guardrails, observability, and a clear human owner—not just a clever prompt.",
  "The fastest workflow is not always the best one. Quality has to survive the handoff to the next step.",
  "A miss is useful when the system makes it visible enough to diagnose and improve.",
] as const;

/** Runs the optional shot-meter interaction and reveals portfolio projects. */
export function ShotGame({ unlocked, onUnlock }: ShotGameProps) {
  const [selectedId, setSelectedId] = useState<ShotId>("clay");
  const [power, setPower] = useState(12);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isShooting, setIsShooting] = useState(false);
  const [assistMode, setAssistMode] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [message, setMessage] = useState("Choose a spot, then stop the meter in the orange window.");
  const resultTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedShot = shots.find((shot) => shot.id === selectedId) ?? shots[0];

  useEffect(() => {
    if (isShooting) return;

    const meterTimer = window.setInterval(() => {
      setPower((current) => {
        const next = current + direction * 2;
        if (next >= 100) {
          setDirection(-1);
          return 100;
        }
        if (next <= 0) {
          setDirection(1);
          return 0;
        }
        return next;
      });
    }, 28);

    return () => window.clearInterval(meterTimer);
  }, [direction, isShooting]);

  useEffect(() => () => {
    if (resultTimer.current) clearTimeout(resultTimer.current);
  }, []);

  function selectShot(id: ShotId) {
    if (isShooting) return;
    setSelectedId(id);
    const shot = shots.find((item) => item.id === id);
    if (shot) setMessage(`${shot.label} selected. Stop the meter in the orange window.`);
  }

  function takeShot() {
    if (isShooting) return;

    const made = assistMode || (power >= selectedShot.targetMin && power <= selectedShot.targetMax);
    const nextAttempt = attempts + 1;
    setAttempts(nextAttempt);
    setIsShooting(true);
    setMessage("Shot in the air…");

    resultTimer.current = setTimeout(() => {
      if (made) {
        onUnlock(selectedShot.id);
        setMessage(`Bucket. ${selectedShot.project} unlocked.`);
      } else {
        setMessage(`Off the rim. ${missInsights[(nextAttempt - 1) % missInsights.length]}`);
      }
      setIsShooting(false);
      setPower(12);
      setDirection(1);
    }, 620);
  }

  return (
    <div className="game-shell page-shell">
      <div className="court-panel">
        <div className="court" aria-label="Basketball half court with three selectable shot locations">
          <svg className="court-lines" viewBox="0 0 720 520" aria-hidden="true">
            <rect x="2" y="2" width="716" height="516" rx="4" />
            <path d="M190 2v180c0 115 76 190 170 190s170-75 170-190V2" />
            <rect x="250" y="2" width="220" height="196" />
            <circle cx="360" cy="198" r="78" />
            <path d="M306 35h108M360 35v42" />
            <circle cx="360" cy="84" r="25" />
          </svg>

          {shots.map((shot) => (
            <button
              className={`shot-spot ${selectedId === shot.id ? "is-selected" : ""} ${unlocked.has(shot.id) ? "is-unlocked" : ""}`}
              key={shot.id}
              style={{ left: shot.x, top: shot.y }}
              onClick={() => selectShot(shot.id)}
              aria-pressed={selectedId === shot.id}
            >
              <span className="shot-dot" aria-hidden="true">{unlocked.has(shot.id) ? "✓" : ""}</span>
              <span>{shot.label}</span>
            </button>
          ))}

          <div className={`game-ball ${isShooting ? "is-shooting" : ""}`} aria-hidden="true" />
        </div>
      </div>

      <div className="game-controls">
        <div className="scoreboard">
          <span>Projects unlocked</span>
          <strong className="tabular">{unlocked.size} / {shots.length}</strong>
        </div>

        <div className="shot-selection">
          <span className="control-label">Current shot</span>
          <strong>{selectedShot.label}</strong>
          <small>{selectedShot.project}</small>
        </div>

        <div className="power-control">
          <div className="meter-labels"><span>Power</span><span>Sweet spot</span></div>
          <div
            className="power-meter"
            role="progressbar"
            aria-label="Shot power"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={power}
          >
            <div
              className="target-zone"
              style={{ left: `${selectedShot.targetMin}%`, width: `${selectedShot.targetMax - selectedShot.targetMin}%` }}
            />
            <div className="meter-marker" style={{ transform: `scaleX(${power / 100})` }} />
          </div>
        </div>

        <button className="shoot-button" type="button" onClick={takeShot} disabled={isShooting}>
          {isShooting ? "Shot in the air…" : "Shoot"}
          <span aria-hidden="true">●</span>
        </button>

        <p className="game-message" aria-live="polite">{message}</p>

        <button
          className={`assist-toggle ${assistMode ? "is-active" : ""}`}
          type="button"
          onClick={() => {
            setAssistMode((current) => !current);
            setMessage(assistMode ? "Timing mode on." : "Assist mode on. Your next shot will count.");
          }}
          aria-pressed={assistMode}
        >
          {assistMode ? "Assist mode on" : "Need an assist?"}
        </button>

        <ul className="unlock-list" aria-label="Unlocked projects">
          {shots.map((shot) => (
            <li key={shot.id} className={unlocked.has(shot.id) ? "is-unlocked" : ""}>
              {unlocked.has(shot.id) ? (
                <a href={`#project-${shot.id}`}>
                  <span>Unlocked — view project ↓</span>
                  <strong>{shot.project}</strong>
                </a>
              ) : (
                <>
                  <span>{`Make the ${shot.label.toLowerCase()}`}</span>
                  <strong>{shot.project}</strong>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
