"use client";

import ThinkingState from "@/components/ui/thinking";
import * as React from "react";

const VARIANTS = ["Steps", "Reasoning", "Search", "Coding"];

export default function ThinkingDemo() {
  const [variant, setVariant] = React.useState("Steps");
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-8 rounded-2xl bg-canvas p-8">
      <div className="flex min-h-[176px] w-full items-center justify-center">
        <ThinkingState key={variant} variant={variant} />
      </div>
      <div className="flex gap-1 rounded-full bg-inset p-1">
        {VARIANTS.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setVariant(v)}
            className={`rounded-full px-3 py-1 text-[12.5px] font-medium transition-colors ${
              variant === v
                ? "bg-surface text-ink"
                : "text-ink-2 hover:text-ink"
            }`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}
