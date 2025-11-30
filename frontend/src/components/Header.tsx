export function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <div className="text-3xl animate-pulse">🎄</div>
            <div className="text-center">
              <h1 className="text-2xl font-semibold tracking-tight bg-gradient-to-r from-green-600 via-red-600 to-green-600 bg-clip-text text-transparent">
                Christmas Tree Wizard
              </h1>
              <span className="text-xs text-gray-500 font-medium">Find Your Perfect Tree in Texas</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
