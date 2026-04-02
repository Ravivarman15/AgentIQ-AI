"use client";
import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  Database,
  Brain,
  Bot,
  BarChart3,
  FileText,
  Upload,
  Search,
  Lightbulb,
  Sparkles,
  Shield,
  Zap,
  Cpu,
  ArrowRight,
  ChevronRight,
  MessageSquare,
  TrendingUp,
  Activity,
} from "lucide-react";

/* ─── Fade-in-on-scroll wrapper ─── */
function FadeInSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   1. FEATURES SECTION
   ═══════════════════════════════════════════════════════ */
const features = [
  {
    icon: Database,
    title: "Data Intelligence",
    desc: "Automatically analyze dataset structure, quality, and correlations.",
    color: "from-blue-500 to-cyan-500",
    glow: "blue",
  },
  {
    icon: Brain,
    title: "AutoML Engine",
    desc: "Train and compare multiple machine learning models automatically.",
    color: "from-purple-500 to-pink-500",
    glow: "purple",
  },
  {
    icon: Bot,
    title: "AI Chat Assistant",
    desc: "Ask questions and get insights from your dataset using AI.",
    color: "from-emerald-500 to-teal-500",
    glow: "emerald",
  },
  {
    icon: BarChart3,
    title: "Visualization",
    desc: "Generate interactive charts for better understanding.",
    color: "from-amber-500 to-orange-500",
    glow: "amber",
  },
  {
    icon: FileText,
    title: "Report Generation",
    desc: "Export professional reports with insights and predictions.",
    color: "from-rose-500 to-red-500",
    glow: "rose",
  },
];

const glowMap: Record<string, string> = {
  blue: "rgba(59,130,246,0.15)",
  purple: "rgba(168,85,247,0.15)",
  emerald: "rgba(16,185,129,0.15)",
  amber: "rgba(245,158,11,0.15)",
  rose: "rgba(244,63,94,0.15)",
};

function FeaturesSection() {
  return (
    <section className="w-full max-w-6xl mx-auto mt-24 px-4">
      <FadeInSection className="text-center mb-14">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/15 text-blue-400 text-xs font-bold uppercase tracking-widest mb-5">
          <Sparkles className="w-3.5 h-3.5" /> Platform Capabilities
        </span>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
          Powerful AI{" "}
          <span className="gradient-text">Capabilities</span>
        </h2>
        <p className="text-[var(--text-muted)] max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
          Everything you need to go from raw data to production-level insights
          — automated, intelligent, and fast.
        </p>
      </FadeInSection>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((f, i) => (
          <FadeInSection key={f.title} delay={i * 0.08}>
            <div
              className="group relative rounded-2xl bg-[var(--glass-panel)] border border-[var(--card-border)] p-6 hover:border-white/10 transition-all duration-300 hover:shadow-2xl overflow-hidden h-full"
              style={
                {
                  "--card-glow": glowMap[f.glow],
                } as React.CSSProperties
              }
            >
              {/* Hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,var(--card-glow),transparent_70%)]" />

              {/* Icon */}
              <div
                className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} p-[1px] mb-5 group-hover:scale-110 transition-transform duration-300`}
              >
                <div className="w-full h-full rounded-xl bg-[var(--glass-panel)] flex items-center justify-center">
                  <f.icon className="w-5 h-5 text-white/90" />
                </div>
              </div>

              <h3 className="font-bold text-lg mb-2 relative z-10">
                {f.title}
              </h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed relative z-10">
                {f.desc}
              </p>
            </div>
          </FadeInSection>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   2. HOW IT WORKS SECTION
   ═══════════════════════════════════════════════════════ */
const workflowSteps = [
  { icon: Upload, label: "Upload Dataset", accent: "text-blue-400" },
  { icon: Search, label: "Analyze Data", accent: "text-cyan-400" },
  { icon: Cpu, label: "Train Models", accent: "text-purple-400" },
  { icon: MessageSquare, label: "Ask Questions", accent: "text-emerald-400" },
  { icon: Lightbulb, label: "Get Insights", accent: "text-amber-400" },
];

function HowItWorksSection() {
  return (
    <section className="w-full max-w-5xl mx-auto mt-32 px-4">
      <FadeInSection className="text-center mb-16">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/15 text-purple-400 text-xs font-bold uppercase tracking-widest mb-5">
          <Activity className="w-3.5 h-3.5" /> Workflow
        </span>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
          How AgentIQ AI{" "}
          <span className="gradient-text">Works</span>
        </h2>
        <p className="text-[var(--text-muted)] max-w-xl mx-auto text-base md:text-lg">
          Five simple steps from raw data to actionable intelligence.
        </p>
      </FadeInSection>

      {/* Desktop: horizontal */}
      <div className="hidden md:flex items-center justify-between gap-2">
        {workflowSteps.map((step, i) => (
          <FadeInSection
            key={step.label}
            delay={i * 0.1}
            className="flex items-center gap-3"
          >
            {/* Step card */}
            <div className="flex flex-col items-center gap-3 group">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-[var(--glass-panel)] border border-[var(--card-border)] flex items-center justify-center group-hover:scale-110 group-hover:border-white/15 transition-all duration-300">
                  <step.icon className={`w-7 h-7 ${step.accent}`} />
                </div>
                {/* Step number badge */}
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
                  {i + 1}
                </div>
              </div>
              <span className="text-xs font-semibold text-center whitespace-nowrap">
                {step.label}
              </span>
            </div>

            {/* Arrow between steps */}
            {i < workflowSteps.length - 1 && (
              <div className="flex items-center mx-1 mt-[-20px]">
                <div className="w-12 h-[2px] bg-gradient-to-r from-[var(--card-border)] to-[var(--card-border)] relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/40 to-purple-500/40 animate-pulse" />
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--text-muted)] -ml-1" />
              </div>
            )}
          </FadeInSection>
        ))}
      </div>

      {/* Mobile: vertical */}
      <div className="md:hidden flex flex-col items-center gap-4">
        {workflowSteps.map((step, i) => (
          <FadeInSection key={step.label} delay={i * 0.08}>
            <div className="flex items-center gap-4 w-full max-w-xs">
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-xl bg-[var(--glass-panel)] border border-[var(--card-border)] flex items-center justify-center">
                  <step.icon className={`w-6 h-6 ${step.accent}`} />
                </div>
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-[9px] font-bold text-white">
                  {i + 1}
                </div>
              </div>
              <span className="text-sm font-semibold">{step.label}</span>
            </div>
            {i < workflowSteps.length - 1 && (
              <div className="w-[2px] h-6 bg-gradient-to-b from-[var(--card-border)] to-transparent mx-auto mt-1" />
            )}
          </FadeInSection>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   3. INTERACTIVE PREVIEW SECTION
   ═══════════════════════════════════════════════════════ */
function PreviewSection() {
  const [activePreview, setActivePreview] = useState(0);

  const previews = [
    {
      title: "Dataset Insights",
      content: (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Database className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-xs font-bold">sales_data.csv</p>
                <p className="text-[10px] text-[var(--text-muted)]">
                  12 columns • 8,432 rows
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-green-400 px-2 py-0.5 rounded-full bg-green-500/10">
              98.5% Quality
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Numeric", value: "8", color: "text-cyan-400" },
              { label: "Categorical", value: "3", color: "text-purple-400" },
              { label: "Correlations", value: "12", color: "text-amber-400" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-2.5 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] text-center"
              >
                <p className={`text-lg font-bold ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "Model Prediction",
      content: (
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/15">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400">
                Prediction Result
              </span>
            </div>
            <p className="text-2xl font-bold mb-1">$42,850</p>
            <p className="text-[10px] text-[var(--text-muted)]">
              Annual Revenue Forecast • 94.2% confidence
            </p>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 p-2.5 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)]">
              <p className="text-[10px] text-[var(--text-muted)] mb-0.5">
                Model
              </p>
              <p className="text-xs font-bold">XGBoost</p>
            </div>
            <div className="flex-1 p-2.5 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)]">
              <p className="text-[10px] text-[var(--text-muted)] mb-0.5">
                R² Score
              </p>
              <p className="text-xs font-bold text-emerald-400">0.942</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "AI Assistant",
      content: (
        <div className="space-y-2.5">
          {/* User bubble */}
          <div className="flex justify-end">
            <div className="max-w-[85%] px-3.5 py-2 rounded-2xl rounded-br-sm bg-blue-600 text-white text-xs leading-relaxed">
              What are the top factors affecting revenue?
            </div>
          </div>
          {/* Bot bubble */}
          <div className="flex justify-start gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="w-3 h-3 text-white" />
            </div>
            <div className="max-w-[85%] px-3.5 py-2 rounded-2xl rounded-bl-sm bg-[var(--card-bg)] border border-[var(--card-border)] text-xs leading-relaxed">
              Based on the analysis, the top 3 factors are:{" "}
              <strong>Marketing Spend</strong> (32%),{" "}
              <strong>Customer Count</strong> (28%), and{" "}
              <strong>Season</strong> (18%).
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="w-full max-w-4xl mx-auto mt-32 px-4">
      <FadeInSection className="text-center mb-12">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-5">
          <Zap className="w-3.5 h-3.5" /> Live Preview
        </span>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
          See It In <span className="gradient-text">Action</span>
        </h2>
        <p className="text-[var(--text-muted)] max-w-lg mx-auto">
          A glimpse of what AgentIQ AI delivers from your data.
        </p>
      </FadeInSection>

      <FadeInSection delay={0.15}>
        <div className="rounded-2xl bg-[var(--glass-panel)] border border-[var(--card-border)] overflow-hidden shadow-2xl">
          {/* Tab bar */}
          <div className="flex border-b border-[var(--card-border)]">
            {previews.map((p, i) => (
              <button
                key={p.title}
                onClick={() => setActivePreview(i)}
                className={`flex-1 px-4 py-3 text-xs font-bold transition-all relative ${
                  activePreview === i
                    ? "text-[var(--foreground)]"
                    : "text-[var(--text-muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {p.title}
                {activePreview === i && (
                  <motion.div
                    layoutId="preview-tab"
                    className="absolute bottom-0 left-2 right-2 h-[2px] bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Content pane */}
          <div className="p-5 min-h-[200px]">
            <motion.div
              key={activePreview}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {previews[activePreview].content}
            </motion.div>
          </div>
        </div>
      </FadeInSection>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   4. TRUST / BADGES SECTION
   ═══════════════════════════════════════════════════════ */
const badges = [
  { icon: Sparkles, label: "AI Powered", color: "blue" },
  { icon: Activity, label: "Real-Time Analysis", color: "emerald" },
  { icon: Cpu, label: "Multi-Model Training", color: "purple" },
  { icon: Shield, label: "Secure Processing", color: "amber" },
];

const badgeColors: Record<
  string,
  { text: string; bg: string; border: string; shadow: string }
> = {
  blue: {
    text: "text-blue-400",
    bg: "bg-blue-500/8",
    border: "border-blue-500/20",
    shadow: "shadow-blue-500/10",
  },
  emerald: {
    text: "text-emerald-400",
    bg: "bg-emerald-500/8",
    border: "border-emerald-500/20",
    shadow: "shadow-emerald-500/10",
  },
  purple: {
    text: "text-purple-400",
    bg: "bg-purple-500/8",
    border: "border-purple-500/20",
    shadow: "shadow-purple-500/10",
  },
  amber: {
    text: "text-amber-400",
    bg: "bg-amber-500/8",
    border: "border-amber-500/20",
    shadow: "shadow-amber-500/10",
  },
};

function BadgesSection() {
  return (
    <section className="w-full max-w-4xl mx-auto mt-28 px-4">
      <FadeInSection className="flex flex-wrap justify-center gap-3 md:gap-4">
        {badges.map((b, i) => {
          const c = badgeColors[b.color];
          return (
            <motion.div
              key={b.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className={`group flex items-center gap-2.5 px-5 py-2.5 rounded-full ${c.bg} border ${c.border} ${c.shadow} shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-default`}
            >
              <b.icon
                className={`w-4 h-4 ${c.text} group-hover:rotate-12 transition-transform`}
              />
              <span className={`text-xs font-bold ${c.text}`}>{b.label}</span>

              {/* Glow dot */}
              <span
                className={`w-1.5 h-1.5 rounded-full ${c.bg} ${c.text} animate-pulse`}
                style={{ boxShadow: `0 0 6px currentColor` }}
              />
            </motion.div>
          );
        })}
      </FadeInSection>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   5. FOOTER SECTION
   ═══════════════════════════════════════════════════════ */
function FooterSection() {
  return (
    <footer className="w-full mt-32 pb-8">
      <FadeInSection>
        {/* Gradient divider */}
        <div className="max-w-3xl mx-auto mb-10 h-[1px] bg-gradient-to-r from-transparent via-[var(--card-border)] to-transparent" />

        <div className="flex flex-col items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight gradient-text">
              AGENTIQ AI
            </span>
          </div>

          {/* Tagline */}
          <p className="text-sm text-[var(--text-muted)] text-center max-w-md">
            Autonomous AI-powered data science — from upload to insight in
            seconds.
          </p>

          {/* Nav links */}
          <div className="flex items-center gap-6 text-xs text-[var(--text-muted)]">
            <a
              href="/docs"
              className="hover:text-[var(--foreground)] transition-colors"
            >
              Documentation
            </a>
            <span className="w-1 h-1 rounded-full bg-[var(--card-border)]" />
            <a
              href="/login"
              className="hover:text-[var(--foreground)] transition-colors"
            >
              Get Started
            </a>
            <span className="w-1 h-1 rounded-full bg-[var(--card-border)]" />
            <a
              href="#"
              className="hover:text-[var(--foreground)] transition-colors"
            >
              About
            </a>
          </div>

          {/* Made with ❤️ by Ravi */}
          <div className="mt-4 relative group cursor-default">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-rose-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <p className="relative text-sm font-medium text-[var(--text-muted)] tracking-wide flex items-center gap-1.5">
              Made with{" "}
              <span
                className="inline-block text-base animate-pulse"
                style={{
                  background:
                    "linear-gradient(135deg, #f43f5e, #ec4899, #f43f5e)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  filter: "drop-shadow(0 0 6px rgba(244,63,94,0.5))",
                }}
              >
                ❤️
              </span>{" "}
              <span className="font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                by Ravi
              </span>
            </p>
          </div>

          <p className="text-[10px] text-[var(--text-muted)] opacity-50 mt-2">
            © {new Date().getFullYear()} AgentIQ AI. All rights reserved.
          </p>
        </div>
      </FadeInSection>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════
   COMBINED EXPORT
   ═══════════════════════════════════════════════════════ */
export default function LandingSections() {
  return (
    <>
      {/* Subtle gradient line separator */}
      <div className="mt-16 mb-4 w-full max-w-4xl mx-auto h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

      <FeaturesSection />
      <HowItWorksSection />
      <PreviewSection />
      <BadgesSection />
      <FooterSection />
    </>
  );
}
