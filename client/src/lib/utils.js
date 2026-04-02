/**
 * Returns true when `url` is a syntactically valid http/https URL.
 * Used by Authenticate, NewPlace, and UpdatePlace forms.
 */
export const isValidUrl = (url) => {
  try {
    const { protocol } = new URL(url);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
};
