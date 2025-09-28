export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Winksy.ai</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-500 hover:text-gray-900">Features</a>
              <a href="#techs" className="text-gray-500 hover:text-gray-900">For Techs</a>
              <a href="#users" className="text-gray-500 hover:text-gray-900">For Users</a>
              <a href="#gamification" className="text-gray-500 hover:text-gray-900">Lash League</a>
            </nav>
            <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800">
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-16">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Free AI Lash Extension App
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect with professional lash technicians, get AI-powered style recommendations,
            earn rewards, and join the ultimate beauty gamification experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-black text-white px-8 py-3 rounded-lg text-lg hover:bg-gray-800">
              Download App
            </button>
            <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg text-lg hover:bg-gray-50">
              I'm a Lash Tech
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div id="features" className="py-16">
          <h3 className="text-3xl font-bold text-center mb-12">Key Features</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h4 className="text-xl font-semibold mb-3">🎭 AI Lash Analysis</h4>
              <p className="text-gray-600">Upload any photo to get celebrity-style lash recommendations with detailed specifications.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h4 className="text-xl font-semibold mb-3">🏆 Lash League</h4>
              <p className="text-gray-600">Earn points for everything, compete in weekly challenges, and unlock rewards.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h4 className="text-xl font-semibold mb-3">💰 Points as Currency</h4>
              <p className="text-gray-600">6,000 points = Free $60 fill. Earn rewards on every booking.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h4 className="text-xl font-semibold mb-3">📅 Smart Booking</h4>
              <p className="text-gray-600">AI-matched appointments with real-time availability and instant booking.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h4 className="text-xl font-semibold mb-3">🛍️ Supply Store</h4>
              <p className="text-gray-600">Dropshipped supplies with discounted pricing for professionals.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h4 className="text-xl font-semibold mb-3">📱 PWA Experience</h4>
              <p className="text-gray-600">Works offline, installable, and feels like a native app.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center py-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl text-white">
          <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of lash lovers and professionals in the Lash League
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-purple-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100">
              Download Free App
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-white hover:text-purple-600">
              Join as Lash Tech
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-xl font-bold mb-4">Winksy.ai</h4>
              <p className="text-gray-400">Revolutionizing lash extensions with AI and gamification.</p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">For Users</h5>
              <ul className="space-y-2 text-gray-400">
                <li>Find Lash Techs</li>
                <li>Earn Rewards</li>
                <li>AI Style Match</li>
                <li>Lash League</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">For Techs</h5>
              <ul className="space-y-2 text-gray-400">
                <li>Free Marketing</li>
                <li>Supply Store</li>
                <li>Client Management</li>
                <li>Growth Tools</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Company</h5>
              <ul className="space-y-2 text-gray-400">
                <li>About</li>
                <li>Careers</li>
                <li>Privacy</li>
                <li>Contact</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Winksy.ai. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
