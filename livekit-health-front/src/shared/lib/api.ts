const BASE = process.env.NEXT_PUBLIC_API_URL_LARAVEL!;
const API_PREFIX = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const cleanPath = path.replace(/^\//, ""); // quita slash inicial
  const url = `${BASE}${API_PREFIX}/${cleanPath}`;

  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(
      Object.values(error.errors ?? {})
        .flat()
        .join(", ") ||
        error.message ||
        `Error ${res.status}`,
    );
  }

  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
