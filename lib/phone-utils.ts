/**
 * Phone number utilities for normalization and matching
 */

/**
 * Normalize a phone number by removing all non-digit characters except +
 * @param phone - The phone number to normalize
 * @returns Normalized phone number
 */
export function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // Remove all spaces, dashes, dots, parentheses, and other formatting
  // Keep only digits and the + sign
  return phone.replace(/[^\d+]/g, '');
}

/**
 * Generate multiple variations of a phone number for flexible matching
 * @param phone - The phone number to generate variations for
 * @returns Array of phone number variations
 */
export function generatePhoneVariations(phone: string): string[] {
  if (!phone) return [];
  
  const normalized = normalizePhoneNumber(phone);
  const variations = new Set<string>();
  
  // Add the original normalized version
  variations.add(normalized);
  
  // If it starts with +, also try without +
  if (normalized.startsWith('+')) {
    variations.add(normalized.substring(1));
  } else {
    // If it doesn't start with +, try adding it
    variations.add('+' + normalized);
  }
  
  // For Spanish numbers, try common variations
  if (normalized.startsWith('+34') || normalized.startsWith('34')) {
    const withoutCountry = normalized.replace(/^\+?34/, '');
    variations.add('+34' + withoutCountry);
    variations.add('34' + withoutCountry);
    variations.add(withoutCountry);
  }
  
  // For Italian numbers, try common variations
  if (normalized.startsWith('+39') || normalized.startsWith('39')) {
    const withoutCountry = normalized.replace(/^\+?39/, '');
    variations.add('+39' + withoutCountry);
    variations.add('39' + withoutCountry);
    variations.add(withoutCountry);
  }
  
  return Array.from(variations);
}

/**
 * Check if two phone numbers match (after normalization)
 * @param phone1 - First phone number
 * @param phone2 - Second phone number
 * @returns True if the numbers match
 */
export function phoneNumbersMatch(phone1: string, phone2: string): boolean {
  if (!phone1 || !phone2) return false;
  
  const normalized1 = normalizePhoneNumber(phone1);
  const normalized2 = normalizePhoneNumber(phone2);
  
  return normalized1 === normalized2;
}

/**
 * Create a Supabase filter condition for phone number matching
 * @param phone - The phone number to search for
 * @returns Supabase filter string
 */
export function createPhoneFilter(phone: string): string {
  const variations = generatePhoneVariations(phone);
  
  if (variations.length === 0) return '';
  
  // Create OR conditions for each variation
  const conditions = variations.map(variation => 
    `phone.eq.${variation},home_phone.eq.${variation},cell_phone.eq.${variation}`
  );
  
  return conditions.join(',');
}

/**
 * Find the best matching phone number from a list
 * @param searchPhone - The phone number being searched for
 * @param phoneList - Array of phone numbers to search in
 * @returns The best matching phone number or null
 */
export function findBestPhoneMatch(searchPhone: string, phoneList: string[]): string | null {
  if (!searchPhone || !phoneList || phoneList.length === 0) return null;
  
  const searchVariations = generatePhoneVariations(searchPhone);
  
  for (const phone of phoneList) {
    if (!phone) continue;
    
    const phoneVariations = generatePhoneVariations(phone);
    
    // Check if any variations match
    for (const searchVar of searchVariations) {
      for (const phoneVar of phoneVariations) {
        if (searchVar === phoneVar) {
          return phone; // Return the original phone number from the list
        }
      }
    }
  }
  
  return null;
} 