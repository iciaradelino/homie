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
  MessageSquare
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Chatbot from '@/components/Chatbot'

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
  
  // --- State Declarations --- 
  const [listings, setListings] = useState<HouseData[]>([]); 
  const [loading, setLoading] = useState(true); 
  const [loadingMore, setLoadingMore] = useState(false); // For load more button
  const [error, setError] = useState<string | null>(null); 
  const [page, setPage] = useState(1); // Current page *to be loaded next*
  const [totalListings, setTotalListings] = useState(0); // Total available
  const [isChatbotOpen, setIsChatbotOpen] = useState(false); // State for chatbot visibility

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

  // --- Effects ---

  // Effect 1: Initialize filters from URL on initial load ONLY
  useEffect(() => {
    const initialFilters: SearchFilters = {};
    // Directly use searchParams which is stable
    const locationParam = searchParams.get('location');
    const priceRangeParam = searchParams.get('priceRange');
    const bedroomsParam = searchParams.get('bedrooms');
    const bathroomsParam = searchParams.get('bathrooms');

    if (locationParam) initialFilters.location = locationParam;
    if (priceRangeParam) initialFilters.priceRange = priceRangeParam;
    if (bedroomsParam) initialFilters.bedrooms = bedroomsParam;
    if (bathroomsParam) initialFilters.bathrooms = bathroomsParam;

    // Add other filters from searchParams if they exist (example)
    // if (searchParams.has('garage')) initialFilters.garage = 'true';

    setActiveFilters(initialFilters);
    console.log("Initialized activeFilters from URL:", initialFilters);
    // Only depends on searchParams, which is stable from useSearchParams
  }, [searchParams]);

  // Effect 2: Sync input fields when activeFilters change (e.g., due to chatbot or back/forward navigation)
  useEffect(() => {
    setInputLocation(activeFilters.location || '');
    setInputPriceRange(activeFilters.priceRange || 'any');
    setInputBedrooms(activeFilters.bedrooms || 'any');
    setInputBathrooms(activeFilters.bathrooms || 'any');
     // Sync other input states if added
  }, [activeFilters]);

  // Define fetchListings using useCallback
  // Now depends on activeFilters state directly
  const fetchListings = useCallback(async (isLoadMore = false) => {
    const currentPageToFetch = isLoadMore ? page : 1; // Use state for load more, 1 for new search

    if (!isLoadMore) {
      setLoading(true);
      setListings([]); // Clear existing listings only for a *new* search
      // Don't reset page here, Effect 3 handles it when filters change
    } else {
      setLoadingMore(true);
    }
    setError(null);

    const queryParams = new URLSearchParams();
    // Build query from activeFilters state
    Object.entries(activeFilters).forEach(([key, value]) => {
        // Ensure value is a string and not empty/undefined before setting
        if (typeof value === 'string' && value !== '' && value !== 'any') {
             queryParams.set(key, value);
        } else if (typeof value === 'boolean' && value === true) {
             queryParams.set(key, 'true'); // Handle boolean filters if added
        }
    });

    queryParams.set('page', currentPageToFetch.toString());
    queryParams.set('limit', LISTINGS_PER_PAGE.toString());

    const queryString = queryParams.toString();
    console.log("Fetching listings:", isLoadMore ? "Load More" : "New Search", `page=${currentPageToFetch}`, queryString);

    try {
      const response = await fetch(`/api/listings?${queryString}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP error! status: ${response.status}, details: ${JSON.stringify(errorData)}`);
      }
      const data: { listings: HouseData[], total: number } = await response.json();

      setTotalListings(data.total);

      if (isLoadMore) {
        setListings(prev => [...prev, ...data.listings]);
      } else {
        setListings(data.listings);
      }

      // Increment page number *after* successful fetch for the *next* potential load more
      setPage(currentPageToFetch + 1);

    } catch (e: any) {
      console.error("Failed to fetch listings:", e);
      setError(`Failed to load listings: ${e.message}`);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  // Depend on activeFilters and the page *to be loaded next*
  }, [activeFilters, page]);

  // Function to fetch explanations for top matches
  const fetchExplanations = async (topMatches: HouseData[], currentFilters: SearchFilters) => {
      const topMatchIds = topMatches.map(m => m.web_id).sort();

      // --- Prevent unnecessary refetching --- 
      // Check if we are already loading or if the IDs haven't changed since the last fetch
      if (loadingExplanations || (lastExplainedListingIds.current.length === topMatchIds.length && lastExplainedListingIds.current.every((id, i) => id === topMatchIds[i]))) {
          console.log("[Explain Fetch] Skipping fetch: Already loading or IDs haven't changed.");
          return;
      }
      // --- End Prevent unnecessary refetching ---

      if (!topMatches || topMatches.length === 0) {
          console.log("[Explain Fetch] No top matches to explain.");
          setLoadingExplanations(false);
          setTopMatchExplanations({});
          return;
      }
      // Add check for filters
      if (!currentFilters || Object.keys(currentFilters).length === 0) {
          console.log("[Explain Fetch] No active filters to base explanation on.");
           // Decide if you still want to show loading/clear or just do nothing
          setLoadingExplanations(false);
          setTopMatchExplanations({}); // Clear explanations if filters disappear
          return;
      }

      console.log("[Explain Fetch] Starting explanation generation for top matches:", topMatches.map(m => m.web_id));
      setLoadingExplanations(true);
      setTopMatchExplanations({}); // Clear old explanations

      const explanationPromises = topMatches.map(async (match) => {
          try {
              // Log before making the fetch call
              console.log(`[Explain Fetch] Attempting fetch for ID: ${match.web_id} to /api/explain-match`);
              const response = await fetch('/api/explain-match', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ apartmentData: match, activeFilters: currentFilters }),
              });
              if (!response.ok) {
                  console.error(`[Explain Fetch] Failed for ID ${match.web_id}: ${response.statusText}`);
                  return { id: match.web_id, explanation: "Unable to load explanation." };
              }
              const data = await response.json();
              return { id: match.web_id, explanation: data.explanation || "" };
          } catch (error) {
              console.error(`[Explain Fetch] Error fetching explanation for ID ${match.web_id}:`, error);
              return { id: match.web_id, explanation: "Error loading explanation." };
          }
      });

      const results = await Promise.all(explanationPromises);
      const newExplanations: Record<number, string> = {};
      results.forEach(result => {
          if (result) {
              newExplanations[result.id] = result.explanation;
          }
      });

      console.log("[Explain Fetch] Explanations generated:", newExplanations);
      setTopMatchExplanations(newExplanations);
      setLoadingExplanations(false);
      // Store the IDs for which we just fetched explanations
      lastExplainedListingIds.current = topMatchIds; 
  };

  // Effect 3: Fetch listings when activeFilters change and update URL
   useEffect(() => {
      console.log("activeFilters changed, preparing to fetch and update URL", activeFilters);

      // Reset page to 1 *before* fetching when filters change
      setPage(1);

      // Fetch immediately with the new filters (page will be 1)
      // We define an async function inside useEffect to handle the fetch and subsequent explanation fetch
      const loadListingsAndExplanations = async () => {
          await fetchListings(false); // Wait for listings to fetch
          // Access the latest listings state via the setter's callback or refetching logic
          // For simplicity, we initiate explanation fetch here, but it might run on slightly stale `listings` state
          // A more robust way might involve another useEffect watching `listings` state specifically.
          // Let's try triggering it after fetchListings finishes setting state (though state updates are async)
          // NOTE: This approach has limitations. fetchListings updates state asynchronously.
          // We'll call fetchExplanations, but it will use the *current* activeFilters
          // and might capture the listings *before* fetchListings fully updates the state.

          // A better approach: Trigger explanations in a separate useEffect that depends on `listings`
      };

      loadListingsAndExplanations();

      // Update URL to reflect the new activeFilters
      const currentParams = new URLSearchParams();
      Object.entries(activeFilters).forEach(([key, value]) => {
          if (typeof value === 'string' && value !== '' && value !== 'any') {
               currentParams.set(key, value);
          } else if (typeof value === 'boolean' && value === true) {
               currentParams.set(key, 'true');
          }
      });
       // Use router.replace to update URL without adding to history stack for filter changes
       // Keep existing pathname, update search query
      router.replace(`/search?${currentParams.toString()}`, { scroll: false }); // scroll: false prevents jumping to top

      // fetchListings is stable due to useCallback, activeFilters trigger this effect
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [activeFilters, router]); // Add router dependency

  // Effect 4: Fetch explanations when listings change or filters change
  useEffect(() => {
      console.log("[Effect 4] Running: Check if explanations should be fetched.");
      const hasActiveFilters = Object.keys(activeFilters).length > 0;
      console.log(`[Effect 4] Listings length: ${listings.length}, Has Active Filters:`, hasActiveFilters);

      if (hasActiveFilters) {
          // Filters are active. Should we fetch explanations?
          if (listings.length > 0) {
              // Yes, listings are also loaded.
              const topMatches = listings.slice(0, 3);
              console.log("[Effect 4] Conditions met (filters & listings present). Calling fetchExplanations.");
              fetchExplanations(topMatches, activeFilters);
          } else {
              // Listings are temporarily empty (likely during a refetch due to filter change).
              // Do nothing - wait for listings to reload. Keep existing explanations (if any) and loading state.
              console.log("[Effect 4] Filters present, but listings empty. Waiting for listings to load.");
          }
      } else {
          // No active filters.
          console.log("[Effect 4] No active filters. Clearing explanations.");
          // Clear explanations and ensure loading is off.
          setLoadingExplanations(false);
          setTopMatchExplanations({});
      }

      // Depend on the first listing's ID and the filters.
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listings[0]?.web_id, JSON.stringify(activeFilters)]);

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
     // Merge chatbot filters with existing ones? Or replace?
     // Let's replace for now, assuming chatbot provides a complete new context
     const newFilters = { ...chatbotFilters };

     // Remove undefined/empty/any values potentially sent by chatbot API
     Object.keys(newFilters).forEach(key => {
         if (newFilters[key] === undefined || newFilters[key] === '' || newFilters[key] === 'any') {
            delete newFilters[key];
         }
     });

     console.log("Updating activeFilters from chatbot:", newFilters);
     // This state update will trigger Effect 3
     setActiveFilters(newFilters);
     // Optionally close the chatbot after update
     // closeChatbot();
  };

  // Function to handle clicking the "Load More" button
  const handleLoadMore = () => {
     fetchListings(true); // Call fetchListings with isLoadMore flag, uses current page state
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
          {/* Top Matches Section (Only shows if listings exist and not initial load) */}
          {!loading && listings.length >= 3 && (
            <section className="mb-12 p-6 bg-gradient-to-br from-homie/5 to-homie/10 rounded-lg border border-homie/20 shadow-sm">
              <h2 className="text-xl font-semibold text-homie-dark mb-6">Top Matches For You</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {listings.slice(0, 3).map((apartment: HouseData) => (
                  // Re-using the same card structure from the main grid
                  <div key={`${apartment.web_id}-top`} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full transition-shadow duration-200 hover:shadow-lg">
                    <div className="relative h-48 bg-gray-200 flex items-center justify-center text-gray-400 flex-shrink-0">
                      {/* Placeholder - Consider smaller image or different layout for top matches */}
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

                      {/* Explanation Section - Only render if activeFilters exist */}
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
                                  <span>Explanation unavailable.</span>
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

                    {/* Explanation Section - Only render if activeFilters exist */}
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
                                <span>Explanation unavailable.</span>
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
      <Chatbot
        isOpen={isChatbotOpen}
        onClose={closeChatbot}
        onSearchUpdate={handleChatbotSearchUpdate}
      />

    </div>
  )
} 