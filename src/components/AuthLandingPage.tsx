import React from 'react';
import { ArrowRight, BarChart3, CheckCircle2, ShieldCheck } from 'lucide-react';

interface AuthLandingPageProps {
  onSignIn: () => void;
  onSignUp: () => void;
}

export const AuthLandingPage: React.FC<AuthLandingPageProps> = ({ onSignIn, onSignUp }) => (
  <div className="min-h-[100dvh] bg-[#fbfaf6] text-[#17343a]">
    <header className="border-b border-[#d9d2c2] bg-[#fbfaf6]/95">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="" className="h-10 w-[133px] object-contain object-left" />
          <span className="hidden rounded bg-[#f5e6bf] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#7c571f] sm:inline">
            Production
          </span>
        </div>
        <button
          type="button"
          onClick={onSignIn}
          className="rounded-xl border border-[#b8d4d1] bg-white px-4 py-2 text-sm font-bold text-[#176f78] transition hover:bg-[#e6f0ee]"
        >
          Sign in
        </button>
      </div>
    </header>

    <main className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
      <section>
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#b8d4d1] bg-[#e6f0ee] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#176f78]">
          <ShieldCheck className="h-3.5 w-3.5" />
          Secure IE operations workspace
        </div>
        <h1 className="max-w-3xl font-display text-5xl font-bold leading-[0.95] tracking-tight text-[#17343a] sm:text-7xl">
          Keep every production decision tied to the floor.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-[#527078] sm:text-lg">
          Track daily IE protocols, line efficiency, manpower balance, bottlenecks, WIP flow, and management reports in one controlled workspace.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onSignUp}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#176f78] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#176f78]/20 transition hover:bg-[#11535b]"
          >
            Create workspace account
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onSignIn}
            className="rounded-2xl border border-[#d9d2c2] bg-white px-5 py-3.5 text-sm font-bold text-[#17343a] transition hover:border-[#8bb7b7] hover:bg-[#f1eee6]"
          >
            Sign in to continue
          </button>
        </div>
      </section>

      <section className="relative">
        <div className="absolute -inset-4 rounded-[2rem] bg-[#e6f0ee] blur-2xl" />
        <div className="relative rounded-[2rem] border border-[#d9d2c2] bg-white p-5 shadow-xl shadow-[#17343a]/10 sm:p-7">
          <div className="mb-6 flex items-center justify-between border-b border-[#eee9df] pb-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#527078]">Operations snapshot</div>
              <div className="mt-1 text-lg font-bold text-[#17343a]">IE Daily Control</div>
            </div>
            <BarChart3 className="h-6 w-6 text-[#176f78]" />
          </div>
          <div className="rounded-2xl bg-[#176f78] p-5 text-white">
            <div className="text-xs font-semibold text-[#dceceb]">Today’s standard completion</div>
            <div className="mt-2 text-5xl font-black">58<span className="text-2xl text-[#f8c56a]">%</span></div>
            <div className="mt-3 h-2 rounded-full bg-white/20">
              <div className="h-2 w-[58%] rounded-full bg-[#f8c56a]" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              ['6', 'Active lines'],
              ['85%', 'Target efficiency'],
              ['12', 'Daily protocols'],
              ['24/7', 'Floor visibility']
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-[#eee9df] bg-[#fbfaf6] p-4">
                <div className="text-2xl font-black text-[#17343a]">{value}</div>
                <div className="mt-1 text-[11px] font-semibold text-[#527078]">{label}</div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-2 rounded-xl bg-[#e6f0ee] px-3 py-2 text-xs font-semibold text-[#176f78]">
            <CheckCircle2 className="h-4 w-4" />
            Built for industrial engineering teams
          </div>
        </div>
      </section>
    </main>
  </div>
);