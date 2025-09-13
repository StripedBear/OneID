interface UserProfileProps {
  params: {
    username: string;
  };
}

export default function UserProfile({ params }: UserProfileProps) {
  const { username } = params;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">@{username}</h1>
            <p className="text-gray-600 mb-8">User Profile</p>
            
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Contact Information</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>📧 Email: contact@{username}.com</p>
                  <p>📱 Phone: +1 (555) 123-4567</p>
                  <p>🌐 Website: https://{username}.com</p>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Social Media</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>🐦 Twitter: @{username}</p>
                  <p>💼 LinkedIn: linkedin.com/in/{username}</p>
                  <p>📸 Instagram: @{username}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
                Save Contact
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}