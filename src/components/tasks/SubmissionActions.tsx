"use client";

import { useState } from "react";
import { 
  Pencil, 
  Trash2, 
  X, 
  Check, 
  Loader2,
  ExternalLink 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface SubmissionActionsProps {
  submissionId: string;
  initialUrl: string;
  initialNote: string;
  isOwner: boolean;
  isManager: boolean;
}

export function SubmissionActions({ submissionId, initialUrl, initialNote, isOwner, isManager }: SubmissionActionsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [url, setUrl] = useState(initialUrl);
  const [note, setNote] = useState(initialNote);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!isOwner && !isManager) return null;

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this submission?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks/submissions/${submissionId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Submission deleted");
        router.refresh();
      } else {
        throw new Error("Failed to delete");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks/submissions/${submissionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ githubUrl: url, submissionNote: note })
      });
      if (res.ok) {
        toast.success("Submission updated and re-evaluated");
        setIsEditing(false);
        router.refresh();
      } else {
        throw new Error("Failed to update");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isEditing) {
    return (
      <div className="p-4 bg-white border border-indigo-100 rounded-2xl shadow-xl space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b pb-2 mb-2">
           <span className="text-[10px] font-black uppercase text-indigo-600">Editing Submission</span>
           <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3">
          <Input 
            value={url} 
            onChange={(e) => setUrl(e.target.value)} 
            placeholder="GitHub URL" 
            className="text-xs h-9 rounded-lg"
          />
          <textarea 
            value={note} 
            onChange={(e) => setNote(e.target.value)} 
            placeholder="Updated notes..." 
            className="w-full min-h-[60px] p-2 text-xs bg-slate-50 border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <div className="flex items-center gap-2">
             <Button 
                onClick={handleUpdate} 
                disabled={loading} 
                size="sm" 
                className="w-full bg-indigo-600 font-bold"
             >
                {loading ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Check className="w-3 h-3 mr-2" />}
                {loading ? "Re-evaluating..." : "Save Changes"}
             </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 opacity-0 group-hover/sub:opacity-100 transition-opacity">
       {isOwner && (
         <button 
           onClick={() => setIsEditing(true)}
           className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
           title="Edit Submission"
         >
           <Pencil className="w-3.5 h-3.5" />
         </button>
       )}
       <button 
         onClick={handleDelete}
         className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 transition-all shadow-sm"
         title="Delete Submission"
       >
         <Trash2 className="w-3.5 h-3.5" />
       </button>
    </div>
  );
}
