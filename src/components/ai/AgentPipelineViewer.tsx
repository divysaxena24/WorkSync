"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Eraser, 
  BrainCircuit, 
  UserPlus, 
  AlertTriangle, 
  SearchCode, 
  ShieldCheck,
  ChevronRight,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

const AGENTS = [
  { id: "cleaner", name: "Cleaner", icon: Eraser, description: "Contextual De-noising", color: "text-blue-400" },
  { id: "architect", name: "Architect", icon: BrainCircuit, description: "Structure Extraction", color: "text-purple-400" },
  { id: "matcher", name: "Matcher", icon: UserPlus, description: "Personnel Alignment", color: "text-cyan-400" },
  { id: "predictor", name: "Predictor", icon: AlertTriangle, description: "Risk Analysis", color: "text-amber-400" },
  { id: "auditor", name: "Auditor", icon: SearchCode, description: "Compliance Audit", color: "text-indigo-400" },
  { id: "validator", name: "Validator", icon: ShieldCheck, description: "Final Verdict", color: "text-emerald-400" },
];

interface AgentNodeProps {
  agent: typeof AGENTS[0];
  status: "idle" | "thinking" | "complete";
  confidence?: number;
  active?: boolean;
}

const AgentNode = ({ agent: Agent, status, confidence, active }: AgentNodeProps) => (
  <motion.div 
    layout
    className={cn(
      "relative group flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all duration-500",
      active ? "bg-primary/5 border-primary/40 glass-panel neon-glow-cyan" : "bg-white/5 border-white/5 grayscale opacity-50"
    )}
  >
    {status === "thinking" && (
      <motion.div 
        className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse shadow-[0_0_10px_var(--primary)]" 
      />
    )}
    
    <div className={cn(
      "w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110",
      active ? "bg-primary/10" : "bg-white/5"
    )}>
      <Agent.icon className={cn("w-6 h-6", active ? Agent.color : "text-muted-foreground")} />
    </div>

    <div className="text-center">
      <div className="text-xs font-bold tracking-tight text-foreground">{Agent.name}</div>
      <div className="text-[10px] text-muted-foreground font-medium mt-0.5 whitespace-nowrap">{Agent.description}</div>
    </div>

    {active && confidence && (
      <div className="mt-2 w-full bg-white/5 rounded-full h-1 overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${confidence}%` }}
          className={cn("h-full", confidence > 90 ? "bg-emerald-500" : "bg-primary")}
        />
      </div>
    )}

    {active && confidence && (
      <div className="text-[9px] font-mono text-primary font-bold">{confidence}% CONFIDENCE</div>
    )}
  </motion.div>
);

export function AgentPipelineViewer({ activeStep = 0, stepsStatus = [] }: { activeStep?: number, stepsStatus?: ("idle" | "thinking" | "complete")[] }) {
  return (
    <div className="w-full py-8 px-4 relative overflow-hidden glass-panel rounded-3xl">
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight">Neural Process Stream</h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Autonomous Multi-Agent Orchestration</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          SYSTEM STABLE • LATENCY 124MS
        </div>
      </div>

      <div className="flex items-center justify-between relative gap-2">
        {/* Connecting Lines (Background) */}
        <div className="absolute top-10 left-0 right-0 h-[2px] bg-white/5 -z-10" />
        
        {AGENTS.map((agent, i) => (
          <React.Fragment key={agent.id}>
            <AgentNode 
              agent={agent} 
              active={i <= activeStep}
              status={i === activeStep ? "thinking" : i < activeStep ? "complete" : "idle"}
              confidence={i < activeStep ? 90 + Math.floor(Math.random() * 9) : i === activeStep ? 75 : undefined}
            />
            {i < AGENTS.length - 1 && (
              <div className="flex-1 flex justify-center mt-[-30px]">
                <ChevronRight className={cn(
                  "w-4 h-4 transition-colors duration-500",
                  i < activeStep ? "text-primary shadow-[0_0_10px_var(--primary)]" : "text-white/10"
                )} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Decision Log Summary Overlay */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 p-4 rounded-2xl bg-black/40 border border-white/5 font-mono text-[10px] space-y-2"
      >
        <div className="flex items-center justify-between text-muted-foreground/50 border-b border-white/5 pb-2 mb-2">
          <span>PIPELINE_RESOLVER_V1.1</span>
          <span>EXECUTION_TRACE</span>
        </div>
        <div className="flex gap-3">
          <span className="text-primary truncate">[09:44:23] AGENT({AGENTS[activeStep]?.id.toUpperCase()}):</span>
          <span className="text-foreground animate-pulse">Running heuristic analysis on current context buffer...</span>
        </div>
      </motion.div>
    </div>
  );
}
