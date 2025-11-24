export default function Header() {
  return (
    <header className="bg-gradient-to-r from-purple-600 via-purple-700 to-purple-600 text-white shadow-xl border-b-4 border-purple-800">
      <div className="py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-3xl">💜</div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Purple Team</h1>
              <span className="text-purple-200 text-xs font-medium">R2R Hackathon 2025</span>
            </div>
          </div>
          <nav className="flex items-center gap-8 ml-auto">
            <a
              href="/"
              className="hover:text-purple-200 transition-all duration-200 font-medium hover:scale-110 transform"
            >
              Home
            </a>
            <a
              href="/features"
              className="hover:text-purple-200 transition-all duration-200 font-medium hover:scale-110 transform"
            >
              Features
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
