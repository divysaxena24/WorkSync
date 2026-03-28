"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";

export function TaskSubmissionForm({ taskId }: { taskId: string }) {
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Safety timeout to prevent button from being stuck forever
    const timeoutId = setTimeout(() => {
      setLoading(false);
      toast.error("Evaluation is taking longer than expected. Please refresh the page in a few moments.");
    }, 60000);

    try {
      console.log(`[SUBMIT] Sending request to API...`);
      const res = await fetch("/api/tasks/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, githubUrl: url, submissionNote: note }),
      });
      
      console.log("[SUBMIT_DEBUG] Response status:", res.status);

      if (!res.ok) {
         const errorText = await res.text();
         throw new Error(errorText || "Submission failed");
      }

      const data = await res.json();
      toast.success(data.message || "Work submitted successfully!");
      setUrl("");
      setNote("");
      router.refresh(); // Refresh the page to show new submission
    } catch (err: any) {
      toast.error(err.message || "Failed to submit work");
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400">GitHub Work Link</label>
          <Input 
            type="text" 
            placeholder="https://github.com/owner/repo/pull/123" 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
            className="bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl h-12"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Submission Note (Optional)</label>
          <textarea 
            placeholder="What did you implement? e.g. Fixed the auth bug in routes.ts"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={loading}
            className="w-full min-h-[100px] p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
          />
        </div>

        <Button 
          type="submit" 
          disabled={loading || !url}
          className="w-full bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 rounded-xl h-12 group transition-all"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span className="text-sm font-bold">Evaluating Work...</span>
            </div>
          ) : (
            <div className="flex items-center gap-3 font-bold">
              <span>Submit for Evaluation</span>
              <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          )}
        </Button>
        <p className="text-[10px] text-center text-slate-400 uppercase tracking-widest font-bold">
           AI will analyze for technical completeness
        </p>
      </div>
    </form>
  );
}
