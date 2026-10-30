
import {
  ArrowRight,
  Search,
  Network,
  Sparkles,
  Code2,
  GitBranch,
  ShieldCheck,
  Zap,
  FileCode2,
  Upload,
  Command,
  ChevronRight,
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Intelligent Code Search",
    description:
      "Find functions, classes and logic across an entire repository using natural-language questions.",
    color: "text-violet-400",
  },
  {
    icon: Network,
    title: "Understand Connections",
    description:
      "Explore how files, modules and functions connect through an interactive code map.",
    color: "text-cyan-400",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Explanations",
    description:
      "Get repository-aware explanations grounded in real code and verifiable references.",
    color: "text-fuchsia-400",
  },
];

function Navbar() {
  return (
    <nav className="flex items-center justify-between border-b border-white/10 px-6 py-5 md:px-12">
      <a href="#" className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500 text-white">
          <Network size={21} />
        </div>
        <span className="text-xl font-bold tracking-tight text-white">
          Code<span className="text-violet-400">Atlas</span>
        </span>
      </a>

      <div className="hidden items-center gap-9 text-sm text-slate-400 md:flex">
        <a href="#features" className="transition hover:text-white">Features</a>
        <a href="#how-it-works" className="transition hover:text-white">How it works</a>
        <a href="#about" className="transition hover:text-white">About</a>
      </div>

      <a
        href="/dashboard"
        className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-violet-100"
      >
        Get Started <ArrowRight className="ml-1 inline" size={15} />
      </a>
    </nav>
  );
}

function HeroPreview() {
  return (
    <div className="relative mx-auto mt-16 max-w-5xl">
      <div className="absolute -inset-5 rounded-3xl bg-violet-600/15 blur-3xl" />

      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0e1423] shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
            <span className="ml-3 text-xs text-slate-400">CodeAtlas Explorer</span>
          </div>
          <span className="text-xs text-slate-500">Preview interface</span>
        </div>

        <div className="grid min-h-[300px] grid-cols-1 md:grid-cols-[190px_1fr_220px]">
          <div className="hidden border-r border-white/10 p-5 md:block">
            <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-slate-500">
              Repository
            </p>
            <div className="mb-4 flex items-center gap-2 text-sm text-white">
              <GitBranch size={15} className="text-violet-400" />
              sample-project
            </div>
            {["src", "components", "services", "utils", "App.jsx", "main.jsx"].map((item) => (
              <div key={item} className="flex items-center gap-2 py-2 text-xs text-slate-400">
                <FileCode2 size={13} className="text-cyan-400" />
                {item}
              </div>
            ))}
          </div>

          <div className="p-5 md:p-7">
            <div className="mb-5 flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
              <Search size={16} className="text-violet-400" />
              <span className="text-sm text-slate-400">
                Where is user authentication handled?
              </span>
              <Command size={14} className="ml-auto text-slate-600" />
            </div>

            <div className="mb-4 flex items-center gap-2 text-xs text-slate-500">
              <Sparkles size={14} className="text-violet-400" />
              Suggested code matches
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-violet-400/30 bg-violet-500/[0.07] p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">authenticateUser()</span>
                  <span className="text-xs text-violet-300">Match 1</span>
                </div>
                <p className="text-xs text-slate-400">src/auth/login.js · Lines 18–36</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <span className="text-sm font-semibold text-white">validateCredentials()</span>
                <p className="mt-2 text-xs text-slate-400">src/auth/validation.js · Lines 8–21</p>
              </div>
            </div>
          </div>

          <div className="hidden border-l border-white/10 p-5 md:block">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
              <Sparkles size={15} className="text-violet-400" />
              AI Insights
            </div>
            <p className="text-xs leading-6 text-slate-400">
              Authentication appears to be handled by the login module. The validation function checks the credentials before the user is authenticated.
            </p>
            <div className="mt-5 rounded-lg border border-cyan-400/20 bg-cyan-400/5 p-3">
              <p className="text-xs font-medium text-cyan-300">Source evidence</p>
              <p className="mt-2 text-xs text-slate-400">login.js · Lines 18–36</p>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-slate-600">
        Illustrative preview — repository results will become dynamic when the backend is connected.
      </p>
    </div>
  );
}

export default function Landing() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#090d18] text-white">
      <Navbar />

      <section className="relative px-6 pb-20 pt-24 text-center md:px-12 md:pt-32">
        <div className="pointer-events-none absolute left-1/2 top-20 h-80 w-80 -translate-x-1/2 rounded-full bg-violet-600/15 blur-[120px]" />

        <div className="relative mx-auto max-w-4xl">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/[0.07] px-4 py-2 text-xs font-medium text-violet-300">
            <Sparkles size={14} />
            A smarter way to explore code
          </div>

          <h1 className="text-5xl font-bold leading-[1.12] tracking-tight sm:text-6xl md:text-7xl">
            Your codebase has a story.
            <span className="mt-2 block bg-gradient-to-r from-violet-400 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
              Discover it with AI.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-slate-400 md:text-lg">
            Explore unfamiliar repositories, find the code that matters,
            and understand how everything connects — without getting lost
            in thousands of lines.
          </p>

          <div id="get-started" className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="/dashboard"
              className="group rounded-xl bg-violet-500 px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-1 hover:bg-violet-400"
            >
              Explore your repository
              <ArrowRight size={17} className="ml-2 inline transition group-hover:translate-x-1" />
            </a>
            <a
              href="#how-it-works"
              className="rounded-xl border border-white/10 bg-white/[0.03] px-7 py-4 text-sm font-semibold text-slate-200 transition hover:border-white/25 hover:bg-white/[0.07]"
            >
              See how it works
              <ChevronRight size={17} className="ml-2 inline" />
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-slate-500">
            <span className="flex items-center gap-2"><ShieldCheck size={14} /> Evidence-backed answers</span>
            <span className="flex items-center gap-2"><Code2 size={14} /> Multiple languages</span>
            <span className="flex items-center gap-2"><Zap size={14} /> Intelligent search</span>
          </div>
        </div>

        <HeroPreview />
      </section>

      <section id="features" className="border-t border-white/[0.06] px-6 py-24 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-400">Explore smarter</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
              Everything you need to understand a codebase
            </h2>
            <p className="mt-4 leading-7 text-slate-400">
              Go beyond file names. Discover the logic, structure and relationships behind your code.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {features.map(({ icon: Icon, title, description, color }) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.025] p-7 transition duration-300 hover:-translate-y-1 hover:border-violet-400/30 hover:bg-white/[0.045]">
                <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.06] ${color}`}>
                  <Icon size={23} />
                </div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-400">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="px-6 py-20 md:px-12">
        <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-gradient-to-br from-violet-500/10 via-[#111827] to-cyan-500/[0.06] p-8 text-center md:p-14">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
            <Upload size={25} />
          </div>
          <h2 className="mt-6 text-3xl font-bold">Start with your repository</h2>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-400">
            Upload your project and let CodeAtlas map its structure, find relevant code and help you understand how it works.
          </p>
          <a href="#get-started" className="mt-8 inline-flex items-center rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-violet-100">
            Get started <ArrowRight size={16} className="ml-2" />
          </a>
        </div>
      </section>

      <footer id="about" className="border-t border-white/[0.07] px-6 py-8 text-center text-xs text-slate-500">
        <span className="font-semibold text-slate-300">CodeAtlas</span>
        <span className="mx-2">·</span>
        Explore code. Understand connections.
      </footer>
    </main>
  );
}
