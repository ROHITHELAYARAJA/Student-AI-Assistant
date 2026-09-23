"use client"

import * as React from "react"
import {
  ArrowUpIcon,
  AudioLinesIcon,
  CheckIcon,
  ChevronDownIcon,
  GlobeIcon,
  Loader2Icon,
  MicIcon,
  PencilIcon,
  PlusIcon,
  PuzzleIcon,
  SquareIcon,
  TelescopeIcon,
  UnplugIcon,
  UploadIcon,
  XIcon,
} from "lucide-react"
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  type HTMLMotionProps,
} from "framer-motion"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

/* =============================================================================
 * AiPromptInput — Blast AI Motoko Prompt Composer
 *
 * A premium AI prompt composer: auto-growing textarea, rotating placeholder,
 * floating toolbar, Cursor/Claude-style model selector, and stateful send control.
 * ============================================================================= */

const EASE = [0.2, 0, 0, 1] as const
const SPRING_SOFT = { type: "spring" as const, stiffness: 420, damping: 32 }
const SPRING_HEIGHT = { type: "spring" as const, stiffness: 380, damping: 34 }
const SPRING_PRESS = { type: "spring" as const, stiffness: 500, damping: 28 }
const SPRING_ICON = { type: "spring" as const, duration: 0.3, bounce: 0 }

const MENU_PANEL_CLASS = cn(
  "bg-[var(--color-surface,#181822)] text-[var(--color-text,#F4F4F6)] origin-bottom-left overflow-hidden rounded-2xl border-2 border-[var(--color-border,#272738)] p-1.5",
  "shadow-[0_8px_30px_-8px_rgba(8,8,8,0.35),0_2px_8px_-2px_rgba(8,8,8,0.2)]",
  "z-50 backdrop-blur-xl"
)

const CHIP_SURFACE_CLASS = cn(
  "bg-[var(--color-surface-hover,#1E1E2C)] text-[var(--color-text,#F4F4F6)] inline-flex items-center gap-1.5 rounded-full py-1 pr-1 pl-2 text-xs font-medium border border-[var(--color-border,#272738)]",
  "shadow-[inset_0_0_0_1px_rgba(123,123,123,0.12)]"
)

const TOOLBAR_BTN_CLASS = cn(
  "relative flex size-9 cursor-pointer items-center justify-center rounded-xl",
  "transition-[background-color,color,box-shadow,opacity,transform] duration-200 ease-[cubic-bezier(0.2,0,0,1)]",
  "hover:bg-[var(--color-surface-hover,#1E1E2C)] hover:text-[var(--color-text,#F4F4F6)]",
  "focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:outline-none",
  "disabled:pointer-events-none disabled:opacity-40"
)

type PresenceProps = Pick<
  HTMLMotionProps<"span">,
  "initial" | "animate" | "exit" | "transition"
>

const FADE_ONLY: PresenceProps = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

const ICON_SWAP: PresenceProps = {
  initial: { opacity: 0, scale: 0.25, filter: "blur(4px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 0.25, filter: "blur(4px)" },
  transition: SPRING_ICON,
}

function scaleBlurPresence(reduceMotion: boolean): PresenceProps {
  if (reduceMotion) return FADE_ONLY
  return {
    initial: { opacity: 0, scale: 0.9, filter: "blur(4px)" },
    animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
    exit: { opacity: 0, scale: 0.9, filter: "blur(4px)" },
    transition: SPRING_ICON,
  }
}

function menuPresence(reduceMotion: boolean): PresenceProps {
  if (reduceMotion) return FADE_ONLY
  return {
    initial: { opacity: 0, y: 6, scale: 0.96, filter: "blur(4px)" },
    animate: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
    exit: { opacity: 0, y: 4, scale: 0.98, filter: "blur(2px)" },
    transition: { duration: 0.2, ease: EASE },
  }
}

function placeholderPresence(reduceMotion: boolean): PresenceProps {
  if (reduceMotion) return FADE_ONLY
  return {
    initial: { opacity: 0, y: 6, filter: "blur(4px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    exit: { opacity: 0, y: -6, filter: "blur(4px)" },
    transition: { duration: 0.35, ease: EASE },
  }
}

function iconPresence(reduceMotion: boolean): PresenceProps {
  return reduceMotion ? FADE_ONLY : ICON_SWAP
}

function statusPresence(reduceMotion: boolean): PresenceProps {
  if (reduceMotion) return FADE_ONLY
  return {
    initial: { opacity: 0, scale: 0.92, filter: "blur(4px)" },
    animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
    exit: { opacity: 0, scale: 0.94, filter: "blur(4px)" },
    transition: { type: "spring", duration: 0.35, bounce: 0 },
  }
}

function flyoutPresence(reduceMotion: boolean): PresenceProps {
  if (reduceMotion) return FADE_ONLY
  return {
    initial: { opacity: 0, x: -6, scale: 0.98, filter: "blur(4px)" },
    animate: { opacity: 1, x: 0, scale: 1, filter: "blur(0px)" },
    exit: { opacity: 0, x: -4, scale: 0.98, filter: "blur(2px)" },
    transition: { duration: 0.18, ease: EASE },
  }
}

function valuePresence(reduceMotion: boolean): PresenceProps {
  return reduceMotion ? FADE_ONLY : ICON_SWAP
}

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 4 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: EASE },
  },
}

const itemVariantsReduced = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.15 } },
}

export type AiModelEffort = "high" | "medium" | "low"

export type AiModel = {
  id: string
  label: string
  description?: string
  efforts?: AiModelEffort[]
  contexts?: Array<string | number>
  supportsFast?: boolean
  supportsThinking?: boolean
  defaultEffort?: AiModelEffort
  defaultContext?: string | number
  defaultFast?: boolean
  defaultThinking?: boolean
  disabled?: boolean
}

export type AiModelSelection = {
  id: string
  effort?: AiModelEffort
  context?: string
  fast?: boolean
  thinking?: boolean
}

/** 5 Professional AWS Bedrock Models for Blast AI */
export const DEFAULT_AI_MODELS: AiModel[] = [
  {
    id: "anthropic.claude-3-haiku-20240307-v1:0",
    label: "Claude 3 Haiku",
    description: "Fast, intelligent Claude reasoning via AWS Bedrock for deep conceptual learning.",
    efforts: ["high", "medium", "low"],
    contexts: ["200K"],
    supportsFast: true,
    supportsThinking: true,
    defaultEffort: "high",
    defaultContext: "200K",
    defaultFast: true,
    defaultThinking: true,
  },
  {
    id: "meta.llama3-70b-instruct-v1:0",
    label: "LLaMA 3 70B Instruct",
    description: "Flagship open weights model with massive reasoning capacity for academic mastery.",
    efforts: ["high", "medium", "low"],
    contexts: ["8K", "64K"],
    supportsFast: true,
    supportsThinking: true,
    defaultEffort: "high",
    defaultContext: "8K",
    defaultFast: true,
  },
  {
    id: "meta.llama3-8b-instruct-v1:0",
    label: "LLaMA 3 8B Instruct",
    description: "High-speed lightweight inference tuned for rapid Q&A and instant flashcard recall.",
    efforts: ["medium", "low"],
    contexts: ["8K"],
    supportsFast: true,
    supportsThinking: false,
    defaultEffort: "medium",
    defaultContext: "8K",
    defaultFast: true,
  },
  {
    id: "amazon.nova-lite-v1:0",
    label: "Amazon Nova Lite",
    description: "Cost-effective, multimodal foundation model engineered by AWS Bedrock.",
    efforts: ["high", "medium", "low"],
    contexts: ["300K"],
    supportsFast: true,
    supportsThinking: false,
    defaultEffort: "medium",
    defaultContext: "300K",
    defaultFast: true,
  },
  {
    id: "amazon.nova-micro-v1:0",
    label: "Amazon Nova Micro",
    description: "Ultra-low latency text-only model providing immediate responses for interactive quizzes.",
    efforts: ["medium", "low"],
    contexts: ["128K"],
    supportsFast: true,
    supportsThinking: false,
    defaultEffort: "low",
    defaultContext: "128K",
    defaultFast: true,
  },
]

const EFFORT_LABEL: Record<AiModelEffort, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
}

export interface ModelSelectorProps {
  children: React.ReactNode
  models?: AiModel[]
  value?: AiModelSelection
  defaultValue?: AiModelSelection
  onValueChange?: (value: AiModelSelection) => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
  className?: string
  "aria-label"?: string
}

export interface ModelSelectorTriggerProps extends Omit<
  HTMLMotionProps<"button">,
  "children"
> {
  children?: React.ReactNode
}

export type ModelSelectorValueProps = React.HTMLAttributes<HTMLSpanElement>

export interface ModelSelectorContentProps extends Omit<
  HTMLMotionProps<"div">,
  "children"
> {
  children?: React.ReactNode
  side?: "top" | "bottom"
}

interface ModelSelectorContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  selection: AiModelSelection
  selectModel: (id: string) => void
  patchSelection: (patch: Partial<AiModelSelection>) => void
  models: AiModel[]
  selectedModel: AiModel | undefined
  disabled: boolean
  reduceMotion: boolean
  triggerRef: React.RefObject<HTMLButtonElement | null>
  contentRef: React.RefObject<HTMLDivElement | null>
  contentId: string
  layoutGroupId: string
  activeIndex: number
  setActiveIndex: (index: number) => void
  optionIds: string[]
  ariaLabel: string
  side: "top" | "bottom"
  setSide: (side: "top" | "bottom") => void
  editingId: string | null
  setEditingId: (id: string | null) => void
  previewId: string | null
  setPreviewId: (id: string | null) => void
  getConfigFor: (model: AiModel) => AiModelSelection
}

function optionDomId(contentId: string, modelId: string) {
  return `${contentId}-option-${modelId.replace(/[^a-zA-Z0-9_-]/g, "_")}`
}

function firstEnabledIndex(models: AiModel[], optionIds: string[]) {
  for (let i = 0; i < optionIds.length; i++) {
    const model = models.find((m) => m.id === optionIds[i])
    if (model && !model.disabled) return i
  }
  return 0
}

function lastEnabledIndex(models: AiModel[], optionIds: string[]) {
  for (let i = optionIds.length - 1; i >= 0; i--) {
    const model = models.find((m) => m.id === optionIds[i])
    if (model && !model.disabled) return i
  }
  return Math.max(0, optionIds.length - 1)
}

const ModelSelectorContext =
  React.createContext<ModelSelectorContextValue | null>(null)

function useModelSelectorContext(component: string): ModelSelectorContextValue {
  const ctx = React.useContext(ModelSelectorContext)
  if (!ctx) {
    throw new Error(`${component} must be used within <ModelSelector>`)
  }
  return ctx
}

export function formatContext(
  context: string | number | undefined
): string | null {
  if (context === undefined || context === "") return null
  if (typeof context === "number") {
    if (context >= 1_000_000) return `${(context / 1_000_000).toFixed(0)}M`
    if (context >= 1_000) return `${Math.round(context / 1_000)}K`
    return String(context)
  }
  return String(context)
}

function defaultSelectionFor(model: AiModel): AiModelSelection {
  return {
    id: model.id,
    effort: model.defaultEffort ?? model.efforts?.[0],
    context:
      formatContext(model.defaultContext ?? model.contexts?.[0]) ?? undefined,
    fast: model.defaultFast ?? false,
    thinking: model.defaultThinking ?? false,
  }
}

function resolveSelection(
  models: AiModel[],
  value?: AiModelSelection
): AiModelSelection {
  const model = models.find((m) => m.id === value?.id) ?? models[0]
  if (!model) {
    return { id: value?.id ?? "" }
  }
  const base = defaultSelectionFor(model)
  if (!value || value.id !== model.id) return base
  return {
    id: model.id,
    effort: value.effort ?? base.effort,
    context: value.context ?? base.context,
    fast: value.fast ?? base.fast,
    thinking: value.thinking ?? base.thinking,
  }
}

function ModelLabelParts({
  model,
  selection,
  className,
}: {
  model: AiModel | undefined
  selection: AiModelSelection
  className?: string
}) {
  if (!model) {
    return (
      <span className={cn("text-[var(--color-text-muted,#A1A1AA)]", className)}>Select model</span>
    )
  }

  const mods: string[] = []
  if (selection.effort) mods.push(EFFORT_LABEL[selection.effort])
  if (selection.fast) mods.push("Fast")
  if (selection.thinking) mods.push("Thinking")

  return (
    <span className={cn("flex min-w-0 items-baseline gap-1.5", className)}>
      <span className="text-[var(--color-text,#F4F4F6)] truncate font-semibold">{model.label}</span>
      {mods.map((mod) => (
        <span
          key={mod}
          className="text-[#FF5E00]/80 shrink-0 font-medium text-[11px] tabular-nums"
        >
          {mod}
        </span>
      ))}
    </span>
  )
}

function OptionChip({
  selected,
  onClick,
  children,
  disabled,
  reduceMotion,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
  disabled?: boolean
  reduceMotion: boolean
}) {
  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onClick}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      transition={SPRING_PRESS}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium",
        "transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)]",
        "focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:outline-none",
        selected
          ? "bg-[#FF5E00]/20 text-[#FF5E00] border border-[#FF5E00]/30"
          : "text-[var(--color-text-muted,#A1A1AA)] hover:bg-[var(--color-surface-hover,#1E1E2C)] hover:text-[var(--color-text,#F4F4F6)]",
        disabled && "pointer-events-none opacity-40"
      )}
    >
      <span>{children}</span>
      <span className="flex size-3.5 shrink-0 items-center justify-center">
        <MenuCheckmark
          visible={selected}
          reduceMotion={reduceMotion}
          className="text-[#FF5E00]"
        />
      </span>
    </motion.button>
  )
}

function ToggleChip({
  selected,
  onClick,
  children,
  reduceMotion,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
  reduceMotion: boolean
}) {
  return (
    <motion.button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      transition={SPRING_PRESS}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium",
        "transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)]",
        "focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:outline-none",
        selected
          ? "bg-[#FF5E00]/20 text-[#FF5E00] border border-[#FF5E00]/30"
          : "text-[var(--color-text-muted,#A1A1AA)] hover:bg-[var(--color-surface-hover,#1E1E2C)] hover:text-[var(--color-text,#F4F4F6)]"
      )}
    >
      <span>{children}</span>
      <span className="flex size-3.5 shrink-0 items-center justify-center">
        <MenuCheckmark
          visible={selected}
          reduceMotion={reduceMotion}
          className="text-[#FF5E00]"
        />
      </span>
    </motion.button>
  )
}

function ModelSelector({
  children,
  models = DEFAULT_AI_MODELS,
  value: valueProp,
  defaultValue,
  onValueChange,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  className,
  "aria-label": ariaLabel = "AWS Bedrock Models",
}: ModelSelectorProps) {
  const reduceMotion = usePrefersReducedMotion()
  const layoutGroupId = React.useId()
  const contentId = React.useId()
  const triggerRef = React.useRef<HTMLButtonElement | null>(null)
  const contentRef = React.useRef<HTMLDivElement | null>(null)

  const initial =
    defaultValue ?? (models[0] ? defaultSelectionFor(models[0]) : { id: "" })

  const [selection, setSelection] = useControllableState({
    value: valueProp,
    defaultValue: initial,
    onChange: onValueChange,
  })

  const [open, setOpenState] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })

  const [activeIndex, setActiveIndex] = React.useState(0)
  const [side, setSide] = React.useState<"top" | "bottom">("top")
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [previewId, setPreviewId] = React.useState<string | null>(null)

  const optionIds = React.useMemo(() => models.map((m) => m.id), [models])
  const configCacheRef = React.useRef<Record<string, AiModelSelection>>({})
  const resolved = resolveSelection(models, selection)

  React.useEffect(() => {
    if (resolved.id) configCacheRef.current[resolved.id] = resolved
  }, [resolved])

  const selectedModel = models.find((m) => m.id === resolved.id) ?? models[0]

  const getConfigFor = React.useCallback(
    (model: AiModel): AiModelSelection => {
      if (resolved.id === model.id) return resolved
      return configCacheRef.current[model.id] ?? defaultSelectionFor(model)
    },
    [resolved]
  )

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (disabled && next) return
      setOpenState(next)
      if (!next) {
        setEditingId(null)
        setPreviewId(null)
      }
    },
    [disabled, setOpenState]
  )

  const selectModel = React.useCallback(
    (id: string) => {
      const model = models.find((m) => m.id === id)
      if (!model || model.disabled) return
      const next = resolveSelection(models, { ...getConfigFor(model), id })
      setSelection(next)
      setEditingId(null)
      setOpen(false)
      triggerRef.current?.focus()
    },
    [models, getConfigFor, setSelection, setOpen]
  )

  const patchSelection = React.useCallback(
    (patch: Partial<AiModelSelection>) => {
      setSelection((prev) => {
        const id = patch.id ?? prev.id
        const model = models.find((m) => m.id === id)
        const base = model
          ? id === prev.id
            ? resolveSelection(models, prev)
            : (configCacheRef.current[id] ?? defaultSelectionFor(model))
          : prev
        const next = resolveSelection(models, { ...base, ...patch, id })
        configCacheRef.current[id] = next
        return next
      })
    },
    [models, setSelection]
  )

  React.useEffect(() => {
    if (!open) return
    const idx = optionIds.indexOf(resolved.id)
    setActiveIndex(idx >= 0 ? idx : firstEnabledIndex(models, optionIds))
  }, [open, optionIds, resolved.id, models])

  React.useEffect(() => {
    if (!open) return

    const onPointer = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null
      if (!target) return
      const inTrigger = triggerRef.current?.contains(target)
      const inContent = contentRef.current?.contains(target)
      if (!inTrigger && !inContent) setOpen(false)
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        if (editingId) {
          setEditingId(null)
          return
        }
        setOpen(false)
        triggerRef.current?.focus()
        return
      }

      if (editingId || optionIds.length === 0) return

      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault()
        const delta = event.key === "ArrowDown" ? 1 : -1
        setActiveIndex((prev) => {
          let next = prev
          for (let i = 0; i < optionIds.length; i++) {
            next = (next + delta + optionIds.length) % optionIds.length
            const model = models.find((m) => m.id === optionIds[next])
            if (!model?.disabled) break
          }
          return next
        })
        return
      }

      if (event.key === "Enter" || event.key === " ") {
        const target = event.target as HTMLElement | null
        if (target?.closest("[data-slot='model-selector-item']")) return
        if (target?.closest("[data-slot='model-selector-edit']")) return
        event.preventDefault()
        const id = optionIds[activeIndex]
        if (id) selectModel(id)
        return
      }
    }

    document.addEventListener("mousedown", onPointer)
    document.addEventListener("touchstart", onPointer)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onPointer)
      document.removeEventListener("touchstart", onPointer)
      document.removeEventListener("keydown", onKey)
    }
  }, [open, setOpen, optionIds, activeIndex, models, selectModel, editingId])

  React.useEffect(() => {
    if (disabled) setOpen(false)
  }, [disabled, setOpen])

  return (
    <ModelSelectorContext.Provider
      value={{
        open,
        setOpen,
        selection: resolved,
        selectModel,
        patchSelection,
        models,
        selectedModel,
        disabled,
        reduceMotion,
        triggerRef,
        contentRef,
        contentId,
        layoutGroupId,
        activeIndex,
        setActiveIndex,
        optionIds,
        ariaLabel,
        side,
        setSide,
        editingId,
        setEditingId,
        previewId,
        setPreviewId,
        getConfigFor,
      }}
    >
      <div
        data-slot="model-selector"
        data-state={open ? "open" : "closed"}
        className={cn("relative inline-flex", className)}
      >
        {children}
      </div>
    </ModelSelectorContext.Provider>
  )
}

ModelSelector.displayName = "ModelSelector"

const ModelSelectorTrigger = React.forwardRef<
  HTMLButtonElement,
  ModelSelectorTriggerProps
>(({ className, children, disabled, onClick, ...props }, ref) => {
  const {
    open,
    setOpen,
    triggerRef,
    contentId,
    disabled: rootDisabled,
    selectedModel,
    selection,
  } = useModelSelectorContext("ModelSelectorTrigger")

  const isDisabled = disabled || rootDisabled
  const label = selectedModel
    ? [
        selectedModel.label,
        selection.effort ? EFFORT_LABEL[selection.effort] : null,
        selection.fast ? "Fast" : null,
        selection.thinking ? "Thinking" : null,
      ]
        .filter(Boolean)
        .join(" ")
    : "Select model"

  return (
    <motion.button
      ref={(node) => assignRef(node, ref, triggerRef)}
      type="button"
      disabled={isDisabled}
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={contentId}
      aria-label={`Model: ${label}`}
      data-slot="model-selector-trigger"
      data-state={open ? "open" : "closed"}
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented || isDisabled) return
        setOpen(!open)
      }}
      whileHover={isDisabled ? undefined : { scale: 1.02, y: -1 }}
      whileTap={isDisabled ? undefined : { scale: 0.96 }}
      transition={SPRING_PRESS}
      className={cn(
        "text-[var(--color-text-muted,#A1A1AA)] flex min-h-9 cursor-pointer items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-medium border border-[var(--color-border,#272738)] bg-[var(--color-surface,#181822)]",
        "transition-colors duration-200 ease-[cubic-bezier(0.2,0,0,1)]",
        "hover:bg-[var(--color-surface-hover,#1E1E2C)] hover:text-[var(--color-text,#F4F4F6)]",
        "focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:outline-none",
        "disabled:pointer-events-none disabled:opacity-40",
        open && "bg-[var(--color-surface-hover,#1E1E2C)] text-[var(--color-text,#F4F4F6)] border-[#FF5E00]/40",
        className
      )}
      {...props}
    >
      {children ?? <ModelSelectorValue />}
      <motion.span
        animate={{ rotate: open ? 180 : 0 }}
        transition={{ duration: 0.2, ease: EASE }}
        className="flex shrink-0 text-[#FF5E00]"
      >
        <ChevronDownIcon className="size-3.5 opacity-80" aria-hidden />
      </motion.span>
    </motion.button>
  )
})
ModelSelectorTrigger.displayName = "ModelSelectorTrigger"

function ModelSelectorValue({ className, ...props }: ModelSelectorValueProps) {
  const { selectedModel, selection, reduceMotion } =
    useModelSelectorContext("ModelSelectorValue")

  return (
    <span
      data-slot="model-selector-value"
      className={cn("relative flex min-w-0 items-center", className)}
      {...props}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={`${selection.id}-${selection.effort}-${selection.fast}-${selection.thinking}`}
          {...valuePresence(reduceMotion)}
          className="flex min-w-0"
        >
          <ModelLabelParts
            model={selectedModel}
            selection={selection}
            className="text-xs"
          />
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
ModelSelectorValue.displayName = "ModelSelectorValue"

const ModelSelectorContent = React.forwardRef<
  HTMLDivElement,
  ModelSelectorContentProps
>(({ className, children, side: sideProp = "top", style, ...props }, ref) => {
  const {
    open,
    contentId,
    triggerRef,
    contentRef,
    reduceMotion,
    ariaLabel,
    setSide,
    editingId,
    previewId,
    models,
    activeIndex,
    optionIds,
  } = useModelSelectorContext("ModelSelectorContent")

  const [mounted, setMounted] = React.useState(false)
  const [coords, setCoords] = React.useState<{
    top: number
    left: number
  } | null>(null)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    setSide(sideProp)
  }, [sideProp, setSide])

  React.useLayoutEffect(() => {
    if (!open) return

    const update = () => {
      const trigger = triggerRef.current
      if (!trigger) return
      const rect = trigger.getBoundingClientRect()
      if (sideProp === "bottom") {
        setCoords({
          top: rect.bottom + 8,
          left: rect.left,
        })
      } else {
        setCoords({
          top: rect.top - 8,
          left: rect.left,
        })
      }
    }

    update()
    window.addEventListener("resize", update)
    window.addEventListener("scroll", update, true)
    return () => {
      window.removeEventListener("resize", update)
      window.removeEventListener("scroll", update, true)
    }
  }, [open, triggerRef, sideProp])

  if (!mounted) return null

  const list = children ?? <ModelSelectorDefaultItems />
  const editingModel = models.find((m) => m.id === editingId)
  const previewModel = models.find((m) => m.id === previewId)
  const panelModel = editingModel ?? previewModel
  const activeModelId = optionIds[activeIndex]
  const activeOptionId = activeModelId
    ? optionDomId(contentId, activeModelId)
    : undefined

  return createPortal(
    <AnimatePresence>
      {open && coords ? (
        <motion.div
          key={contentId}
          ref={(node) => assignRef(node, ref, contentRef)}
          data-slot="model-selector-content"
          data-editing={editingId ? "" : undefined}
          {...menuPresence(reduceMotion)}
          style={{
            position: "fixed",
            top: coords.top,
            left: coords.left,
            transform: sideProp === "top" ? "translateY(-100%)" : undefined,
            zIndex: 9999,
            ...style,
          }}
          className={cn("flex origin-top-left items-start gap-3", className)}
          {...props}
        >
          <div
            id={contentId}
            role="listbox"
            aria-label={ariaLabel}
            aria-activedescendant={activeOptionId}
            data-slot="model-selector-listbox"
            className="min-w-0"
          >
            {list}
          </div>

          <AnimatePresence initial={false}>
            {panelModel ? (
              <ModelSidePanel
                key="model-side-panel"
                model={panelModel}
                editing={!!editingModel}
              />
            ) : null}
          </AnimatePresence>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  )
})
ModelSelectorContent.displayName = "ModelSelectorContent"

function ModelSelectorDefaultItems() {
  const { models, layoutGroupId, reduceMotion, editingId, setPreviewId } =
    useModelSelectorContext("ModelSelectorDefaultItems")

  return (
    <LayoutGroup id={layoutGroupId}>
      <motion.ul
        role="presentation"
        variants={listVariants}
        initial={reduceMotion ? false : "hidden"}
        animate="show"
        className={cn(MENU_PANEL_CLASS, "flex min-w-64 flex-col gap-0.5")}
        onMouseLeave={() => {
          if (!editingId) setPreviewId(null)
        }}
      >
        {models.map((model) => (
          <li key={model.id} role="none">
            <ModelSelectorItem model={model} />
          </li>
        ))}
      </motion.ul>
    </LayoutGroup>
  )
}

function ModelSidePanel({
  model,
  editing,
}: {
  model: AiModel
  editing: boolean
}) {
  const { reduceMotion } = useModelSelectorContext("ModelSidePanel")

  return (
    <motion.aside
      data-slot="model-selector-side-panel"
      aria-label={
        editing ? `${model.label} settings` : `${model.label} details`
      }
      {...flyoutPresence(reduceMotion)}
      className={cn(MENU_PANEL_CLASS, "flex w-60 shrink-0 flex-col gap-3 p-3")}
    >
      {editing ? (
        <ModelEditPanelContent model={model} />
      ) : (
        <ModelInfoPanelContent model={model} />
      )}
    </motion.aside>
  )
}

function ModelInfoPanelContent({ model }: { model: AiModel }) {
  const contexts = model.contexts
    ?.map((context) => formatContext(context))
    .filter(Boolean)
    .join(" · ")

  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-[var(--color-text,#F4F4F6)] text-xs font-bold">{model.label}</span>
        <span className="text-[10px] text-[#FF5E00] font-mono font-semibold">AWS Bedrock</span>
      </div>
      {model.description ? (
        <p className="text-[var(--color-text-muted,#A1A1AA)] text-[11px] leading-relaxed">
          {model.description}
        </p>
      ) : null}
      {contexts ? (
        <div className="mt-1 flex flex-col gap-1 border-t border-[var(--color-border,#272738)] pt-2">
          <span className="text-[var(--color-text-faint,#71717A)] text-[10px] font-semibold tracking-wide uppercase">
            Context Window
          </span>
          <span className="text-[var(--color-text,#F4F4F6)] text-xs font-medium tabular-nums">
            {contexts} tokens
          </span>
        </div>
      ) : null}
    </>
  )
}

function ModelEditPanelContent({ model }: { model: AiModel }) {
  const { getConfigFor, patchSelection, reduceMotion } =
    useModelSelectorContext("ModelEditPanelContent")

  const config = getConfigFor(model)
  const efforts = model.efforts ?? []
  const contexts = model.contexts ?? []

  return (
    <>
      {efforts.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <div className="text-[var(--color-text-faint,#71717A)] px-0.5 text-[10px] font-semibold tracking-wide uppercase">
            Reasoning Effort
          </div>
          <div className="flex flex-col gap-0.5">
            {efforts.map((effort) => (
              <OptionChip
                key={effort}
                selected={config.effort === effort}
                reduceMotion={reduceMotion}
                onClick={() => patchSelection({ id: model.id, effort })}
              >
                {EFFORT_LABEL[effort]}
              </OptionChip>
            ))}
          </div>
        </div>
      ) : null}

      {contexts.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <div className="text-[var(--color-text-faint,#71717A)] px-0.5 text-[10px] font-semibold tracking-wide uppercase">
            Context Size
          </div>
          <div className="flex flex-col gap-0.5">
            {contexts.map((ctx) => {
              const label = formatContext(ctx) ?? String(ctx)
              return (
                <OptionChip
                  key={label}
                  selected={config.context === label}
                  reduceMotion={reduceMotion}
                  onClick={() =>
                    patchSelection({ id: model.id, context: label })
                  }
                >
                  <span className="tabular-nums">{label}</span>
                </OptionChip>
              )
            })}
          </div>
        </div>
      ) : null}

      {(model.supportsFast || model.supportsThinking) && (
        <div className="flex flex-col gap-1.5">
          <div className="text-[var(--color-text-faint,#71717A)] px-0.5 text-[10px] font-semibold tracking-wide uppercase">
            Inference Modes
          </div>
          <div className="flex flex-col gap-0.5">
            {model.supportsFast ? (
              <ToggleChip
                selected={!!config.fast}
                reduceMotion={reduceMotion}
                onClick={() =>
                  patchSelection({ id: model.id, fast: !config.fast })
                }
              >
                Fast Mode (Optimized Latency)
              </ToggleChip>
            ) : null}
            {model.supportsThinking ? (
              <ToggleChip
                selected={!!config.thinking}
                reduceMotion={reduceMotion}
                onClick={() =>
                  patchSelection({
                    id: model.id,
                    thinking: !config.thinking,
                  })
                }
              >
                Deep Thinking & Synthesis
              </ToggleChip>
            ) : null}
          </div>
        </div>
      )}
    </>
  )
}

function ModelSelectorItem({ model }: { model: AiModel }) {
  const {
    selection,
    selectModel,
    reduceMotion,
    layoutGroupId,
    contentId,
    activeIndex,
    setActiveIndex,
    optionIds,
    editingId,
    setEditingId,
    setPreviewId,
    getConfigFor,
    patchSelection,
  } = useModelSelectorContext("ModelSelectorItem")

  const isActive = model.id === selection.id
  const isEditing = editingId === model.id
  const optionIndex = optionIds.indexOf(model.id)
  const isHighlighted = optionIndex === activeIndex && optionIndex >= 0
  const isDisabled = !!model.disabled
  const config = getConfigFor(model)
  const optionId = optionDomId(contentId, model.id)

  const optionRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    if (isHighlighted) {
      optionRef.current?.scrollIntoView({ block: "nearest" })
    }
  }, [isHighlighted])

  return (
    <motion.div
      variants={reduceMotion ? itemVariantsReduced : itemVariants}
      className={cn(
        "group/item relative flex w-full items-center gap-1 rounded-xl",
        "transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)]",
        isActive ? "text-[var(--color-text,#F4F4F6)]" : "text-[var(--color-text-muted,#A1A1AA)]",
        isHighlighted && !isActive && "bg-[var(--color-surface-hover,#1E1E2C)]/60",
        isEditing && "bg-[var(--color-surface-hover,#1E1E2C)]",
        isDisabled && "pointer-events-none opacity-40"
      )}
      onMouseEnter={() => {
        if (!isDisabled && optionIndex >= 0) {
          setActiveIndex(optionIndex)
          if (!editingId) setPreviewId(model.id)
        }
      }}
    >
      {isActive ? (
        <motion.span
          layoutId={`${layoutGroupId}-active`}
          className="bg-[var(--color-surface-hover,#1E1E2C)] absolute inset-0 rounded-xl border border-[#FF5E00]/30"
          transition={SPRING_SOFT}
        />
      ) : null}

      <div
        ref={optionRef}
        id={optionId}
        role="option"
        aria-selected={isActive}
        aria-disabled={isDisabled || undefined}
        data-slot="model-selector-item"
        data-highlighted={isHighlighted ? "" : undefined}
        data-active={isActive ? "" : undefined}
        data-editing={isEditing ? "" : undefined}
        onClick={() => {
          if (!isDisabled) selectModel(model.id)
        }}
        className={cn(
          "relative z-10 flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-xl px-2.5 py-2 text-left",
          "transition-transform duration-150 ease-[cubic-bezier(0.2,0,0,1)]",
          !isDisabled && "active:scale-[0.98]"
        )}
      >
        <span className="min-w-0 flex-1">
          <ModelLabelParts
            model={model}
            selection={config}
            className="text-xs"
          />
        </span>
        {isActive ? (
          <MenuCheckmark
            visible
            reduceMotion={reduceMotion}
            className="text-[#FF5E00]"
          />
        ) : (
          <span className="size-3.5 shrink-0" aria-hidden />
        )}
      </div>

      <motion.button
        type="button"
        data-slot="model-selector-edit"
        aria-label={`Edit ${model.label} settings`}
        aria-expanded={isEditing}
        disabled={isDisabled}
        onClick={(event) => {
          event.stopPropagation()
          if (isEditing) {
            setEditingId(null)
            return
          }
          patchSelection({ ...config, id: model.id })
          setEditingId(model.id)
        }}
        whileTap={isDisabled ? undefined : { scale: 0.96 }}
        transition={SPRING_PRESS}
        className={cn(
          "relative z-10 mr-1 flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg",
          "text-[var(--color-text-muted,#A1A1AA)] opacity-0 transition-[opacity,background-color,color] duration-150 ease-[cubic-bezier(0.2,0,0,1)]",
          "hover:bg-[var(--color-surface,#181822)] hover:text-[var(--color-text,#F4F4F6)]",
          "focus-visible:ring-ring/50 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:outline-none",
          "group-hover/item:opacity-100",
          (isEditing || isHighlighted) && "opacity-100",
          isEditing && "bg-[var(--color-surface,#181822)] text-[#FF5E00]"
        )}
      >
        <PencilIcon className="size-3.5" aria-hidden />
      </motion.button>
    </motion.div>
  )
}

export type AiPromptModel = AiModel
export type AiPromptSendStatus = "idle" | "loading" | "success"
export type DictationPhase = "idle" | "recording" | "processing"

export const DEFAULT_PLACEHOLDERS = [
  "Ask Blast anything about your study topic...",
  "Enter a topic for an instant Turbo study pack...",
  "Generate 10 quiz questions on Operating Systems...",
  "Create an exam roadmap for Machine Learning...",
  "Explain Java OOP & JVM Memory Dynamics...",
  "Build high-yield notes on Data Structures..."
] as const

export const DEFAULT_MODELS: AiModel[] = DEFAULT_AI_MODELS

export interface AiPromptInputProps {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  onSubmit?: (value: string, selection: AiModelSelection) => void
  placeholders?: readonly string[]
  placeholderInterval?: number
  models?: AiModel[]
  modelSelection?: AiModelSelection
  defaultModelSelection?: AiModelSelection
  onModelSelectionChange?: (selection: AiModelSelection) => void
  disabled?: boolean
  status?: AiPromptSendStatus
  maxLength?: number
  minRows?: number
  maxRows?: number
  showToolbar?: boolean
  showActions?: boolean
  showModelSelector?: boolean
  deepResearch?: boolean
  defaultDeepResearch?: boolean
  onDeepResearchChange?: (active: boolean) => void
  webSearch?: boolean
  defaultWebSearch?: boolean
  onWebSearchChange?: (active: boolean) => void
  onUploadFile?: () => void
  onSkills?: () => void
  onConnectors?: () => void
  getDictationTranscript?: () => string
  onDictationChange?: (listening: boolean) => void
  onVoiceChange?: (active: boolean) => void
  className?: string
  textareaClassName?: string
  "aria-label"?: string
  "data-testid"?: string
}

function assignRef<T>(
  node: T | null,
  ...refs: Array<React.Ref<T> | undefined>
) {
  for (const ref of refs) {
    if (typeof ref === "function") ref(node)
    else if (ref) (ref as React.MutableRefObject<T | null>).current = node
  }
}

function usePrefersReducedMotion() {
  const [reduceMotion, setReduceMotion] = React.useState(false)

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setReduceMotion(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])

  return reduceMotion
}

function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: {
  value: T | undefined
  defaultValue: T
  onChange?: (value: T) => void
}): [T, (next: T | ((prev: T) => T)) => void] {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const isControlled = value !== undefined
  const current = isControlled ? value : uncontrolled

  const setValue = React.useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved =
        typeof next === "function" ? (next as (prev: T) => T)(current) : next
      if (!isControlled) setUncontrolled(resolved)
      onChange?.(resolved)
    },
    [isControlled, onChange, current]
  )

  return [current, setValue]
}

type MenuCoords = { top: number; left: number }

function useAnchoredMenu(disabled = false) {
  const [open, setOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const [coords, setCoords] = React.useState<MenuCoords | null>(null)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)
  const menuId = React.useId()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useLayoutEffect(() => {
    if (!open) return

    const update = () => {
      const trigger = triggerRef.current
      if (!trigger) return
      const rect = trigger.getBoundingClientRect()
      setCoords({
        top: rect.top + window.scrollY - 8,
        left: rect.left + window.scrollX,
      })
    }

    update()
    window.addEventListener("resize", update)
    window.addEventListener("scroll", update, true)
    return () => {
      window.removeEventListener("resize", update)
      window.removeEventListener("scroll", update, true)
    }
  }, [open])

  React.useEffect(() => {
    if (!open) return

    const onPointer = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null
      if (!target) return
      const inTrigger = triggerRef.current?.contains(target)
      const inContent = contentRef.current?.contains(target)
      if (!inTrigger && !inContent) setOpen(false)
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      event.preventDefault()
      setOpen(false)
      triggerRef.current?.focus()
    }

    document.addEventListener("mousedown", onPointer)
    document.addEventListener("touchstart", onPointer)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onPointer)
      document.removeEventListener("touchstart", onPointer)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  React.useEffect(() => {
    if (disabled) setOpen(false)
  }, [disabled])

  return { open, setOpen, mounted, coords, triggerRef, contentRef, menuId }
}

function AnchoredMenuPortal({
  mounted,
  open,
  coords,
  contentRef,
  id,
  role,
  "aria-label": ariaLabel,
  reduceMotion,
  className,
  children,
}: {
  mounted: boolean
  open: boolean
  coords: MenuCoords | null
  contentRef: React.RefObject<HTMLDivElement | null>
  id: string
  role: "menu" | "listbox"
  "aria-label": string
  reduceMotion: boolean
  className?: string
  children: React.ReactNode
}) {
  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {open && coords ? (
        <motion.div
          key={id}
          ref={contentRef as any}
          id={id}
          role={role}
          aria-label={ariaLabel}
          {...menuPresence(reduceMotion)}
          style={{
            position: "absolute",
            top: coords.top,
            left: coords.left,
            transform: "translateY(-100%)",
            zIndex: 9999,
          }}
          className={cn(MENU_PANEL_CLASS, className)}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  )
}

function MenuCheckmark({
  visible,
  reduceMotion,
  className,
}: {
  visible: boolean
  reduceMotion: boolean
  className?: string
}) {
  return (
    <AnimatePresence initial={false}>
      {visible ? (
        <motion.span
          key="check"
          {...scaleBlurPresence(reduceMotion)}
          className={cn("flex shrink-0", className)}
        >
          <CheckIcon className="size-3.5" aria-hidden />
        </motion.span>
      ) : null}
    </AnimatePresence>
  )
}

function IconSwapFrame({
  swapKey,
  reduceMotion,
  children,
}: {
  swapKey: string
  reduceMotion: boolean
  children: React.ReactNode
}) {
  return (
    <motion.span
      key={swapKey}
      {...iconPresence(reduceMotion)}
      className="relative z-10 flex"
    >
      {children}
    </motion.span>
  )
}

function RotatingPlaceholder({
  phrases,
  interval,
  active,
  reduceMotion,
}: {
  phrases: readonly string[]
  interval: number
  active: boolean
  reduceMotion: boolean
}) {
  const [index, setIndex] = React.useState(0)
  const safePhrases = phrases.length > 0 ? phrases : DEFAULT_PLACEHOLDERS
  const phraseCount = safePhrases.length

  React.useEffect(() => {
    if (!active || reduceMotion || phraseCount <= 1) return
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % phraseCount)
    }, interval)
    return () => window.clearInterval(id)
  }, [active, interval, reduceMotion, phraseCount])

  const current = safePhrases[index % phraseCount] ?? safePhrases[0]

  if (!active) return null

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 px-1"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={current}
          className="text-[var(--color-text-muted,#A1A1AA)]/70 block truncate text-[14px] leading-7 sm:text-base font-normal"
          {...placeholderPresence(reduceMotion)}
        >
          {current}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

function ActiveToolChip({
  label,
  icon,
  onRemove,
  reduceMotion,
}: {
  label: string
  icon: React.ReactNode
  onRemove: () => void
  reduceMotion: boolean
}) {
  return (
    <motion.span
      layout
      {...scaleBlurPresence(reduceMotion)}
      className={CHIP_SURFACE_CLASS}
    >
      <span className="flex shrink-0 [&_svg]:size-3.5 text-[#FF5E00]">{icon}</span>
      <span>{label}</span>
      <button
        type="button"
        aria-label={`Disable ${label}`}
        onClick={onRemove}
        className={cn(
          "text-[var(--color-text-muted,#A1A1AA)] hover:text-[var(--color-text,#F4F4F6)] flex size-5 cursor-pointer items-center justify-center rounded-full",
          "transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)]",
          "focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:outline-none"
        )}
      >
        <XIcon className="size-3" aria-hidden />
      </button>
    </motion.span>
  )
}

function actionsItemClass(active = false) {
  return cn(
    "relative flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs font-medium",
    "transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)]",
    "focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:outline-none",
    active
      ? "bg-[#FF5E00]/20 text-[#FF5E00]"
      : "text-[var(--color-text-muted,#A1A1AA)] hover:bg-[var(--color-surface-hover,#1E1E2C)] hover:text-[var(--color-text,#F4F4F6)]"
  )
}

function PlusActionsMenu({
  disabled,
  reduceMotion,
  deepResearch,
  webSearch,
  onUploadFile,
  onToggleDeepResearch,
  onToggleWebSearch,
  onSkills,
  onConnectors,
}: {
  disabled?: boolean
  reduceMotion: boolean
  deepResearch: boolean
  webSearch: boolean
  onUploadFile?: () => void
  onToggleDeepResearch: () => void
  onToggleWebSearch: () => void
  onSkills?: () => void
  onConnectors?: () => void
}) {
  const { open, setOpen, mounted, coords, triggerRef, contentRef, menuId } =
    useAnchoredMenu(disabled)

  const runAndClose = (action?: () => void) => {
    action?.()
    setOpen(false)
  }

  return (
    <div className="relative">
      <motion.button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label="Open actions"
        onClick={() => setOpen((v) => !v)}
        whileHover={disabled ? undefined : { scale: 1.05, y: -1 }}
        whileTap={disabled ? undefined : { scale: 0.96 }}
        transition={SPRING_PRESS}
        className={cn(
          TOOLBAR_BTN_CLASS,
          "text-[var(--color-text-muted,#A1A1AA)] border border-[var(--color-border,#272738)] bg-[var(--color-surface,#181822)]",
          open && "bg-[var(--color-surface-hover,#1E1E2C)] text-[#FF5E00] border-[#FF5E00]/40"
        )}
      >
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2, ease: EASE }}
          className="flex [&_svg]:size-4"
        >
          <PlusIcon aria-hidden />
        </motion.span>
      </motion.button>

      <AnchoredMenuPortal
        mounted={mounted}
        open={open}
        coords={coords}
        contentRef={contentRef}
        id={menuId}
        role="menu"
        aria-label="Actions"
        reduceMotion={reduceMotion}
        className="min-w-56"
      >
        <div className="flex flex-col gap-0.5">
          <motion.button
            type="button"
            role="menuitem"
            whileTap={{ scale: 0.98 }}
            transition={SPRING_PRESS}
            className={actionsItemClass()}
            onClick={() => runAndClose(onUploadFile)}
          >
            <UploadIcon className="size-4 shrink-0 opacity-70" aria-hidden />
            <span>Upload Document / Notes</span>
          </motion.button>

          <motion.button
            type="button"
            role="menuitemcheckbox"
            aria-checked={deepResearch}
            whileTap={{ scale: 0.98 }}
            transition={SPRING_PRESS}
            className={actionsItemClass(deepResearch)}
            onClick={() => runAndClose(onToggleDeepResearch)}
          >
            <TelescopeIcon className="size-4 shrink-0 opacity-70" aria-hidden />
            <span className="min-w-0 flex-1">Deep Research Mode</span>
            <MenuCheckmark visible={deepResearch} reduceMotion={reduceMotion} />
          </motion.button>

          <motion.button
            type="button"
            role="menuitemcheckbox"
            aria-checked={webSearch}
            whileTap={{ scale: 0.98 }}
            transition={SPRING_PRESS}
            className={actionsItemClass(webSearch)}
            onClick={() => runAndClose(onToggleWebSearch)}
          >
            <GlobeIcon className="size-4 shrink-0 opacity-70" aria-hidden />
            <span className="min-w-0 flex-1">Google & Web Sources</span>
            <MenuCheckmark visible={webSearch} reduceMotion={reduceMotion} />
          </motion.button>

          <div role="separator" className="bg-[var(--color-border,#272738)] my-1.5 h-px" />

          <motion.button
            type="button"
            role="menuitem"
            whileTap={{ scale: 0.98 }}
            transition={SPRING_PRESS}
            className={actionsItemClass()}
            onClick={() => runAndClose(onSkills)}
          >
            <PuzzleIcon className="size-4 shrink-0 opacity-70" aria-hidden />
            <span>Study Skills & Methods</span>
          </motion.button>

          <motion.button
            type="button"
            role="menuitem"
            whileTap={{ scale: 0.98 }}
            transition={SPRING_PRESS}
            className={actionsItemClass()}
            onClick={() => runAndClose(onConnectors)}
          >
            <UnplugIcon className="size-4 shrink-0 opacity-70" aria-hidden />
            <span>RAG Document Store</span>
          </motion.button>
        </div>
      </AnchoredMenuPortal>
    </div>
  )
}

const WAVE_BARS = [0.35, 0.7, 0.45, 0.9, 0.55, 0.8, 0.4] as const

const DEMO_STUDY_TRANSCRIPTS = [
  "How to learn Java object-oriented programming from scratch",
  "Generate 10 quiz questions on Operating Systems deadlocks",
  "Explain gradient descent and backpropagation in machine learning",
  "Create an intensive 2-week exam roadmap for Calculus II",
] as const

function DictationWaveform({
  processing,
  reduceMotion,
}: {
  processing: boolean
  reduceMotion: boolean
}) {
  return (
    <motion.div
      layout
      {...statusPresence(reduceMotion)}
      className={cn(
        "bg-[var(--color-surface-hover,#1E1E2C)] text-[var(--color-text,#F4F4F6)] flex h-9 items-center gap-2 rounded-xl px-2.5 border border-[var(--color-border,#272738)]",
        "shadow-[inset_0_0_0_1px_rgba(123,123,123,0.12)]"
      )}
      aria-hidden
    >
      {processing ? (
        <span className="text-[var(--color-text-muted,#A1A1AA)] flex items-center gap-1.5 text-xs font-medium">
          <Loader2Icon className="size-3.5 animate-spin text-[#FF5E00]" />
          Processing
        </span>
      ) : (
        <div className="flex h-4 items-end gap-[3px]">
          {WAVE_BARS.map((base, index) => (
            <motion.span
              key={index}
              className="bg-[#FF5E00] w-[3px] origin-bottom rounded-full"
              initial={{ height: 4 }}
              animate={
                reduceMotion
                  ? { height: Math.max(4, base * 14) }
                  : {
                      height: [
                        Math.max(3, base * 6),
                        Math.max(8, base * 16),
                        Math.max(4, base * 9),
                        Math.max(10, base * 14),
                      ],
                    }
              }
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : {
                      duration: 0.7 + index * 0.08,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.05,
                    }
              }
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}

function VoiceModeBadge({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <motion.div
      layout
      {...statusPresence(reduceMotion)}
      className={cn(
        "bg-[#FF5E00]/20 text-[#FF5E00] border border-[#FF5E00]/40 flex h-9 items-center gap-2 rounded-xl px-2.5",
        "shadow-[0_0_12px_rgba(255,94,0,0.25)]"
      )}
      role="status"
      aria-live="polite"
    >
      <motion.span
        className="flex"
        animate={reduceMotion ? undefined : { opacity: [0.55, 1, 0.55] }}
        transition={{ duration: 1.4, ease: EASE, repeat: Infinity }}
      >
        <AudioLinesIcon className="size-3.5" aria-hidden />
      </motion.span>
      <span className="text-xs font-bold tracking-tight">Voice Orb Active</span>
    </motion.div>
  )
}

function MicButton({
  disabled,
  phase,
  onToggle,
  reduceMotion,
}: {
  disabled?: boolean
  phase: DictationPhase
  onToggle: () => void
  reduceMotion: boolean
}) {
  const active = phase === "recording"
  const processing = phase === "processing"
  const label =
    phase === "recording"
      ? "Stop recording"
      : phase === "processing"
        ? "Processing voice"
        : "Start voice dictation"

  return (
    <motion.button
      type="button"
      aria-label={label}
      aria-pressed={active}
      aria-busy={processing || undefined}
      disabled={disabled || processing}
      onClick={onToggle}
      whileHover={disabled || processing ? undefined : { scale: 1.05, y: -1 }}
      whileTap={disabled || processing ? undefined : { scale: 0.96 }}
      transition={SPRING_PRESS}
      className={cn(
        TOOLBAR_BTN_CLASS,
        "overflow-visible border border-[var(--color-border,#272738)] bg-[var(--color-surface,#181822)]",
        active || processing
          ? "bg-[#FF5E00]/20 text-[#FF5E00] border-[#FF5E00]/40"
          : "text-[var(--color-text-muted,#A1A1AA)]"
      )}
    >
      <AnimatePresence>
        {active && !reduceMotion ? (
          <motion.span
            key="mic-ring"
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-xl border border-[#FF5E00]"
            initial={{ opacity: 0.45, scale: 1 }}
            animate={{ opacity: 0, scale: 1.55 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: EASE, repeat: Infinity }}
          />
        ) : null}
      </AnimatePresence>
      <AnimatePresence mode="wait" initial={false}>
        {processing ? (
          <IconSwapFrame swapKey="processing" reduceMotion={reduceMotion}>
            <Loader2Icon className="size-4 animate-spin text-[#FF5E00]" aria-hidden />
          </IconSwapFrame>
        ) : active ? (
          <IconSwapFrame swapKey="stop" reduceMotion={reduceMotion}>
            <SquareIcon className="size-3.5 fill-current text-[#FF5E00]" aria-hidden />
          </IconSwapFrame>
        ) : (
          <IconSwapFrame swapKey="mic" reduceMotion={reduceMotion}>
            <MicIcon className="size-4" aria-hidden />
          </IconSwapFrame>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

function ActionButton({
  disabled,
  status,
  hasText,
  talking,
  onSend,
  onTalkToggle,
  reduceMotion,
}: {
  disabled?: boolean
  status: AiPromptSendStatus
  hasText: boolean
  talking: boolean
  onSend: () => void
  onTalkToggle: () => void
  reduceMotion: boolean
}) {
  const isLoading = status === "loading"
  const isSuccess = status === "success"
  const showSend = !talking && (hasText || isLoading || isSuccess)
  const isDisabled = talking ? false : disabled || isLoading

  const label = talking
    ? "Stop voice conversation"
    : isLoading
      ? "Generating..."
      : isSuccess
        ? "Generated"
        : showSend
          ? "Generate study path"
          : "Talk with Blast"

  return (
    <motion.button
      type="button"
      aria-label={label}
      aria-pressed={talking || undefined}
      aria-busy={isLoading || undefined}
      disabled={isDisabled}
      onClick={() => {
        if (talking || !showSend) onTalkToggle()
        else onSend()
      }}
      whileHover={
        isDisabled ? undefined : { scale: 1.06, transition: SPRING_SOFT }
      }
      whileTap={isDisabled ? undefined : { scale: 0.94 }}
      animate={{
        scale: isSuccess && !talking ? [1, 1.08, 1] : 1,
      }}
      transition={SPRING_PRESS}
      className={cn(
        "relative flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-full font-bold",
        "transition-[background-color,box-shadow,opacity,color] duration-200 ease-[cubic-bezier(0.2,0,0,1)]",
        "focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:outline-none",
        "disabled:pointer-events-none",
        showSend || talking
          ? [
              "bg-gradient-to-br from-[#FF5E00] via-[#FFAA00] to-[#E11D48] text-white",
              "shadow-[0_4px_16px_rgba(255,94,0,0.35)]",
              "hover:shadow-[0_6px_20px_rgba(255,94,0,0.5)]",
            ]
          : "bg-[var(--color-surface-hover,#1E1E2C)] text-[var(--color-text-muted,#A1A1AA)] hover:text-[var(--color-text,#F4F4F6)] border border-[var(--color-border,#272738)]",
        talking &&
          "shadow-[0_0_0_4px_rgba(255,94,0,0.3),0_4px_20px_rgba(255,94,0,0.5)]"
      )}
    >
      <AnimatePresence>
        {talking && !reduceMotion ? (
          <>
            <motion.span
              key="ring-1"
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full border border-[#FF5E00]"
              initial={{ opacity: 0.5, scale: 1 }}
              animate={{ opacity: 0, scale: 1.85 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, ease: EASE, repeat: Infinity }}
            />
            <motion.span
              key="ring-2"
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full border border-[#FFAA00]"
              initial={{ opacity: 0.35, scale: 1 }}
              animate={{ opacity: 0, scale: 1.55 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1.4,
                ease: EASE,
                repeat: Infinity,
                delay: 0.35,
              }}
            />
          </>
        ) : null}
      </AnimatePresence>

      <AnimatePresence mode="wait" initial={false}>
        {talking ? (
          <IconSwapFrame swapKey="stop" reduceMotion={reduceMotion}>
            <SquareIcon className="size-3.5 fill-current" aria-hidden />
          </IconSwapFrame>
        ) : isLoading ? (
          <IconSwapFrame swapKey="loader" reduceMotion={reduceMotion}>
            <Loader2Icon className="size-4 animate-spin text-white" aria-hidden />
          </IconSwapFrame>
        ) : isSuccess ? (
          <IconSwapFrame swapKey="check" reduceMotion={reduceMotion}>
            <CheckIcon className="size-4 text-white" aria-hidden />
          </IconSwapFrame>
        ) : showSend ? (
          <IconSwapFrame swapKey="arrow" reduceMotion={reduceMotion}>
            <ArrowUpIcon className="size-4 text-white stroke-[2.5]" aria-hidden />
          </IconSwapFrame>
        ) : (
          <IconSwapFrame swapKey="waves" reduceMotion={reduceMotion}>
            <AudioLinesIcon className="size-4" aria-hidden />
          </IconSwapFrame>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

const AiPromptInput = React.forwardRef<HTMLTextAreaElement, AiPromptInputProps>(
  (
    {
      value: valueProp,
      defaultValue = "",
      onChange,
      onSubmit,
      placeholders = DEFAULT_PLACEHOLDERS,
      placeholderInterval = 3200,
      models = DEFAULT_MODELS,
      modelSelection: modelSelectionProp,
      defaultModelSelection,
      onModelSelectionChange,
      disabled = false,
      status = "idle",
      maxLength = 4000,
      minRows = 1,
      maxRows = 8,
      showToolbar = true,
      showActions = true,
      showModelSelector = true,
      deepResearch: deepResearchProp,
      defaultDeepResearch = false,
      onDeepResearchChange,
      webSearch: webSearchProp,
      defaultWebSearch = true,
      onWebSearchChange,
      onUploadFile,
      onSkills,
      onConnectors,
      getDictationTranscript,
      onDictationChange,
      onVoiceChange,
      className,
      textareaClassName,
      "aria-label": ariaLabel = "Blast AI Study Prompt",
      "data-testid": dataTestId,
    },
    ref
  ) => {
    const [value, setValue] = useControllableState({
      value: valueProp,
      defaultValue,
      onChange,
    })

    const initialSelection =
      defaultModelSelection ??
      (models[0] ? defaultSelectionFor(models[0]) : { id: "" })
    const [modelSelection, setModelSelection] = useControllableState({
      value: modelSelectionProp,
      defaultValue: initialSelection,
      onChange: onModelSelectionChange,
    })

    const [deepResearch, setDeepResearch] = useControllableState({
      value: deepResearchProp,
      defaultValue: defaultDeepResearch,
      onChange: onDeepResearchChange,
    })

    const [webSearch, setWebSearch] = useControllableState({
      value: webSearchProp,
      defaultValue: defaultWebSearch,
      onChange: onWebSearchChange,
    })

    const [focused, setFocused] = React.useState(false)
    const [height, setHeight] = React.useState<number | "auto">("auto")
    const reduceMotion = usePrefersReducedMotion()
    const [dictationPhase, setDictationPhase] =
      React.useState<DictationPhase>("idle")
    const [talking, setTalking] = React.useState(false)

    const valueRef = React.useRef(value)
    valueRef.current = value
    const transcriptIndex = React.useRef(0)
    const processTimer = React.useRef<number | null>(null)
    const getTranscriptRef = React.useRef(getDictationTranscript)
    getTranscriptRef.current = getDictationTranscript

    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)
    const mirrorRef = React.useRef<HTMLDivElement>(null)
    const fieldId = React.useId()

    const trimmed = value.trim()
    const hasText = trimmed.length > 0
    const showPlaceholder = value.length === 0 && !focused
    const hasActiveTools = deepResearch || webSearch
    const dictating = dictationPhase !== "idle"
    const sessionLocked = dictating || talking

    React.useEffect(() => {
      if (!hasText || !talking) return
      setTalking(false)
      onVoiceChange?.(false)
    }, [hasText, talking, onVoiceChange])

    React.useEffect(() => {
      return () => {
        if (processTimer.current !== null) {
          window.clearTimeout(processTimer.current)
        }
      }
    }, [])

    const resize = React.useCallback(() => {
      const el = textareaRef.current
      const mirror = mirrorRef.current
      if (!el) return

      const styles = window.getComputedStyle(el)
      const lineHeight = Number.parseFloat(styles.lineHeight) || 28
      const paddingY =
        Number.parseFloat(styles.paddingTop) +
        Number.parseFloat(styles.paddingBottom)
      const minH = lineHeight * minRows + paddingY
      const maxH = lineHeight * maxRows + paddingY

      if (mirror) {
        mirror.style.width = `${el.clientWidth}px`
        mirror.textContent = value.endsWith("\n") ? `${value} ` : value || " "
        const next = Math.min(Math.max(mirror.scrollHeight, minH), maxH)
        setHeight(next)
        el.style.overflowY = mirror.scrollHeight > maxH ? "auto" : "hidden"
      } else {
        el.style.height = "auto"
        const next = Math.min(Math.max(el.scrollHeight, minH), maxH)
        setHeight(next)
        el.style.overflowY = el.scrollHeight > maxH ? "auto" : "hidden"
      }
    }, [value, minRows, maxRows])

    React.useLayoutEffect(() => {
      resize()
    }, [resize])

    const submit = React.useCallback(() => {
      if (disabled || status === "loading" || !trimmed) return
      onSubmit?.(trimmed, modelSelection)
    }, [disabled, status, trimmed, onSubmit, modelSelection])

    const finishDictation = React.useCallback(() => {
      setDictationPhase("processing")
      onDictationChange?.(false)
      if (processTimer.current !== null) {
        window.clearTimeout(processTimer.current)
      }
      processTimer.current = window.setTimeout(() => {
        const sample =
          getTranscriptRef.current?.() ??
          DEMO_STUDY_TRANSCRIPTS[transcriptIndex.current % DEMO_STUDY_TRANSCRIPTS.length]
        transcriptIndex.current += 1
        const current = valueRef.current
        const nextValue = current.trim()
          ? `${current.trim()} ${sample}`
          : sample
        setValue(nextValue)
        setDictationPhase("idle")
        processTimer.current = null
      }, 900)
    }, [onDictationChange, setValue])

    const toggleDictation = React.useCallback(() => {
      if (disabled || dictationPhase === "processing") return
      if (dictationPhase === "recording") {
        finishDictation()
        return
      }
      if (talking) {
        setTalking(false)
        onVoiceChange?.(false)
      }
      setDictationPhase("recording")
      onDictationChange?.(true)
    }, [
      disabled,
      dictationPhase,
      talking,
      finishDictation,
      onDictationChange,
      onVoiceChange,
    ])

    const toggleTalk = React.useCallback(() => {
      if (disabled || dictationPhase === "processing") return
      const next = !talking
      if (next && dictationPhase === "recording") {
        setDictationPhase("idle")
        onDictationChange?.(false)
      }
      setTalking(next)
      onVoiceChange?.(next)
    }, [disabled, dictationPhase, talking, onVoiceChange, onDictationChange])

    const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (
        event.key === "Enter" &&
        !event.shiftKey &&
        !event.nativeEvent.isComposing
      ) {
        event.preventDefault()
        submit()
      }
    }

    return (
      <motion.div
        data-slot="ai-prompt-input"
        data-focused={focused || undefined}
        data-disabled={disabled || undefined}
        data-status={status}
        data-dictating={dictating || undefined}
        data-dictation-phase={
          dictationPhase === "idle" ? undefined : dictationPhase
        }
        data-talking={talking || undefined}
        animate={
          reduceMotion
            ? undefined
            : {
                boxShadow: focused
                  ? "0 2px 8px rgba(8,8,8,0.2), 0 16px 48px -12px rgba(255,94,0,0.18)"
                  : "0 1px 2px rgba(8,8,8,0.1), 0 8px 24px -12px rgba(0,0,0,0.25)",
              }
        }
        transition={{ duration: 0.28, ease: EASE }}
        className={cn(
          "bg-[var(--color-surface,#181822)] border-[var(--color-border,#272738)] relative w-full overflow-visible rounded-[1.75rem] border-2 p-3.5 sm:p-4",
          "transition-[background-color,border-color,opacity] duration-200 ease-[cubic-bezier(0.2,0,0,1)]",
          focused && "border-[#FF5E00]/60",
          disabled && "pointer-events-none opacity-55",
          talking && "border-[#FF5E00] ring-2 ring-[#FF5E00]/25",
          className
        )}
        data-testid={dataTestId}
      >
        <div
          ref={mirrorRef}
          aria-hidden
          className="invisible absolute top-0 left-0 -z-10 px-1 text-[15px] leading-7 break-words whitespace-pre-wrap sm:text-base"
        />

        <AnimatePresence initial={false}>
          {hasActiveTools ? (
            <motion.div
              key="active-tools"
              initial={false}
              className="mb-2.5 flex flex-wrap items-center gap-1.5 px-0.5"
            >
              <AnimatePresence initial={false} mode="popLayout">
                {deepResearch ? (
                  <ActiveToolChip
                    key="deep-research"
                    label="Deep Research"
                    icon={<TelescopeIcon aria-hidden />}
                    reduceMotion={reduceMotion}
                    onRemove={() => setDeepResearch(false)}
                  />
                ) : null}
                {webSearch ? (
                  <ActiveToolChip
                    key="web-search"
                    label="Google & Web Sources"
                    icon={<GlobeIcon aria-hidden />}
                    reduceMotion={reduceMotion}
                    onRemove={() => setWebSearch(false)}
                  />
                ) : null}
              </AnimatePresence>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div
          className={cn(
            "relative min-h-7 transition-opacity duration-200 ease-[cubic-bezier(0.2,0,0,1)]",
            talking && "pointer-events-none opacity-40"
          )}
        >
          <RotatingPlaceholder
            phrases={placeholders}
            interval={placeholderInterval}
            active={showPlaceholder && !talking}
            reduceMotion={reduceMotion}
          />

          <motion.textarea
            id={fieldId}
            ref={(node) => assignRef(node, ref, textareaRef)}
            value={value}
            disabled={disabled || sessionLocked}
            rows={minRows}
            maxLength={maxLength}
            aria-label={ariaLabel}
            aria-multiline="true"
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            animate={
              reduceMotion
                ? undefined
                : { height: typeof height === "number" ? height : undefined }
            }
            transition={SPRING_HEIGHT}
            className={cn(
              "text-[var(--color-text,#F4F4F6)] relative z-10 block w-full resize-none bg-transparent px-1 font-body",
              "text-[15px] leading-7 sm:text-base font-medium",
              "placeholder:text-transparent",
              "outline-none focus-visible:outline-none",
              "disabled:cursor-not-allowed",
              "caret-[#FF5E00]",
              textareaClassName
            )}
            style={
              reduceMotion && typeof height === "number"
                ? { height }
                : undefined
            }
          />
        </div>

        <AnimatePresence initial={false}>
          {showToolbar ? (
            <motion.div
              key="toolbar"
              initial={false}
              animate={{
                opacity:
                  focused ||
                  value.length > 0 ||
                  hasActiveTools ||
                  dictating ||
                  talking
                    ? 1
                    : 0.85,
                y: 0,
              }}
              transition={{ duration: 0.22, ease: EASE }}
              className="border-[var(--color-border,#272738)] mt-3 flex items-center justify-between gap-2 border-t pt-3 sm:mt-3.5"
            >
              <div
                className={cn(
                  "flex min-w-0 items-center gap-1.5 transition-opacity duration-200 ease-[cubic-bezier(0.2,0,0,1)]",
                  sessionLocked && "pointer-events-none opacity-40"
                )}
              >
                {showActions ? (
                  <PlusActionsMenu
                    disabled={disabled || sessionLocked}
                    reduceMotion={reduceMotion}
                    deepResearch={deepResearch}
                    webSearch={webSearch}
                    onUploadFile={onUploadFile}
                    onToggleDeepResearch={() => setDeepResearch(!deepResearch)}
                    onToggleWebSearch={() => setWebSearch(!webSearch)}
                    onSkills={onSkills}
                    onConnectors={onConnectors}
                  />
                ) : null}

                {showModelSelector && models.length > 0 ? (
                  <ModelSelector
                    models={models}
                    value={modelSelection}
                    onValueChange={setModelSelection}
                    disabled={disabled || sessionLocked}
                  >
                    <ModelSelectorTrigger className="h-9">
                      <ModelSelectorValue className="max-w-40 sm:max-w-56" />
                    </ModelSelectorTrigger>
                    <ModelSelectorContent side="top" />
                  </ModelSelector>
                ) : null}
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <AnimatePresence initial={false}>
                  {dictating ? (
                    <DictationWaveform
                      key="dictation-wave"
                      processing={dictationPhase === "processing"}
                      reduceMotion={reduceMotion}
                    />
                  ) : null}
                  {talking ? (
                    <VoiceModeBadge
                      key="voice-mode"
                      reduceMotion={reduceMotion}
                    />
                  ) : null}
                </AnimatePresence>

                <MicButton
                  disabled={disabled || status === "loading" || talking}
                  phase={dictationPhase}
                  onToggle={toggleDictation}
                  reduceMotion={reduceMotion}
                />
                <ActionButton
                  disabled={disabled || dictationPhase !== "idle"}
                  status={status}
                  hasText={hasText}
                  talking={talking}
                  onSend={submit}
                  onTalkToggle={toggleTalk}
                  reduceMotion={reduceMotion}
                />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    )
  }
)

AiPromptInput.displayName = "AiPromptInput"

export { AiPromptInput }
export default AiPromptInput
