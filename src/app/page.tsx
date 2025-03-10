import React from 'react'
import Link from 'next/link'
import { 
  Search, 
  Home, 
  DollarSign, 
  BedDouble, 
  Bath,
  MapPin,
  MessageSquare,
  Calendar,
  Shield,
  Star,
  Clock,
  CheckCircle2,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-homie hover:text-homie-dark">
              <Home className="h-6 w-6" />
              <span className="text-xl font-semibold">Homie</span>
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link href="#" className="text-sm font-medium hover:text-homie">Search</Link>
              <Link href="#" className="text-sm font-medium hover:text-homie">Neighborhoods</Link>
              <Link href="#" className="text-sm font-medium hover:text-homie">Resources</Link>
              <Link href="#" className="text-sm font-medium hover:text-homie">About</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-sm font-medium hover:text-homie">Sign In</Link>
            <Button className="bg-homie text-white hover:bg-homie-dark">Sign Up</Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-20 bg-gradient-to-br from-[#f0f7f7] via-white to-[#e8f3f2]">
          <div className="container flex flex-col items-center text-center">
            <h1 className="text-6xl font-bold mb-4 text-homie">Homie</h1>
            <p className="text-gray-600 text-xl mb-12 max-w-2xl">
              Find your perfect apartment with ease. Search, compare, and connect with landlords all in one place.
            </p>
            <div className="w-full max-w-3xl bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-8">
              <div className="flex items-center gap-2 mb-6">
                <Search className="h-5 w-5 text-homie" />
                <h2 className="text-xl font-semibold">Find Your New Home</h2>
              </div>
              <div className="space-y-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    type="text" 
                    placeholder="Enter city, neighborhood, or address" 
                    className="pl-10 h-12 text-base focus:ring-homie focus:border-homie bg-white"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium mb-2">
                      <DollarSign className="h-4 w-4 text-homie" />
                      Price Range
                    </label>
                    <Select>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Any price" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="500-1000">€500 - €1,000</SelectItem>
                        <SelectItem value="1000-1500">€1,000 - €1,500</SelectItem>
                        <SelectItem value="1500-2000">€1,500 - €2,000</SelectItem>
                        <SelectItem value="2000+">€2,000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium mb-2">
                      <BedDouble className="h-4 w-4 text-homie" />
                      Bedrooms
                    </label>
                    <Select>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="studio">Studio</SelectItem>
                        <SelectItem value="1">1 Bedroom</SelectItem>
                        <SelectItem value="2">2 Bedrooms</SelectItem>
                        <SelectItem value="3">3+ Bedrooms</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium mb-2">
                      <Bath className="h-4 w-4 text-homie" />
                      Bathrooms
                    </label>
                    <Select>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Bathroom</SelectItem>
                        <SelectItem value="1.5">1.5 Bathrooms</SelectItem>
                        <SelectItem value="2">2+ Bathrooms</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button className="w-full h-12 text-base bg-homie hover:bg-homie-dark">
                  Search Apartments
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-[#f7faf9]">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need to Find Your Home</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Discover why Homie is the smartest way to find your next apartment in Madrid
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-homie/10 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-homie" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Smart Location Search</h3>
                <p className="text-gray-600">Find apartments in the best neighborhoods, with detailed area insights and amenities.</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-homie/10 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-homie" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Direct Communication</h3>
                <p className="text-gray-600">Connect directly with landlords and schedule viewings without intermediaries.</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-homie/10 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-homie" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Easy Scheduling</h3>
                <p className="text-gray-600">Book viewings instantly with our integrated calendar system.</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-homie/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-homie" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Verified Listings</h3>
                <p className="text-gray-600">All listings are verified to ensure you're seeing real, available properties.</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-homie/10 rounded-lg flex items-center justify-center mb-4">
                  <Star className="h-6 w-6 text-homie" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Save Favorites</h3>
                <p className="text-gray-600">Keep track of your favorite properties and compare them easily.</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-homie/10 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-homie" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Real-time Updates</h3>
                <p className="text-gray-600">Get instant notifications when new properties match your criteria.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-[#fdfcfb]">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How Homie Works</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Finding your perfect home is easy with our simple process
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-12 relative">
              <div className="text-center relative">
                <div className="w-16 h-16 bg-homie text-white rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Search & Filter</h3>
                <p className="text-gray-600">Enter your preferences and browse through our verified listings</p>
                <ArrowRight className="hidden md:block h-8 w-8 text-homie absolute top-4 -right-6" />
              </div>
              <div className="text-center relative">
                <div className="w-16 h-16 bg-homie text-white rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Schedule Viewings</h3>
                <p className="text-gray-600">Book appointments directly with landlords at your convenience</p>
                <ArrowRight className="hidden md:block h-8 w-8 text-homie absolute top-4 -right-6" />
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-homie text-white rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Move In</h3>
                <p className="text-gray-600">Complete the paperwork and move into your new home</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-[#f5f8f8]">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Join thousands of happy renters who found their home with Homie
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <Star className="h-5 w-5 fill-current text-yellow-400" />
                  <Star className="h-5 w-5 fill-current text-yellow-400" />
                  <Star className="h-5 w-5 fill-current text-yellow-400" />
                  <Star className="h-5 w-5 fill-current text-yellow-400" />
                  <Star className="h-5 w-5 fill-current text-yellow-400" />
                </div>
                <p className="text-gray-600 mb-6">"Found my dream apartment in Malasaña within a week! The process was incredibly smooth and the landlord verification gave me peace of mind."</p>
                <div>
                  <p className="font-semibold">Laura García</p>
                  <p className="text-sm text-gray-500">Graduate Student</p>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <Star className="h-5 w-5 fill-current text-yellow-400" />
                  <Star className="h-5 w-5 fill-current text-yellow-400" />
                  <Star className="h-5 w-5 fill-current text-yellow-400" />
                  <Star className="h-5 w-5 fill-current text-yellow-400" />
                  <Star className="h-5 w-5 fill-current text-yellow-400" />
                </div>
                <p className="text-gray-600 mb-6">"The direct messaging feature saved me so much time. I could ask questions and schedule viewings instantly. Best rental platform in Madrid!"</p>
                <div>
                  <p className="font-semibold">Miguel Rodríguez</p>
                  <p className="text-sm text-gray-500">Young Professional</p>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <Star className="h-5 w-5 fill-current text-yellow-400" />
                  <Star className="h-5 w-5 fill-current text-yellow-400" />
                  <Star className="h-5 w-5 fill-current text-yellow-400" />
                  <Star className="h-5 w-5 fill-current text-yellow-400" />
                  <Star className="h-5 w-5 fill-current text-yellow-400" />
                </div>
                <p className="text-gray-600 mb-6">"As an international student, I was worried about finding a place. Homie made it easy with their verified listings and English support."</p>
                <div>
                  <p className="font-semibold">Sophie Anderson</p>
                  <p className="text-sm text-gray-500">International Student</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-white py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4 text-homie hover:text-homie-dark">
                <Home className="h-5 w-5" />
                <span className="font-semibold">Homie</span>
              </Link>
              <p className="text-sm text-gray-500">Making home hunting easier in Madrid</p>
            </div>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <h3 className="font-medium mb-4">Company</h3>
                <div className="flex flex-col gap-2">
                  <Link href="#" className="text-sm text-gray-500 hover:text-homie">About</Link>
                  <Link href="#" className="text-sm text-gray-500 hover:text-homie">Careers</Link>
                  <Link href="#" className="text-sm text-gray-500 hover:text-homie">Contact</Link>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-4">Legal</h3>
                <div className="flex flex-col gap-2">
                  <Link href="#" className="text-sm text-gray-500 hover:text-homie">Terms</Link>
                  <Link href="#" className="text-sm text-gray-500 hover:text-homie">Privacy</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 