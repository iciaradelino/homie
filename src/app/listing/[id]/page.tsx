'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  BedDouble,
  Bath,
  Home,
  DollarSign,
  Check,
  X,
  Share2,
  Heart,
  Loader2,
  AlertTriangle,
  Building, // Example icon for 'type'
  CalendarDays, // Example icon for 'year_built'
  Compass // Example icon for 'orientation'
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

// Re-use the HouseData interface (or import if defined centrally)
interface HouseData {
  web_id: number;
  url: string | null;
  title: string | null;
  type: string | null;
  price: number | null;
  deposit: number | null; // Display if available
  private_owner: boolean; // Display if available
  professional_name: string | null; // Display if available
  floor_built: number | null;
  floor_area: number | null; // Display if available
  floor: string | number | null; // Display if available
  year_built: number | null; // Display if available
  orientation: string | null; // Display if available
  bedrooms: number | null;
  bathrooms: number | null;
  second_hand: boolean; // Display if available
  lift: boolean;
  garage_included: boolean;
  furnished: boolean;
  equipped_kitchen: boolean;
  fitted_wardrobes: boolean; // Display if available
  air_conditioning: boolean;
  terrace: boolean;
  balcony: boolean;
  storeroom: boolean; // Display if available
  swimming_pool: boolean;
  garden_area: boolean; // Display if available
  location: string | null;
  district: string | null;
  subdistrict: string | null;
  postalcode: string | number | null; // Display if available
  last_update: string | null; // Display if available
  [key: string]: any;
}

export default function ListingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string; // Get ID from URL

  const [listing, setListing] = useState<HouseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return; // Don't fetch if ID is not available yet

    const fetchListing = async () => {
      setLoading(true);
      setError(null);
      console.log(`Fetching details for listing ID: ${id}`);
      try {
        const response = await fetch(`/api/listings?id=${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Listing not found.');
          }
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`HTTP error! status: ${response.status}, details: ${JSON.stringify(errorData)}`);
        }
        const data: HouseData = await response.json();
        setListing(data);
      } catch (e: any) {
        console.error("Failed to fetch listing details:", e);
        setError(`Failed to load listing: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]); // Re-run effect if ID changes

  const renderFeature = (label: string, value: React.ReactNode, icon?: React.ReactNode) => {
    if (value === null || value === undefined || value === '') return null;
    return (
      <div className="flex items-center gap-2 text-gray-700">
        {icon || <Check className="h-4 w-4 text-green-600" />}
        <span className="font-medium">{label}:</span>
        <span>{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}</span>
      </div>
    );
  };

  const renderBooleanFeature = (label: string, value: boolean | undefined | null, IconTrue: React.ElementType = Check, IconFalse: React.ElementType = X) => {
    if (value === null || value === undefined) return null;
    const Icon = value ? IconTrue : IconFalse;
    const color = value ? 'text-green-600' : 'text-red-600';
    return (
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className={value ? 'text-gray-700' : 'text-gray-500'}>{label}</span>
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header (Consistent with other pages) */}
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

      {/* Main Content Area */}
      <main className="container mx-auto py-8">
        {/* Back Button */}
        <Button variant="outline" size="sm" onClick={() => router.back()} className="mb-6 flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Search
        </Button>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-homie" />
            <p className="ml-4 text-gray-600">Loading listing details...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-10 px-4 bg-red-50 border border-red-200 rounded-md">
             <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-3" />
            <p className="text-red-700 font-semibold text-lg">Error Loading Listing</p>
            <p className="text-red-600 text-sm mt-1 mb-4">{error}</p>
             <Button variant="outline" size="sm" onClick={() => router.back()}>
               Go Back
             </Button>
          </div>
        )}

        {/* Listing Details (Render only if loading is finished, no error, and listing exists) */}
        {!loading && !error && listing && (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
             {/* Image Placeholder/Gallery Area */}
             <div className="h-64 md:h-96 bg-gray-200 flex items-center justify-center text-gray-400">
                 Image Gallery Placeholder (Listing ID: {listing.web_id})
             </div>

            <div className="p-6 md:p-8">
              {/* Top Section: Title, Price, Actions */}
              <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{listing.title || 'Apartment Listing'}</h1>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                     <MapPin className="h-4 w-4 flex-shrink-0" />
                     <span title={`${listing.location}, ${listing.subdistrict}, ${listing.district}, ${listing.postalcode}`}>
                       {listing.subdistrict || 'N/A'}, {listing.district || 'N/A'}{listing.postalcode ? `, ${listing.postalcode}` : ''}
                     </span>
                  </div>
                </div>
                <div className="flex-shrink-0 flex flex-col items-end gap-2">
                   <span className="text-2xl font-bold text-homie">
                     {listing.price ? `€${listing.price}/mo` : 'Price not available'}
                   </span>
                   <div className="flex gap-2">
                     <Button variant="outline" size="icon">
                       <Heart className="h-4 w-4" />
                     </Button>
                      <Button variant="outline" size="icon">
                       <Share2 className="h-4 w-4" />
                     </Button>
                     <Button className="bg-homie hover:bg-homie-dark">Contact Landlord</Button>
                   </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Key Info Section: Beds, Baths, Sqm, etc. */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 text-center">
                 <div className="bg-gray-50 p-3 rounded-md">
                     <BedDouble className="h-6 w-6 text-homie mx-auto mb-1" />
                     <p className="text-sm font-medium text-gray-800">{listing.bedrooms === 0 ? 'Studio' : `${listing.bedrooms ?? 'N/A'} bed${listing.bedrooms !== 1 ? 's' : ''}`}</p>
                 </div>
                 <div className="bg-gray-50 p-3 rounded-md">
                     <Bath className="h-6 w-6 text-homie mx-auto mb-1" />
                     <p className="text-sm font-medium text-gray-800">{listing.bathrooms ?? 'N/A'} bath{listing.bathrooms !== 1 ? 's' : ''}</p>
                 </div>
                 <div className="bg-gray-50 p-3 rounded-md">
                     <Home className="h-6 w-6 text-homie mx-auto mb-1" />
                     <p className="text-sm font-medium text-gray-800">{listing.floor_built ? `${listing.floor_built} m²` : 'N/A'} built</p>
                 </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                     <Building className="h-6 w-6 text-homie mx-auto mb-1" />
                     <p className="text-sm font-medium text-gray-800">{listing.type || 'N/A'}</p>
                 </div>
              </div>

              <Separator className="my-6" />

              {/* Details & Features Section */}
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Details & Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                 {/* Column 1 */}
                 <div>
                    {renderFeature('Floor Level', listing.floor, <Home className="h-4 w-4 text-gray-600"/>)}
                    {renderFeature('Total Area', listing.floor_area ? `${listing.floor_area} m²` : null, <Home className="h-4 w-4 text-gray-600"/>)}
                    {renderFeature('Year Built', listing.year_built, <CalendarDays className="h-4 w-4 text-gray-600"/>)}
                    {renderFeature('Orientation', listing.orientation, <Compass className="h-4 w-4 text-gray-600"/>)}
                    {renderFeature('Deposit', listing.deposit ? `€${listing.deposit}` : null, <DollarSign className="h-4 w-4 text-gray-600"/>)}
                    {renderFeature('Listing Type', listing.private_owner ? 'Private Owner' : (listing.professional_name ? `Agency (${listing.professional_name})` : 'Agency'), <Building className="h-4 w-4 text-gray-600"/>)}
                    {renderFeature('Condition', listing.second_hand ? 'Second Hand' : 'New Build', <Check className="h-4 w-4 text-gray-600"/>)}
                 </div>
                 {/* Column 2 - Boolean Features */}
                 <div className="space-y-2">
                    {renderBooleanFeature('Lift Included', listing.lift)}
                    {renderBooleanFeature('Garage Included', listing.garage_included)}
                    {renderBooleanFeature('Furnished', listing.furnished)}
                    {renderBooleanFeature('Kitchen Equipped', listing.equipped_kitchen)}
                    {renderBooleanFeature('Fitted Wardrobes', listing.fitted_wardrobes)}
                    {renderBooleanFeature('Air Conditioning', listing.air_conditioning)}
                    {renderBooleanFeature('Terrace', listing.terrace)}
                    {renderBooleanFeature('Balcony', listing.balcony)}
                    {renderBooleanFeature('Storeroom', listing.storeroom)}
                    {renderBooleanFeature('Swimming Pool', listing.swimming_pool)}
                    {renderBooleanFeature('Garden Area', listing.garden_area)}
                 </div>
              </div>
              
              {/* Description (If Available) */}
              {/* {listing.description && ( <>
                <Separator className="my-6" />
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Description</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
                </>
              )} */}

              {/* Map Placeholder */}
              <Separator className="my-6" />
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Location</h2>
               <div className="h-64 bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
                  Map Placeholder for {listing.district}
               </div>
               
               {/* Last Update */}
               {listing.last_update && (
                  <p className="text-xs text-gray-400 mt-6 text-right">
                     Last updated: {new Date(listing.last_update).toLocaleDateString()}
                  </p>
               )}

            </div>
          </div>
        )}
      </main>
       {/* Footer (Consider making a shared Layout component later) */}
       <footer className="border-t bg-white py-8 mt-12">
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
                  <h3 className="font-medium mb-4">Resources</h3>
                  <div className="flex flex-col gap-2">
                    <Link href="#" className="text-sm text-gray-500 hover:text-homie">Blog</Link>
                    <Link href="#" className="text-sm text-gray-500 hover:text-homie">Guides</Link>
                    <Link href="#" className="text-sm text-gray-500 hover:text-homie">FAQ</Link>
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
  );
} 