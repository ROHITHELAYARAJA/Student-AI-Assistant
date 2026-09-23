import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface ToolStep {
  id: string;
  plugin: 'gmail' | 'calendar' | 'executor' | 'handoff' | 'scholar';
  pluginName: string;
  action: string;
  details?: string;
  timestamp?: string;
  status?: 'completed' | 'running' | 'pending';
}

export interface ToolExecutionTraceProps {
  tools?: ToolStep[];
  className?: string;
  defaultExpanded?: boolean;
}

// Pixel-accurate App Icons matching Image 3
export const AppIcons: Record<string, React.FC<{ size?: number; className?: string }>> = {
  gmail: ({ size = 20, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`rounded-md shrink-0 ${className}`}>
      <rect width="24" height="24" rx="5" fill="#1F1F24" />
      {/* Gmail M logo colors */}
      <path d="M4 6.5L12 12.5L20 6.5V17C20 17.6 19.6 18 19 18H17V11L12 15L7 11V18H5C4.4 18 4 17.6 4 17V6.5Z" fill="#EA4335" />
      <path d="M19 6H17.5L12 10.2L6.5 6H5C4.4 6 4 6.4 4 7V7.5L12 13.5L20 7.5V7C20 6.4 19.6 6 19 6Z" fill="#4285F4" />
      <path d="M4 7V17C4 17.6 4.4 18 5 18H7V10.5L4 8V7Z" fill="#34A853" />
      <path d="M20 7V17C20 17.6 19.6 18 19 18H17V10.5L20 8V7Z" fill="#FBBC05" />
    </svg>
  ),
  calendar: ({ size = 20, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`rounded-md shrink-0 ${className}`}>
      <rect width="24" height="24" rx="5" fill="#1A73E8" />
      <rect x="4" y="6" width="16" height="14" rx="2" fill="#FFFFFF" />
      <rect x="4" y="6" width="16" height="4" fill="#EA4335" />
      <text x="12" y="17" fill="#1A73E8" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
        31
      </text>
    </svg>
  ),
  executor: ({ size = 20, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`rounded-md shrink-0 ${className}`}>
      <rect width="24" height="24" rx="5" fill="#00353A" />
      <rect x="5" y="6" width="14" height="10" rx="1.5" stroke="#00B4D8" strokeWidth="1.5" fill="#001820" />
      <path d="M9 10L7.5 11L9 12" stroke="#00E5FF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 10L16.5 11L15 12" stroke="#00E5FF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="13" y1="9.5" x2="11" y2="12.5" stroke="#00E5FF" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="12" y1="16" x2="12" y2="18" stroke="#00B4D8" strokeWidth="1.5" />
      <line x1="9" y1="18" x2="15" y2="18" stroke="#00B4D8" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  handoff: ({ size = 20, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`rounded-md shrink-0 ${className}`}>
      <rect width="24" height="24" rx="5" fill="#004380" />
      <path d="M7 16L16 7" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 7H16V13" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  scholar: ({ size = 20, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`rounded-md shrink-0 ${className}`}>
      <rect width="24" height="24" rx="5" fill="#3B2864" />
      <path d="M12 5L4 9L12 13L20 9L12 5Z" fill="#A78BFA" />
      <path d="M6 11V15C6 17 9 19 12 19C15 19 18 17 18 15V11" stroke="#A78BFA" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
};

export const DEFAULT_STUDY_TOOLS: ToolStep[] = [
  {
    id: 'tool-1',
    plugin: 'gmail',
    pluginName: 'Gmail',
    action: 'Sent email to the team',
    details: 'Study digest & flashcards sent to team@student.edu with interactive quiz link.',
    timestamp: '2s ago',
    status: 'completed'
  },
  {
    id: 'tool-2',
    plugin: 'calendar',
    pluginName: 'Google Calendar',
    action: 'Created meeting for tomorrow at 2 PM',
    details: 'Spaced repetition revision block "Operating Systems Review" scheduled with alert.',
    timestamp: '1.5s ago',
    status: 'completed'
  },
  {
    id: 'tool-3',
    plugin: 'executor',
    pluginName: 'Executor',
    action: 'Executed code analysis task',
    details: 'Verified algorithm complexity: O(N log N) runtime and O(1) space across 6 test cases.',
    timestamp: '800ms ago',
    status: 'completed'
  },
  {
    id: 'tool-4',
    plugin: 'handoff',
    pluginName: 'Handoff',
    action: 'Delegated to scheduling assistant',
    details: 'Handed off to Blast AI Study Planner for curriculum pacing and milestones.',
    timestamp: '300ms ago',
    status: 'completed'
  }
];

export const ToolExecutionTrace: React.FC<ToolExecutionTraceProps> = ({
  tools = DEFAULT_STUDY_TOOLS,
  className = '',
  defaultExpanded = true
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);

  const toggleStep = (id: string) => {
    setExpandedStepId(prev => (prev === id ? null : id));
  };

  return (
    <div
      className={`rounded-2xl bg-[#0B0C10] border border-[#1A1C24] p-3 sm:p-4 text-zinc-100 shadow-xl transition-all select-none ${className}`}
    >
      {/* Header bar: App icons stack + "Used X tools" + Toggle Chevron */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between cursor-pointer hover:opacity-90 py-1 transition-opacity"
      >
        <div className="flex items-center gap-2.5">
          {/* Stacked App Icons */}
          <div className="flex items-center -space-x-1.5">
            {tools.slice(0, 4).map((tool) => {
              const IconComp = AppIcons[tool.plugin] || AppIcons.executor;
              return (
                <div
                  key={tool.id}
                  className="rounded-md ring-2 ring-[#0B0C10] shadow-sm transform hover:scale-110 transition-transform"
                >
                  <IconComp size={22} />
                </div>
              );
            })}
          </div>

          {/* Used tools label */}
          <span className="text-xs sm:text-sm font-medium text-zinc-300">
            Used {tools.length} tools
          </span>
        </div>

        {/* Toggle icon */}
        <button
          type="button"
          className="text-zinc-400 hover:text-zinc-200 p-1"
          aria-label={isExpanded ? 'Collapse tools' : 'Expand tools'}
        >
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Expanded Timeline Steps matching Image 3 */}
      {isExpanded && (
        <div className="mt-4 pt-2 border-t border-[#1A1C24]/80 flex flex-col space-y-0 relative">
          {tools.map((tool, index) => {
            const isLast = index === tools.length - 1;
            const isStepExpanded = expandedStepId === tool.id;
            const IconComp = AppIcons[tool.plugin] || AppIcons.executor;

            return (
              <div key={tool.id} className="relative flex items-start gap-3 group">
                {/* Vertical Timeline Line */}
                {!isLast && (
                  <div
                    className="absolute left-[13px] top-[26px] bottom-[-6px] w-[1.5px] bg-[#222533]"
                    aria-hidden
                  />
                )}

                {/* Tool App Icon */}
                <div className="relative z-10 pt-0.5 shrink-0">
                  <IconComp size={26} className="shadow-md" />
                </div>

                {/* Step Content */}
                <div className="flex-1 pb-4 min-w-0">
                  <div
                    onClick={() => toggleStep(tool.id)}
                    className="flex items-center justify-between cursor-pointer py-0.5 group-hover:text-white transition-colors"
                  >
                    <span className="text-xs sm:text-sm font-medium text-zinc-200 truncate">
                      {tool.action}
                    </span>
                    {tool.details && (
                      <span className="text-zinc-500 group-hover:text-zinc-300 ml-2 shrink-0">
                        {isStepExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </span>
                    )}
                  </div>

                  {/* Plugin Badge Name (matching Image 3) */}
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-zinc-400 font-normal">
                      {tool.pluginName}
                    </span>
                    {tool.timestamp && (
                      <span className="text-[10px] text-zinc-500 font-mono">
                        • {tool.timestamp}
                      </span>
                    )}
                  </div>

                  {/* Expanded Step Details */}
                  {isStepExpanded && tool.details && (
                    <div className="mt-2 p-2.5 rounded-lg bg-[#14161F] border border-[#222533] text-xs text-zinc-300 leading-relaxed font-mono">
                      {tool.details}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ToolExecutionTrace;
