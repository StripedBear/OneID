import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            HumanDNS - Living Address Book
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Current communication channels by permanent link
          </p>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Public Profiles
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Discover people and their channels: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">/username</code>
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/alice" className="text-blue-500 hover:underline bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded">
                /alice
              </Link>
              <Link href="/bob" className="text-blue-500 hover:underline bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded">
                /bob
              </Link>
              <Link href="/charlie" className="text-blue-500 hover:underline bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded">
                /charlie
              </Link>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/register" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Get Started
            </Link>
            <Link 
              href="/login" 
              className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium py-3 px-6 rounded-lg transition-colors"
            >
              I have an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
