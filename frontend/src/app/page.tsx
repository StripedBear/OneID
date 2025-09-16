import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen text-white bg-slate-900 relative overflow-hidden">
      {/* Gradient background with flowing colors */}
      <div className="absolute inset-0">
        <div className="gradient-background"></div>
      </div>
      
      <div className="relative z-10 flex items-center justify-center min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-6">
              OneID - Living Contact Book
            </h1>
            <p className="text-xl text-slate-300">
              Current communication channels by permanent link
            </p>
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
              className="bg-slate-800 border border-slate-600 text-slate-300 hover:bg-slate-700 font-medium py-3 px-6 rounded-xl transition-colors"
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
