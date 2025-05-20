import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

// Define the expected structure of a row in your CSV
// Updated based on the new houses_Madrid.csv columns
interface HouseData {
  web_id: number;
  url: string | null;
  title: string | null;
  type: string | null; 
  price: number | null; 
  deposit: number | null;
  private_owner: boolean;
  professional_name: string | null;
  floor_built: number | null; 
  floor_area: number | null;  
  floor: string | number | null; 
  year_built: number | null;
  orientation: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  second_hand: boolean;
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
  garden_area: boolean;
  location: string | null; 
  district: string | null; 
  subdistrict: string | null; 
  postalcode: string | number | null;
  last_update: string | null;

  [key: string]: any; 
}

// --- Cache for parsed data ---
let allListings: HouseData[] = [];
let isDataLoaded = false;
let dataLoadError: string | null = null;

function loadAndParseData() {
  if (isDataLoaded) return; // Only load once

  const csvFilePath = path.resolve('.', 'houses_Madrid.csv');
  try {
    console.log(`[API Init] Reading CSV from: ${csvFilePath}`);
    const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });
    console.log(`[API Init] Parsing CSV data...`);
    const parseResult = Papa.parse<HouseData>(fileContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });

    if (parseResult.errors.length > 0) {
      console.error("[API Init] CSV Parsing Errors:", parseResult.errors.slice(0, 5));
      throw new Error('Failed to parse CSV data');
    }

    allListings = parseResult.data;
    isDataLoaded = true;
    dataLoadError = null;
    console.log(`[API Init] Successfully loaded and parsed ${allListings.length} listings.`);

  } catch (error: any) {
    console.error("[API Init] Error loading or processing CSV file:", error);
    if (error.code === 'ENOENT') {
       dataLoadError = 'CSV file not found at expected path.';
    } else {
       dataLoadError = `Internal Server Error during data load: ${error.message}`;
    }
    isDataLoaded = false; // Ensure we know loading failed
  }
}

// --- Load data when the module is first loaded ---
loadAndParseData();

export async function GET(request: NextRequest) {
  // Check if data failed to load initially
  if (!isDataLoaded && dataLoadError) {
      const status = dataLoadError.includes('not found') ? 404 : 500;
      return NextResponse.json({ error: dataLoadError }, { status });
  }
  if (!isDataLoaded || !allListings) {
      // Should ideally not happen if loadAndParseData ran, but safeguard
      return NextResponse.json({ error: 'Data not available' }, { status: 500 });
  }

  const { searchParams } = request.nextUrl;
  const listingId = searchParams.get('id');

  // --- Handle Request for a Single Listing ---
  if (listingId) {
    const id = parseInt(listingId, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid listing ID format' }, { status: 400 });
    }
    console.log(`[API Single] Searching for listing ID: ${id}`);
    const listing = allListings.find(item => item.web_id === id);

    if (listing) {
      console.log(`[API Single] Found listing: ${listing.title}`);
      return NextResponse.json(listing); // Return the single listing object
    } else {
      console.log(`[API Single] Listing ID ${id} not found.`);
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }
  }

  // --- If no ID, proceed with Filtering and Pagination Logic ---
  console.log("[API List] No ID provided, proceeding with filtering/pagination.");
  let data = [...allListings]; // Start with a copy

  // Location Filter
  const locationQuery = searchParams.get('location')?.toLowerCase();
  if (locationQuery) {
    console.log(`[API Filter] Location: "${locationQuery}"`);
    data = data.filter(item =>
      (item.location?.toLowerCase().includes(locationQuery)) ||
      (item.district?.toLowerCase().includes(locationQuery)) ||
      (item.subdistrict?.toLowerCase().includes(locationQuery))
    );
  }

  // Price Range Filter
  const priceRange = searchParams.get('priceRange');
  if (priceRange && priceRange !== 'any') {
    const [minPriceStr, maxPriceStr] = priceRange.split('-');
    const minPrice = parseInt(minPriceStr, 10);
    const maxPrice = (maxPriceStr === '' || maxPriceStr === undefined) ? Infinity : parseInt(maxPriceStr, 10);
    console.log(`[API Filter] Price Range: min=${minPrice}, max=${maxPrice === Infinity ? 'inf' : maxPrice}`);
    if (!isNaN(minPrice)) {
      data = data.filter(item => {
        if (item.price === null || item.price === undefined) return false;
        if (maxPrice === Infinity) return item.price >= minPrice;
        else if (!isNaN(maxPrice)) return item.price >= minPrice && item.price <= maxPrice;
        return false;
      });
    }
  }

  // Bedrooms Filter
  const bedrooms = searchParams.get('bedrooms');
  if (bedrooms && bedrooms !== 'any') {
     console.log(`[API Filter] Bedrooms: "${bedrooms}"`);
    if (bedrooms === 'studio') {
      data = data.filter(item => item.bedrooms !== null && item.bedrooms <= 1); // Adjust logic if needed
    } else if (bedrooms.endsWith('+')) {
      const minRooms = parseInt(bedrooms.replace('+', ''), 10);
      if (!isNaN(minRooms)) data = data.filter(item => item.bedrooms !== null && item.bedrooms >= minRooms);
    } else {
      const exactRooms = parseInt(bedrooms, 10);
      if (!isNaN(exactRooms)) data = data.filter(item => item.bedrooms === exactRooms);
    }
  }

  // Bathrooms Filter
  const bathrooms = searchParams.get('bathrooms');
  if (bathrooms && bathrooms !== 'any') {
    console.log(`[API Filter] Bathrooms: "${bathrooms}"`);
    if (bathrooms.endsWith('+')) {
      const minBaths = parseFloat(bathrooms.replace('+', ''));
      if (!isNaN(minBaths)) data = data.filter(item => item.bathrooms !== null && item.bathrooms >= minBaths);
    } else {
      const exactBaths = parseFloat(bathrooms);
      if (!isNaN(exactBaths)) data = data.filter(item => item.bathrooms === exactBaths);
    }
  }

  // Common Requirements Filters
  const commonFilters: { param: string; field: keyof HouseData }[] = [
    { param: 'garage', field: 'garage_included' },
    { param: 'kitchenAmenities', field: 'equipped_kitchen' },
    { param: 'balcony', field: 'balcony' },
    { param: 'lift', field: 'lift' },
    { param: 'furnished', field: 'furnished' },
    { param: 'ac', field: 'air_conditioning' },
    { param: 'terrace', field: 'terrace' },
    { param: 'pool', field: 'swimming_pool' },
    // { param: 'storeroom', field: 'storeroom' },
    // { param: 'fittedWardrobes', field: 'fitted_wardrobes' },
  ];

  commonFilters.forEach(({ param, field }) => {
    const filterValue = searchParams.get(param);
    if (filterValue === 'true') {
       console.log(`[API Filter] ${param} (${String(field)}) = true`);
       data = data.filter(item => {
        const val = item[field];
        // Check for boolean true, number 1, or string "true" (case-insensitive)
        return val === true || val === 1 || (typeof val === 'string' && val.toLowerCase() === 'true');
      });
    }
  });

  console.log(`[API Result] Found ${data.length} matching listings.`);

  // --- Pagination Logic ---
  const total = data.length; // Total matching listings *before* pagination
  console.log(`[API Result] Found ${total} total matching listings.`);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '21', 10); // Default limit (e.g., 3 rows of 7)
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const paginatedData = data.slice(startIndex, endIndex);
  console.log(`[API Result] Returning page ${page} (limit ${limit}): ${paginatedData.length} listings.`);

  // Return paginated data and total count
  return NextResponse.json({ listings: paginatedData, total: total });
} 