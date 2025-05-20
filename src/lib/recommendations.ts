import { UserProfile } from '@/context/UserContext';

// Define the structure of an apartment for recommendation purposes
export interface ApartmentData {
  web_id: number;
  title?: string | null;
  price?: number | null;
  location?: string | null;
  district?: string | null;
  subdistrict?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  floor_built?: number | null; // Square meters
  lift?: boolean;
  garage_included?: boolean;
  furnished?: boolean;
  equipped_kitchen?: boolean;
  air_conditioning?: boolean;
  terrace?: boolean;
  balcony?: boolean;
  swimming_pool?: boolean;
  // Additional metadata we might need for recommendations
  transportation?: {
    metro_distance?: number;
    bus_stops_nearby?: number;
    bike_lanes_nearby?: boolean;
  };
  neighborhood_data?: {
    nightlife_score?: number; // 1-10
    noise_level?: number; // 1-10
    green_spaces?: number; // 1-10
    restaurant_density?: number; // 1-10
  };
}

// Define scoring weights for different preferences
const PREFERENCE_WEIGHTS = {
  // Transportation preferences
  transportPreference: {
    walking: { metro_distance: 2.0, bus_stops_nearby: 0.5 },
    publicTransport: { metro_distance: 1.5, bus_stops_nearby: 2.0 },
    driving: { garage_included: 3.0 },
    cycling: { bike_lanes_nearby: 2.5 }
  },
  
  // Social life preferences
  socialPreference: {
    vibrant: { nightlife_score: 3.0, restaurant_density: 2.0 },
    moderate: { nightlife_score: 1.0, restaurant_density: 1.5 },
    quiet: { nightlife_score: -1.5, noise_level: -2.0 }
  },
  
  // Noise preferences
  noisePreference: {
    lowNoise: { noise_level: -3.0 },
    moderateNoise: { noise_level: 0 },
    highNoise: { noise_level: 1.0 }
  },
  
  // Other preferences
  outdoorSpaces: { green_spaces: 2.5, terrace: 1.5, balcony: 1.0 },
  workFromHome: { floor_built: 1.5, equipped_kitchen: 1.0, air_conditioning: 1.5 },
  petOwner: { green_spaces: 1.5 },
  
  // Cuisine importance
  cuisineImportance: {
    veryImportant: { restaurant_density: 3.0 },
    important: { restaurant_density: 2.0 },
    neutral: { restaurant_density: 0.5 },
    notImportant: { restaurant_density: 0 }
  }
};

// Default neighborhood data for districts - can be expanded with actual data
const DISTRICT_DATA: Record<string, any> = {
  'Centro': { 
    nightlife_score: 9, 
    noise_level: 8, 
    green_spaces: 3, 
    restaurant_density: 9,
    metro_distance: 2,
    bus_stops_nearby: 8,
    bike_lanes_nearby: true
  },
  'Salamanca': { 
    nightlife_score: 7, 
    noise_level: 5, 
    green_spaces: 4, 
    restaurant_density: 8,
    metro_distance: 3,
    bus_stops_nearby: 7,
    bike_lanes_nearby: true
  },
  'Chamberí': { 
    nightlife_score: 7, 
    noise_level: 6, 
    green_spaces: 4, 
    restaurant_density: 7,
    metro_distance: 3,
    bus_stops_nearby: 8,
    bike_lanes_nearby: true
  },
  'Chamartín': { 
    nightlife_score: 5, 
    noise_level: 5, 
    green_spaces: 6, 
    restaurant_density: 6,
    metro_distance: 4,
    bus_stops_nearby: 6,
    bike_lanes_nearby: true
  },
  'Retiro': { 
    nightlife_score: 5, 
    noise_level: 4, 
    green_spaces: 9, 
    restaurant_density: 6,
    metro_distance: 3,
    bus_stops_nearby: 5,
    bike_lanes_nearby: true
  },
  'Arganzuela': { 
    nightlife_score: 5, 
    noise_level: 5, 
    green_spaces: 6, 
    restaurant_density: 6,
    metro_distance: 4,
    bus_stops_nearby: 6,
    bike_lanes_nearby: true
  },
  'Tetuán': { 
    nightlife_score: 6, 
    noise_level: 6, 
    green_spaces: 4, 
    restaurant_density: 6,
    metro_distance: 4,
    bus_stops_nearby: 7,
    bike_lanes_nearby: true
  },
  'Moncloa-Aravaca': { 
    nightlife_score: 6, 
    noise_level: 4, 
    green_spaces: 7, 
    restaurant_density: 5,
    metro_distance: 5,
    bus_stops_nearby: 5,
    bike_lanes_nearby: true
  },
  // Add more districts as needed
  'default': { 
    nightlife_score: 5, 
    noise_level: 5, 
    green_spaces: 5, 
    restaurant_density: 5,
    metro_distance: 5,
    bus_stops_nearby: 5,
    bike_lanes_nearby: false
  }
};

// Enrich apartment data with neighborhood information
function enrichApartmentData(apartment: ApartmentData): ApartmentData {
  const enriched = { ...apartment };
  
  // Add neighborhood data based on district
  const district = apartment.district || 'default';
  const districtData = DISTRICT_DATA[district] || DISTRICT_DATA.default;
  
  enriched.neighborhood_data = {
    nightlife_score: districtData.nightlife_score,
    noise_level: districtData.noise_level,
    green_spaces: districtData.green_spaces,
    restaurant_density: districtData.restaurant_density
  };
  
  enriched.transportation = {
    metro_distance: districtData.metro_distance,
    bus_stops_nearby: districtData.bus_stops_nearby,
    bike_lanes_nearby: districtData.bike_lanes_nearby
  };
  
  return enriched;
}

// Calculate commute score based on work location
function calculateCommuteScore(apartment: ApartmentData, userProfile: UserProfile): number {
  if (!userProfile.lifestyle.workLocation) return 0;
  
  // This is simplified - in a real app, you'd use geocoding and actual distance calculations
  // For now, we'll just use a random score as a placeholder
  return Math.random() * 5; // 0-5 points for commute
}

// Main scoring function
export function scoreApartmentForUser(apartment: ApartmentData, userProfile: UserProfile): number {
  let score = 50; // Base score
  const enrichedApartment = enrichApartmentData(apartment);
  const lifestyle = userProfile.lifestyle;
  
  // Define types for preference keys to help TypeScript
  type TransportPrefKey = keyof typeof PREFERENCE_WEIGHTS.transportPreference;
  type SocialPrefKey = keyof typeof PREFERENCE_WEIGHTS.socialPreference;
  type NoisePrefKey = keyof typeof PREFERENCE_WEIGHTS.noisePreference;
  type CuisinePrefKey = keyof typeof PREFERENCE_WEIGHTS.cuisineImportance;
  
  // Transportation preference
  if (lifestyle.transportPreference) {
    const prefKey = lifestyle.transportPreference as TransportPrefKey;
    if (prefKey in PREFERENCE_WEIGHTS.transportPreference) {
      const transportWeights = PREFERENCE_WEIGHTS.transportPreference[prefKey];
      if (transportWeights) {
        Object.entries(transportWeights).forEach(([key, value]) => {
          const weight = value as number; // Cast weight to number
          if (key === 'metro_distance' && enrichedApartment.transportation?.metro_distance) {
            // Lower distance is better
            score += weight * (10 - enrichedApartment.transportation.metro_distance) / 2;
          }
          else if (key === 'bus_stops_nearby' && enrichedApartment.transportation?.bus_stops_nearby) {
            // More bus stops is better
            score += weight * enrichedApartment.transportation.bus_stops_nearby / 2;
          }
          else if (key === 'garage_included' && enrichedApartment.garage_included) {
            score += weight;
          }
          else if (key === 'bike_lanes_nearby' && enrichedApartment.transportation?.bike_lanes_nearby) {
            score += weight;
          }
        });
      }
    }
  }
  
  // Social preference
  if (lifestyle.socialPreference) {
    const prefKey = lifestyle.socialPreference as SocialPrefKey;
     if (prefKey in PREFERENCE_WEIGHTS.socialPreference) {
      const socialWeights = PREFERENCE_WEIGHTS.socialPreference[prefKey];
      if (socialWeights) {
        Object.entries(socialWeights).forEach(([key, value]) => {
          const weight = value as number; // Cast weight to number
          if (key === 'nightlife_score' && enrichedApartment.neighborhood_data?.nightlife_score) {
            score += weight * enrichedApartment.neighborhood_data.nightlife_score / 3;
          }
          else if (key === 'restaurant_density' && enrichedApartment.neighborhood_data?.restaurant_density) {
            score += weight * enrichedApartment.neighborhood_data.restaurant_density / 3;
          }
          else if (key === 'noise_level' && enrichedApartment.neighborhood_data?.noise_level) {
            // For negative weights, lower noise is better (score increases if noise is low)
            // For positive weights, higher noise is better (score increases if noise is high)
            score += weight * enrichedApartment.neighborhood_data.noise_level / 3; 
          }
        });
      }
    }
  }
  
  // Noise preference
  if (lifestyle.noisePreference) {
    const prefKey = lifestyle.noisePreference as NoisePrefKey;
    if (prefKey in PREFERENCE_WEIGHTS.noisePreference) {
      const noiseWeights = PREFERENCE_WEIGHTS.noisePreference[prefKey];
      if (noiseWeights && noiseWeights.noise_level !== undefined && enrichedApartment.neighborhood_data?.noise_level) {
          // Negative weight means lower noise is better (score increases if noise is low)
          score += noiseWeights.noise_level * (noiseWeights.noise_level < 0 ? (10 - enrichedApartment.neighborhood_data.noise_level) : enrichedApartment.neighborhood_data.noise_level) / 3;
      }
    }
  }
  
  // Outdoor spaces
  if (lifestyle.outdoorSpaces) {
    if (enrichedApartment.terrace) {
      score += PREFERENCE_WEIGHTS.outdoorSpaces.terrace;
    }
    if (enrichedApartment.balcony) {
      score += PREFERENCE_WEIGHTS.outdoorSpaces.balcony;
    }
    if (enrichedApartment.neighborhood_data?.green_spaces) {
      score += PREFERENCE_WEIGHTS.outdoorSpaces.green_spaces * 
               enrichedApartment.neighborhood_data.green_spaces / 3;
    }
  }
  
  // Work from home
  if (lifestyle.workFromHome) {
    if (enrichedApartment.air_conditioning) {
      score += PREFERENCE_WEIGHTS.workFromHome.air_conditioning;
    }
    if (enrichedApartment.equipped_kitchen) {
      score += PREFERENCE_WEIGHTS.workFromHome.equipped_kitchen;
    }
    if (enrichedApartment.floor_built && enrichedApartment.floor_built > 60) {
      // Bigger apartment is better for WFH
      score += PREFERENCE_WEIGHTS.workFromHome.floor_built * 
               Math.min(enrichedApartment.floor_built / 30, 3);
    }
  }
  
  // Pet owner
  if (lifestyle.petOwner) {
    if (enrichedApartment.neighborhood_data?.green_spaces) {
      score += PREFERENCE_WEIGHTS.petOwner.green_spaces * 
               enrichedApartment.neighborhood_data.green_spaces / 3;
    }
  }
  
  // Cuisine importance
  if (lifestyle.cuisineImportance) {
    const prefKey = lifestyle.cuisineImportance as CuisinePrefKey;
     if (prefKey in PREFERENCE_WEIGHTS.cuisineImportance) {
      const cuisineWeights = PREFERENCE_WEIGHTS.cuisineImportance[prefKey];
      if (cuisineWeights && cuisineWeights.restaurant_density !== undefined && 
          enrichedApartment.neighborhood_data?.restaurant_density) {
        score += cuisineWeights.restaurant_density * 
                 enrichedApartment.neighborhood_data.restaurant_density / 3;
      }
    }
  }
  
  // Commute score (simplified)
  score += calculateCommuteScore(enrichedApartment, userProfile);
  
  return Math.min(Math.max(score, 0), 100); // Ensure score is between 0-100
} 