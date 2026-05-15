/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Github, 
  Layout, 
  Slack, 
  ExternalLink, 
  ChevronRight, 
  ArrowUpRight, 
  Activity,
  Calendar,
  Users,
  Code,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { PROJECT_DATA } from './constants';
import { ProjectPhase } from './types';

export default function App() {
  const [activePhase, setActivePhase] = useState<ProjectPhase>(ProjectPhase.BUILD);

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'On Track': return 'text-emerald-600';
      case 'At Risk': return 'text-amber-600';
      case 'Delayed': return 'text-rose-600';
      default: return 'text-ink';
    }
  };

  const getStatusIcon = (phase: ProjectPhase) => {
    const phases = Object.values(ProjectPhase);
    const currentIndex = phases.indexOf(PROJECT_DATA.currentPhase);
    const targetIndex = phases.indexOf(phase);

    if (targetIndex < currentIndex) return <CheckCircle2 className="w-3 h-3 text-emerald-500" />;
    if (targetIndex === currentIndex) return <Activity className="w-3 h-3 text-accent animate-pulse" />;
    return <div className="w-2 h-2 rounded-full bg-neutral/30" />;
  };

  return (
    <div className="min-h-screen max-w-6xl mx-auto px-6 py-12 md:py-24">
      {/* SECTION 1: Header & Overview */}
      <header className="mb-20">
        <div className="flex flex-col mb-12 gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-2 py-0.5 bg-primary-dark text-paper text-[10px] font-mono uppercase tracking-widest rounded">
                {PROJECT_DATA.status}
              </span>
              <span className="text-[10px] font-mono text-neutral">
                {PROJECT_DATA.slug}.v1.0
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tighter mb-4 leading-none uppercase">
              {PROJECT_DATA.name}
            </h1>
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-mono uppercase tracking-widest text-neutral">Client /</p>
              <p className="text-base font-display uppercase tracking-tight">{PROJECT_DATA.client}</p>
            </div>
          </div>
        </div>

        {/* MILESTONE PROGRESS BAR */}
        <div className="mb-16">
          <div className="flex justify-between items-center mb-6">
            <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-neutral">Project Lifecycle Journey</p>
            <p className="text-[10px] font-mono uppercase tracking-widest text-primary-dark font-bold">Phase: {PROJECT_DATA.currentPhase}</p>
          </div>
          <div className="relative">
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-line -translate-y-1/2" />
            <div className="relative flex justify-between">
              {Object.values(ProjectPhase).map((phase, i) => {
                const phases = Object.values(ProjectPhase);
                const currentIndex = phases.indexOf(PROJECT_DATA.currentPhase);
                const isCompleted = i < currentIndex;
                const isActive = i === currentIndex;
                
                return (
                  <div key={phase} className="flex flex-col items-center group relative cursor-default">
                    <div className={`w-3 h-3 rounded-none rotate-45 border transition-all duration-500 z-10 bg-paper 
                      ${isCompleted ? 'bg-primary-dark border-primary-dark scale-75' : 
                        isActive ? 'bg-accent border-primary-dark scale-125 ring-4 ring-accent/20' : 
                        'border-neutral/30 group-hover:border-primary-dark'}`} 
                    />
                    <span className={`absolute top-6 text-[9px] font-mono uppercase tracking-tighter whitespace-nowrap transition-all
                      ${isActive ? 'text-primary-dark font-bold scale-110' : 'text-neutral opacity-50 group-hover:opacity-100'}`}>
                      {phase}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-line">
          <div className="w-full">
            <h2 className="text-xs font-mono uppercase tracking-widest text-neutral mb-4 flex items-center gap-2">
               <Activity className="w-3 h-3" /> Executive Summary
            </h2>
            <p className="text-lg font-light leading-relaxed text-primary-dark max-w-4xl">
              {PROJECT_DATA.description}
            </p>
          </div>
        </div>
      </header>

      {/* SECTION 2: Stakeholders & Links */}
      <section className="mb-20 py-12 border-y border-line">
        <div className="grid md:grid-cols-2 gap-20">
          <div>
            <h3 className="text-xs font-mono uppercase tracking-widest text-neutral mb-8 flex items-center gap-2">
              <Users className="w-3 h-3" /> Strategic Stakeholders
            </h3>
            <div className="space-y-4">
              {PROJECT_DATA.deliveryTeam.map((member, i) => (
                <div key={i} className="flex justify-between items-center border-b border-line pb-3 group transition-colors hover:border-accent">
                  <div>
                    <p className="text-base font-display uppercase tracking-tight text-primary-dark">{member.name}</p>
                    <p className="text-[10px] text-neutral tracking-widest uppercase font-mono mt-0.5">{member.role}</p>
                  </div>
                  {member.company && (
                    <span className="text-[8px] font-mono uppercase px-1.5 py-0.5 bg-primary-dark text-paper tracking-widest">
                      {member.company}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-mono uppercase tracking-widest text-neutral mb-8 flex items-center gap-2">
              <ExternalLink className="w-3 h-3" /> Asset Directory
            </h3>
            <div className="flex flex-col divide-y divide-line">
              {PROJECT_DATA.operationalLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  className="flex items-center justify-between py-3 group hover:pl-2 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full border border-line flex items-center justify-center group-hover:bg-accent group-hover:border-accent transition-colors">
                      <ArrowUpRight className="w-3 h-3 text-primary-dark" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-primary-dark">{link.label}</span>
                  </div>
                  <span className="text-[9px] font-mono text-neutral opacity-0 group-hover:opacity-100 transition-opacity">Open link →</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Phase Tabs & Details */}
      <section className="mb-24">
        <div className="flex flex-wrap border-b border-line mb-10 overflow-x-auto">
          {Object.values(ProjectPhase).map((phase) => (
            <button
              key={phase}
              onClick={() => setActivePhase(phase)}
              className={`relative py-4 px-6 text-xs font-mono uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2
                ${activePhase === phase ? 'text-primary-dark font-bold' : 'text-neutral hover:text-primary-dark'}
              `}
            >
              {getStatusIcon(phase)}
              {phase}
              {activePhase === phase && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-accent"
                />
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activePhase}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid md:grid-cols-5 gap-12"
          >
            <div className="md:col-span-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral block mb-4">
                Phase Context — {activePhase}
              </span>
              <h4 className="text-5xl font-display uppercase mb-6">Details & Intelligence</h4>
              <p className="text-primary-dark/80 leading-relaxed mb-8">
                {PROJECT_DATA.phaseContent[activePhase].notes || "No detailed notes available for this phase."}
              </p>
              
              {activePhase === ProjectPhase.BUILD && (
                <div className="p-4 bg-primary-dark text-paper rounded-sm border-l-4 border-accent">
                  <p className="text-xs uppercase tracking-widest text-accent font-bold mb-1 flex items-center gap-1">
                    <Activity className="w-3 h-3" /> Attention Required
                  </p>
                  <p className="text-xs opacity-90">
                    Jira tasks in Engineering stream are slightly behind schedule due to LKID-41 complexity.
                  </p>
                </div>
              )}
            </div>

            <div className="md:col-span-3">
              {activePhase === ProjectPhase.BUILD ? (
                <div className="space-y-12">
                  {/* Commits */}
                  <div>
                    <h5 className="text-[10px] font-mono uppercase tracking-widest text-neutral mb-4 border-b border-line pb-2 flex items-center gap-2">
                      <Code className="w-3 h-3" /> Recent Commits
                    </h5>
                    <div className="space-y-3 font-mono">
                      {PROJECT_DATA.phaseContent[activePhase].commits?.map((commit, i) => (
                        <div key={i} className="flex gap-4 p-3 hover:bg-primary-dark/5 border-l border-transparent hover:border-accent transition-colors group">
                          <span className="text-accent bg-primary-dark px-1.5 py-0.5 text-[10px] rounded h-fit">{commit.id}</span>
                          <div>
                            <p className="text-xs font-medium group-hover:text-primary-dark">{commit.message}</p>
                            <p className="text-[10px] text-neutral mt-1">{commit.author} · {commit.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Jira Tasks */}
                  <div>
                    <h5 className="text-[10px] font-mono uppercase tracking-widest text-neutral mb-4 border-b border-line pb-2 flex items-center gap-2">
                      <Layout className="w-3 h-3" /> Jira Activity
                    </h5>
                    <div className="divide-y divide-line">
                      {PROJECT_DATA.phaseContent[activePhase].jiraTasks?.map((task, i) => (
                        <div key={i} className="py-3 flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-neutral group-hover:text-primary-dark transition-colors">{task.id}</span>
                            <span className="text-sm font-medium">{task.title}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-[10px] font-mono text-neutral uppercase tracking-tighter">{task.stream}</span>
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm ${
                              task.status === 'Done' ? 'bg-primary-dark text-accent' : 'bg-accent text-primary-dark'
                            }`}>
                              {task.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (activePhase === ProjectPhase.SALES || activePhase === ProjectPhase.DISCOVERY) && PROJECT_DATA.phaseContent[activePhase].meetings ? (
                <div>
                  <h5 className="text-[10px] font-mono uppercase tracking-widest text-neutral mb-6 border-b border-line pb-2 flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> Phase Meetings
                  </h5>
                  <div className="space-y-6">
                    {PROJECT_DATA.phaseContent[activePhase].meetings?.map((meeting, i) => (
                      <div key={i} className="relative pl-6 border-l border-line hover:border-accent transition-all py-1">
                        <div className="absolute -left-[3px] top-2 w-1.5 h-1.5 bg-accent" />
                        <p className="text-sm text-neutral font-mono mb-1">{meeting.date}</p>
                        <p className="text-xl font-display uppercase mb-2">{meeting.title}</p>
                        <div className="flex flex-wrap gap-2 text-[10px] text-neutral uppercase tracking-widest font-mono">
                          {meeting.participants.map(p => <span key={p} className="bg-primary-dark/5 px-1">{p}</span>)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center border border-dashed border-line rounded-sm text-neutral">
                  <Activity className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-sm font-mono uppercase tracking-widest">Awaiting Lifecycle Data</p>
                  <p className="text-[10px] mt-2 px-8 text-center max-w-xs">Specific intelligence for this stream is currently being ingested from production systems.</p>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Footer / Meta info */}
      <footer className="pt-12 border-t border-line flex flex-col md:flex-row justify-between items-center gap-6 opacity-30 hover:opacity-100 transition-opacity">
        <div className="text-[10px] font-mono uppercase tracking-[0.3em]">
          Automated Lifecycle Report · LKID-v1
        </div>
        <div className="flex gap-8 text-[10px] font-mono uppercase">
          <span>Synced: 2024-05-15 05:06</span>
          <span>Last Poll: 4m ago</span>
          <span>Version: 4.2.1-stable</span>
        </div>
      </footer>
    </div>
  );
}
