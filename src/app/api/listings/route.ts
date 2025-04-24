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

export async function GET(request: NextRequest) {
  const csvFilePath = path.resolve('.', 'houses_Madrid.csv');

  try {
    const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });

    const parseResult = Papa.parse<HouseData>(fileContent, {
      header: true,
      dynamicTyping: true, 
      skipEmptyLines: true,
    });

    if (parseResult.errors.length > 0) {
      // Log first few errors for better debugging
      console.error("CSV Parsing Errors (first 5):", parseResult.errors.slice(0, 5));
      return NextResponse.json({ error: 'Failed to parse CSV data', details: parseResult.errors.slice(0, 5) }, { status: 500 });
    }

    let data = parseResult.data;

    // --- Filtering Logic (Updated for new columns) --- 
    const { searchParams } = request.nextUrl;

    // REMOVED: Filter for operation === 'rent' (assuming new dataset is rentals)
    // data = data.filter(item => item.operation && item.operation.toLowerCase() === 'rent');

    // Location Filter (using location, district, subdistrict)
    const locationQuery = searchParams.get('location')?.toLowerCase();
    if (locationQuery) {
      console.log(`[API DEBUG] Searching for location: "${locationQuery}"`); 
      data = data.filter(item => { 
        const locationLower = item.location?.toLowerCase();
        const districtLower = item.district?.toLowerCase();
        const subdistrictLower = item.subdistrict?.toLowerCase();

        const isMatch = 
          (locationLower && locationLower.includes(locationQuery)) ||
          (districtLower && districtLower.includes(locationQuery)) ||
          (subdistrictLower && subdistrictLower.includes(locationQuery));

        // Optional: Keep logging for a few items if needed
        // if (checkedCount < maxLogItems) { ... }
        
        return isMatch;
      });
    }

    // Price Range Filter (using 'price')
    const priceRange = searchParams.get('priceRange');
    if (priceRange && priceRange !== 'any') {
      const [minPriceStr, maxPriceStr] = priceRange.split('-');
      const minPrice = parseInt(minPriceStr, 10);
      // Handle cases like "2000-" where maxPriceStr is empty
      const maxPrice = (maxPriceStr === '' || maxPriceStr === undefined) ? Infinity : parseInt(maxPriceStr, 10);

      if (!isNaN(minPrice)) {
        data = data.filter(item => {
          if (item.price === null || item.price === undefined) return false;
          if (maxPrice === Infinity) {
            return item.price >= minPrice;
          } else if (!isNaN(maxPrice)) {
            return item.price >= minPrice && item.price <= maxPrice;
          } 
          return false; 
        });
      }
    }

    // Bedrooms Filter (using 'bedrooms')
    const bedrooms = searchParams.get('bedrooms');
    if (bedrooms && bedrooms !== 'any') {
      if (bedrooms === 'studio') {
        // Assuming studio means 0 or 1 bedroom in new dataset?
        data = data.filter(item => item.bedrooms !== null && item.bedrooms <= 1);
      } else if (bedrooms.endsWith('+')) {
        const minRooms = parseInt(bedrooms.replace('+', ''), 10);
        if (!isNaN(minRooms)) {
          data = data.filter(item => item.bedrooms !== null && item.bedrooms >= minRooms);
        }
      } else {
        const exactRooms = parseInt(bedrooms, 10);
        if (!isNaN(exactRooms)) {
          data = data.filter(item => item.bedrooms === exactRooms);
        }
      }
    }

    // Bathrooms Filter (using 'bathrooms')
    const bathrooms = searchParams.get('bathrooms');
    if (bathrooms && bathrooms !== 'any') {
      if (bathrooms.endsWith('+')) {
        const minBaths = parseFloat(bathrooms.replace('+', ''));
        if (!isNaN(minBaths)) {
          data = data.filter(item => item.bathrooms !== null && item.bathrooms >= minBaths);
        }
      } else {
        const exactBaths = parseFloat(bathrooms);
        if (!isNaN(exactBaths)) {
          data = data.filter(item => item.bathrooms === exactBaths);
        }
      }
    }

    // Updated Common Requirements Filters for new boolean fields
    const commonFilters: { param: string; field: keyof HouseData }[] = [
      // Map existing relevant UI params first
      { param: 'garage', field: 'garage_included' },
      { param: 'kitchenAmenities', field: 'equipped_kitchen' },
      { param: 'balcony', field: 'balcony' },
      // Add mappings for other boolean fields in the new dataset
      { param: 'lift', field: 'lift' },
      { param: 'furnished', field: 'furnished' },
      { param: 'ac', field: 'air_conditioning' },
      { param: 'terrace', field: 'terrace' },
      { param: 'pool', field: 'swimming_pool' },
      // Add others if needed, e.g.:
      // { param: 'storeroom', field: 'storeroom' },
      // { param: 'fittedWardrobes', field: 'fitted_wardrobes' },
    ];

    commonFilters.forEach(({ param, field }) => {
      const filterValue = searchParams.get(param);
      // Keep the logic checking for 'true'
      if (filterValue === 'true') {
         // No need for function check as all are direct boolean fields now
         data = data.filter(item => item[field] === true);
      }
    });

    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Error reading or processing CSV file:", error);
    if (error.code === 'ENOENT') {
      return NextResponse.json({ error: 'CSV file not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 