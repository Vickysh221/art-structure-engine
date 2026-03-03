import { useState, type ReactNode } from "react";

function Tag({ label, color = "blue" }: { label: string; color?: "blue" | "purple" | "green" | "orange" | "pink" | "yellow" }) {
  const colors = {
    blue: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    purple: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    green: "bg-green-500/20 text-green-300 border-green-500/30",
    orange: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    pink: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    yellow: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  };

  return <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 font-mono text-xs ${colors[color]}`}>{label}</span>;
}

function SpecRow({ token, value, usage }: { token: string; value: string; usage: string }) {
  return (
    <div className="flex items-start gap-4 border-b border-white/5 py-2.5 last:border-0">
      <code className="w-32 shrink-0 font-mono text-xs text-cyan-300">{token}</code>
      <code className="w-20 shrink-0 font-mono text-xs text-white/50">{value}</code>
      <span className="text-xs text-white/60">{usage}</span>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="mb-4 mt-10 flex items-center gap-3">
      <div className="h-px flex-1 bg-white/10" />
      <span className="text-xs uppercase tracking-widest text-white/40">{children}</span>
      <div className="h-px flex-1 bg-white/10" />
    </div>
  );
}

function DemoPageLayout() { return <div className="space-y-3"><div className="mb-2 text-xs text-white/40">Page wrapper · <Tag label="px-4" color="blue" /> <Tag label="py-5 / py-8" color="yellow" /> <Tag label="max-w-3xl / max-w-4xl" color="green" /></div><div className="rounded-3xl border border-white/10 bg-white/[0.03] px-4 py-5"><div className="mb-5 flex items-center justify-between"><div><div className="text-sm text-white">🌤️ Page Title</div><div className="text-xs text-white/60">Subtitle text</div></div><button className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80">← Back</button></div><div className="rounded-3xl border border-white/10 bg-white/5 p-4"><div className="py-3 text-center text-[10px] text-white/30">Main chat container · <span className="font-mono text-cyan-300">p-4</span></div></div></div><div className="grid grid-cols-3 gap-3 text-[10px] text-white/50"><div className="rounded-2xl border border-dashed border-white/10 p-3 text-center">gap-3</div><div className="rounded-2xl border border-dashed border-white/10 p-3 text-center">gap-3</div><div className="rounded-2xl border border-dashed border-white/10 p-3 text-center">gap-3</div></div><div className="text-center text-[10px] text-white/30">Grid nav · <Tag label="grid-cols-3" color="purple" /> <Tag label="gap-3" color="orange" /></div></div>; }

function DemoChatBubbles() { return <div className="space-y-2"><div className="mb-2 text-xs text-white/40">Messages list · <Tag label="space-y-2" color="orange" /></div><div className="flex justify-start"><div className="relative max-w-[85%] rounded-2xl border border-white/10 bg-white/10 px-3 py-2"><div className="absolute -top-4 left-0 whitespace-nowrap text-[10px] text-white/30">AI · max-w-[85%]</div><div className="text-xs text-white">Buenos días :) ¿Qué tienes en mente hoy?</div><div className="absolute -right-12 top-1/2 flex -translate-y-1/2 flex-col items-start gap-0.5"><Tag label="px-3" color="blue" /><Tag label="py-2" color="yellow" /></div></div></div><div className="flex justify-end"><div className="relative max-w-[85%] rounded-2xl bg-white px-3 py-2"><div className="absolute -top-4 right-0 whitespace-nowrap text-[10px] text-black/40">User · right-aligned</div><div className="text-xs text-black">Hoy no quiero salir mucho.</div></div></div></div>; }

function DemoComposer() { return <div><div className="mb-2 text-xs text-white/40">Composer · <Tag label="mt-3" color="yellow" /> <Tag label="gap-2" color="orange" /></div><div className="mt-3 flex gap-2"><div className="relative flex-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-2"><div className="text-xs text-white/40">Say something…</div><div className="absolute -bottom-4 left-0 flex gap-2"><Tag label="px-3" color="blue" /><Tag label="py-2" color="yellow" /><Tag label="flex-1" color="green" /></div></div><button className="rounded-2xl bg-white px-4 py-2 text-xs text-black">Send<div className="mt-0.5 flex justify-center gap-1"><Tag label="px-4" color="blue" /><Tag label="py-2" color="yellow" /></div></button></div></div>; }
function DemoHighlightCard() { return <div><div className="mb-2 text-xs text-white/40">Highlight Card · <Tag label="p-3" color="blue" /> <Tag label="gap-2" color="orange" /></div><div className="rounded-2xl border border-white/10 bg-white/5 p-3"><div className="mb-2 text-[10px] text-white/60">Highlight</div><div className="grid gap-2"><div className="rounded-xl border border-white/10 bg-black/20 p-2"><div className="text-[10px] text-white/60">You said</div><div className="text-xs text-white">Hoy no quiero salir.</div><div className="mt-1 flex gap-1"><Tag label="p-2" color="blue" /><Tag label="rounded-xl" color="purple" /></div></div><div className="rounded-xl border border-white/10 bg-black/20 p-2"><div className="text-[10px] text-white/60">More natural</div><div className="text-xs text-white">Hoy no me apetece salir.</div></div><div className="flex flex-wrap gap-2"><span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-white/80">Stealable: no me apetece…</span><div className="flex items-center gap-1 text-[10px] text-white/30"><Tag label="px-2.5" color="blue" /><Tag label="py-1" color="yellow" /><Tag label="rounded-full" color="purple" /></div></div></div></div></div>; }
function DemoChoiceCard() { return <div><div className="mb-2 text-xs text-white/40">Choice Card · <Tag label="p-3" color="blue" /> <Tag label="gap-2" color="orange" /></div><div className="rounded-2xl border border-white/10 bg-white/5 p-3"><div className="mb-2 text-[10px] text-white/60">Tomorrow seed</div><div className="mb-2 text-xs text-white">Mañana, si tienes un poquito de energía… ¿qué te gustaría más?</div><div className="flex gap-2"><button className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80">un café tranquilo</button><button className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80">una caminata corta</button></div><div className="mt-1 flex gap-1"><Tag label="flex gap-2" color="orange" /><Tag label="px-3 py-2" color="blue" /><Tag label="flex-1" color="green" /></div></div></div>; }
function DemoPushCard() { return <div><div className="mb-2 text-xs text-white/40">Push Card (Home) · <Tag label="p-6" color="blue" /> <Tag label="rounded-3xl" color="purple" /></div><div className="rounded-3xl border border-white/10 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 p-6"><div className="mb-4"><div className="text-sm text-white">🌙 Wrap up the day</div><div className="text-xs text-white/80">Reflect on today's language journey</div><div className="mt-1 text-[10px] text-white/40">↑ mb-4 between header & description</div></div><div className="mb-4 text-xs text-white/70">Capture highlights and plant seeds for tomorrow.<div className="text-[10px] text-white/40">↑ mb-4 before CTA</div></div><button className="rounded-2xl bg-white px-4 py-2 text-xs text-black">Start Night Wrap</button><div className="mt-2 flex gap-1"><Tag label="px-4 py-2" color="blue" /><Tag label="rounded-2xl" color="purple" /></div></div></div>; }
function DemoInfoCards() { return <div><div className="mb-2 text-xs text-white/40">Info Cards · <Tag label="p-4" color="blue" /> <Tag label="gap-4" color="orange" /> <Tag label="grid-cols-3" color="green" /></div><div className="grid grid-cols-3 gap-4">{["Morning Recall", "Day Flow", "Night Wrap"].map((title) => (<div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="mb-2 text-[10px] text-white/60">{title}</div><div className="text-xs text-white/80">Description text here.</div></div>))}</div></div>; }
function DemoShadowChip() { return <div><div className="mb-2 text-xs text-white/40">Shadow Chip · <Tag label="mt-3" color="yellow" /> <Tag label="p-3" color="blue" /></div><div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3"><div className="text-[10px] text-white/60">Shadow chip</div><div className="mt-1 text-xs text-white">Shadow: "Hoy no me apetece salir."</div><div className="mt-1 flex gap-1"><Tag label="mt-1" color="yellow" /><Tag label="p-3" color="blue" /></div></div></div>; }
function DemoMorningPlanSelector() { return <div><div className="mb-2 text-xs text-white/40">Plan Selector · <Tag label="mb-4" color="yellow" /> <Tag label="gap-2" color="orange" /> <Tag label="flex-wrap" color="green" /></div><div className="mb-4"><div className="mb-3 text-xs text-white/80">What's your focus today?</div><div className="flex flex-wrap gap-2">{["Work", "Running", "Flamenco", "Rest"].map((p) => (<button key={p} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/80">{p}</button>))}</div><div className="mt-2 flex gap-1"><Tag label="px-4 py-2" color="blue" /><Tag label="gap-2" color="orange" /></div></div></div>; }
function DemoBadge() { return <div><div className="mb-2 text-xs text-white/40">Tip Drawer Card · <Tag label="p-3" color="blue" /> <Tag label="space-y-3" color="orange" /></div><div className="space-y-3"><div className="rounded-2xl border border-white/10 bg-white/5 p-3"><div className="text-xs text-white">Suena más nativo</div><div className="mt-1 text-xs text-white/75">En lugar de "No quiero salir hoy.", mucha gente dice: "Hoy no me apetece salir."</div><div className="mt-1 flex gap-1"><Tag label="mt-1" color="yellow" /><Tag label="p-3" color="blue" /></div></div><div className="rounded-2xl border border-white/10 bg-white/5 p-3"><div className="text-xs text-white/75">Want one example from <span className="text-white">your</span> life?</div></div></div></div>; }

function SpacingTokenTable() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 text-xs uppercase tracking-wider text-white/60">Spacing Token Reference</div>
      <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
        <div>
          <div className="mb-2 text-[10px] uppercase tracking-wider text-white/40">Padding</div>
          <SpecRow token="p-2" value="8px" usage="Nested sub-blocks inside cards (You said / More natural)" />
          <SpecRow token="p-3" value="12px" usage="Content cards: Shadow chip, Highlight, Choice, Tip drawer items" />
          <SpecRow token="p-4" value="16px" usage="Main chat container, Info cards (Home), Tip drawer" />
          <SpecRow token="p-6" value="24px" usage="Push Card (Home hero)" />
          <SpecRow token="px-2.5" value="10px" usage="Pill / Stealable chip (horizontal)" />
          <SpecRow token="px-3" value="12px" usage="Input field, Back button, Choice buttons (horizontal)" />
          <SpecRow token="px-4" value="16px" usage="Send button, Plan selector buttons, CTA (horizontal)" />
          <SpecRow token="py-1" value="4px" usage="Pill / Stealable chip (vertical)" />
          <SpecRow token="py-2" value="8px" usage="Input field, all action buttons (vertical)" />
          <SpecRow token="py-3" value="12px" usage="Testing nav buttons" />
          <SpecRow token="py-5" value="20px" usage="Page vertical padding (ritual pages)" />
          <SpecRow token="py-8" value="32px" usage="Page vertical padding (Home)" />
          <SpecRow token="px-4" value="16px" usage="Page horizontal padding (all pages)" />
        </div>
        <div>
          <div className="mb-2 text-[10px] uppercase tracking-wider text-white/40">Gap / Spacing</div>
          <SpecRow token="space-y-2" value="8px" usage="Chat messages list" />
          <SpecRow token="space-y-3" value="12px" usage="Highlight cards list, Tip drawer cards" />
          <SpecRow token="gap-2" value="8px" usage="Composer row, Choice buttons, Plan selector chips" />
          <SpecRow token="gap-3" value="12px" usage="Testing nav grid, Header button row" />
          <SpecRow token="gap-4" value="16px" usage="Info cards grid (Home)" />
          <SpecRow token="gap-2" value="8px" usage="Nested highlight sub-grid (You said / Better)" />
          <div className="mb-2 mt-4 text-[10px] uppercase tracking-wider text-white/40">Margin</div>
          <SpecRow token="mt-1" value="4px" usage="Card body text below label" />
          <SpecRow token="mt-2" value="8px" usage="Choice prompt → buttons, Push Card description → CTA" />
          <SpecRow token="mt-3" value="12px" usage="Composer above chat, Shadow chip above composer, Highlight area" />
          <SpecRow token="mb-3" value="12px" usage="Plan selector label → chips, Tip drawer header → cards" />
          <SpecRow token="mb-4" value="16px" usage="Push Card header → desc, Plan selector block" />
          <SpecRow token="mb-5" value="20px" usage="Page header → main container" />
          <SpecRow token="mb-6" value="24px" usage="Push Card → Testing nav (Home)" />
          <SpecRow token="mt-6" value="24px" usage="Info cards grid below Testing nav (Home)" />
        </div>
      </div>
    </div>
  );
}

function RadiusTable() {
  const items = [
    { cls: "rounded-full", px: "9999px", usage: "Pill / Stealable chip" },
    { cls: "rounded-3xl", px: "24px", usage: "Page-level containers, Push Card" },
    { cls: "rounded-2xl", px: "16px", usage: "Buttons, inputs, content cards, chips" },
    { cls: "rounded-xl", px: "12px", usage: "Nested sub-blocks inside cards" },
    { cls: "rounded-md", px: "6px", usage: "Style guide annotation tags" },
  ];
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 text-xs uppercase tracking-wider text-white/60">Border Radius</div>
      <div className="flex flex-wrap gap-3">
        {items.map((r) => (
          <div key={r.cls} className="flex flex-col items-center gap-2">
            <div className={`h-12 w-12 border border-white/20 bg-white/10 ${r.cls}`} />
            <code className="font-mono text-[10px] text-cyan-300">{r.cls}</code>
            <span className="text-[10px] text-white/40">{r.px}</span>
            <span className="max-w-[80px] text-center text-[10px] text-white/30">{r.usage}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HierarchyDiagram() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 text-xs uppercase tracking-wider text-white/60">Nesting & Spacing Hierarchy</div>
      <div className="space-y-1 font-mono text-[11px] leading-relaxed text-white/70"><div><span className="text-white/30">L0</span> <span className="text-green-300">page</span> <span className="text-white/30">· px-4 py-5(ritual) / py-8(home)</span></div><div><span className="text-white/30">│</span></div><div><span className="text-white/30">L1</span> <span className="text-purple-300">header</span> <span className="text-white/30">· mb-5 · flex justify-between</span></div><div><span className="text-white/30">│</span></div><div><span className="text-white/30">L1</span> <span className="text-purple-300">main-card</span> <span className="text-white/30">· rounded-3xl p-4</span></div><div><span className="text-white/30">│ │</span></div><div><span className="text-white/30">│ L2</span> <span className="text-cyan-300">messages</span> <span className="text-white/30">· space-y-2</span></div></div>
    </div>
  );
}

export function StyleGuide({ onClose }: { onClose?: () => void }) {
  const [activeTab, setActiveTab] = useState<"components" | "tokens" | "hierarchy">("components");

  return (
    <div className="min-h-screen bg-[#07080B] text-white">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="text-2xl text-white">Style Guide</div>
            <div className="mt-1 text-sm text-white/60">Ritualized Language Loop · Padding & Gap Specs</div>
          </div>
          {onClose && (
            <button onClick={onClose} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 transition hover:bg-white/10">
              ← Back to App
            </button>
          )}
        </div>

        <div className="mb-6 flex gap-2">
          {(["components", "tokens", "hierarchy"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={
                "rounded-2xl border px-4 py-2 text-sm capitalize transition " +
                (activeTab === tab ? "border-white bg-white text-black" : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10")
              }
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "components" && (
          <div className="space-y-12">
            <SectionTitle>Page Layout</SectionTitle><DemoPageLayout />
            <SectionTitle>Chat Bubbles</SectionTitle><DemoChatBubbles />
            <SectionTitle>Composer</SectionTitle><div className="pt-6"><DemoComposer /></div>
            <SectionTitle>Push Card (Home)</SectionTitle><DemoPushCard />
            <SectionTitle>Morning · Plan Selector</SectionTitle><DemoMorningPlanSelector />
            <SectionTitle>Day Flow · Shadow Chip</SectionTitle><DemoShadowChip />
            <SectionTitle>Night Wrap · Highlight Card</SectionTitle><DemoHighlightCard />
            <SectionTitle>Night Wrap · Choice Card</SectionTitle><DemoChoiceCard />
            <SectionTitle>Tip Drawer Cards</SectionTitle><DemoBadge />
            <SectionTitle>Home · Info Cards</SectionTitle><DemoInfoCards />
            <SectionTitle>Border Radius</SectionTitle><RadiusTable />
          </div>
        )}

        {activeTab === "tokens" && <div className="space-y-6"><SpacingTokenTable /></div>}
        {activeTab === "hierarchy" && (
          <div className="space-y-6">
            <HierarchyDiagram />
            <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs">
              <div className="mb-3 text-[10px] uppercase tracking-wider text-white/60">Depth → Padding Rule</div>
              <div className="flex items-center gap-3"><span className="h-2 w-2 shrink-0 rounded-full bg-green-400" /><span className="text-white/70"><code className="text-green-300">L0 page</code> → <code className="text-cyan-300">px-4 py-5/py-8</code></span></div>
              <div className="flex items-center gap-3"><span className="h-2 w-2 shrink-0 rounded-full bg-purple-400" /><span className="text-white/70"><code className="text-purple-300">L1 main-card</code> → <code className="text-cyan-300">p-4</code></span></div>
              <div className="flex items-center gap-3"><span className="h-2 w-2 shrink-0 rounded-full bg-cyan-400" /><span className="text-white/70"><code className="text-cyan-300">L2 content sections</code> → <code className="text-cyan-300">p-3</code></span></div>
              <div className="flex items-center gap-3"><span className="h-2 w-2 shrink-0 rounded-full bg-yellow-400" /><span className="text-white/70"><code className="text-yellow-300">L3 interactive items</code> → <code className="text-cyan-300">px-3 py-2</code></span></div>
              <div className="flex items-center gap-3"><span className="h-2 w-2 shrink-0 rounded-full bg-orange-400" /><span className="text-white/70"><code className="text-orange-300">L4 nested sub-blocks</code> → <code className="text-cyan-300">p-2</code></span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
