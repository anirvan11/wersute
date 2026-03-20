export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <nav className="flex justify-between items-center px-8 py-6 border-b border-slate-800">
        <span className="text-2xl font-bold text-blue-400">Wersute</span>
        <a href="/login" className="text-slate-400 hover:text-white text-sm transition-colors">
          Sign In
        </a>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center min-h-[85vh] px-4 text-center">
        <div className="inline-block bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm px-4 py-1.5 rounded-full mb-8">
          AI-managed startup execution
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight max-w-4xl">
          Turn your idea into a{' '}
          <span className="text-blue-400">product blueprint</span>
        </h1>
        <p className="text-xl text-slate-400 mb-10 max-w-2xl leading-relaxed">
          Chat with our AI. Get a consultant-grade startup blueprint.
          We match you with the right developer and manage the build.
        </p>
        <a
          href="/chat"
          className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-xl
                     text-lg font-semibold transition-colors shadow-lg shadow-blue-600/20"
        >
          Start Building — It's Free →
        </a>
        <p className="text-slate-600 text-sm mt-6">No credit card required to start.</p>
      </section>
    </main>
  )
}
