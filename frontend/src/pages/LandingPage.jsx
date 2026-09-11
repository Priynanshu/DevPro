import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import {
    Zap, Terminal, ArrowRight, PlayCircle, Network, Bot, Gauge, Radar,
    Share2, Layers, RefreshCw, SlidersHorizontal, Timer, ShieldCheck,
    CheckCircle2, Activity, Lock, Rocket, GitBranch
} from "lucide-react"
import PublicNavbar from "../components/layout/PublicNavbar"
import Footer from "../components/layout/Footer"
import WebGLShaderBackground from "../components/ui/WebGLShaderBackground"

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: (delay = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay, ease: "easeOut" } })
}

const features = [
    {
        num: "01",
        icon: Zap,
        title: "Live Realtime Tracking",
        description: "Built atop zero-latency WebSockets and CRDTs. Every card adjustment, code branch link, and status shift propagates globally in under 12 milliseconds.",
        readout: "WEBSOCKET_CHANNEL: #production-telemetry",
        tone: "text-accent-400", ring: "hover:border-accent-500/60", glow: "bg-accent-500/10 group-hover:bg-accent-500/20", titleHover: "group-hover:text-accent-400"
    },
    {
        num: "02",
        icon: Bot,
        title: "AI Task Copilot",
        description: "Feed an architectural diagram or PR description. DevPro automatically decomposes system specs into atomic, verified developer tickets with test suites.",
        readout: "LLM_DECOMPOSE: 8 modules staged",
        tone: "text-info", ring: "hover:border-info/60", glow: "bg-info/10 group-hover:bg-info/20", titleHover: "group-hover:text-info"
    },
    {
        num: "03",
        icon: Gauge,
        title: "Redis-Speed Performance",
        description: "In-memory state tier cached at edge nodes guarantees 60fps interaction speed. Zero lag, zero spinners, zero page reloads on repos with 100k+ issues.",
        readout: "MUTATION_TIME: 0.4ms at 60 FPS",
        tone: "text-success", ring: "hover:border-success/60", glow: "bg-success/10 group-hover:bg-success/20", titleHover: "group-hover:text-success"
    },
    {
        num: "04",
        icon: Radar,
        title: "Smart Urgency Engine",
        description: "Machine intelligence spots blocking tasks and lagging reviewers before deadlines slip. Automated smart nudges route critical approvals straight to notifications.",
        readout: "CRITICAL PATH SAVED: +18 hrs/sprint",
        tone: "text-critical", ring: "hover:border-critical/60", glow: "bg-critical/10 group-hover:bg-critical/20", titleHover: "group-hover:text-critical"
    },
    {
        num: "05",
        icon: Share2,
        title: "Neural Org Graph",
        description: "Topological mapping of your team and task ownership. Know precisely who's assigned what, who's reviewing, and where architectural drag resides.",
        readout: "GRAPH DENSITY: 94.2% (Topological tie)",
        tone: "text-accent2", ring: "hover:border-accent2/60", glow: "bg-accent2/10 group-hover:bg-accent2/20", titleHover: "group-hover:text-accent2"
    },
    {
        num: "06",
        icon: Layers,
        title: "Unified Engineering Stack",
        description: "Zero cognitive context switching. Projects, tasks, subtasks, comments and files, all inside one deterministic workspace.",
        readout: "SYNC_HOOKS: 24 PROTOCOLS LIVE",
        tone: "text-ink", ring: "hover:border-white/40", glow: "bg-white/5 group-hover:bg-white/10", titleHover: "group-hover:text-white"
    }
]

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-canvas">
            <PublicNavbar />

            {/* ================= HERO ================= */}
            <section className="relative flex min-h-[88vh] flex-col items-center justify-center overflow-hidden border-b border-border px-6 pb-24 pt-16 lg:px-8">
                <div className="absolute inset-0 z-0 opacity-80 pointer-events-none">
                    <WebGLShaderBackground />
                </div>
                <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(10,10,11,0.65)_55%,#0A0A0B_100%)]" />
                <div className="pointer-events-none absolute inset-0 z-10 opacity-15 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]" />

                {/* Floating lateral metric badges */}
                <div className="pointer-events-none absolute left-8 top-1/2 z-20 hidden -translate-y-16 flex-col gap-2 rounded border border-white/10 bg-surface/90 p-3 shadow-2xl backdrop-blur-md xl:flex">
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-success" />
                        <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">IPC LATENCY</span>
                    </div>
                    <div className="font-display text-2xl font-bold tracking-tight text-ink">0.4<span className="ml-0.5 font-mono text-sm text-success">ms</span></div>
                    <div className="font-mono text-[10px] text-ink-faint">Local Shared Memory</div>
                </div>
                <div className="pointer-events-none absolute right-8 top-1/2 z-20 hidden -translate-y-8 flex-col gap-2 rounded border border-white/10 bg-surface/90 p-3 shadow-2xl backdrop-blur-md xl:flex">
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-info" />
                        <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">CRDT STABILITY</span>
                    </div>
                    <div className="font-display text-2xl font-bold tracking-tight text-ink">99.999<span className="ml-0.5 font-mono text-sm text-info">%</span></div>
                    <div className="font-mono text-[10px] text-ink-faint">Conflict-Free Topology</div>
                </div>

                <div className="relative z-20 mx-auto flex max-w-5xl flex-col items-center text-center">
                    

                    <motion.h1
                        initial="hidden" animate="show" custom={0.1} variants={fadeUp}
                        className="mb-6 max-w-4xl font-display text-4xl font-extrabold uppercase leading-[1.05] tracking-tighter text-ink sm:text-6xl lg:text-7xl"
                    >
                        THE <span className="text-glow bg-gradient-to-r from-accent-500 via-accent-400 to-orange-300 bg-clip-text text-transparent underline decoration-accent-500/40 decoration-wavy underline-offset-8">DETERMINISTIC</span> PROJECT ENGINE FOR HIGH-VELOCITY TEAMS.
                    </motion.h1>

                    <motion.p
                        initial="hidden" animate="show" custom={0.2} variants={fadeUp}
                        className="mb-10 max-w-3xl text-base font-normal leading-relaxed text-ink-muted sm:text-lg lg:text-xl"
                    >
                        Eliminate coordination drag. AI-assisted task decomposition, real-time dependency tracking, and zero-conflict multi-region state syncing built for elite engineering crews.
                    </motion.p>

                    <motion.div initial="hidden" animate="show" custom={0.3} variants={fadeUp} className="mb-16 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                        <Link
                            to="/register"
                            className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded bg-accent-500 px-8 py-4 text-sm font-bold uppercase tracking-wider text-white shadow-[0_0_35px_rgba(255,77,0,0.5)] transition hover:bg-accent-600 hover:shadow-[0_0_50px_rgba(255,77,0,0.8)] active:scale-95 sm:text-base"
                        >
                            <Zap size={20} className="transition-transform group-hover:rotate-12" />
                            <span>Start Free Cluster</span>
                            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                            <div className="absolute inset-0 w-1/2 -translate-x-full skew-x-12 bg-white/25 transition-transform duration-1000 ease-out group-hover:translate-x-[350%]" />
                        </Link>
                        <a
                            href="#product"
                            className="group inline-flex items-center gap-3 rounded border border-white/10 bg-surface-high/80 px-6 py-4 text-sm font-semibold uppercase tracking-wider text-ink-muted shadow-lg backdrop-blur-xl transition hover:border-white/30 hover:bg-surface-hover hover:text-ink active:scale-95 sm:text-base"
                        >
                            <PlayCircle size={20} className="text-accent-400 transition-transform group-hover:scale-125" />
                            <span>Watch 90s Engine Breakdown</span>
                            <span className="ml-1 font-mono text-xs text-ink-faint">01:30</span>
                        </a>
                    </motion.div>

                </div>
            </section>

            {/* ================= INTERACTIVE PRODUCT CHASSIS ================= */}
            <section className="relative z-30 mx-auto -mt-12 max-w-7xl px-4 sm:px-6 lg:px-8" id="product">
                <motion.div
                    initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6 }}
                    className="group relative rounded-xl border border-white/15 bg-surface/90 p-4 shadow-2xl backdrop-blur-2xl transition hover:border-accent-500/50 sm:p-7"
                >
                    <div className="absolute -top-[1px] left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-accent-500 to-transparent opacity-80" />

                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                                <span className="inline-block h-3 w-3 rounded-full bg-critical/80" />
                                <span className="inline-block h-3 w-3 rounded-full bg-warning/80" />
                                <span className="inline-block h-3 w-3 rounded-full bg-success/80" />
                            </div>
                            <span className="mx-1 h-4 w-px bg-white/10" />
                            <span className="flex items-center gap-2 font-mono text-xs font-semibold tracking-wider text-ink-muted">
                                <Terminal size={14} className="text-accent-400" />
                                DevPro_RUNTIME // KANBAN_STREAM_SYNC [ACTIVE_V1]
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-2 rounded border border-success/20 bg-success/10 px-2.5 py-1 font-mono text-[11px] text-success">
                                <span className="h-1.5 w-1.5 animate-ping rounded-full bg-success" />
                                LIVE WS: 8.4ms
                            </span>
                            <button className="p-1 text-ink-muted transition hover:text-ink" title="Reload cluster state">
                                <RefreshCw size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                        <div className="flex flex-col gap-3.5 rounded-lg border border-white/5 bg-surface-high/60 p-4">
                            <div className="flex items-center justify-between border-b border-white/5 pb-1">
                                <span className="flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-ink-muted">
                                    <span className="h-2 w-2 rounded-full bg-accent-500" />
                                    Todo
                                </span>
                                <span className="rounded bg-white/5 px-2 py-0.5 font-mono text-[10px] text-ink-muted">3</span>
                            </div>

                            <div className="cursor-grab rounded-md border border-white/10 bg-surface-hover/90 p-4 shadow-md transition hover:-translate-y-1 hover:border-accent-500/50 hover:shadow-xl">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="rounded border border-accent-500/20 bg-accent-500/10 px-2 py-0.5 font-mono text-[11px] font-bold text-accent-400">AST-809</span>
                                    <span className="flex items-center gap-1 rounded border border-critical/20 bg-critical/10 px-2 py-0.5 font-mono text-[10px] font-medium text-critical">
                                        <span className="h-1.5 w-1.5 rounded-full bg-critical" />P0 Critical
                                    </span>
                                </div>
                                <h4 className="mb-3 font-display text-sm font-semibold text-ink">Synthesize distributed consensus loop</h4>
                                <div className="flex items-center justify-between border-t border-white/5 pt-2 font-mono text-[11px] text-ink-muted">
                                    <span className="flex items-center gap-1 text-info">
                                        <SlidersHorizontal size={12} />
                                        2/3 Subtasks
                                    </span>
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-accent-500/30 bg-accent-500/20 text-[10px] font-bold text-accent-400">ER</span>
                                </div>
                            </div>

                            <div className="cursor-grab rounded-md border border-white/10 bg-surface-hover/90 p-4 shadow-md transition hover:-translate-y-1 hover:border-white/20">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[11px] font-bold text-ink-muted">AST-812</span>
                                    <span className="rounded border border-success/20 bg-success/10 px-2 py-0.5 font-mono text-[10px] text-success">Automated</span>
                                </div>
                                <h4 className="mb-3 font-display text-sm font-semibold text-ink">Refactor memory mapping telemetry</h4>
                                <div className="flex items-center justify-between border-t border-white/5 pt-2 font-mono text-[11px] text-ink-muted">
                                    <span className="flex items-center gap-1">
                                        <Timer size={12} />
                                        40m est.
                                    </span>
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-ink-muted">AX</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative flex flex-col gap-3.5 overflow-hidden rounded-lg border border-info/20 bg-surface-high/60 p-4">
                            <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-full bg-info/5 blur-2xl" />
                            <div className="flex items-center justify-between border-b border-white/5 pb-1">
                                <span className="flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-info">
                                    <span className="h-2 w-2 animate-pulse rounded-full bg-info" />
                                    In Progress
                                </span>
                                <span className="rounded bg-info/10 px-2 py-0.5 font-mono text-[10px] text-info">2</span>
                            </div>

                            <div className="cursor-grab rounded-md border border-accent-500/40 bg-surface-hover p-4 shadow-[0_0_24px_rgba(255,77,0,0.18)] transition hover:-translate-y-1">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="rounded border border-accent-500/40 bg-accent-500/20 px-2 py-0.5 font-mono text-[11px] font-bold text-accent-400">AST-794</span>
                                    <span className="flex animate-pulse items-center gap-1 rounded bg-accent-500 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-white">
                                        <span className="h-1.5 w-1.5 rounded-full bg-white" />Active Sync
                                    </span>
                                </div>
                                <h4 className="mb-2 font-display text-sm font-semibold text-ink">Zero-downtime database migration</h4>
                                <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full border border-white/5 bg-black/40">
                                    <div className="relative h-full w-[84%] bg-gradient-to-r from-accent-500 to-info" />
                                </div>
                                <div className="flex items-center justify-between border-t border-white/5 pt-2 font-mono text-[11px]">
                                    <span className="flex items-center gap-1 font-semibold text-accent-400">
                                        <RefreshCw size={12} className="animate-spin" />
                                        84% Complete
                                    </span>
                                    <div className="flex -space-x-1.5">
                                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-500 text-[10px] font-bold text-white ring-1 ring-black">VK</div>
                                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-info text-[10px] font-bold text-black ring-1 ring-black">LT</div>
                                    </div>
                                </div>
                            </div>

                            <div className="cursor-grab rounded-md border border-white/10 bg-surface-hover/90 p-4 shadow-md transition hover:-translate-y-1">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[11px] font-bold text-ink-muted">AST-798</span>
                                    <span className="rounded bg-white/5 px-2 py-0.5 font-mono text-[10px] text-ink-muted">Staged</span>
                                </div>
                                <h4 className="mb-3 font-display text-sm font-medium text-ink-muted">Edge worker cache eviction policy</h4>
                                <div className="flex items-center justify-between border-t border-white/5 pt-2 font-mono text-[11px] text-ink-muted">
                                    <span className="flex items-center gap-1 text-success">
                                        <CheckCircle2 size={12} />
                                        Ready for Merge
                                    </span>
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-ink-muted">SR</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3.5 rounded-lg border border-white/5 bg-surface-high/60 p-4">
                            <div className="flex items-center justify-between border-b border-white/5 pb-1">
                                <span className="flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-success">
                                    <span className="h-2 w-2 rounded-full bg-success" />
                                    Done
                                </span>
                                <span className="rounded bg-success/10 px-2 py-0.5 font-mono text-[10px] text-success">14</span>
                            </div>

                            <div className="rounded-md border border-success/20 bg-surface-hover/70 p-4 shadow-md transition hover:-translate-y-1">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="rounded border border-success/20 bg-success/10 px-2 py-0.5 font-mono text-[11px] font-bold text-success">AST-780</span>
                                    <span className="flex items-center gap-1 rounded border border-success/20 bg-success/10 px-2 py-0.5 font-mono text-[10px] text-success">
                                        <CheckCircle2 size={11} /> Verified
                                    </span>
                                </div>
                                <h4 className="mb-3 font-display text-sm font-medium text-ink-faint line-through">Quantum TLS handshake integration</h4>
                                <div className="flex items-center justify-between border-t border-white/5 pt-2 font-mono text-[11px] text-ink-muted">
                                    <span>Deployed to 18 regions</span>
                                    <span className="font-bold text-success">0 regressions</span>
                                </div>
                            </div>

                            <div className="flex flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-white/10 bg-white/[0.02] p-4 text-center">
                                <Bot size={20} className="text-accent-400" />
                                <span className="font-mono text-[11px] text-ink-muted">AI Copilot auto-archived 8 completed tasks</span>
                                <span className="font-mono text-[10px] text-ink-faint">Cycle time reduced by 38%</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* ================= VELOCITY METRIC STRIP ================= */}
            <section className="relative border-b border-border bg-surface/30 py-20">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
                        {[
                            { value: "10x", label: "Faster Sprints", caption: "Zero sprint freeze phases", bar: "from-accent-500", numberHover: "group-hover:text-accent-400" },
                            { value: "<12ms", label: "Global Sync", caption: "Multi-region live updates", bar: "from-info", numberHover: "group-hover:text-info" },
                            { value: "99.99%", label: "Deterministic", caption: "Zero race-condition state", bar: "from-success", numberHover: "group-hover:text-success" },
                            { value: "4.2M", label: "Commits Mapped", caption: "Seamless topological graph", bar: "from-accent2", numberHover: "group-hover:text-accent2" }
                        ].map((metric) => (
                            <motion.div
                                key={metric.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="group relative flex flex-col items-center rounded-lg border border-white/5 bg-surface p-6 transition hover:border-accent-500/40 lg:items-start"
                            >
                                <div className={`mb-4 h-1 w-full rounded-full bg-gradient-to-r ${metric.bar} to-transparent`} />
                                <span className={`font-display text-5xl font-extrabold tracking-tight text-ink transition-colors lg:text-6xl ${metric.numberHover}`}>{metric.value}</span>
                                <span className="mt-2 font-display text-sm font-semibold uppercase tracking-wide text-ink-muted sm:text-base">{metric.label}</span>
                                <span className="mt-1 font-mono text-xs text-ink-faint">{metric.caption}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ================= FEATURE BENTO GRID ================= */}
            <section className="relative mx-auto max-w-7xl px-6 py-28 lg:px-8" id="architecture">
                <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                    <div className="max-w-2xl">
                        <div className="mb-3 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-accent-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
                            // ARCHITECTURAL SPECIFICATIONS
                        </div>
                        <h2 className="font-display text-3xl font-extrabold uppercase leading-tight tracking-tight text-ink sm:text-5xl">
                            Engineered For Pure Zero Friction.
                        </h2>
                    </div>
                    <p className="max-w-md text-sm text-ink-muted sm:text-base">
                        Built with a fast Node.js and Redis backend and a reactive React frontend. Replace bloated ticket queues with pure execution.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-60px" }}
                            transition={{ duration: 0.5, delay: index * 0.06 }}
                            className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-surface p-7 shadow-lg transition hover:bg-surface-hover ${feature.ring}`}
                        >
                            <div className={`pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full blur-2xl transition ${feature.glow}`} />
                            <div>
                                <div className="mb-6 flex items-center justify-between">
                                    <span className={`font-mono text-2xl font-bold ${feature.tone}`}>{feature.num}</span>
                                    <div className={`flex h-10 w-10 items-center justify-center rounded border border-white/10 bg-white/5 transition-transform group-hover:scale-110 ${feature.tone}`}>
                                        <feature.icon size={20} />
                                    </div>
                                </div>
                                <h3 className={`mb-2 font-display text-xl font-bold uppercase text-ink transition-colors ${feature.titleHover}`}>{feature.title}</h3>
                                <p className="mb-6 text-sm leading-relaxed text-ink-muted">{feature.description}</p>
                            </div>
                            <div className={`flex items-center gap-2 rounded border border-white/5 bg-black/50 p-2.5 font-mono text-[11px] ${feature.tone}`}>
                                <span className="h-2 w-2 rounded-full bg-current" />
                                <span>{feature.readout}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ================= BENCHMARK COMPARISON ================= */}
            <section className="relative border-y border-border bg-surface/20 py-24" id="benchmarks">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        className="relative overflow-hidden rounded-2xl border border-white/10 bg-surface p-8 shadow-2xl lg:p-12"
                    >
                        <div className="pointer-events-none absolute -top-32 left-1/3 h-96 w-96 rounded-full bg-accent-500/10 blur-[130px]" />
                        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
                            <div className="lg:col-span-7">
                                <h2 className="mb-4 font-display text-3xl font-extrabold uppercase tracking-tight text-ink sm:text-4xl lg:text-5xl">
                                    Outperforming Legacy Issue Trackers By An Order Of Magnitude.
                                </h2>
                                <p className="mb-8 text-base leading-relaxed text-ink-muted">
                                    Independent benchmark testing against 50,000 active tickets. DevPro maintains sub-millisecond local state mutation backed by Redis caching.
                                </p>

                                <div className="space-y-6">
                                    <div className="rounded-lg border border-accent-500/40 bg-surface-hover/80 p-4">
                                        <div className="mb-2 flex items-center justify-between font-mono text-xs">
                                            <span className="flex items-center gap-1.5 font-bold text-ink">
                                                <span className="h-2 w-2 rounded-full bg-accent-500" />
                                                DevPro Engine (Redis + Node.js)
                                            </span>
                                            <span className="text-sm font-bold text-accent-400">11ms <span className="font-normal text-ink-muted">(Real-time)</span></span>
                                        </div>
                                        <div className="h-3 w-full overflow-hidden rounded-full border border-white/5 bg-black p-0.5">
                                            <div className="h-full w-[96%] rounded-full bg-gradient-to-r from-accent-500 via-accent-400 to-orange-300 shadow-[0_0_12px_rgba(255,77,0,0.6)]" />
                                        </div>
                                    </div>
                                    <div className="rounded-lg border border-white/5 bg-black/30 p-3">
                                        <div className="mb-2 flex items-center justify-between font-mono text-xs text-ink-muted">
                                            <span>Traditional SaaS Cloud Tool A</span>
                                            <span className="text-ink-muted">480ms (43x slower)</span>
                                        </div>
                                        <div className="h-2.5 w-full overflow-hidden rounded-full border border-white/5 bg-black">
                                            <div className="h-full w-[38%] rounded-full bg-zinc-600" />
                                        </div>
                                    </div>
                                    <div className="rounded-lg border border-white/5 bg-black/30 p-3">
                                        <div className="mb-2 flex items-center justify-between font-mono text-xs text-ink-muted">
                                            <span>Legacy Enterprise Issue Tracker B</span>
                                            <span className="text-ink-muted">1,420ms (129x slower)</span>
                                        </div>
                                        <div className="h-2.5 w-full overflow-hidden rounded-full border border-white/5 bg-black">
                                            <div className="h-full w-[14%] rounded-full bg-zinc-700" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-surface-high p-6 shadow-xl lg:col-span-5">
                                <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-3">
                                    <span className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-ink-muted">
                                        <Share2 size={14} className="text-info" />
                                        DISTRIBUTED_TOPOLOGY
                                    </span>
                                    <span className="rounded border border-success/20 bg-success/10 px-2 py-0.5 font-mono text-[11px] text-success">
                                        NODES: 64/64 ACTIVE
                                    </span>
                                </div>

                                <div className="relative flex h-56 w-full items-center justify-center overflow-hidden rounded border border-white/5 bg-black/40">
                                    <svg className="h-full w-full" viewBox="0 0 240 140" fill="none">
                                        <line x1="40" y1="70" x2="120" y2="30" stroke="#333" strokeWidth="1.5" strokeDasharray="2 2" />
                                        <line x1="40" y1="70" x2="120" y2="110" stroke="#333" strokeWidth="1.5" strokeDasharray="2 2" />
                                        <line x1="120" y1="30" x2="200" y2="70" stroke="#333" strokeWidth="1.5" strokeDasharray="2 2" />
                                        <line x1="120" y1="110" x2="200" y2="70" stroke="#333" strokeWidth="1.5" strokeDasharray="2 2" />
                                        <line x1="120" y1="30" x2="120" y2="110" stroke="rgba(255, 77, 0, 0.4)" strokeWidth="2" />
                                        <circle cx="40" cy="70" r="7" className="fill-accent-500 animate-pulse" />
                                        <circle cx="120" cy="30" r="6" className="fill-info" />
                                        <circle cx="120" cy="110" r="6" className="fill-success" />
                                        <circle cx="200" cy="70" r="7" className="fill-accent-400" />
                                    </svg>
                                    <div className="absolute rounded border border-white/15 bg-surface/95 px-4 py-2 text-center shadow-2xl backdrop-blur-md">
                                        <span className="block font-mono text-xs font-bold text-ink">ZERO RACE CONDITIONS</span>
                                        <span className="font-mono text-[10px] text-success">Conflict Rate: 0.0000%</span>
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-between pt-4 font-mono text-[11px] text-ink-faint">
                                    <span className="flex items-center gap-1">
                                        <span className="h-1.5 w-1.5 rounded-full bg-success" />
                                        SYNC STATE: ACTIVE
                                    </span>
                                    <span>EPOCH: 0x94EF_STABLE</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ================= TERMINAL DEPLOY CTA ================= */}
            <section className="relative mx-auto max-w-5xl px-6 py-28 text-center lg:px-8" id="terminal-deploy">
                <div className="pointer-events-none absolute -top-16 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-accent-500/20 blur-[150px]" />
                <motion.div
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    className="relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-b from-surface to-surface/60 p-8 shadow-2xl sm:p-16"
                >
                    <div className="mb-4 inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-accent-400">
                        <span className="h-2 w-2 animate-ping rounded-full bg-accent-500" />
                        // INSTANT CLOUD DEPLOYMENT
                    </div>
                    <h2 className="mb-6 font-display text-3xl font-extrabold uppercase leading-tight tracking-tighter text-ink sm:text-5xl lg:text-6xl">
                        SWITCH TO VELOCITY.<br />CUT OUT THE CEREMONY.
                    </h2>
                    <p className="mx-auto mb-10 max-w-xl text-base text-ink-muted sm:text-lg">
                        Create your first project in less than 3 minutes. No migration headaches, no credit card required.
                    </p>

                    <Link
                        to="/register"
                        className="mx-auto mb-8 flex max-w-md items-center justify-center gap-2 rounded-md bg-accent-500 px-6 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(255,77,0,0.5)] transition hover:bg-accent-600 active:scale-95"
                    >
                        <span>Deploy Your Workspace</span>
                        <Rocket size={16} />
                    </Link>

                    <div className="flex flex-wrap items-center justify-center gap-6 font-mono text-xs text-ink-muted">
                        <span className="flex items-center gap-1.5">
                            <CheckCircle2 size={14} className="text-success" />
                            SOC2 Type II Certified
                        </span>
                        <span className="flex items-center gap-1.5">
                            <CheckCircle2 size={14} className="text-success" />
                            ISO 27001 Certified
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Lock size={14} className="text-success" />
                            End-to-End Encrypted
                        </span>
                    </div>
                </motion.div>
            </section>

            <Footer />
        </div>
    )
}

export default LandingPage
