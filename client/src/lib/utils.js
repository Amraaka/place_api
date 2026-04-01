/**
 * Returns true when `url` is a syntactically valid http/https URL.
 * Used by Authenticate, NewPlace, and UpdatePlace forms.
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
