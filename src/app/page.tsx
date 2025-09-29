'use client'

import Link from 'next/link'
import {
  Sparkles,
  Trophy,
  Gift,
  Camera,
  Users,
  Zap,
  Target,
  Smartphone,
  ArrowRight,
} from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Winksy.ai
              </h1>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-700 hover:text-purple-600 transition-colors">
                Features
              </Link>
              <Link href="#lash-league" className="text-gray-700 hover:text-purple-600 transition-colors">
                Lash League
              </Link>
              <Link href="#how-it-works" className="text-gray-700 hover:text-purple-600 transition-colors">
                How It Works
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Link href="/auth/signin" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                Sign In
              </Link>
              <Link href="/auth/signup" className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow">
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              <span>100% Free • No Credit Card Required</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                AI-Powered Lash
              </span>
              <br />
              <span className="text-gray-900">Extension Revolution</span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Upload any photo for instant celebrity lash matches. Book appointments with top techs. 
              Earn points for free services. Join the Lash League and compete for rewards!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button className="bg-black text-white px-8 py-4 rounded-full text-lg font-semibold flex items-center justify-center space-x-2 shadow-xl hover:shadow-2xl transition-shadow">
                <Smartphone className="w-5 h-5" />
                <span>Download Free App</span>
              </button>
              <button className="bg-white text-gray-900 border-2 border-gray-200 px-8 py-4 rounded-full text-lg font-semibold flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-shadow">
                <Users className="w-5 h-5" />
                <span>I&apos;m a Lash Tech</span>
              </button>
            </div>

            {/* Hero Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <Camera className="w-10 h-10 text-purple-600 mb-4 mx-auto" />
                <h3 className="font-semibold mb-2">AI Lash Analysis</h3>
                <p className="text-sm text-gray-600">Celebrity style matching in seconds</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <Trophy className="w-10 h-10 text-indigo-600 mb-4 mx-auto" />
                <h3 className="font-semibold mb-2">Lash League</h3>
                <p className="text-sm text-gray-600">Compete and win real products</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <Gift className="w-10 h-10 text-pink-600 mb-4 mx-auto" />
                <h3 className="font-semibold mb-2">Points = Products</h3>
                <p className="text-sm text-gray-600">6,000 points = Free $60 fill</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/80 backdrop-blur rounded-2xl p-8 shadow-xl">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">10K+</div>
                <div className="text-gray-600 mt-2">Active Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">500+</div>
                <div className="text-gray-600 mt-2">Lash Techs</div>
              </div>
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">50K+</div>
                <div className="text-gray-600 mt-2">Bookings Made</div>
              </div>
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">$1M+</div>
                <div className="text-gray-600 mt-2">Rewards Given</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full mb-4">
                AI Powered
              </div>
              <h3 className="text-xl font-semibold mb-3">🎭 AI Lash Analysis</h3>
              <p className="text-gray-600">Upload any photo to get celebrity-style lash recommendations with detailed specifications.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="inline-block px-3 py-1 bg-pink-100 text-pink-700 text-sm font-medium rounded-full mb-4">
                Gamification
              </div>
              <h3 className="text-xl font-semibold mb-3">🏆 Lash League</h3>
              <p className="text-gray-600">Earn points for everything, compete in weekly challenges, and unlock rewards.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full mb-4">
                Rewards
              </div>
              <h3 className="text-xl font-semibold mb-3">💰 Points as Currency</h3>
              <p className="text-gray-600">6,000 points = Free $60 fill. Earn rewards on every booking.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-semibold mb-3">📅 Smart Booking</h3>
              <p className="text-gray-600">AI-matched appointments with real-time availability and instant booking.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-semibold mb-3">🛍️ Supply Store</h3>
              <p className="text-gray-600">Dropshipped supplies with discounted pricing for professionals.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-semibold mb-3">📱 PWA Experience</h3>
              <p className="text-gray-600">Works offline, installable, and feels like a native app.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Lash League Section */}
      <section id="lash-league" className="py-16 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-6">The Lash League 🏆</h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            Level up from Newbie to Goddess. Compete in weekly challenges. Win real products!
          </p>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
            <div className="grid grid-cols-3 md:grid-cols-7 gap-4">
              {[
                { level: "Newbie", color: "bg-gray-400" },
                { level: "Enthusiast", color: "bg-green-400" },
                { level: "Addict", color: "bg-blue-400" },
                { level: "Expert", color: "bg-purple-400" },
                { level: "Influencer", color: "bg-pink-400" },
                { level: "Legend", color: "bg-orange-400" },
                { level: "Goddess", color: "bg-gradient-to-r from-yellow-400 to-pink-400" }
              ].map((tier, index) => (
                <div key={index} className="text-center">
                  <div className={`${tier.color} rounded-full w-12 h-12 md:w-16 md:h-16 mx-auto mb-2 flex items-center justify-center text-white font-bold`}>
                    {index + 1}
                  </div>
                  <h4 className="font-semibold text-xs md:text-sm">{tier.level}</h4>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <Target className="w-10 h-10 text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Daily Challenges</h3>
              <p className="text-gray-600">Complete themed challenges for bonus points</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <Trophy className="w-10 h-10 text-pink-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Weekly Competitions</h3>
              <p className="text-gray-600">Battle for the top spot and win prizes</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <Gift className="w-10 h-10 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Achievement Badges</h3>
              <p className="text-gray-600">Collect exclusive badges and rewards</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Download & Sign Up",
                description: "Free app, instant 1,000 point welcome bonus",
                icon: Smartphone
              },
              {
                step: "2",
                title: "Upload or Book",
                description: "Try AI lash analysis or book with a tech",
                icon: Camera
              },
              {
                step: "3",
                title: "Earn & Redeem",
                description: "Complete challenges, earn points, get free services",
                icon: Gift
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {item.step}
                  </div>
                  <item.icon className="w-12 h-12 text-purple-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-12 text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of lash lovers and professionals in the Lash League
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-purple-600 px-8 py-3 rounded-full text-lg font-semibold hover:shadow-xl transition-shadow">
                Download Free App
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-white hover:text-purple-600 transition-all">
                Join as Lash Tech
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-xl font-bold">Winksy.ai</h4>
              </div>
              <p className="text-gray-400">
                Revolutionizing lash extensions with AI, gamification, and rewards.
              </p>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">For Users</h5>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Find Lash Techs</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Earn Rewards</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">AI Style Match</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Lash League</Link></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">For Techs</h5>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Free Marketing</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Supply Store</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Client Management</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Growth Tools</Link></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Company</h5>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Winksy.ai. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}