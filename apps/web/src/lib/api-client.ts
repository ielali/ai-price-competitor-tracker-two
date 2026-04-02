import { useAuthStore } from "@/stores/auth-store";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface ApiResponse<T> {
  data: T;
}

interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export class ApiClientError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

async function parseErrorResponse(res: Response): Promise<ApiClientError> {
  try {
    const body: ApiError = await res.json();
    return new ApiClientError(
      body.error.code,
      body.error.message,
      res.status,
      body.error.details
    );
  } catch {
    return new ApiClientError("UNKNOWN_ERROR", res.statusText, res.status);
  }
}

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeToRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function notifyRefreshSubscribers(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

async function tryRefreshToken(): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Refresh failed");
  }

  const body: ApiResponse<{ accessToken: string }> = await res.json();
  return body.data.accessToken;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const { accessToken } = useAuthStore.getState();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (res.status === 401 && retry) {
    // Attempt token refresh
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const newToken = await tryRefreshToken();
        useAuthStore.getState().setAccessToken(newToken);
        notifyRefreshSubscribers(newToken);
        isRefreshing = false;
        return request<T>(path, options, false);
      } catch {
        isRefreshing = false;
        useAuthStore.getState().clearAuth();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        throw new ApiClientError("SESSION_EXPIRED", "Session expired", 401);
      }
    }

    // Queue request until refresh completes
    return new Promise((resolve, reject) => {
      subscribeToRefresh(async (newToken) => {
        try {
          headers["Authorization"] = `Bearer ${newToken}`;
          const retryRes = await fetch(`${API_BASE_URL}${path}`, {
            ...options,
            headers,
            credentials: "include",
          });
          if (!retryRes.ok) {
            reject(await parseErrorResponse(retryRes));
          } else {
            const data: ApiResponse<T> = await retryRes.json();
            resolve(data.data);
          }
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  if (!res.ok) {
    throw await parseErrorResponse(res);
  }

  const body: ApiResponse<T> = await res.json();
  return body.data;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),

  post: <T>(path: string, data?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: data != null ? JSON.stringify(data) : undefined,
    }),

  put: <T>(path: string, data?: unknown) =>
    request<T>(path, {
      method: "PUT",
      body: data != null ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),

  // Auth-specific methods that don't go through auth header logic
  postPublic: async <T>(path: string, data?: unknown): Promise<T> => {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: data != null ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    if (!res.ok) {
      throw await parseErrorResponse(res);
    }

    const body: ApiResponse<T> = await res.json();
    return body.data;
  },
};
