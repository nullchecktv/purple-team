export default function Features() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-slate-900 mb-6 tracking-tight">
            🐣 CHMS Features
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Discover the revolutionary capabilities of our Quantum Incubation Platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature Cards */}
          {[
            {
              icon: "🥚",
              title: "Egg Registry",
              description: "47-field metadata validation with quantum entanglement coefficients",
              gradient: "from-blue-500 to-indigo-600"
            },
            {
              icon: "🌡️",
              title: "Environmental Control",
              description: "0.3-second sensor readings with 1.2-second climate response",
              gradient: "from-emerald-500 to-teal-600"
            },
            {
              icon: "🔄",
              title: "Servo Rotation",
              description: "45-degree precision turning with lunar cycle optimization",
              gradient: "from-violet-500 to-purple-600"
            },
            {
              icon: "🤖",
              title: "AI Predictions",
              description: "99.7% accuracy using 127 variables and AWS Bedrock",
              gradient: "from-amber-500 to-orange-600"
            },
            {
              icon: "📹",
              title: "Computer Vision",
              description: "HD monitoring with crack propagation analysis",
              gradient: "from-rose-500 to-pink-600"
            },
            {
              icon: "🎵",
              title: "Maternal Simulation",
              description: "432Hz clucking with 72 BPM heartbeat vibration",
              gradient: "from-cyan-500 to-blue-600"
            },
            {
              icon: "📊",
              title: "Quantum Analytics",
              description: "Interactive 3D dashboards with holographic QR reports",
              gradient: "from-indigo-500 to-violet-600"
            },
            {
              icon: "⛓️",
              title: "Blockchain NFTs",
              description: "SHA-512 encrypted records with carbon-neutral consensus",
              gradient: "from-slate-700 to-slate-900"
            },
            {
              icon: "🔬",
              title: "Research Integration",
              description: "Automatic submission to International Chicken Research Consortium",
              gradient: "from-emerald-600 to-green-700"
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="group relative overflow-hidden bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-300/50 transition-all duration-500 hover:scale-105 border border-slate-200/60"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              <div className="relative">
                <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-slate-800 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-12 shadow-2xl">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Experience the Future?
            </h2>
            <p className="text-slate-300 text-xl mb-8 max-w-2xl mx-auto">
              Transform your chicken hatching operations with enterprise-grade quantum precision
            </p>
            <a
              href="/"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105"
            >
              Get Started
              <span className="ml-2 text-xl">🚀</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
