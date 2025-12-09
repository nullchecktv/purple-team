import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl border-b border-slate-700/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <Link href="/" className="flex items-center space-x-4 group">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
              <span className="text-white text-2xl">🐣</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight group-hover:text-blue-300 transition-colors duration-300">
                CHMS
              </h1>
              <span className="text-slate-400 text-sm font-medium">
                Quantum Incubation Platform
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            <Link
              href="/"
              className="px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:bg-slate-700/50 hover:text-blue-300"
            >
              Home
            </Link>
            <Link
              href="/features"
              className="px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:bg-slate-700/50 hover:text-blue-300"
            >
              Features
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
