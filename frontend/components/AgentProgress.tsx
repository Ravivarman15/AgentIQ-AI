"use client";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

interface Step {
  id: string;
  name: string;
  status: "waiting" | "running" | "completed";
}

export default function AgentProgress({ steps }: { steps: Step[] }) {
  return (
    <div className="flex flex-col space-y-4">
      {steps.map((step, index) => (
        <motion.div
          key={step.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`flex items-center p-4 rounded-xl border ${step.status === "running"
              ? "bg-blue-500/10 border-blue-500/50"
              : step.status === "completed"
                ? "bg-green-500/10 border-green-500/50"
                : "bg-[var(--foreground)]/5 border-[var(--card-border)]"
            }`}
        >
          <div className="mr-4">
            {step.status === "completed" ? (
              <CheckCircle2 className="text-green-500 w-6 h-6" />
            ) : step.status === "running" ? (
              <Loader2 className="text-blue-500 w-6 h-6 animate-spin" />
            ) : (
              <Circle className="text-[var(--text-muted)] w-6 h-6 opacity-30" />
            )}
          </div>
          <div>
            <h3 className={`font-semibold ${step.status === "running" ? "text-blue-400" : "text-[var(--foreground)]"}`}>
              {step.name}
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              {step.status === "completed" ? "Agent tasks finalized" : step.status === "running" ? "Processing data..." : "Waiting for orchestrator"}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
