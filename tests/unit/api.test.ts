import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClient } from "@/lib/api";

function jsonResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

describe("ApiClient", () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    mockFetch.mockReset();
    vi.stubGlobal("fetch", mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends a GET with no-store caching and parses the response", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ hello: "world" }));
    const client = new ApiClient("http://test.local");

    const result = await client.get<{ hello: string }>("/api/v1/x");

    expect(result).toEqual({ hello: "world" });
    expect(mockFetch).toHaveBeenCalledWith(
      "http://test.local/api/v1/x",
      expect.objectContaining({
        method: "GET",
        cache: "no-store",
      })
    );
  });

  it("includes the bearer token when one is set", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({}));
    const client = new ApiClient("http://test.local");
    client.setToken("tok-123");

    await client.get("/api/v1/x");

    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(options.headers).toEqual(
      expect.objectContaining({
        Authorization: "Bearer tok-123",
        "Content-Type": "application/json",
      })
    );
  });

  it("omits the authorization header without a token", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({}));
    const client = new ApiClient("http://test.local");

    await client.get("/api/v1/x");

    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(options.headers).not.toHaveProperty("Authorization");
  });

  it("clears the token", async () => {
    mockFetch.mockResolvedValue(jsonResponse({}));
    const client = new ApiClient("http://test.local");
    client.setToken("tok");
    client.clearToken();

    await client.get("/api/v1/x");

    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(options.headers).not.toHaveProperty("Authorization");
  });

  it("serializes the body on POST", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({}));
    const client = new ApiClient("http://test.local");

    await client.post("/api/v1/games", { max_players: 4 });

    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(options.method).toBe("POST");
    expect(options.body).toBe(JSON.stringify({ max_players: 4 }));
  });

  it("sends POST without a body when none is provided", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({}));
    const client = new ApiClient("http://test.local");

    await client.post("/api/v1/games/join");

    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(options.body).toBeUndefined();
  });

  it("supports PUT and DELETE verbs", async () => {
    mockFetch.mockResolvedValue(jsonResponse({}));
    const client = new ApiClient("http://test.local");

    await client.put("/api/v1/x", { a: 1 });
    expect(mockFetch.mock.calls[0][1].method).toBe("PUT");

    await client.delete("/api/v1/x");
    expect(mockFetch.mock.calls[1][1].method).toBe("DELETE");
  });

  it("throws the API detail message on error responses", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ detail: "game not found" }, false, 404));
    const client = new ApiClient("http://test.local");

    await expect(client.get("/api/v1/games/1")).rejects.toThrow("game not found");
  });

  it("falls back to the HTTP status when the body has no detail", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({}, false, 500));
    const client = new ApiClient("http://test.local");

    await expect(client.get("/api/v1/x")).rejects.toThrow("HTTP 500");
  });
});