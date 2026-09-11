import clsx from "clsx"

// Buttons: sharp 6px radius, blood-orange primary, hairline-bordered secondary.
export const Button = ({ children, variant = "primary", className, ...props }) => {
    const base = "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"

    const variants = {
        primary: "bg-accent-500 text-white hover:bg-accent-600 shadow-[0_0_12px_rgba(255,77,0,0.25)]",
        outline: "bg-surface border border-border text-ink hover:border-border-strong hover:bg-surface-hover",
        ghost: "text-ink-muted hover:text-ink hover:bg-white/5",
        danger: "bg-critical text-white hover:opacity-90"
    }

    return (
        <button className={clsx(base, variants[variant], className)} {...props}>
            {children}
        </button>
    )
}

// Cards: flat dark surface, hairline border, no diffuse shadow — border
// brightens on hover instead of the card "lifting".
export const Card = ({ children, className, ...props }) => {
    return (
        <div className={clsx("rounded-lg border border-border bg-surface p-5 transition-colors hover:border-border-strong", className)} {...props}>
            {children}
        </div>
    )
}

// Status tags: small-radius rectangles (this design system avoids pill
// shapes for badges), tinted background, solid-colored text.
export const Badge = ({ children, tone = "accent" }) => {
    const tones = {
        accent: "bg-accent-500/15 text-accent-300 border-accent-500/20",
        info: "bg-info/15 text-info border-info/20",
        success: "bg-success/15 text-success border-success/20",
        warning: "bg-warning/15 text-warning border-warning/20",
        critical: "bg-critical/15 text-critical border-critical/20",
        gray: "bg-white/5 text-ink-muted border-border"
    }

    return (
        <span className={clsx("inline-flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wide", tones[tone])}>
            {children}
        </span>
    )
}

export const EmptyState = ({ icon: Icon, title, description, action }) => {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface/50 px-6 py-16 text-center">
            {Icon && (
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-accent-400">
                    <Icon size={26} />
                </div>
            )}
            <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
            {description && <p className="mt-1 max-w-sm text-sm text-ink-muted">{description}</p>}
            {action && <div className="mt-5">{action}</div>}
        </div>
    )
}

export const Skeleton = ({ className, style }) => {
    return <div className={clsx("animate-pulse rounded-md bg-surface-high", className)} style={style} />
}
