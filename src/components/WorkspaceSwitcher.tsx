"use client";

import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Building2, ChevronDown, Plus, Check } from "lucide-react";
import { useRouter } from "next/navigation";

export function WorkspaceSwitcher({ 
  profiles, 
  activeProfileId 
}: { 
  profiles: any[], 
  activeProfileId: string 
}) {
  const router = useRouter();
  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 bg-white border-slate-200 hover:bg-slate-50 rounded-xl px-4 py-6 shadow-sm group transition-all"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-indigo-500/20 shadow-lg">
            {activeProfile.company.name.slice(0, 1).toUpperCase()}
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-black text-slate-900 uppercase italic leading-none mb-0.5">{activeProfile.company.name}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Space Context</div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl border-slate-100 shadow-2xl">
        <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 py-1.5">Switch Workspace</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-50" />
        
        <div className="space-y-1 my-1">
          {profiles.map((profile) => (
            <DropdownMenuItem 
              key={profile.id}
              onClick={() => router.push(`/dashboard?u=${profile.id}`)}
              className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                profile.id === activeProfileId ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                  profile.id === activeProfileId ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {profile.company.name.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-bold leading-none mb-1">{profile.company.name}</div>
                  <div className="text-[10px] opacity-70 font-medium uppercase tracking-tighter">{profile.role}</div>
                </div>
              </div>
              {profile.id === activeProfileId && <Check className="w-4 h-4" />}
            </DropdownMenuItem>
          ))}
        </div>

        <DropdownMenuSeparator className="bg-slate-50" />
        <DropdownMenuItem 
          onClick={() => router.push("/onboarding")}
          className="flex items-center gap-2 p-3 text-slate-500 hover:text-indigo-600 cursor-pointer rounded-xl"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold">Join or Create New</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
