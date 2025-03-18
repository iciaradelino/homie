import React from 'react'
import Link from 'next/link'
import { 
  Search, 
  DollarSign, 
  BedDouble, 
  Bath,
  FileText,
  MapPin,
  Home as HomeIcon,
  Heart,
  Share2,
  Home,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Example apartment data
const EXAMPLE_APARTMENTS = [
  {
    id: 1,
    title: "Modern Studio in Malasaña",
    description: "Bright and newly renovated studio in the heart of Malasaña. Perfect for young professionals.",
    price: 1200,
    bedrooms: "Studio",
    bathrooms: 1,
    location: "Malasaña, Madrid",
    imageUrl: "https://placehold.co/600x400/e9ecef/495057?text=Apartment+Image",
    features: ["Fully furnished", "Air conditioning", "High-speed internet", "Elevator"],
    sqm: 45
  },
  {
    id: 2,
    title: "Spacious 2-Bedroom in Salamanca",
    description: "Elegant apartment in the prestigious Salamanca district. Recently renovated with high-end finishes.",
    price: 1800,
    bedrooms: "2",
    bathrooms: 2,
    location: "Salamanca, Madrid",
    imageUrl: "https://placehold.co/600x400/e9ecef/495057?text=Apartment+Image",
    features: ["Doorman", "Parking", "Balcony", "Built-in wardrobes"],
    sqm: 85
  },
  {
    id: 3,
    title: "Cozy 1-Bedroom in La Latina",
    description: "Charming apartment in the historic La Latina neighborhood. Close to Plaza Mayor and great tapas bars.",
    price: 1100,
    bedrooms: "1",
    bathrooms: 1,
    location: "La Latina, Madrid",
    imageUrl: "https://placehold.co/600x400/e9ecef/495057?text=Apartment+Image",
    features: ["Pet-friendly", "Recently renovated", "Original features", "Great location"],
    sqm: 55
  },
  {
    id: 4,
    title: "Luxury 3-Bedroom in Retiro",
    description: "Stunning apartment overlooking Retiro Park. Perfect for families or professionals.",
    price: 2500,
    bedrooms: "3",
    bathrooms: 2,
    location: "Retiro, Madrid",
    imageUrl: "https://placehold.co/600x400/e9ecef/495057?text=Apartment+Image",
    features: ["Park views", "Concierge", "Modern kitchen", "Storage room"],
    sqm: 120
  }
]

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-homie hover:text-homie-dark">
              <Home className="h-6 w-6" />
              <span className="text-xl font-semibold">Homie</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-sm font-medium hover:text-homie">Sign In</Link>
            <Button className="bg-homie text-white hover:bg-homie-dark">Sign Up</Button>
          </div>
        </div>
      </header>

      {/* Search Filters */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="container mx-auto py-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                type="text" 
                placeholder="Enter location" 
                className="pl-10 bg-white"
              />
            </div>
            <Select>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="500-1000">€500 - €1,000</SelectItem>
                <SelectItem value="1000-1500">€1,000 - €1,500</SelectItem>
                <SelectItem value="1500-2000">€1,500 - €2,000</SelectItem>
                <SelectItem value="2000+">€2,000+</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Bedrooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="studio">Studio</SelectItem>
                <SelectItem value="1">1 Bedroom</SelectItem>
                <SelectItem value="2">2 Bedrooms</SelectItem>
                <SelectItem value="3">3+ Bedrooms</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Bathrooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Bathroom</SelectItem>
                <SelectItem value="1.5">1.5 Bathrooms</SelectItem>
                <SelectItem value="2">2+ Bathrooms</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-homie hover:bg-homie-dark">
              Update Search
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      <main className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            {EXAMPLE_APARTMENTS.length} apartments found
          </h1>
          <p className="text-gray-600">in Madrid matching your criteria</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {EXAMPLE_APARTMENTS.map((apartment) => (
            <div key={apartment.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-48">
                <img 
                  src={apartment.imageUrl} 
                  alt={apartment.title}
                  className="w-full h-full object-cover"
                />
                <button className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white">
                  <Heart className="h-5 w-5 text-homie" />
                </button>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{apartment.title}</h3>
                  <span className="text-lg font-semibold text-homie">€{apartment.price}/mo</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
                  <MapPin className="h-4 w-4" />
                  <span>{apartment.location}</span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{apartment.description}</p>
                <div className="flex gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <BedDouble className="h-4 w-4" />
                    <span>{apartment.bedrooms}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bath className="h-4 w-4" />
                    <span>{apartment.bathrooms}</span>
                  </div>
                  <div>
                    <span>{apartment.sqm} m²</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {apartment.features.map((feature, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1">Contact Landlord</Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
} 