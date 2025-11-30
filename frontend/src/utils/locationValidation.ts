export interface DeliveryZoneData {
  zones: string[];
  details: {
    [key: string]: {
      cities: string[];
      zip_prefixes: string[];
    };
  };
}

export interface ValidationResult {
  valid: boolean;
  deliveryZone: string | null;
  error: string | null;
}

let cachedZoneData: DeliveryZoneData | null = null;

export async function fetchDeliveryZones(): Promise<DeliveryZoneData> {
  if (cachedZoneData) {
    return cachedZoneData;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  
  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is not configured');
  }

  const response = await fetch(`${apiUrl}/delivery-zones`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch delivery zones');
  }
  
  const data: DeliveryZoneData = await response.json();
  cachedZoneData = data;
  return data;
}

export async function validateLocation(location: string): Promise<ValidationResult> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  
  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is not configured');
  }

  const response = await fetch(`${apiUrl}/delivery-zones?location=${encodeURIComponent(location)}`);
  
  if (!response.ok) {
    throw new Error('Failed to validate location');
  }
  
  return await response.json();
}

export function validateLocationLocal(location: string, zoneData: DeliveryZoneData): ValidationResult {
  const trimmed = location.trim();
  
  // Check if it's a zip code (5 digits)
  if (/^\d{5}$/.test(trimmed)) {
    const zipPrefix = trimmed.substring(0, 3);
    for (const [zoneName, data] of Object.entries(zoneData.details)) {
      if (data.zip_prefixes.includes(zipPrefix)) {
        return {
          valid: true,
          deliveryZone: zoneName,
          error: null
        };
      }
    }
    return {
      valid: false,
      deliveryZone: null,
      error: 'Zip code not in Texas delivery zones'
    };
  }
  
  // Check if it's a city name
  const lowerLocation = trimmed.toLowerCase();
  for (const [zoneName, data] of Object.entries(zoneData.details)) {
    for (const city of data.cities) {
      if (city.toLowerCase() === lowerLocation) {
        return {
          valid: true,
          deliveryZone: zoneName,
          error: null
        };
      }
    }
  }
  
  return {
    valid: false,
    deliveryZone: null,
    error: 'City not found in Texas delivery zones'
  };
}
