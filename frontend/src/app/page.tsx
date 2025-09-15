import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen text-white bg-slate-900 relative overflow-hidden">
      {/* Animated grid with pulsing connections */}
      <div className="absolute inset-0">
        <div className="grid-overlay">
          <div className="grid-lines"></div>
          <div className="grid-nodes">
            <div className="node node-1"></div>
            <div className="node node-2"></div>
            <div className="node node-3"></div>
            <div className="node node-4"></div>
            <div className="node node-5"></div>
            <div className="node node-6"></div>
            <div className="node node-7"></div>
            <div className="node node-8"></div>
            <div className="node node-9"></div>
            <div className="node node-10"></div>
            <div className="node node-11"></div>
            <div className="node node-12"></div>
          </div>
          <div className="grid-connections">
            <div className="connection connection-1"></div>
            <div className="connection connection-2"></div>
            <div className="connection connection-3"></div>
            <div className="connection connection-4"></div>
            <div className="connection connection-5"></div>
            <div className="connection connection-6"></div>
            <div className="connection connection-7"></div>
            <div className="connection connection-8"></div>
          </div>
        </div>
      </div>
      
      <div className="relative z-10">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6">
            OneID - Living Address Book
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Current communication channels by permanent link
          </p>
          
          <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              Public Profiles
            </h2>
            <p className="text-slate-300 mb-4">
              Discover people and their channels: <code className="bg-slate-700 px-2 py-1 rounded">/username</code>
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/alice" className="text-blue-400 hover:text-blue-300 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition-colors">
                /alice
              </Link>
              <Link href="/bob" className="text-blue-400 hover:text-blue-300 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition-colors">
                /bob
              </Link>
              <Link href="/charlie" className="text-blue-400 hover:text-blue-300 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition-colors">
                /charlie
              </Link>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/register" 
              className="bg-white text-slate-900 hover:bg-slate-100 font-medium py-3 px-6 rounded-xl transition-colors"
            >
              Get Started
            </Link>
            <Link 
              href="/login" 
              className="border border-slate-600 text-slate-300 hover:bg-slate-800 font-medium py-3 px-6 rounded-xl transition-colors"
            >
              I have an account
            </Link>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
