// TypeScript port of public/js/api.js's apiRequest/apiGet/apiPost.
// Same credentials/error-throwing behavior as the vanilla version; no apiPostForm
// or escapeHtml port needed here (form uploads and HTML escaping aren't used by
// the React layout components that consume this client).

export interface ApiError extends Error {
  status: number;
  data: unknown;
}

async function apiRequest<T>(
  method: "GET" | "POST",
  path: string,
  body: unknown,
): Promise<T> {
  const opts: RequestInit = { method, credentials: "same-origin" };
  if (body !== undefined) {
    opts.headers = { "Content-Type": "application/json" };
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(path, opts);

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const errorField =
      data !== null && typeof data === "object" && "error" in data
        ? (data as { error?: unknown }).error
        : undefined;
    const message =
      typeof errorField === "string" ? errorField : `Request failed (${res.status})`;
    const err = new Error(message) as ApiError;
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data as T;
}

export function apiGet<T>(path: string): Promise<T> {
  return apiRequest<T>("GET", path, undefined);
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return apiRequest<T>("POST", path, body);
}
