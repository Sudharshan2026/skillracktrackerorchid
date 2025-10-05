/**
 * URL preprocessing utilities for SkillRack profile URLs
 * Implements requirement 4.7: URL preprocessing and validation enhancements
 */

export interface UrlPreprocessingResult {
  /** The cleaned and normalized URL */
  cleanedUrl: string;
  /** Whether any changes were made to the original URL */
  wasModified: boolean;
  /** Description of changes made for user feedback */
  modifications: string[];
}

/**
 * Preprocesses a SkillRack profile URL by removing whitespace and normalizing protocol
 * @param rawUrl - The raw URL input from the user
 * @returns Object containing the cleaned URL and modification details
 */
export function preprocessUrl(rawUrl: string): UrlPreprocessingResult {
  const modifications: string[] = [];
  let cleanedUrl = rawUrl;

  // Step 1: Remove leading and trailing whitespace
  const trimmedUrl = rawUrl.trim();
  if (trimmedUrl !== rawUrl) {
    modifications.push('Removed extra whitespace');
    cleanedUrl = trimmedUrl;
  }

  // Step 2: Remove internal whitespace (spaces within the URL)
  const noSpacesUrl = cleanedUrl.replace(/\s+/g, '');
  if (noSpacesUrl !== cleanedUrl) {
    modifications.push('Removed spaces within URL');
    cleanedUrl = noSpacesUrl;
  }

  // Step 3: Add protocol if missing
  if (cleanedUrl && !cleanedUrl.match(/^https?:\/\//)) {
    // Check if it starts with skillrack.com or www.skillrack.com
    if (cleanedUrl.match(/^(www\.)?skillrack\.com/)) {
      cleanedUrl = `https://${cleanedUrl}`;
      modifications.push('Added https:// protocol');
    }
  }

  // Step 4: Normalize www subdomain (add if missing, SkillRack requires www)
  if (cleanedUrl.includes('://skillrack.com') && !cleanedUrl.includes('://www.skillrack.com')) {
    cleanedUrl = cleanedUrl.replace('://skillrack.com', '://www.skillrack.com');
    modifications.push('Added www subdomain');
  }

  return {
    cleanedUrl,
    wasModified: modifications.length > 0,
    modifications
  };
}

/**
 * Validates if a URL matches the expected SkillRack profile format
 * @param url - The URL to validate
 * @returns True if the URL is a valid SkillRack profile URL
 */
export function validateSkillRackUrl(url: string): boolean {
  const skillrackPattern = /^https?:\/\/www\.skillrack\.com\/profile\/\d+\/[a-zA-Z0-9]+/;
  return skillrackPattern.test(url);
}

/**
 * Provides user-friendly feedback about URL preprocessing
 * @param result - The preprocessing result
 * @returns A formatted message for user feedback
 */
export function getPreprocessingFeedback(result: UrlPreprocessingResult): string | null {
  if (!result.wasModified) {
    return null;
  }

  const changes = result.modifications.join(', ');
  return `URL automatically cleaned: ${changes}`;
}