import * as Localization from 'expo-localization';

const EU_COUNTRIES = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
  'GB', 'IS', 'LI', 'NO', 'CH'
];


export type UserRegion = 'EU' | 'US' | 'OTHER';

export async function detectUserRegion(): Promise<UserRegion> {
  try {
    const locales = Localization.getLocales();
    
    if (locales && locales.length > 0) {
      const locale = locales[0];
      const regionCode = locale.regionCode?.toUpperCase();
      
      if (regionCode) {
        if (EU_COUNTRIES.includes(regionCode)) {
          return 'EU';
        }
        
        if (regionCode === 'US') {
          return 'US';
        }
      }
    }
    
    return 'OTHER';
  } catch (error) {
    console.log('Region detection error:', error);
    return 'OTHER';
  }
}

export function isGDPRRequired(region: UserRegion): boolean {
  return region === 'EU';
}

export function isCCPARequired(region: UserRegion): boolean {
  return region === 'US';
}
