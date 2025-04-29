import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Define the structure for filters the chatbot should extract
// Should align with query params for /api/listings
interface SearchFilters {
    location?: string;
    priceRange?: string; // e.g., "1000-2000" or "3000-" or "-1500"
    bedrooms?: string; // e.g., "2", "3+", "studio"
    bathrooms?: string; // e.g., "1", "2+"
    garage?: string; // "true"
    kitchenAmenities?: string; // "true"
    balcony?: string; // "true"
    lift?: string; // "true"
    furnished?: string; // "true"
    ac?: string; // "true"
    terrace?: string; // "true"
    pool?: string; // "true"
    // Add other boolean filter keys based on your API
    [key: string]: any;
}

// --- OpenAI Client Initialization ---
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Ensure OPENAI_API_KEY is in your .env file
});

// --- System Prompt for OpenAI ---
const systemPrompt = `
You are Homie Helper, an AI assistant helping users find apartments in Madrid.
Your goal is to understand the user's request and extract relevant search filters based on the available criteria.
The available filter keys and their expected formats are:
- location: string (e.g., "Sol", "Malasaña", "near Retiro Park") - be flexible with how users describe location.
- priceRange: string (e.g., "1000-1500", "2000-", "-1200") - represent ranges, minimums, or maximums. Use numbers only.
- bedrooms: string (e.g., "1", "2", "3+", "studio") - use "studio" for 0 or 1 bedroom if specified as studio, "X+" for minimums.
- bathrooms: string (e.g., "1", "1.5", "2+") - use "X+" for minimums.
- garage: "true" if requested.
- kitchenAmenities: "true" if an equipped kitchen is requested.
- balcony: "true" if requested.
- lift: "true" if an elevator/lift is requested.
- furnished: "true" if requested.
- ac: "true" if air conditioning is requested.
- terrace: "true" if requested.
- pool: "true" if a swimming pool is requested.

Analyze the user's message and respond ONLY with a JSON object containing two keys:
1. "filters": An object containing the extracted filter keys and their corresponding string values based on the user's request. Only include filters explicitly mentioned or clearly implied. Do not invent filters. If a filter type is not mentioned, omit it. Ensure values match the expected formats.
2. "explanation": A friendly, concise string explaining what filters you understood and are applying. Start with "Okay," or similar confirmation. Example: "Okay, I'll look for apartments near Sol with at least 2 bedrooms and a balcony." or "Okay, searching for furnished studios under €1200."

If the user's message is unclear or doesn't contain specific search criteria, return an empty "filters" object and an "explanation" asking for more details. Example: { "filters": {}, "explanation": "I understand you're looking for an apartment. Could you tell me more about the location, price range, or number of bedrooms you prefer?" }

Respond ONLY with the valid JSON object, nothing else before or after it.
`;


export async function POST(request: NextRequest) {
  const body = await request.json();
  const userMessage = body.message;

  if (!userMessage || typeof userMessage !== 'string') {
    return NextResponse.json({ error: 'Invalid message format' }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
      console.error("[API Chatbot] OpenAI API Key not found. Make sure it's set in the .env file.");
      return NextResponse.json({ error: 'Server configuration error: Missing API key.' }, { status: 500 });
  }

  console.log("[API Chatbot] Received message:", userMessage);

  try {
    console.log("[API Chatbot] Sending request to OpenAI...");
    const completion = await openai.chat.completions.create({
        // Use a cheaper model like gpt-3.5-turbo
        // You could potentially use gpt-4o-mini when available and compare cost/performance
        model: "gpt-3.5-turbo-0125",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
        ],
        temperature: 0.3, // Lower temperature for more deterministic filter extraction
        max_tokens: 250, // Limit response size
        response_format: { type: "json_object" }, // Ensure response is JSON
    });

    const rawResponse = completion.choices[0]?.message?.content;
    console.log("[API Chatbot] Received raw response from OpenAI:", rawResponse);

    if (!rawResponse) {
        throw new Error("OpenAI response was empty.");
    }

    let parsedResponse: { filters: SearchFilters, explanation: string };
    try {
        parsedResponse = JSON.parse(rawResponse);
    } catch (parseError) {
        console.error("[API Chatbot] Failed to parse OpenAI JSON response:", parseError);
        console.error("[API Chatbot] Raw response causing parse error:", rawResponse);
        // Fallback response if JSON parsing fails
         return NextResponse.json({
             filters: {},
             explanation: "Sorry, I had a little trouble understanding that. Could you try phrasing it differently?"
         });
    }


    // Basic validation of the parsed structure
    if (typeof parsedResponse !== 'object' || parsedResponse === null || typeof parsedResponse.filters !== 'object' || typeof parsedResponse.explanation !== 'string') {
         console.error("[API Chatbot] OpenAI response format is incorrect:", parsedResponse);
         throw new Error("OpenAI response format is incorrect.");
    }

    // Clean up filters: remove empty/null/'any' values that might sneak in
    const cleanedFilters: SearchFilters = {};
    for (const key in parsedResponse.filters) {
        const value = parsedResponse.filters[key];
        if (value !== null && value !== undefined && value !== '' && value !== 'any') {
            // Ensure boolean-like filters are explicitly "true"
            if (['garage', 'kitchenAmenities', 'balcony', 'lift', 'furnished', 'ac', 'terrace', 'pool'].includes(key)) {
                 if (value === true || String(value).toLowerCase() === 'true') {
                     cleanedFilters[key] = 'true';
                 }
            } else {
                 cleanedFilters[key] = String(value); // Ensure all filter values are strings
            }
        }
    }


    console.log("[API Chatbot] Extracted Filters (Cleaned):", cleanedFilters);
    console.log("[API Chatbot] Sending Explanation:", parsedResponse.explanation);

    return NextResponse.json({ filters: cleanedFilters, explanation: parsedResponse.explanation });

  } catch (error: any) {
    console.error("[API Chatbot] Error calling OpenAI API:", error);
     // Provide a user-friendly error message
     let explanation = 'Sorry, I encountered an error while processing your request. Please try again later.';
     if (error.status === 401) {
         explanation = 'There seems to be an issue with the server configuration (API key). Please contact support.';
     } else if (error.response?.data?.error?.message) {
         // Try to get a more specific error from OpenAI if available
         explanation = `An error occurred: ${error.response.data.error.message}`;
     }

    return NextResponse.json({
        filters: {}, // Return empty filters on error
        explanation: explanation
     }, { status: 500 }); // Keep status 500 for server-side errors
  }
} 