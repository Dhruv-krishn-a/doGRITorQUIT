'use client';

import React, { useLayoutEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Sparkles,
  CheckCircle2,
  BarChart3,
  ArrowRight,
  BrainCircuit,
  LayoutDashboard,
  MoreVertical
} from 'lucide-react';

// Register GSAP plugins safely
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const mainRef = useRef<HTMLDivElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, tx: 0, ty: 0, rAF: 0 });

  useLayoutEffect(() => {
    const root = mainRef.current;
    if (!root) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      // --- ANIMATION LOGIC STARTS HERE ---
      
      // 1. Mouse Blob Interaction
      const hero = root.querySelector<HTMLElement>('.hero-section');
      const blob1 = root.querySelector<HTMLElement>('.hero-blob-1');
      const blob2 = root.querySelector<HTMLElement>('.hero-blob-2');

      function onMouse(e: MouseEvent) {
        mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 28;
        mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 28;
      }

      function rafLoop() {
        mouseRef.current.tx += (mouseRef.current.x - mouseRef.current.tx) * 0.09;
        mouseRef.current.ty += (mouseRef.current.y - mouseRef.current.ty) * 0.09;

        if (blob1) {
          gsap.set(blob1, {
            x: mouseRef.current.tx * 0.18,
            y: mouseRef.current.ty * 0.18,
            rotate: mouseRef.current.tx * 0.02,
          });
        }
        if (blob2) {
          gsap.set(blob2, {
            x: -mouseRef.current.tx * 0.12,
            y: -mouseRef.current.ty * 0.12,
            rotate: mouseRef.current.ty * 0.02,
          });
        }

        mouseRef.current.rAF = requestAnimationFrame(rafLoop);
      }

      if (!prefersReduced && hero) {
        hero.addEventListener('mousemove', onMouse);
        mouseRef.current.rAF = requestAnimationFrame(rafLoop);
        if (blob1) gsap.to(blob1, { y: '-=12', repeat: -1, yoyo: true, duration: 6, ease: 'sine.inOut' });
        if (blob2) gsap.to(blob2, { y: '+=18', repeat: -1, yoyo: true, duration: 8, ease: 'sine.inOut', delay: 0.6 });
      }

      // 2. Hero Intro Stagger
      if (!prefersReduced) {
        const intro = gsap.timeline({ defaults: { duration: 0.8, ease: 'power3.out' } });
        intro
          .from('.hero-section .inline-flex', { y: 18, opacity: 0 })
          .from('.hero-section h1', { y: 40, opacity: 0, stagger: 0.06 }, '-=0.35')
          .from('.hero-section p', { y: 20, opacity: 0 }, '-=0.45')
          .from('.hero-cta', { scale: 0.96, opacity: 0 }, '-=0.4');
        gsap.to('.hero-cta', { scale: 1.03, repeat: -1, yoyo: true, duration: 2.6, ease: 'power1.inOut', delay: 2 });
      } else {
        gsap.set('.ai-cursor', { opacity: 0 });
        gsap.set('.ai-text-input', { width: '100%' });
      }

      // 3. Hover Micro-interactions
      gsap.utils.toArray<HTMLElement>('.task-row-1, .task-row-2').forEach((el) => {
        const hover = gsap.to(el, { y: -6, paused: true, duration: 0.28, ease: 'power1.out' });
        el.addEventListener('mouseenter', () => hover.play());
        el.addEventListener('mouseleave', () => hover.reverse());
      });

      // 4. General Section Reveals
      function reveal(selector: string) {
        gsap.utils.toArray<HTMLElement>(selector).forEach((el) => {
          ScrollTrigger.create({
            trigger: el,
            start: 'top 85%',
            end: 'bottom 20%',
            onEnter: () => gsap.fromTo(el, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' }),
            onEnterBack: () => gsap.fromTo(el, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }),
            once: true,
          });
        });
      }

      // 5. Desktop Pinned Animation (The complicated scroll part)
      const mm = gsap.matchMedia();

      mm.add('(min-width: 1024px)', () => {
        const masterTl = gsap.timeline({ paused: true });
        const dashboardPreview = root.querySelector<HTMLElement>('.dashboard-view');

        // Step A: AI Creation
        masterTl
          .addLabel('ai-start')
          .to('.text-step-1', { color: '#0f172a', scale: 1.03, opacity: 1, filter: 'blur(0px)', duration: 0.6 })
          .to('.nav-item-dashboard', { backgroundColor: '#eef2ff', color: '#6b21a8', duration: 0.3 }, '<')
          .to('.nav-item-tasks', { backgroundColor: 'transparent', color: '#64748b', duration: 0.3 }, '<')
          .to('.nav-item-analytics', { backgroundColor: 'transparent', color: '#64748b', duration: 0.3 }, '<')
          .to('.ai-cursor', { opacity: 1, duration: 0.08 }, '<')
          .to('.ai-text-input', { width: '100%', duration: 2.2, ease: 'steps(28)' })
          .to('.ai-cursor', { opacity: 0, duration: 0.08 })
          .call(() => {
            if (dashboardPreview) {
              gsap.set(dashboardPreview, { display: 'block' });
            }
          })
          .to('.ai-modal', { scale: 0.96, opacity: 0, y: -18, duration: 0.6, delay: 0.3 })
          .to('.dashboard-view', { opacity: 1, duration: 0.6 }, '<');

        masterTl.addLabel('map-start');

        // Step B: Task Mapping
        // FIX: First, hide the Dashboard View overlay so it doesn't overlap the Tasks list
        masterTl
          .to('.dashboard-view', { opacity: 0, duration: 0.4 })
          .set('.dashboard-view', { display: 'none' }) 
          
          // Then animate the sidebar and text
          .to('.text-step-1', { color: '#94a3b8', scale: 1, opacity: 0.35, filter: 'blur(2px)', duration: 0.5 }, '<')
          .to('.text-step-2', { color: '#0f172a', scale: 1.03, opacity: 1, filter: 'blur(0px)', duration: 0.6 }, '<')
          .to('.nav-item-dashboard', { backgroundColor: 'transparent', color: '#64748b', duration: 0.3 }, '<')
          .to('.nav-item-tasks', { backgroundColor: '#fdf2ff', color: '#7c3aed', duration: 0.3 }, '<')
          
          // Task checklist animations
          .to('.task-row-1 .checkbox-fill', { scale: 1, duration: 0.28, ease: 'back.out(3)' })
          .to('.task-row-1 .task-text', { textDecoration: 'line-through', opacity: 0.5 }, '<')
          .to('.task-row-2 .checkbox-fill', { scale: 1, duration: 0.28, ease: 'back.out(3)' })
          .to('.task-row-2 .task-text', { textDecoration: 'line-through', opacity: 0.5 }, '<');

        masterTl.addLabel('analytics-start');

        // Step C: Analytics
        masterTl
          .to('.text-step-2', { color: '#94a3b8', scale: 1, opacity: 0.35, filter: 'blur(2px)', duration: 0.4 })
          .to('.text-step-3', { color: '#0f172a', scale: 1.03, opacity: 1, filter: 'blur(0px)', duration: 0.6 }, '<')
          .to('.nav-item-tasks', { backgroundColor: 'transparent', color: '#64748b', duration: 0.3 }, '<')
          .to('.nav-item-analytics', { backgroundColor: '#F3E8FF', color: '#7E22CE', duration: 0.3 }, '<')
          
          // FIX: Change x from '-100%' to '-50%'
          // Since the element is 200% wide, -50% translates it by 100% of the parent width (revealing the 2nd half)
          .to('.app-screen', { x: '-50%', duration: 0.9, ease: 'power2.inOut' })
          
          .fromTo(
            '.chart-bar',
            { scaleY: 0 },
            { scaleY: 1, transformOrigin: 'bottom', stagger: 0.08, duration: 1.1, ease: 'back.out(1.4)' },
            '<0.1'
          )
          .fromTo('.grid > .bg-white.p-4', { y: 8, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.5 }, '<');

        ScrollTrigger.create({
          animation: masterTl,
          trigger: '.pinned-container',
          start: 'top top',
          end: () => `+=${Math.max(window.innerHeight * 3.6, 3200)}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        });

        return () => {};
      });

      // Mobile Handling
      mm.add('(max-width: 1023px)', () => {
        reveal('.feature, .roadmap-step, .testimonial, .pricing-card, .faq-item');
        gsap.utils.toArray<HTMLElement>('.text-step-1, .text-step-2, .text-step-3').forEach((el) => {
          ScrollTrigger.create({
            trigger: el,
            start: 'top 85%',
            onEnter: () => gsap.fromTo(el, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }),
            once: true,
          });
        });
        return () => {};
      });

      // Common Reveals
      reveal('.feature');
      reveal('.roadmap-step');
      reveal('.testimonial');
      reveal('.pricing-card');
      reveal('.faq-item');

      return () => {
        if (hero) hero.removeEventListener('mousemove', onMouse as EventListener);
        cancelAnimationFrame(mouseRef.current.rAF);
        mm.revert();
      };
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={mainRef} className="bg-[#FDF2F8] font-sans text-slate-900 selection:bg-purple-200 overflow-x-hidden">
      
      {/* =====================================================================================
          SECTION: NAVIGATION
          Top Bar (Logo, Login Link)
      ===================================================================================== */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center mix-blend-multiply pointer-events-none" aria-hidden="true">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight pointer-events-auto">
          <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center">
            <span className="font-serif italic">P</span>
          </div>
          <span>PlannerAI</span>
        </div>
        <Link href="/dashboard" className="text-sm font-semibold hover:underline decoration-2 underline-offset-4 pointer-events-auto" aria-label="Open dashboard">
          Login / Dashboard
        </Link>
      </nav>

      {/* =====================================================================================
          SECTION: HERO
          Large text, floating blobs, Call to Action button
      ===================================================================================== */}
      <section className="hero-section min-h-screen flex flex-col items-center justify-center relative overflow-hidden pt-20">
        <div className="hero-blob-1 absolute top-1/4 -left-20 rounded-full blur-[100px] opacity-40" style={{ width: '500px', height: '500px', background: 'rgba(139,92,246,0.22)' }} />
        <div className="hero-blob-2 absolute bottom-0 right-0 rounded-full blur-[120px] opacity-40" style={{ width: '520px', height: '520px', background: 'rgba(236,72,153,0.18)' }} />

        <div className="z-10 text-center space-y-6 max-w-4xl px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-200 bg-white/50 text-purple-800 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={12} /> v2.0 Released
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter text-slate-900 leading-[0.9]">
            ARCHITECT<br />
            <span className="bg-linear-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">YOUR FUTURE</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-500 max-w-xl mx-auto font-medium">
            The only workspace that uses AI to break down your massive goals into daily, bite-sized tasks.
          </p>

          <div className="pt-8">
            <Link href="/dashboard" aria-label="Open Dashboard">
              <button className="hero-cta px-8 md:px-10 py-4 bg-slate-900 text-white rounded-full font-bold hover:scale-105 transition-transform duration-300 shadow-2xl shadow-purple-900/20 flex items-center gap-2 mx-auto" type="button">
                Open Dashboard <ArrowRight size={18} />
              </button>
            </Link>
          </div>
        </div>

        <div className="absolute bottom-10 animate-bounce text-slate-400" aria-hidden="true">
          <div className="w-px h-12 bg-slate-300 mx-auto mb-2" />
          <p className="text-xs uppercase tracking-widest">Scroll to Explore</p>
        </div>
      </section>

      {/* =====================================================================================
          SECTION: SCROLL EXPERIENCE (PINNED)
          The split screen effect where the right side simulates the app usage
      ===================================================================================== */}
      <div className="pinned-container relative w-full lg:h-screen flex flex-col lg:flex-row overflow-hidden bg-white/50 backdrop-blur-sm">
        
        {/* --- LEFT SIDE: NARRATIVE STEPS --- */}
        <div className="w-full lg:w-1/3 lg:h-full flex flex-col justify-center px-8 lg:px-16 py-12 lg:py-0 space-y-16 lg:space-y-24 z-10">
          <div className="text-step-1 opacity-30 blur-[2px] transition-all duration-500">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
              <BrainCircuit size={24} />
            </div>
            <h2 className="text-3xl font-bold mb-4">It starts with a thought.</h2>
            <p className="text-lg leading-relaxed text-slate-600">
              Just tell the AI what you want. &quot;Launch an MVP&quot;, &quot;Learn Rust&quot;, or &quot;Get Fit&quot;. Our <strong>Devstral Model</strong> analyzes your intent and constructs a roadmap.
            </p>
          </div>

          <div className="text-step-2 opacity-30 blur-[2px] transition-all duration-500">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
              <CheckCircle2 size={24} />
            </div>
            <h2 className="text-3xl font-bold mb-4">Mapped to Reality.</h2>
            <p className="text-lg leading-relaxed text-slate-600">
              We don&apos;t just give you a list. We populate your calendar. Tasks are prioritized and broken down into <strong>Daily Checklists</strong> so you actually finish them.
            </p>
          </div>

          <div className="text-step-3 opacity-30 blur-[2px] transition-all duration-500">
            <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center mb-4">
              <BarChart3 size={24} />
            </div>
            <h2 className="text-3xl font-bold mb-4">Visual Momentum.</h2>
            <p className="text-lg leading-relaxed text-slate-600">
              Review your <strong>Focus Time</strong> and <strong>Task Velocity</strong>. The dashboard adapts to your performance, helping you maintain a streak that matters.
            </p>
          </div>
        </div>

        {/* --- RIGHT SIDE: APP SIMULATION --- */}
        <div className="w-full lg:w-2/3 min-h-[50vh] lg:h-full bg-[#F3F4F6] relative overflow-hidden flex items-center justify-center p-8">
          <div className="relative w-full max-w-5xl aspect-video bg-[#FDF2F8] rounded-2xl shadow-2xl border border-white/50 overflow-hidden flex">
            {/* App Sidebar */}
            <div className="w-64 bg-[#FDF2F8] border-r border-slate-200/60 p-6 hidden md:flex flex-col gap-6 shrink-0 z-20">
              <div className="font-bold text-slate-800 text-lg mb-4">Planner</div>
              <div className="space-y-1">
                <div className="nav-item-dashboard flex items-center gap-3 px-3 py-2 text-slate-600 rounded-lg hover:bg-white/50 cursor-pointer">
                  <LayoutDashboard size={18} /> Dashboard
                </div>
                <div className="nav-item-tasks flex items-center gap-3 px-3 py-2 text-purple-700 bg-purple-100 rounded-lg font-medium cursor-pointer">
                  <CheckCircle2 size={18} /> My Tasks
                </div>
                <div className="nav-item-analytics flex items-center gap-3 px-3 py-2 text-slate-600 rounded-lg hover:bg-white/50 cursor-pointer transition-colors">
                  <BarChart3 size={18} /> Analytics
                </div>
              </div>
            </div>

            {/* App Content Area */}
            <div className="flex-1 relative overflow-hidden">
              {/* 1. Dashboard Preview (Hidden initially) */}
              <div className="dashboard-view absolute inset-0 z-40 hidden opacity-0 pointer-events-none">
                <div className="h-full p-8 flex flex-col">
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-400">Planner • Overview</div>
                      <div className="text-lg font-bold">Welcome back — track progress</div>
                    </div>
                    <div className="text-sm text-slate-500">Focus: 4h 20m</div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-1/3 bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                      <div className="text-xs text-slate-400">Focus Time</div>
                      <div className="text-2xl font-bold">4h 20m</div>
                    </div>
                    <div className="w-1/3 bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                      <div className="text-xs text-slate-400">Tasks Done</div>
                      <div className="text-2xl font-bold">12</div>
                    </div>
                    <div className="w-1/3 bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                      <div className="text-xs text-slate-400">Streak</div>
                      <div className="text-2xl font-bold">5</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. AI Modal Overlay (Initially Visible) */}
              <div className="ai-modal absolute inset-0 z-50 flex items-center justify-center bg-black/5 backdrop-blur-sm">
                <div className="bg-white w-[90%] max-w-2xl rounded-2xl shadow-2xl border border-slate-100 p-0 overflow-hidden">
                  <div className="bg-slate-50 border-b p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white">
                        <Sparkles size={16} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Strategic Planner</h3>
                        <p className="text-xs text-slate-500">Mistral Devstral • Context Aware</p>
                      </div>
                    </div>
                    <div className="text-slate-400"><MoreVertical size={16} /></div>
                  </div>

                  <div className="p-8 h-64 flex flex-col justify-center items-center text-center space-y-6">
                    <div className="w-full max-w-lg">
                      <div className="bg-purple-50 p-4 rounded-2xl rounded-bl-none text-left text-purple-900 text-sm font-medium mb-4 inline-block">
                        I&apos;m ready to architect your success. What is your main goal?
                      </div>

                      <div className="relative w-full">
                        <div className="w-full bg-white border-2 border-purple-100 rounded-xl p-4 text-left shadow-sm flex items-center text-slate-800 text-lg">
                          <span className="ai-text-input overflow-hidden whitespace-nowrap w-0 block">I want to learn Next.js and GSAP</span>
                          <span className="ai-cursor w-0.5 h-6 bg-purple-600 ml-1 opacity-0" />
                        </div>
                        <div className="absolute right-4 top-4 text-purple-600 bg-purple-100 p-1 rounded-md">
                          <ArrowRight size={16} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Sliding Screen Container (Tasks -> Analytics) */}
              <div className="app-screen w-[200%] h-full flex transition-transform ease-out">
                
                {/* SLIDE A: Tasks View */}
                <div className="w-1/2 h-full p-8 overflow-y-auto bg-[#FDF2F8]">
                  <header className="flex justify-between items-center mb-8">
                    <div>
                      <h2 className="text-3xl font-bold text-slate-800">My Tasks</h2>
                      <p className="text-slate-500">Manage your daily goals</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm" type="button">Today</button>
                    </div>
                  </header>

                  <div className="space-y-4">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Thu, Nov 02</div>

                    <div className="task-row-1 bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                      <div className="w-6 h-6 rounded-full border-2 border-purple-200 mt-1 flex items-center justify-center relative overflow-hidden">
                        <div className="checkbox-fill w-full h-full bg-purple-500 scale-0 transition-transform origin-center" />
                      </div>
                      <div className="flex-1">
                        <div className="task-text text-slate-800 font-medium text-lg">Setup Development Environment</div>
                        <div className="flex gap-2 mt-2">
                          <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">Node.js</span>
                          <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">VS Code</span>
                        </div>
                      </div>
                    </div>

                    <div className="task-row-2 bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                      <div className="w-6 h-6 rounded-full border-2 border-purple-200 mt-1 flex items-center justify-center relative overflow-hidden">
                        <div className="checkbox-fill w-full h-full bg-purple-500 scale-0 transition-transform origin-center" />
                      </div>
                      <div className="flex-1">
                        <div className="task-text text-slate-800 font-medium text-lg">Learn SQL Basics</div>
                        <div className="flex gap-2 mt-2">
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded font-bold">HIGH</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SLIDE B: Analytics View */}
                <div className="w-1/2 h-full p-8 bg-[#FDF2F8]">
                  <header className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-800">Performance</h2>
                    <p className="text-slate-500">Insights for the last 7 days</p>
                  </header>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                      <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-2">
                        <LayoutDashboard size={16} />
                      </div>
                      <div className="text-2xl font-bold text-slate-800">4h 20m</div>
                      <div className="text-xs text-slate-400 uppercase">Focus Time</div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                      <div className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-2">
                        <CheckCircle2 size={16} />
                      </div>
                      <div className="text-2xl font-bold text-slate-800">12</div>
                      <div className="text-xs text-slate-400 uppercase">Tasks Done</div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-64 flex flex-col">
                    <div className="flex justify-between mb-4">
                      <h3 className="font-bold text-slate-700">Task Velocity</h3>
                      <span className="text-xs bg-slate-100 px-2 py-1 rounded">Daily</span>
                    </div>
                    <div className="flex-1 flex items-end justify-between gap-2">
                      {[30, 45, 25, 60, 80, 50, 90].map((h, i) => (
                        <div key={i} className="w-full bg-slate-100 rounded-t-lg relative group h-full flex items-end">
                          <div
                            className="chart-bar w-full rounded-t-lg opacity-90 hover:opacity-100 transition-opacity"
                            style={{ height: `${h}%`, background: 'linear-gradient(to top, #7c3aed, #ec4899)' }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================================
          SECTION: FEATURES
          3 Column Layout with images
      ===================================================================================== */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-6">Features that actually ship work</h2>
          <p className="text-slate-500 mb-12 max-w-2xl">PlannerAI blends AI planning, calendar sync, and progress insights into a single workflow. Designed for builders who want results.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="feature bg-[#FEF3FF] p-6 rounded-2xl shadow-sm">
              <div className="w-12 h-12 bg-purple-600 text-white rounded-lg flex items-center justify-center mb-4">AI</div>
              <h3 className="font-bold text-lg mb-2">AI Roadmaps</h3>
              <p className="text-sm text-slate-600">Automatically decomposes goals into milestones, then daily tasks with estimates.</p>
              <Image src="/images/feature-ai.jpg" alt="AI roadmap" width={720} height={360} className="mt-4 w-full rounded-md object-cover h-40" />
            </div>

            <div className="feature bg-[#EFF6FF] p-6 rounded-2xl shadow-sm">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center mb-4">CL</div>
              <h3 className="font-bold text-lg mb-2">Checklists</h3>
              <p className="text-sm text-slate-600">Daily checklists that nudge you toward consistent progress and streaks.</p>
              <Image src="/images/feature-checklist.jpg" alt="Checklists" width={720} height={360} className="mt-4 w-full rounded-md object-cover h-40" />
            </div>

            <div className="feature bg-[#ECFDF5] p-6 rounded-2xl shadow-sm">
              <div className="w-12 h-12 bg-green-600 text-white rounded-lg flex items-center justify-center mb-4">AN</div>
              <h3 className="font-bold text-lg mb-2">Analytics</h3>
              <p className="text-sm text-slate-600">Visualize focus time, velocity, and habit formation over weeks and months.</p>
              <Image src="/images/feature-analytics.jpg" alt="Analytics" width={720} height={360} className="mt-4 w-full rounded-md object-cover h-40" />
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================================
          SECTION: ROADMAP
          Q1, Q2, Q3 milestones
      ===================================================================================== */}
      <section className="py-20 bg-[#F9FAFB]">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-6">Roadmap</h2>
          <p className="text-slate-500 mb-12 max-w-2xl">Where PlannerAI is headed — built for scale, privacy, and delightful UX.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Q1 — Core', desc: 'Refine AI planner, offline sync, and native mobile pairing.' },
              { title: 'Q2 — Growth', desc: 'Team plans, integrations (Calendar, Notion), and shared goals.' },
              { title: 'Q3 — Scale', desc: 'Workspaces, API, and analytics export.' }
            ].map((s, i) => (
              <div key={i} className="roadmap-step bg-white p-6 rounded-2xl shadow-sm">
                <div className="text-xs text-slate-400 uppercase mb-2">Milestone</div>
                <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-slate-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================================
          SECTION: TESTIMONIALS
      ===================================================================================== */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-6">Loved by builders</h2>
          <p className="text-slate-500 mb-12 max-w-2xl">Real feedback from early users.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Aisha', text: 'PlannerAI turned my vague goals into daily wins. Streaks actually helped me finish a book.' },
              { name: 'Ravi', text: 'The analytics nudged me to focus and ship small increments every week.' },
              { name: 'Maya', text: 'Pairing with my phone was instant — clipboard sync made my dev loop faster.' }
            ].map((t, i) => (
              <div key={i} className="testimonial bg-[#FEFBFF] p-6 rounded-2xl shadow-sm">
                <div className="text-slate-700 font-medium mb-2">“{t.text}”</div>
                <div className="text-xs text-slate-400 mt-4">— {t.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================================
          SECTION: PRICING
      ===================================================================================== */}
      <section className="py-20 bg-[#F9FAFB]">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-6">Pricing</h2>
          <p className="text-slate-500 mb-12 max-w-2xl">Simple plans — free for personal use, paid for teams and extra sync.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="pricing-card bg-white p-6 rounded-2xl shadow-sm">
              <div className="text-xs text-slate-400 uppercase">Free</div>
              <div className="text-2xl font-bold my-4">$0</div>
              <div className="text-sm text-slate-600">Basic AI planning, 1 device pairing, core features.</div>
              <button className="mt-6 px-4 py-2 bg-slate-900 text-white rounded-full">Get started</button>
            </div>

            <div className="pricing-card bg-white p-6 rounded-2xl shadow-lg border-2 border-purple-100">
              <div className="text-xs text-slate-400 uppercase">Pro</div>
              <div className="text-2xl font-bold my-4">$8 / month</div>
              <div className="text-sm text-slate-600">Multiple devices, calendar sync, priority support.</div>
              <button className="mt-6 px-4 py-2 bg-purple-600 text-white rounded-full">Start trial</button>
            </div>

            <div className="pricing-card bg-white p-6 rounded-2xl shadow-sm">
              <div className="text-xs text-slate-400 uppercase">Teams</div>
              <div className="text-2xl font-bold my-4">Contact us</div>
              <div className="text-sm text-slate-600">Shared workspaces, admin controls, and billing.</div>
              <button className="mt-6 px-4 py-2 bg-slate-900 text-white rounded-full">Contact sales</button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================================
          SECTION: FAQ
      ===================================================================================== */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-6">FAQ</h2>
          <div className="space-y-4">
            {[
              { q: 'Is PlannerAI private?', a: 'Yes — user data is private by default. We are building stronger encryption and export options.' },
              { q: 'Can I sync across devices?', a: 'Yes — pairing and syncing is available for mobile and desktop.' },
              { q: 'Are there team plans?', a: 'Yes — Teams are coming with admin controls and shared workspaces.' }
            ].map((f, i) => (
              <details key={i} className="faq-item p-4 rounded-lg bg-[#F8FAFF]">
                <summary className="font-medium cursor-pointer">{f.q}</summary>
                <p className="mt-2 text-slate-600">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================================
          SECTION: FOOTER
      ===================================================================================== */}
      <footer className="py-24 bg-linear-to-r from-purple-600 to-pink-500 text-white text-center">
        <div className="max-w-3xl mx-auto px-6 space-y-6">
          <h2 className="text-3xl font-extrabold">Stop Planning. Start Executing.</h2>
          <p className="opacity-90">Get PlannerAI and ship consistent progress.</p>
          <div className="flex justify-center mt-4">
            <Link href="/dashboard">
              <button className="px-8 py-3 bg-white text-purple-600 font-bold rounded-full">Get Started Free</button>
            </Link>
          </div>
          <p className="text-sm opacity-80 mt-8">© 2026 PlannerAI. Made with ❤️ by Dhruv Krishna.</p>
        </div>
      </footer>
    </div>
  );
}