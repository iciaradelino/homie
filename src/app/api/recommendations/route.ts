import { NextRequest, NextResponse } from 'next/server';
import { scoreApartmentForUser, ApartmentData } from '@/lib/recommendations';
import { UserProfile } from '@/context/UserContext';
import path from 'path';
import fs from 'fs';
import Papa from 'papaparse';

// Cache for parsed data
let allListings: any[] = [];
let isDataLoaded = false;

function loadAndParseData() {
  if (isDataLoaded) return; // Only load once

  const csvFilePath = path.resolve('.', 'houses_Madrid.csv');
  try {
    console.log(`[Recommendations API] Reading CSV from: ${csvFilePath}`);
    const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });
    const parseResult = Papa.parse(fileContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });

    if (parseResult.errors.length > 0) {
      console.error("[Recommendations API] CSV Parsing Errors:", parseResult.errors.slice(0, 5));
      throw new Error('Failed to parse CSV data');
    }

    allListings = parseResult.data;
    isDataLoaded = true;
    console.log(`[Recommendations API] Successfully loaded and parsed ${allListings.length} listings.`);
  } catch (error: any) {
    console.error("[Recommendations API] Error loading or processing CSV file:", error);
    isDataLoaded = false;
  }
}

// Make sure data is loaded
loadAndParseData();

export async function POST(request: NextRequest) {
  // Make sure data is loaded
  if (!isDataLoaded || !allListings || allListings.length === 0) {
    loadAndParseData();
    if (!isDataLoaded) {
      return NextResponse.json({ error: 'Data not available' }, { status: 500 });
    }
  }

  try {
    const requestData = await request.json();
    const { userProfile, filters = {}, limit = 10 } = requestData;

    // Validate user profile
    if (!userProfile || !userProfile.lifestyle) {
      return NextResponse.json({ error: 'Invalid user profile provided' }, { status: 400 });
    }

    // Apply basic filters first (if any)
    let filteredListings = [...allListings];
    
    // Apply location filter if specified
    if (filters.location) {
      const locationQuery = filters.location.toLowerCase();
      filteredListings = filteredListings.filter((item: any) =>
        (item.location?.toLowerCase().includes(locationQuery)) ||
        (item.district?.toLowerCase().includes(locationQuery)) ||
        (item.subdistrict?.toLowerCase().includes(locationQuery))
      );
    }

    // Price Range Filter
    if (filters.priceRange && filters.priceRange !== 'any') {
      const [minPriceStr, maxPriceStr] = filters.priceRange.split('-');
      const minPrice = parseInt(minPriceStr, 10);
      const maxPrice = (maxPriceStr === '' || maxPriceStr === undefined) ? Infinity : parseInt(maxPriceStr, 10);
      
      if (!isNaN(minPrice)) {
        filteredListings = filteredListings.filter((item: any) => {
          if (item.price === null || item.price === undefined) return false;
          if (maxPrice === Infinity) return item.price >= minPrice;
          else if (!isNaN(maxPrice)) return item.price >= minPrice && item.price <= maxPrice;
          return false;
        });
      }
    }

    // Bedrooms Filter
    if (filters.bedrooms && filters.bedrooms !== 'any') {
      if (filters.bedrooms === 'studio') {
        filteredListings = filteredListings.filter((item: any) => item.bedrooms !== null && item.bedrooms <= 1);
      } else if (filters.bedrooms.endsWith('+')) {
        const minRooms = parseInt(filters.bedrooms.replace('+', ''), 10);
        if (!isNaN(minRooms)) filteredListings = filteredListings.filter((item: any) => item.bedrooms !== null && item.bedrooms >= minRooms);
      } else {
        const exactRooms = parseInt(filters.bedrooms, 10);
        if (!isNaN(exactRooms)) filteredListings = filteredListings.filter((item: any) => item.bedrooms === exactRooms);
      }
    }

    // Bathrooms Filter
    if (filters.bathrooms && filters.bathrooms !== 'any') {
      if (filters.bathrooms.endsWith('+')) {
        const minBaths = parseFloat(filters.bathrooms.replace('+', ''));
        if (!isNaN(minBaths)) filteredListings = filteredListings.filter((item: any) => item.bathrooms !== null && item.bathrooms >= minBaths);
      } else {
        const exactBaths = parseFloat(filters.bathrooms);
        if (!isNaN(exactBaths)) filteredListings = filteredListings.filter((item: any) => item.bathrooms === exactBaths);
      }
    }

    // Common Requirements Filters
    const commonFilters: { param: string; field: string }[] = [
      { param: 'garage', field: 'garage_included' },
      { param: 'kitchenAmenities', field: 'equipped_kitchen' },
      { param: 'balcony', field: 'balcony' },
      { param: 'lift', field: 'lift' },
      { param: 'furnished', field: 'furnished' },
      { param: 'ac', field: 'air_conditioning' },
      { param: 'terrace', field: 'terrace' },
      { param: 'pool', field: 'swimming_pool' },
    ];

    commonFilters.forEach(({ param, field }) => {
      const filterValue = filters[param];
      if (filterValue === 'true') {
        filteredListings = filteredListings.filter((item: any) => item[field] === true);
      }
    });

    // Score each listing based on user profile
    const scoredListings = filteredListings.map((listing: any) => {
      // Convert to ApartmentData
      const apartmentData: ApartmentData = {
        web_id: listing.web_id,
        title: listing.title,
        price: listing.price,
        location: listing.location,
        district: listing.district,
        subdistrict: listing.subdistrict,
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        floor_built: listing.floor_built,
        lift: listing.lift,
        garage_included: listing.garage_included,
        furnished: listing.furnished,
        equipped_kitchen: listing.equipped_kitchen,
        air_conditioning: listing.air_conditioning,
        terrace: listing.terrace,
        balcony: listing.balcony,
        swimming_pool: listing.swimming_pool
      };

      // Score apartment
      const score = scoreApartmentForUser(apartmentData, userProfile as UserProfile);
      
      return {
        ...listing,
        matchScore: score,
      };
    });

    // Sort by match score (highest first)
    scoredListings.sort((a, b) => b.matchScore - a.matchScore);

    // Return only the top N results
    const topRecommendations = scoredListings.slice(0, limit);

    return NextResponse.json({
      success: true,
      total: scoredListings.length,
      recommendations: topRecommendations
    });
  } catch (error) {
    console.error('[Recommendations API] Error processing request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Support GET method for testing
export async function GET(request: NextRequest) {
  // Sample user profile for testing
  const testUserProfile = {
    id: 'test-user',
    lifestyle: {
      workLocation: 'Centro',
      maxCommute: '30min',
      transportPreference: 'publicTransport',
      socialPreference: 'vibrant',
      outdoorSpaces: true,
      noisePreference: 'moderateNoise',
      workFromHome: true,
      cuisineImportance: 'important'
    },
    createdAt: new Date().toISOString()
  };

  // Extract filters from query parameters
  const { searchParams } = request.nextUrl;
  const filters: Record<string, string> = {};
  
  searchParams.forEach((value, key) => {
    filters[key] = value;
  });

  // Create a POST-like request object
  const requestData = {
    userProfile: testUserProfile,
    filters,
    limit: parseInt(searchParams.get('limit') || '5', 10)
  };

  // Forward to POST handler
  request = new Request(request.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestData)
  }) as NextRequest;

  return POST(request);
} 