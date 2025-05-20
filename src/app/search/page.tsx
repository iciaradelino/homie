'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  MessageSquare,
  SparklesIcon,
  BedIcon,
  BathIcon,
  SquareIcon,
  Square
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Chatbot from '@/components/Chatbot'
import { useUser } from '@/context/UserContext'
import UserAvatar from '@/components/UserAvatar'
import ProfileModal from '@/components/ProfileModal'
import { useToast } from '@/hooks/use-toast'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import Image from 'next/image'

// Define the SearchFilters type here, mirroring the one in Chatbot.tsx
// (or export it from Chatbot.tsx and import it here)
interface SearchFilters {
    location?: string;
    priceRange?: string;
    bedrooms?: string;
    bathrooms?: string;
    garage?: string;
    kitchenAmenities?: string;
    balcony?: string;
    lift?: string;
    furnished?: string;
    ac?: string;
    terrace?: string;
    pool?: string;
    [key: string]: any;
}

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
  const { isAuthenticated, user } = useUser();
  const { toast } = useToast();
  
  // --- State Declarations --- 
  const [listings, setListings] = useState<HouseData[]>([]); 
  const [loading, setLoading] = useState(true); 
  const [loadingMore, setLoadingMore] = useState(false); // For load more button
  const [error, setError] = useState<string | null>(null); 
  const [page, setPage] = useState(1); // Current page *to be loaded next*
  const [totalListings, setTotalListings] = useState(0); // Total available
  const [isChatbotOpen, setIsChatbotOpen] = useState(false); // State for chatbot visibility
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // State to hold explanations for top matches { web_id: explanation }
  const [topMatchExplanations, setTopMatchExplanations] = useState<Record<number, string>>({});
  const [loadingExplanations, setLoadingExplanations] = useState(false);

  // Ref to store the IDs of the listings for which explanations were last fetched
  const lastExplainedListingIds = useRef<number[]>([]);

  // --- Centralized Filter State ---
  // Holds the currently active filters, whether from URL, inputs, or chatbot
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({});

  // --- Input State (controlled components for filter inputs) ---
  // These might temporarily differ from activeFilters until "Update Search" is clicked
  const [inputLocation, setInputLocation] = useState('');
  const [inputPriceRange, setInputPriceRange] = useState('any');
  const [inputBedrooms, setInputBedrooms] = useState('any');
  const [inputBathrooms, setInputBathrooms] = useState('any');
  // Add state for other boolean filters if needed for UI controls

  // --- Modal Handlers ---
  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  const handleSignUpClick = () => {
    setIsProfileModalOpen(true);
  };

  // --- Effect 1: When search params change (URL), update activeFilters ---
  useEffect(() => {
    // This updates our activeFilters based on the URL params
    const params = Object.fromEntries(searchParams.entries());
    console.log("URL params changed, updating activeFilters:", params);
    setActiveFilters(params);
    
    // Reset page when search changes
    setPage(1);
    setListings([]);

    // Also update controlled inputs to match URL params
    setInputLocation(params.location || '');
    setInputPriceRange(params.priceRange || 'any');
    setInputBedrooms(params.bedrooms || 'any');
    setInputBathrooms(params.bathrooms || 'any');
  }, [searchParams]);

  // --- Effect 2: When activeFilters change, fetch listings --- (Modified)
  useEffect(() => {
    // Don't need this first time, will be triggered by URL params change
    if (Object.keys(activeFilters).length > 0) {
      setPage(1); // Reset page number when filters change
      fetchListings(); // Fetch listings with the new filters
    }
  }, [activeFilters]); // Re-fetch when activeFilters change

  // --- Effect 3: When activeFilters change, update URL --- (Unchanged)
  useEffect(() => {
    // Skip on initial render
    if (Object.keys(activeFilters).length > 0) {
      console.log("activeFilters changed, updating URL params:", activeFilters);
      const params = new URLSearchParams();
      
      // Add each filter to URL params
      Object.entries(activeFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '' && value !== 'any') {
          params.set(key, value.toString());
        }
      });
      
      // Update URL without reloading page
      router.push(`/search?${params.toString()}`, { scroll: false });
    }
  }, [activeFilters, router]);

  // Function to fetch explanations for top matches (Modified)
  const fetchExplanations = async (topMatches: HouseData[], currentFilters: SearchFilters) => {
    // Skip if we already have explanations for these exact listings
    const topMatchIds = topMatches.map(match => match.web_id).sort();
    const currentExplainedIds = Object.keys(topMatchExplanations).map(Number).sort();
    
    if (JSON.stringify(topMatchIds) === JSON.stringify(currentExplainedIds) && currentExplainedIds.length > 0) {
      console.log("[fetchExplanations] Skipping, explanations already fetched for these listings.");
      return; 
    }
    
    setLoadingExplanations(true);
    setTopMatchExplanations({}); // Clear old explanations
    console.log(`[fetchExplanations] Fetching AI explanations for top ${topMatches.length} listings...`);

    const explanationPromises = topMatches.map(async (apartment) => {
      try {
        const response = await fetch('/api/explain-match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            apartmentData: apartment, // Send full apartment data as needed by the endpoint
            activeFilters: currentFilters
          }),
        });

        if (!response.ok) {
          console.error(`[API Explain] Failed for ID ${apartment.web_id}: ${response.statusText}`);
          return { id: apartment.web_id, explanation: "Explanation unavailable." }; // Error placeholder
        }

        const data = await response.json();
        return { id: apartment.web_id, explanation: data.explanation || "Could not generate explanation." };
      } catch (error) {
        console.error(`[API Explain] Error fetching explanation for ID ${apartment.web_id}:`, error);
        return { id: apartment.web_id, explanation: "Error fetching explanation." }; // Catch fetch errors
      }
    });

    try {
        const explanations = await Promise.all(explanationPromises);
        const newExplanations: Record<number, string> = {};
        explanations.forEach(item => {
            if (item) { // Ensure item is not null/undefined if Promise.allSettled were used
                newExplanations[item.id] = item.explanation;
            }
        });
        setTopMatchExplanations(newExplanations);
        console.log("[fetchExplanations] AI Explanations fetched:", newExplanations);
    } catch (error) {
        console.error("[fetchExplanations] Error processing explanations:", error);
    } finally {
      setLoadingExplanations(false);
    }
  };

  // Fetch listings function (Modified)
  const fetchListings = async (isLoadMore = false) => {
    const currentPage = isLoadMore ? page : 1; // Use current page for load more, 1 otherwise

    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setError(null);
      // Reset listings only when it's a new search (not load more)
      setListings([]); 
    }

    const usePersonalized = isAuthenticated && user?.lifestyle && Object.keys(user.lifestyle).length > 0;
    const endpoint = usePersonalized ? '/api/recommendations' : '/api/listings';
    
    try {
      let response;
      if (usePersonalized) {
        console.log("[fetchListings] Fetching personalized recommendations...");
        // Prepare request body for recommendations API
        const filterObj: Record<string, string> = {};
        Object.entries(activeFilters).forEach(([key, value]) => {
          if (value && value !== 'any') {
            filterObj[key] = value.toString();
          }
        });
        
        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userProfile: user,
            filters: filterObj,
            // Note: Pagination might need different handling for recommendations API
            // For now, let's assume it returns enough results or handle pagination server-side
            limit: 100 // Fetch more initially for recommendations
          }),
        });

      } else {
        console.log("[fetchListings] Fetching standard listings...");
        // Prepare request params for standard listings API
        const params = new URLSearchParams();
        params.set('page', currentPage.toString());
        params.set('limit', LISTINGS_PER_PAGE.toString());
        Object.entries(activeFilters).forEach(([key, value]) => {
          if (value && value !== 'any') {
            params.set(key, value.toString());
          }
        });
        response = await fetch(`${endpoint}?${params.toString()}`);
      }
      
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText} at ${endpoint}`);
      }
      
      const data = await response.json();
      
      // Process results (Handle both API structures)
      const results = data.recommendations || data.listings || []; // Check both keys
      const total = data.total || results.length;

      if (Array.isArray(results)) {
        if (isLoadMore && !usePersonalized) { // Only append for standard listing pagination
          setListings(prev => [...prev, ...results]);
        } else {
          // Replace listings for new search or personalized results
          setListings(results); 
           // Fetch explanations for top 3 (if available and filters applied)
          if (results.length >= 3 && Object.keys(activeFilters).length > 0) {
            fetchExplanations(results.slice(0, 3), activeFilters);
          }
        }
        
        setTotalListings(total);
        
        // Update page number for next load more (only for standard listings)
        if (!usePersonalized) {
          setPage(prev => prev + 1);
        }
      } else {
        throw new Error('Unexpected API response format');
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Function to handle updating the search from *this* page's filter inputs
  const handleUpdateSearchFromInputs = () => {
    const newFilters: SearchFilters = {
        // Collect filters from input state
        location: inputLocation || undefined, // Store undefined if empty string
        priceRange: inputPriceRange !== 'any' ? inputPriceRange : undefined,
        bedrooms: inputBedrooms !== 'any' ? inputBedrooms : undefined,
        bathrooms: inputBathrooms !== 'any' ? inputBathrooms : undefined,
        // Collect other boolean filters if added
    };
     // Remove undefined keys
    Object.keys(newFilters).forEach(key => newFilters[key] === undefined && delete newFilters[key]);

    console.log("Updating activeFilters from inputs:", newFilters);
    // This state update will trigger Effect 3
    setActiveFilters(newFilters);
  };

  // --- Chatbot Update Handler ---
  const handleChatbotSearchUpdate = (chatbotFilters: SearchFilters) => {
     console.log("Received filters from chatbot:", chatbotFilters);
     // Merge chatbot filters with existing activeFilters
     const mergedFilters = { ...activeFilters, ...chatbotFilters };

     // Remove undefined/empty/any values potentially sent by chatbot API or existing filters
     Object.keys(mergedFilters).forEach(key => {
         if (mergedFilters[key] === undefined || mergedFilters[key] === '' || mergedFilters[key] === 'any') {
            delete mergedFilters[key];
         }
     });

     console.log("Updating activeFilters by merging chatbot filters:", mergedFilters);
     // This state update will trigger Effect 3
     setActiveFilters(mergedFilters);
     // Optionally close the chatbot after update
     // closeChatbot();
  };

  // --- Load More Handler --- (Modified to only work for standard search)
  const handleLoadMore = () => {
    const canLoadMore = !isAuthenticated || !user?.lifestyle; // Only load more if not personalized
    if (canLoadMore) {
       fetchListings(true); 
    }
  };

  // --- Chatbot Visibility Handlers ---
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
              {isAuthenticated ? (
                <UserAvatar />
              ) : (
                <>
                  <Link href="#" className="text-sm font-medium hover:text-homie" onClick={(e) => {
                    e.preventDefault();
                    setIsProfileModalOpen(true);
                  }}>
                    Sign In
                  </Link>
                  <Button 
                    className="bg-homie text-white hover:bg-homie-dark" 
                    onClick={handleSignUpClick}
                  >
                    Sign Up
                  </Button>
                </>
              )}
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
                  value={inputLocation}
                  onChange={(e) => setInputLocation(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Select value={inputPriceRange} onValueChange={setInputPriceRange} disabled={loading}>
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
              <Select value={inputBedrooms} onValueChange={setInputBedrooms} disabled={loading}>
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
              <Select value={inputBathrooms} onValueChange={setInputBathrooms} disabled={loading}>
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
              <Button className="bg-homie hover:bg-homie-dark" onClick={handleUpdateSearchFromInputs} disabled={loading}>
                {loading && !loadingMore ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Update Search'}
              </Button>
            </div>
          </div>
        </div>

        {/* Results */}
        <main className="container mx-auto py-8">
          {/* Top Matches Section - Use listings state directly */}
          {!loading && listings.length >= 3 && (
            <section className="mb-12 p-6 bg-gradient-to-br from-homie/5 to-homie/10 rounded-lg border border-homie/20 shadow-sm">
              <h2 className="text-xl font-semibold text-homie-dark mb-6">
                {isAuthenticated && user?.lifestyle ? 'Top Personalized Matches' : 'Top Matches For You'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {listings.slice(0, 3).map((apartment: HouseData) => (
                  <div key={`${apartment.web_id}-top`} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full transition-shadow duration-200 hover:shadow-lg">
                    <div className="relative h-48 bg-gray-200 flex items-center justify-center text-gray-400 flex-shrink-0">
                      {/* Placeholder - Consider smaller image or different layout for top matches */}
                      Image Placeholder
                      <button className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white">
                        <Heart className="h-5 w-5 text-homie" />
                      </button>
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                      {/* Match score tag for personalized results (Check if matchScore exists) */}
                      {apartment.matchScore !== undefined && apartment.matchScore > 0 && (
                        <div className="flex items-center mb-2">
                          <span 
                            className={`text-xs font-medium px-2 py-1 rounded-full ${
                              apartment.matchScore >= 80 ? 'bg-green-100 text-green-800' : 
                              apartment.matchScore >= 60 ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <SparklesIcon className="h-3 w-3 inline mr-1" />
                            {apartment.matchScore >= 80 ? 'Perfect Match' :
                             apartment.matchScore >= 60 ? 'Good Match' :
                             'Potential Match'}
                            {` (${Math.round(apartment.matchScore)}%)`}
                          </span>
                        </div>
                      )}
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
                            <span>{apartment.bathrooms} bath${apartment.bathrooms !== 1 ? 's' : ''}</span>
                          </div>
                        )}
                        {apartment.floor_built !== null && (
                          <div className="flex items-center gap-1">
                            <Home className="h-4 w-4 text-gray-500" />
                            <span>{apartment.floor_built} m²</span>
                          </div>
                        )}
                      </div>
                      {/* Explanation Section (Use topMatchExplanations state) */}
                      {Object.keys(activeFilters).length > 0 && (
                        <div className="mt-2 mb-3 bg-homie/5 border border-homie/10 rounded-lg p-3">
                          {loadingExplanations ? (
                              <div className="flex items-center justify-center h-[56px] text-gray-500 italic">
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin"/>
                                  <span>Finding perfect match...</span>
                              </div>
                          ) : topMatchExplanations[apartment.web_id] ? (
                              <div>
                                  <div className="flex items-center gap-1.5 mb-1.5">
                                      <div className="bg-homie/20 rounded-full p-1">
                                          <Heart className="h-3.5 w-3.5 text-homie" />
                                      </div>
                                      <p className="text-sm font-medium text-homie">Why this is a great match</p>
                                  </div>
                                  <p className="text-sm text-gray-700 leading-tight">
                                      {topMatchExplanations[apartment.web_id]}
                                  </p>
                              </div>
                          ) : (
                              <div className="flex items-center justify-center h-[56px] text-gray-500 italic">
                                  {/* Display placeholder only if not loading and no explanation exists */}
                                  {!loadingExplanations && <span>Explanation unavailable.</span>}
                              </div>
                          )}
                        </div>
                      )}
                      <div className="mt-auto">
                        <Link href={`/listing/${apartment.web_id}`} passHref legacyBehavior>
                          <Button asChild className="w-full">
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

          {/* Results Title */}          
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              {loading && !loadingMore ? 'Searching apartments...' : 
               error ? 'Error loading results' : 
               `${totalListings} apartment${totalListings !== 1 ? 's' : ''} found`
              }
              {isAuthenticated && user?.lifestyle && !loading && totalListings > 0 && 
                <span className="text-base font-normal text-homie ml-2">(Personalized for you)</span>
              }
            </h1>
            {!loading && !error && totalListings > 0 && 
              <p className="text-gray-600">Showing {listings.length} of {totalListings} in Madrid matching your criteria</p>
            }
            {!loading && !error && totalListings === 0 &&
              <p className="text-gray-600">No apartments found matching your criteria. Try adjusting your filters.</p>
            }
          </div>

          {/* Main Grid */}
          {error ? (
            <div className="text-center py-10">
              <p className="text-red-500 mb-2">{error}</p>
              <Button 
                variant="outline" 
                onClick={() => fetchListings()} 
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading && !loadingMore ? (
                  // Loading placeholders
                  [...Array(6)].map((_, i) => (
                    <div key={i} className="bg-gray-100 rounded-lg shadow-sm h-96 animate-pulse flex flex-col">
                      <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                      <div className="p-4 space-y-4 flex-grow">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="flex gap-2">
                          <div className="h-3 bg-gray-200 rounded w-12"></div>
                          <div className="h-3 bg-gray-200 rounded w-12"></div>
                          <div className="h-3 bg-gray-200 rounded w-12"></div>
                        </div>
                        <div className="mt-auto pt-4">
                          <div className="h-10 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  // Actual apartment cards (skip first 3 if shown in top matches)
                  listings.slice(listings.length >= 3 ? 3 : 0).map((apartment: HouseData) => (
                    <div key={apartment.web_id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full transition-shadow duration-200 hover:shadow-lg">
                      <div className="relative h-48 bg-gray-200 flex items-center justify-center text-gray-400 flex-shrink-0">
                        Image Placeholder
                        <button className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white">
                          <Heart className="h-5 w-5 text-homie" />
                        </button>
                      </div>
                      <div className="p-4 flex flex-col flex-grow">
                         {/* Match score tag */}
                         {apartment.matchScore !== undefined && apartment.matchScore > 0 && (
                          <div className="flex items-center mb-2">
                            <span 
                              className={`text-xs font-medium px-2 py-1 rounded-full ${
                                apartment.matchScore >= 80 ? 'bg-green-100 text-green-800' : 
                                apartment.matchScore >= 60 ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-gray-100 text-gray-800'
                              }`}
                            >
                              <SparklesIcon className="h-3 w-3 inline mr-1" />
                              {apartment.matchScore >= 80 ? 'Perfect Match' :
                              apartment.matchScore >= 60 ? 'Good Match' :
                              'Potential Match'}
                              {` (${Math.round(apartment.matchScore)}%)`}
                            </span>
                          </div>
                        )}
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
                              <span>{apartment.bathrooms} bath${apartment.bathrooms !== 1 ? 's' : ''}</span>
                            </div>
                          )}
                          {apartment.floor_built !== null && (
                            <div className="flex items-center gap-1">
                              <Home className="h-4 w-4 text-gray-500" />
                              <span>{apartment.floor_built} m²</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-auto">
                          <Link href={`/listing/${apartment.web_id}`} passHref legacyBehavior>
                            <Button asChild className="w-full">
                              <a>View Details</a>
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Load More Button (Conditional) */}
              {!loading && !error && listings.length < totalListings && (!isAuthenticated || !user?.lifestyle) && (
                <div className="mt-8 flex justify-center">
                  <Button 
                    variant="outline" 
                    onClick={handleLoadMore} 
                    className="px-8" 
                    disabled={loadingMore}
                  >
                    {loadingMore ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : null}
                    {loadingMore ? 'Loading...' : 'Load More'}
                  </Button>
                </div>
              )}
            </>
          )}
        </main>

        {/* Profile Modal */}
        <ProfileModal 
          isOpen={isProfileModalOpen} 
          onClose={handleCloseProfileModal} 
          source="signup"
        />
      </div>
      
      {/* Chatbot & Toggle Button */}
      <Chatbot 
        isOpen={isChatbotOpen} 
        onClose={closeChatbot} 
        onSearchUpdate={handleChatbotSearchUpdate} 
      />
      
      {/* Chatbot toggle button */}
      <button 
        className="fixed bottom-6 right-6 p-4 bg-homie text-white rounded-full shadow-lg hover:bg-homie-dark z-50"
        onClick={openChatbot}
      >
        <MessageSquare className="h-6 w-6" />
      </button>
    </div>
  );
} 