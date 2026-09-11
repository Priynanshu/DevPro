import { motion } from "framer-motion"
import { Cpu, Radio, Database } from "lucide-react"
import PublicNavbar from "../components/layout/PublicNavbar"
import Footer from "../components/layout/Footer"

const heroStats = [
    { label: "Global Ping Time", value: "< 0.8ms", valueTone: "text-ink", caption: "Edge kernel IPC sync", captionTone: "text-success" },
    { label: "Concurrency Engine", value: "Redis + Node", valueTone: "text-accent-400", caption: "Zero lock, zero race", captionTone: "text-ink-muted" },
    { label: "Active Repositories", value: "14,200+", valueTone: "text-ink", caption: "Topological dependency trees", captionTone: "text-ink-muted" },
    { label: "System Cold Start", value: "18ms", valueTone: "text-info", caption: "WebAssembly edge sandbox", captionTone: "text-ink-muted" }
]

const kernelLayers = [
    {
        icon: Cpu,
        layer: "LAYER 01 // CLIENT",
        badge: "0ms",
        tone: "text-accent-400",
        badgeTone: "bg-accent-500/20 text-accent-400",
        title: "In-Memory State VM",
        description: "Compiles the full project state into an in-memory buffer. Instant optimistic updates without waiting for a network round trip.",
        points: ["Zero layout thrashing", "Binary-efficient sync protocol", "Local snapshot cache"]
    },
    {
        icon: Radio,
        layer: "LAYER 02 // TRANSPORT",
        badge: "< 8ms",
        tone: "text-info",
        badgeTone: "bg-info/20 text-info",
        title: "Global Redis Mesh",
        description: "Distributed Redis-backed caching with automated invalidation. Merges simultaneous task edits with deterministic ordering.",
        points: ["Multi-region cache invalidation", "BullMQ event queue", "Zero conflict resolution prompts"],
        pinned: true
    },
    {
        icon: Database,
        layer: "LAYER 03 // STORAGE",
        badge: "NVMe Fast",
        tone: "text-success",
        badgeTone: "bg-success/20 text-success",
        title: "Append-Only Event Ledger",
        description: "Every task assignment, comment, and status transition is recorded with a verifiable audit trail in MongoDB.",
        points: ["Full activity audit trail", "Time-travel friendly history", "Zero accidental deletions"]
    }
]

const backers = [
    { label: "KRONOS_CAPITAL", dot: "bg-accent-500" },
    { label: "NEO_GRID_VENTURES", dot: "bg-info" },
    { label: "AXON_INFRA", dot: "bg-warning" },
    { label: "SPECTRA_SYSTEMS", dot: "bg-success" },
    { label: "HYPERLANE_OPS", dot: "bg-accent2" }
]

const AboutPage = () => {
    return (
        <div className="min-h-screen bg-canvas">
            <PublicNavbar />

            <main className="mx-auto w-full max-w-7xl space-y-28 px-6 py-16">

                {/* ================= HERO / MANIFESTO ================= */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                    className="space-y-8 pt-4"
                >
                    <div className="inline-flex items-center gap-2 rounded-full border border-accent-500/30 bg-accent-500/10 px-3 py-1 font-mono text-xs text-accent-400">
                        <span className="h-1.5 w-1.5 animate-ping rounded-full bg-accent-500" />
                        <span>// TASKFLOW ARCHITECTURAL DOCTRINE // FOUNDED 2026</span>
                    </div>

                    <div className="max-w-5xl space-y-4">
                        <h1 className="text-4xl font-extrabold uppercase leading-[1.05] tracking-tighter text-ink sm:text-6xl lg:text-7xl">
                            We believe software velocity is a{" "}
                            <span className="text-glow bg-gradient-to-r from-accent-500 via-accent-400 to-orange-300 bg-clip-text text-transparent">
                                Mathematical Certainty
                            </span>
                            , not team alchemy.
                        </h1>
                        <p className="max-w-3xl pt-2 text-lg font-normal leading-relaxed text-ink-muted sm:text-xl">
                            Modern engineering teams spend 41% of their daylight navigating bloated web apps, stale ticket queues, and ceremony meetings. TaskFlow was forged by engineers who refused to accept latency as a corporate tax.
                        </p>
                    </div>
                </motion.section>

                {/* ================= KERNEL ARCHITECTURE ================= */}
                <section className="space-y-6">
                    <div className="font-mono text-xs uppercase tracking-wider text-accent-400">// 02 // TECHNICAL DEEP DIVE</div>
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                        <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">The TaskFlow Kernel Architecture</h2>
                        <div className="flex items-center gap-3 font-mono text-xs text-ink-muted">
                            <span className="rounded border border-border bg-surface px-2.5 py-1 text-ink-muted">NODE.JS CORE</span>
                            <span className="rounded border border-border bg-surface px-2.5 py-1 text-ink-muted">REDIS + BULLMQ</span>
                            <span className="rounded border border-border bg-surface px-2.5 py-1 text-ink-muted">MONGODB</span>
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.6 }}
                        className="relative overflow-hidden rounded-xl border border-border bg-surface p-6 shadow-2xl lg:p-8"
                    >
                        <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-critical/80" />
                                <div className="h-3 w-3 rounded-full bg-warning/80" />
                                <div className="h-3 w-3 rounded-full bg-success/80" />
                                <span className="ml-3 font-mono text-xs text-ink-muted">topology_visualizer // cluster_state: OPTIMAL</span>
                            </div>
                            <div className="hidden font-mono text-xs text-accent-400 sm:block">
                                DAEMON // TASKFLOW_CORE_ENGINE
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            {kernelLayers.map((layer) => (
                                <div
                                    key={layer.layer}
                                    className={`relative space-y-3 rounded-lg border border-border bg-canvas p-5 ${layer.pinned ? "md:border-accent-500/30" : ""}`}
                                >
                                    {layer.pinned && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded bg-accent-500 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-white">
                                            Core Pipeline
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <span className={`flex items-center gap-1.5 font-mono text-xs font-semibold ${layer.tone}`}>
                                            <layer.icon size={13} />
                                            {layer.layer}
                                        </span>
                                        <span className={`rounded px-2 py-0.5 font-mono text-[10px] ${layer.badgeTone}`}>{layer.badge}</span>
                                    </div>
                                    <h4 className="font-display text-base font-bold text-ink">{layer.title}</h4>
                                    <p className="text-xs leading-relaxed text-ink-muted">{layer.description}</p>
                                    <ul className="space-y-1 font-mono text-[11px] text-ink-faint">
                                        {layer.points.map((point) => (
                                            <li key={point}>&bull; {point}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </section>

                {/* ================= INVESTOR / INFRASTRUCTURE BACKING ================= */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
                    className="space-y-6 rounded-xl border border-border bg-gradient-to-r from-surface via-surface-high to-surface p-8 text-center"
                >
                    <div className="font-mono text-xs uppercase tracking-widest text-ink-faint">// BACKED BY HIGH-PERFORMANCE CAPITAL // $24M SERIES A</div>
                    <h3 className="font-display text-2xl font-bold text-ink">Engineered With Backing From The Builders</h3>
                    <p className="mx-auto max-w-xl text-sm text-ink-muted">
                        Supported by founders and engineering leaders from the world's most demanding infrastructure, operating system, and cloud companies.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-8 pt-4 font-mono text-sm font-bold tracking-wider text-ink-muted md:gap-14">
                        {backers.map((backer) => (
                            <div key={backer.label} className="flex items-center gap-2 transition-colors hover:text-ink">
                                <span className={`h-2 w-2 rounded-full ${backer.dot}`} />
                                {backer.label}
                            </div>
                        ))}
                    </div>
                </motion.section>

            </main>

            <Footer />
        </div>
    )
}

export default AboutPage
