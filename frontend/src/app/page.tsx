import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
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
  );
}
