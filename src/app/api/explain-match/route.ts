import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Reuse the SearchFilters and HouseData interfaces (or import if centralized)
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

interface HouseData {
  web_id: number;
  title?: string | null;
  type?: string | null;
  price?: number | null;
  floor_built?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  lift?: boolean;
  garage_included?: boolean;
  furnished?: boolean;
  equipped_kitchen?: boolean;
  air_conditioning?: boolean;
  terrace?: boolean;
  balcony?: boolean;
  swimming_pool?: boolean;
  location?: string | null;
  district?: string | null;
  subdistrict?: string | null;
  [key: string]: any;
}

// --- OpenAI Client Initialization ---
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// --- System Prompt for OpenAI Explanation ---
function getExplanationPrompt(apartment: HouseData, filters: SearchFilters): string {
    // Basic details for context
    let apartmentSummary = `Type: ${apartment.type || 'N/A'}, Location: ${apartment.subdistrict || apartment.district || apartment.location || 'N/A'}, Price: ${apartment.price ? `€${apartment.price}` : 'N/A'}, Size: ${apartment.floor_built ? `${apartment.floor_built}m²` : 'N/A'}, Beds: ${apartment.bedrooms ?? 'N/A'}, Baths: ${apartment.bathrooms ?? 'N/A'}`;
    let amenities = [];
    if (apartment.lift) amenities.push('lift');
    if (apartment.garage_included) amenities.push('garage');
    if (apartment.furnished) amenities.push('furnished');
    if (apartment.equipped_kitchen) amenities.push('equipped kitchen');
    if (apartment.air_conditioning) amenities.push('A/C');
    if (apartment.terrace) amenities.push('terrace');
    if (apartment.balcony) amenities.push('balcony');
    if (apartment.swimming_pool) amenities.push('pool');
    if (amenities.length > 0) {
        apartmentSummary += `, Features: ${amenities.join(', ')}`;
    }

    let prompt = `User is looking for an apartment with filters: ${JSON.stringify(filters)}
Apartment details: ${apartmentSummary}

Explain concisely (1 sentence) why this specific apartment is a potentially good match. 
First, briefly confirm it meets key filtered criteria (like location, beds/baths, price range if possible).
Then, highlight one or two specific positive features from the apartment details provided (like presence of a terrace, pool, garage, being furnished, its type like 'penthouse', or if the price/size seems notable for the area based on general knowledge) that make it stand out, especially if those features weren't explicitly requested in the filters.
Focus ONLY on the provided apartment data and filters. Do not invent features or reasons. Be friendly and helpful. Start the explanation directly.

Example good explanations:
- "Matches your criteria in ${apartment.district || 'the area'} with ${apartment.bedrooms ?? 'N/A'} beds, and notably includes a private terrace."
- "This ${apartment.type || 'apartment'} fits your budget and size needs, and also comes furnished with air conditioning."
- "Located right in ${apartment.subdistrict || 'your desired zone'}, this option includes a garage, which can be hard to find."
- "Besides meeting your core requirements, this one offers access to a swimming pool."

Example explanation if few filters match:
- "While matching your location request, it has more bedrooms than specified but does include a balcony."
`;
    return prompt;
}


export async function POST(request: NextRequest) {
    let apartmentData: HouseData;
    let activeFilters: SearchFilters;

    try {
        const body = await request.json();
        apartmentData = body.apartmentData;
        activeFilters = body.activeFilters;

        if (!apartmentData || !activeFilters || typeof apartmentData !== 'object' || typeof activeFilters !== 'object') {
            throw new Error('Invalid request body format. apartmentData and activeFilters are required.');
        }
    } catch (e) {
         console.error("[API Explain] Invalid request body:", e);
        return NextResponse.json({ error: 'Invalid request format.' }, { status: 400 });
    }

     if (!process.env.OPENAI_API_KEY) {
        console.error("[API Explain] OpenAI API Key not found.");
        return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
     }

     const systemPrompt = getExplanationPrompt(apartmentData, activeFilters);

     console.log(`[API Explain] Requesting explanation for Apartment ID: ${apartmentData?.web_id} with filters:`, activeFilters);

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-0125", // Or gpt-4o-mini
            messages: [
                { role: "system", content: "You are an AI assistant generating concise explanations for why an apartment matches user search criteria." },
                { role: "user", content: systemPrompt }
            ],
            temperature: 0.5, // Allow a bit more creativity for explanations
            max_tokens: 100, // Keep explanations brief
        });

        const explanation = completion.choices[0]?.message?.content?.trim() || "Could not generate explanation.";
        console.log(`[API Explain] Generated explanation for ${apartmentData?.web_id}:`, explanation);

        return NextResponse.json({ explanation });

    } catch (error: any) {
        console.error(`[API Explain] Error calling OpenAI for apartment ${apartmentData?.web_id}:`, error);
        return NextResponse.json({ error: 'Failed to generate explanation.' }, { status: 500 });
    }
}