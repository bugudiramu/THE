const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";

/**
 * API client for the admin dashboard.
 * Calls the NestJS backend at /admin/orders/*.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}/${path.replace(/^\//, "")}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      // Use test token for local dev — Clerk integration will replace this
      Authorization: `Bearer test-token`,
      ...options.headers,
    },
    cache: "no-store",
  } as RequestInit);

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ message: res.statusText })) as { message?: string };
    throw new Error(errorBody.message || `API error: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

/**
 * GET request helper.
 */
export function apiGet<T>(path: string): Promise<T> {
  return apiFetch<T>(path, { method: "GET" });
}

/**
 * PATCH request helper.
 */
export function apiPatch<T>(path: string, body: Record<string, unknown>): Promise<T> {
  return apiFetch<T>(path, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}
