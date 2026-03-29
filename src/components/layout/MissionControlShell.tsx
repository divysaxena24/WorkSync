"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";
import { 
  Terminal,
  Activity,
  Zap,
  Shield,
  Search,
  Bell,
  Settings,
  LayoutDashboard
} from "lucide-react";
import { cn } from "@/lib/core/utils";
import { Button } from "@/components/ui/button";

export function MissionControlShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isLoaded, isSignedIn } = useUser();
  const isLandingPage = pathname === "/";
  const isMeetingPage = pathname?.startsWith("/meeting/");

  return (
    <div className="flex h-screen bg-[#020617] text-slate-100 overflow-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background Neon Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/30 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative h-full overflow-hidden">
        {/* Top Header HUD: Only show on non-landing pages */}
        {!isLandingPage && (
          <header className={cn(
            "h-20 flex items-center justify-between px-8 bg-white/2 backdrop-blur-md border-b border-white/5 relative z-10 shrink-0",
            isMeetingPage && "h-16 px-6 border-none" // Slimmer header for meeting rooms
          )}>
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                  <Zap className="w-5 h-5 text-white fill-white/20" />
                </div>
                <span className="text-sm font-black uppercase tracking-widest text-white hidden sm:block">WorkSync</span>
              </Link>
              
              <div className="h-6 w-px bg-white/10" />

              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors group">
                <Search className="w-4 h-4 text-slate-500 group-hover:text-indigo-400" />
                <span className="text-xs font-bold text-slate-400 group-hover:text-white mr-8 hidden md:block">Command Center...</span>
                <kbd className="hidden lg:inline-block px-1.5 py-0.5 rounded border border-white/10 text-[10px] text-slate-500 font-mono">⌘K</kbd>
              </div>
            </div>

            <div className="flex items-center gap-4">
               {/* Authorized User Section Moved to Header since Sidebar is gone */}
               <div className="flex items-center gap-3 pr-4 border-r border-white/10">
                 {isLoaded && isSignedIn ? (
                   <>
                     <div className="hidden sm:flex flex-col items-end">
                       <span className="text-[10px] font-bold text-white uppercase tracking-tight">Authorized</span>
                       <span className="text-[9px] text-indigo-400 uppercase font-mono leading-none">Project Lead</span>
                     </div>
                     <UserButton 
                       appearance={{
                         elements: {
                           avatarBox: "w-9 h-9 border border-white/10 rounded-xl"
                         }
                       }}
                     />
                   </>
                 ) : isLoaded ? (
                   <SignInButton mode="modal">
                     <Button variant="ghost" className="text-xs text-indigo-400 font-bold">Sign In</Button>
                   </SignInButton>
                 ) : (
                   <div className="w-9 h-9 rounded-xl bg-white/5 animate-pulse" />
                 )}
               </div>

               <div className="flex items-center gap-3">
                 <div className="relative">
                   <div className="absolute top-0 right-0 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[#020617] z-20" />
                   <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors">
                     <Bell className="w-5 h-5 text-slate-400" />
                   </div>
                 </div>
                 <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors hidden sm:flex">
                   <Settings className="w-5 h-5 text-slate-400" />
                 </div>
               </div>
            </div>
          </header>
        )}

        {/* Dynamic Page Content */}
        <div className={cn(
          "flex-1 overflow-y-auto custom-scrollbar relative",
          isLandingPage ? "p-0" : "px-8 py-8",
          isMeetingPage && "p-0 overflow-hidden" // Full-bleed for meetings
        )}>
           <div className={cn(
             "relative z-10 mx-auto",
             isLandingPage || isMeetingPage ? "w-full h-full" : "max-w-7xl"
           )}>
             {children}
           </div>
        </div>
      </main>
    </div>
  );
}
