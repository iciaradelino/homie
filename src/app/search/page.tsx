'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { 
  Search, 
  DollarSign, 
  BedDouble, 
  Bath,
  FileText,
  MapPin,
  Heart,
  Share2,
  Home,
  Loader2,
  MessageSquare
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Chatbot from '@/components/Chatbot'

// Define the HouseData type based on the NEW API response/CSV structure
interface HouseData {
  web_id: number;
  url: string | null;
  title: string | null;
  type: string | null; 
  price: number | null; 
  // deposit: number | null; // Not displayed
  // private_owner: boolean; // Not displayed
  // professional_name: string | null; // Not displayed
  floor_built: number | null; 
  // floor_area: number | null;  // Using floor_built for sqm
  // floor: string | number | null; // Not displayed directly in card
  // year_built: number | null; // Not displayed
  // orientation: string | null; // Not displayed
  bedrooms: number | null;
  bathrooms: number | null;
  // second_hand: boolean; // Not displayed
  lift: boolean;
  garage_included: boolean;
  furnished: boolean;
  equipped_kitchen: boolean;
  fitted_wardrobes: boolean;
  air_conditioning: boolean;
  terrace: boolean;
  balcony: boolean;
  storeroom: boolean;
  swimming_pool: boolean;
  // garden_area: boolean; // Not displayed
  location: string | null; 
  district: string | null; 
  subdistrict: string | null; 
  // postalcode: string | number | null; // Not displayed
  // last_update: string | null; // Not displayed

  // Keep for potential other data
  [key: string]: any; 
}

const LISTINGS_PER_PAGE = 21; // Define limit constant

// Combine everything into the default export component
export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // --- State Declarations --- 
  const [listings, setListings] = useState<HouseData[]>([]); 
  const [loading, setLoading] = useState(true); 
  const [loadingMore, setLoadingMore] = useState(false); // For load more button
  const [error, setError] = useState<string | null>(null); 
  const [location, setLocation] = useState('');
  const [priceRange, setPriceRange] = useState('any');
  const [bedrooms, setBedrooms] = useState('any');
  const [bathrooms, setBathrooms] = useState('any');
  const [page, setPage] = useState(1); // Current page to load
  const [totalListings, setTotalListings] = useState(0); // Total available
  const [isChatbotOpen, setIsChatbotOpen] = useState(false); // State for chatbot visibility

  // Effect to update filter state from URL
  useEffect(() => {
    setLocation(searchParams.get('location') || '');
    setPriceRange(searchParams.get('priceRange') || 'any');
    setBedrooms(searchParams.get('bedrooms') || 'any');
    setBathrooms(searchParams.get('bathrooms') || 'any');
  }, [searchParams]);

  // Define fetchListings using useCallback to prevent recreation on every render
  const fetchListings = useCallback(async (isLoadMore = false) => {
    if (!isLoadMore) {
      setLoading(true); // Full loading state for new searches
      setListings([]); // Clear existing listings for a new search/filter
      setPage(1); // Reset page for new search
    } else {
      setLoadingMore(true); // Specific loading state for load more
    }
    setError(null);

    const currentParams = new URLSearchParams(searchParams.toString());
    // Use the page state for the API call
    currentParams.set('page', isLoadMore ? page.toString() : '1'); 
    currentParams.set('limit', LISTINGS_PER_PAGE.toString());
    
    const queryString = currentParams.toString();
    console.log("Fetching listings:", isLoadMore ? "Load More" : "New Search", `page=${isLoadMore ? page : 1}`, queryString);

    try {
      const response = await fetch(`/api/listings?${queryString}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP error! status: ${response.status}, details: ${JSON.stringify(errorData)}`);
      }
      // Expect { listings: [], total: number } from API now
      const data: { listings: HouseData[], total: number } = await response.json();
      
      setTotalListings(data.total); // Update total count

      if (isLoadMore) {
        setListings(prev => [...prev, ...data.listings]); // Append results
      } else {
        setListings(data.listings); // Replace results
      }
      
      // Increment page number *after* successful fetch for the *next* load more call
      setPage(prev => prev + 1); 

    } catch (e: any) {
      console.error("Failed to fetch listings:", e);
      setError(`Failed to load listings: ${e.message}`);
      // If error on "load more", don't increment page, allow retry
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchParams, page]); // Add page to dependencies

  // Effect to fetch listings when searchParams change (e.g., initial load, filter update)
  useEffect(() => {
    console.log("Search Params changed, fetching initial page...");
    fetchListings(false); // Fetch the first page whenever params change
    // Intentionally ignoring fetchListings in dependency array here
    // because we only want this effect to run when searchParams change,
    // not when fetchListings itself changes due to page state updates.
  }, [searchParams]);

  // Function to handle updating the search from *this* page's filters
  const handleUpdateSearch = () => {
    // Reset page state FIRST before navigating
    setPage(1); 

    const currentParams = new URLSearchParams(searchParams.toString());
    // Update params based on the local state of filters on this page
    if (location) currentParams.set('location', location); else currentParams.delete('location');
    if (priceRange !== 'any') currentParams.set('priceRange', priceRange); else currentParams.delete('priceRange');
    if (bedrooms !== 'any') currentParams.set('bedrooms', bedrooms); else currentParams.delete('bedrooms');
    if (bathrooms !== 'any') currentParams.set('bathrooms', bathrooms); else currentParams.delete('bathrooms');
    
    // Remove page/limit params from URL update, they are handled by fetchListings
    currentParams.delete('page'); 
    currentParams.delete('limit');

    // Use router.push to navigate with new params.
    // This triggers the useEffect hook listening to searchParams, which then calls fetchListings(false).
    router.push(`/search?${currentParams.toString()}`);
  };

  // Function to handle clicking the "Load More" button
  const handleLoadMore = () => {
     fetchListings(true); // Call fetchListings with isLoadMore flag
  };

  // --- Chatbot Handlers ---
  const openChatbot = () => setIsChatbotOpen(true);
  const closeChatbot = () => setIsChatbotOpen(false);

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-x-hidden">
      {/* Main content container that will be pushed */}
      <div className={`transition-margin duration-300 ease-in-out ${isChatbotOpen ? 'mr-80 md:mr-96' : 'mr-0'}`}>
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
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  // Disable input while loading initial results
                  disabled={loading && !loadingMore} 
                />
              </div>
              <Select value={priceRange} onValueChange={setPriceRange} disabled={loading && !loadingMore}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Price</SelectItem>
                  <SelectItem value="500-1000">€500 - €1,000</SelectItem>
                  <SelectItem value="1000-1500">€1,000 - €1,500</SelectItem>
                  <SelectItem value="1500-2000">€1,500 - €2,000</SelectItem>
                  <SelectItem value="2000-">€2,000+</SelectItem>
                </SelectContent>
              </Select>
              <Select value={bedrooms} onValueChange={setBedrooms} disabled={loading && !loadingMore}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Bedrooms" />
                </SelectTrigger>
                <SelectContent>
                   <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="studio">Studio</SelectItem>
                  <SelectItem value="1">1 Bedroom</SelectItem>
                  <SelectItem value="2">2 Bedrooms</SelectItem>
                  <SelectItem value="3+">3+ Bedrooms</SelectItem>
                </SelectContent>
              </Select>
              <Select value={bathrooms} onValueChange={setBathrooms} disabled={loading && !loadingMore}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Bathrooms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="1">1 Bathroom</SelectItem>
                  <SelectItem value="1.5">1.5 Bathrooms</SelectItem>
                  <SelectItem value="2+">2+ Bathrooms</SelectItem>
                </SelectContent>
              </Select>
              <Button className="bg-homie hover:bg-homie-dark" onClick={handleUpdateSearch} disabled={loading}>
                {loading && !loadingMore ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Update Search'}
              </Button>
            </div>
          </div>
        </div>

        {/* Results */}
        <main className="container mx-auto py-8">
          {/* Top Matches Section (Only shows if listings exist and not initial load) */}
          {!loading && listings.length >= 3 && (
            <section className="mb-8 p-6 bg-homie/5 rounded-lg border border-homie/20">
              <h2 className="text-xl font-semibold text-homie-dark mb-4">Top Matches For You</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {listings.slice(0, 3).map((apartment: HouseData) => (
                  // Re-using the same card structure from the main grid
                  <div key={`${apartment.web_id}-top`} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full">
                    <div className="relative h-40 bg-gray-200 flex items-center justify-center text-gray-400 flex-shrink-0">
                      {/* Placeholder - Consider smaller image or different layout for top matches */}
                      Image Placeholder
                      <button className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full hover:bg-white">
                        <Heart className="h-4 w-4 text-homie" />
                      </button>
                    </div>
                    <div className="p-3 flex flex-col flex-grow">
                      <div className="flex justify-between items-start mb-1.5">
                        <h3 className="text-base font-semibold text-gray-900 truncate flex-1 mr-2" title={apartment.title || 'Untitled'}>{apartment.title || 'Apartment Listing'}</h3>
                        {apartment.price && (
                          <span className="text-base font-semibold text-homie whitespace-nowrap">€{apartment.price}/mo</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-gray-500 text-xs mb-2 truncate">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate" title={`${apartment.subdistrict}, ${apartment.district}`}>
                          {apartment.subdistrict || 'Unknown Sub'}, {apartment.district || 'Unknown District'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600 mb-2">
                        {apartment.bedrooms !== null && (
                          <div className="flex items-center gap-1">
                            <BedDouble className="h-3 w-3 text-gray-500" />
                            <span>{apartment.bedrooms === 0 ? 'Studio' : `${apartment.bedrooms} bed${apartment.bedrooms !== 1 ? 's' : ''}`}</span>
                          </div>
                        )}
                        {apartment.bathrooms !== null && (
                          <div className="flex items-center gap-1">
                            <Bath className="h-3 w-3 text-gray-500" />
                            <span>{apartment.bathrooms} bath${apartment.bathrooms !== 1 ? 's' : ''}</span>
                          </div>
                        )}
                        {apartment.floor_built !== null && (
                          <div className="flex items-center gap-1">
                            <Home className="h-3 w-3 text-gray-500" />
                            <span>{apartment.floor_built} m²</span>
                          </div>
                        )}
                      </div>
                      {/* Optional: Add fewer/different tags for top matches if needed */}
                      {/* <div className="flex flex-wrap gap-1 text-xxs text-gray-500 mb-3"> ... </div> */}
                      <div className="mt-auto pt-2 border-t border-gray-100">
                        <Link href={`/listing/${apartment.web_id}`} passHref legacyBehavior>
                          <Button asChild size="sm" className="w-full text-xs">
                            <a>View Details</a>
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              {loading && !loadingMore ? 'Searching apartments...' : 
               error ? 'Error loading results' : 
               `${totalListings} apartment${totalListings !== 1 ? 's' : ''} found`
              }
            </h1>
            {!loading && !error && totalListings > 0 && 
              <p className="text-gray-600">Showing {listings.length} of {totalListings} in Madrid matching your criteria</p>
            }
            {!loading && !error && totalListings === 0 &&
              <p className="text-gray-600">No apartments found matching your criteria. Try adjusting your filters.</p>
            }
          </div>

          {/* Loading State (Only show for initial load/filter update) */}
          {loading && !loadingMore && (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-homie" />
            </div>
          )}

          {/* Error State */}
          {error && !loading && !loadingMore && ( // Don't show full error block if just load more failed
            <div className="text-center py-10 px-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 font-semibold">Error Loading Results</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
              <Button variant="outline" size="sm" onClick={() => fetchListings(false)} className="mt-4"> 
                 Try Again
              </Button>
            </div>
          )}
          {/* Optional: Smaller error indicator if load more fails */}
          {error && loadingMore && <p className="text-center text-red-600 text-sm py-2">Failed to load more listings.</p>}

          {/* Results Grid */}
          {listings.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((apartment: HouseData) => (
                <div key={apartment.web_id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                  <div className="relative h-48 bg-gray-200 flex items-center justify-center text-gray-400 flex-shrink-0">
                    Image Placeholder
                    <button className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white">
                      <Heart className="h-5 w-5 text-homie" />
                    </button>
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate flex-1 mr-2" title={apartment.title || 'Untitled'}>{apartment.title || 'Apartment Listing'}</h3>
                      {apartment.price && (
                        <span className="text-lg font-semibold text-homie whitespace-nowrap">€{apartment.price}/mo</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 text-sm mb-3 truncate">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate" title={`${apartment.subdistrict}, ${apartment.district}`}>
                        {apartment.subdistrict || 'Unknown Sub'}, {apartment.district || 'Unknown District'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mb-3">
                      {apartment.bedrooms !== null && (
                        <div className="flex items-center gap-1">
                          <BedDouble className="h-4 w-4 text-gray-500" />
                          <span>{apartment.bedrooms === 0 ? 'Studio' : `${apartment.bedrooms} bed${apartment.bedrooms !== 1 ? 's' : ''}`}</span> 
                        </div>
                      )}
                      {apartment.bathrooms !== null && (
                        <div className="flex items-center gap-1">
                          <Bath className="h-4 w-4 text-gray-500" />
                          <span>{apartment.bathrooms} bath{apartment.bathrooms !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                      {apartment.floor_built !== null && (
                        <div className="flex items-center gap-1">
                          <Home className="h-4 w-4 text-gray-500" />
                          <span>{apartment.floor_built} m²</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-4">
                      {apartment.lift && <span className="bg-gray-100 px-2 py-0.5 rounded">Lift</span>}
                      {apartment.garage_included && <span className="bg-gray-100 px-2 py-0.5 rounded">Garage</span>}
                      {apartment.furnished && <span className="bg-gray-100 px-2 py-0.5 rounded">Furnished</span>}
                      {apartment.equipped_kitchen && <span className="bg-gray-100 px-2 py-0.5 rounded">Kitchen Equipped</span>}
                      {apartment.air_conditioning && <span className="bg-gray-100 px-2 py-0.5 rounded">A/C</span>}
                      {apartment.terrace && <span className="bg-gray-100 px-2 py-0.5 rounded">Terrace</span>}
                      {apartment.balcony && <span className="bg-gray-100 px-2 py-0.5 rounded">Balcony</span>}
                      {apartment.swimming_pool && <span className="bg-gray-100 px-2 py-0.5 rounded">Pool</span>}
                    </div>
                    <div className="flex gap-2 mt-auto pt-2 border-t border-gray-100">
                      <Link href={`/listing/${apartment.web_id}`} passHref legacyBehavior>
                        <Button asChild className="flex-1">
                          <a>View Details</a>
                        </Button>
                      </Link>
                      <Button variant="outline" size="icon">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More Button */}
          <div className="mt-8 text-center">
            {!loading && !error && listings.length > 0 && listings.length < totalListings && (
              <Button 
                onClick={handleLoadMore} 
                disabled={loadingMore}
                variant="outline"
              >
                {loadingMore ? (
                   <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...</>
                ) : (
                   'Load More Results'
                )}
              </Button>
            )}
          </div>

        </main>
      </div>

      {/* Floating Chatbot Button */}
      {!isChatbotOpen && (
        <Button 
          onClick={openChatbot}
          className="fixed bottom-6 right-6 bg-homie hover:bg-homie-dark rounded-full w-14 h-14 shadow-lg z-40 flex items-center justify-center"
          size="icon"
        >
          <MessageSquare className="h-6 w-6 text-white" />
        </Button>
      )}

      {/* Chatbot Panel */}
      <Chatbot isOpen={isChatbotOpen} onClose={closeChatbot} />

    </div>
  )
} 