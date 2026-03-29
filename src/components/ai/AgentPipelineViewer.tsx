"use client";

import { motion } from "framer-motion";
import { 
  Eraser, 
  Target, 
  Hammer, 
  Users, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight,
  BrainCircuit
} from "lucide-react";
import { cn } from "@/lib/core/utils";

const AGENTS = [
  { id: "cleaner",   name: "Contextual Cleaner", icon: Eraser,        model: "Llama 3.1 8B",  color: "indigo" },
  { id: "miner",     name: "Decision Miner",     icon: Target,        model: "Llama 3.1 8B",  color: "cyan" },
  { id: "architect", name: "Task Architect",     icon: Hammer,        model: "Llama 3.3 70B", color: "purple" },
  { id: "matcher",   name: "Resource Matcher",   icon: Users,         model: "Llama 3.3 70B", color: "blue" },
  { id: "predictor", name: "SLA Predictor",      icon: AlertTriangle, model: "Llama 3.3 70B", color: "amber" },
  { id: "validator", name: "Final Validator",    icon: ShieldCheck,   model: "Llama 3.3 70B", color: "emerald" },
];

export function AgentPipelineViewer({ activeStep }: { activeStep?: string }) {
  return (
    <div className="w-full py-8 px-4 glass-card rounded-3xl border border-white/5 relative overflow-hidden">
      {/* Decorative Background Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-px bg-linear-to-r from-transparent via-indigo-500/20 to-transparent" />
      
      <div className="flex items-center justify-between relative z-10 max-w-5xl mx-auto">
        {AGENTS.map((agent, index) => {
          const isActive = activeStep === agent.id;
          const isPast = activeStep && AGENTS.findIndex(a => a.id === activeStep) > index;

          return (
            <div key={agent.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-3 group">
                {/* Icon Circle */}
                <motion.div 
                  initial={false}
                  animate={{ 
                    scale: isActive ? 1.1 : 1,
                    boxShadow: isActive ? `0 0 25px hsla(var(--neon-indigo), 0.4)` : "none"
                  }}
                  className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500",
                    isActive 
                      ? "bg-white/10 border-white/20 text-white" 
                      : isPast
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-white/2 border-white/5 text-slate-500"
                  )}
                >
                  <agent.icon className={cn(
                    "w-7 h-7",
                    isActive ? "neon-glow-indigo animate-pulse" : ""
                  )} />
                </motion.div>

                {/* Agent Labels */}
                <div className="flex flex-col items-center text-center">
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-[0.15em] transition-colors duration-300",
                    isActive ? "text-indigo-400" : isPast ? "text-emerald-500/70" : "text-slate-600"
                  )}>
                    {agent.name}
                  </span>
                  <span className="text-[8px] font-mono font-bold text-slate-500/50 uppercase">
                    {agent.model}
                  </span>
                </div>
              </div>

              {/* Connector Arrow */}
              {index < AGENTS.length - 1 && (
                <div className="flex-1 flex justify-center px-2">
                  <ArrowRight className={cn(
                    "w-4 h-4 transition-colors duration-500",
                    isPast ? "text-emerald-500/40" : "text-white/5"
                  )} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-indigo-400" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
            Pipeline Activity Log: <span className="text-white">Standby</span>
          </span>
        </div>
        <div className="h-4 w-px bg-white/10" />
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
            All Models Online
          </span>
        </div>
      </div>
    </div>
  );
}
