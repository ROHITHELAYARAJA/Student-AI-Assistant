"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

/* THINKING — expandable agent trace, four variants (Steps, Reasoning, Search, Coding). The trace runs once, settles, and remains expandable. */

const STAGES = [800, 600, 1800, 2600, 1600];

function useSequence(steps: number[]) {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    if (stage >= steps.length - 1) return;
    const t = setTimeout(() => setStage((s) => s + 1), steps[stage]);
    return () => clearTimeout(t);
  }, [stage, steps]);
  return stage;
}

type Row = {
  primary: string;
  secondary?: string;
  mono?: boolean;
  add?: number;
  del?: number;
  href?: string;
};

const VARIANTS: Record<
  string,
  { active: string; done: string; rows: Row[]; query?: string }
> = {
  Steps: {
    active: "Blast is thinking",
    done: "Blast formulated study plan",
    rows: [
      { primary: "Analyzing topic & curriculum scope" },
      { primary: "Scanning knowledge base & documents", secondary: "verified sources" },
      { primary: "Structuring core conceptual notes", secondary: "3 sections" },
      { primary: "Generating active-recall flashcards & quiz" },
      { primary: "Synthesizing comprehensive study pack" },
    ],
  },
  Reasoning: {
    active: "Blast is reasoning",
    done: "Reasoning complete",
    rows: [
      {
        primary:
          "Deconstructing foundational principles before introducing advanced edge cases.",
      },
      {
        primary:
          "Formulating four distinct options per quiz question to challenge common misconceptions.",
      },
      {
        primary:
          "Creating paired retrieval flashcards calibrated for high conceptual retention.",
      },
    ],
  },
  Search: {
    active: "Researching knowledge base",
    done: "Curriculum research complete",
    query: "foundational principles & practice problems",
    rows: [
      {
        primary: "Blast Educational Index",
        secondary: "blast.ai/curriculum",
        href: "#",
      },
      {
        primary: "Academic Learning Archive",
        secondary: "archive.org/stem",
        href: "#",
      },
      {
        primary: "Active Recall Synthesis Model",
        secondary: "blast.ai/retrieval",
        href: "#",
      },
    ],
  },
  Coding: {
    active: "Generating study components",
    done: "Compiled study set",
    rows: [
      { primary: "Structure", secondary: "notes.json", mono: true },
      {
        primary: "Generate",
        secondary: "quiz_and_cards.ts",
        mono: true,
        add: 74,
        del: 12,
      },
      { primary: "Compile", secondary: "study_pack.notebook", mono: true },
    ],
  },
};

function Dot({ tone }: { tone: string }) {
  return (
    <span
      className={`flex size-3.5 shrink-0 items-center justify-center rounded-full text-white ${tone}`}
    >
      <svg
        width="9"
        height="9"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M3.5 12h17M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      </svg>
    </span>
  );
}

const TONES = ["bg-accent", "bg-orange", "bg-green"];

export interface ThinkingStateProps {
  variant?: string;
  topic?: string;
  phase?: string;
  className?: string;
}

export function ThinkingState({
  variant = "Steps",
  topic,
  phase,
  className = "",
}: ThinkingStateProps) {
  const stage = useSequence(STAGES);
  const [manualExpanded, setManualExpanded] = useState<boolean | null>(null);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  
  const baseVariant = VARIANTS[variant] ?? VARIANTS.Steps;
  const v = {
    ...baseVariant,
    active: phase ? `Blast is ${phase.toLowerCase()}` : (topic ? `Blast is analyzing ${topic}` : baseVariant.active),
    query: topic ? topic : baseVariant.query,
  };

  const autoExpanded = stage >= 1 && stage < 4;
  const expanded = manualExpanded ?? autoExpanded;
  const working = stage < 3;
  const visible =
    stage < 2 ? 0 : stage === 2 ? Math.min(2, v.rows.length) : v.rows.length;
  const traceRef = useRef<HTMLDivElement>(null);
  const [lineHeight, setLineHeight] = useState(0);
  
  useLayoutEffect(() => {
    if (traceRef.current) setLineHeight(traceRef.current.offsetHeight);
  }, [visible, expanded, variant, stage]);

  return (
    <div key={variant} className={`flex min-h-[140px] w-full max-w-[420px] flex-col ${className}`}>
      {/* header — shared across variants */}
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() =>
          setManualExpanded((current) => !(current ?? autoExpanded))
        }
        className="-mx-1.5 flex w-fit items-center gap-2 rounded-control px-2 py-1.5
          transition-colors duration-100 hover:bg-hover-2 text-left cursor-pointer"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={working ? "var(--purple, var(--ink-2))" : "var(--ink-3)"}
          className="shrink-0"
        >
          <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
        </svg>
        {working ? (
          <span
            className="bg-clip-text text-[13.5px] font-semibold whitespace-nowrap text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(90deg, var(--ink-3) 35%, var(--purple, var(--ink)) 50%, var(--ink-3) 65%)",
              backgroundSize: "200% 100%",
              animation: "shimmer-text 1.4s linear infinite",
            }}
          >
            {v.active}
          </span>
        ) : (
          <span
            className="text-[13.5px] font-semibold whitespace-nowrap text-ink-2"
            style={{ animation: "fade-in 350ms ease-out both" }}
          >
            {v.done}
          </span>
        )}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--ink-3)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform duration-300 ml-1"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0)" }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* expandable trace */}
      <div
        className="grid transition-[grid-template-rows,opacity] duration-400"
        style={{
          gridTemplateRows: expanded ? "1fr" : "0fr",
          opacity: expanded ? 1 : 0,
          transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
        }}
      >
        <div className="overflow-hidden">
          <div className="relative mt-1 ml-[5px] pl-4">
            <span
              aria-hidden
              className="absolute left-[3px] w-px bg-line"
              style={{
                top: -8,
                height: lineHeight ? lineHeight - 2 : 0,
                transition: "height 500ms cubic-bezier(0.23,1,0.32,1)",
              }}
            />
            <div ref={traceRef} className="flex flex-col gap-1 py-1">
              {v.query && (
                <div
                  className="flex h-6 items-center gap-2 px-1.5"
                  style={{
                    animation: expanded
                      ? "fade-up 300ms cubic-bezier(0.23,1,0.32,1) both"
                      : undefined,
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--ink-3)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="shrink-0"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="M21 21l-4.3-4.3" />
                  </svg>
                  <span className="text-[12.5px] text-ink-2 truncate max-w-[320px]">{v.query}</span>
                </div>
              )}
              {v.rows.slice(0, visible).map((row, i) => {
                const content = (
                  <>
                    {variant === "Search" && <Dot tone={TONES[i % 3]} />}
                    {variant === "Steps" &&
                      (i < visible - 1 || !working ? (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="var(--green, #189a4d)"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="shrink-0"
                        >
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      ) : (
                        <span
                          className="size-3 shrink-0 rounded-full border-[1.5px] border-line-strong border-t-purple"
                          style={{ animation: "spin 700ms linear infinite" }}
                        />
                      ))}
                    <span
                      className={`min-w-0 truncate text-[12.5px] ${variant === "Reasoning" ? "whitespace-normal leading-relaxed text-ink-2" : "font-medium text-ink"} ${variant === "Search" ? "animated-underline" : ""}`}
                    >
                      {row.primary}
                    </span>
                    {row.secondary && (
                      <span
                        className={`shrink-0 text-[11.5px] text-ink-3 ${row.mono ? "font-mono" : ""}`}
                      >
                        {row.secondary}
                      </span>
                    )}
                    {row.add !== undefined && (
                      <span className="shrink-0 font-mono text-[11px] tabular-nums ml-auto">
                        <span className="text-green">+{row.add}</span>{" "}
                        <span className="text-red">−{row.del}</span>
                      </span>
                    )}
                  </>
                );
                const rowClass =
                  "flex min-h-7 w-full items-center gap-2 rounded-[6px] px-1.5 py-0.5 text-left";
                const animation = {
                  animation: `fade-up 320ms cubic-bezier(0.23,1,0.32,1) ${i * 120}ms both`,
                };

                if (variant === "Search") {
                  return (
                    <a
                      key={row.primary}
                      href={row.href || "#"}
                      className={`${rowClass} transition-colors duration-150 hover:bg-hover`}
                      style={animation}
                      onClick={(e) => e.preventDefault()}
                    >
                      {content}
                    </a>
                  );
                }

                if (variant === "Coding") {
                  const selected = selectedTool === row.primary;
                  return (
                    <button
                      key={row.primary}
                      type="button"
                      aria-pressed={selected}
                      onClick={() =>
                        setSelectedTool(selected ? null : row.primary)
                      }
                      className={`${rowClass} transition-colors duration-150 ${selected ? "bg-inset" : "hover:bg-hover"}`}
                      style={animation}
                    >
                      {content}
                    </button>
                  );
                }

                return (
                  <div key={row.primary} className={rowClass} style={animation}>
                    {content}
                  </div>
                );
              })}
              {variant === "Search" && stage >= 3 && (
                <span
                  className="text-[12px] text-ink-3"
                  style={{ animation: "fade-in 300ms ease-out both" }}
                >
                  +3 curriculum sources verified
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThinkingState;
