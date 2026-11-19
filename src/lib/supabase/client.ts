'use client';

/**
 * Fetch JSON from our own API routes. Returns null on ANY failure (not logged in,
 * Supabase not configured, network error) so pages can keep their built-in demo data.
 */
export async function fetchData<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { credentials: 'same-origin', cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.success ? (json.data as T) : null;
  } catch {
    return null;
  }
}
