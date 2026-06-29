import { STOPWORDS_BI } from "./stopwords";

export function tokenize(text: string): string[] {
  if (!text) return [];

  // Convert to lowercase
  const lowercased = text.toLowerCase();
  
  // Remove punctuation and non-alphanumeric characters (keep spaces)
  const cleaned = lowercased.replace(/[^a-z0-9\s]/g, " ");
  
  // Split by whitespace
  const tokens = cleaned.split(/\s+/);
  
  // Filter out empty strings, tokens < 2 chars, and stopwords
  return tokens.filter((token) => {
    return token.length > 1 && !STOPWORDS_BI.has(token);
  });
}
