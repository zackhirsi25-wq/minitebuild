import { afterEach, describe, expect, it, vi } from "vitest";
import { env, fixtureModes } from "@/lib/env";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("anthropicApiKey", () => {
  it("prefers APP_ANTHROPIC_API_KEY over ANTHROPIC_API_KEY", () => {
    vi.stubEnv("APP_ANTHROPIC_API_KEY", "app-key");
    vi.stubEnv("ANTHROPIC_API_KEY", "fallback-key");
    expect(env.anthropicApiKey).toBe("app-key");
  });

  it("falls back to ANTHROPIC_API_KEY when APP_ANTHROPIC_API_KEY is unset or blank", () => {
    vi.stubEnv("APP_ANTHROPIC_API_KEY", " ");
    vi.stubEnv("ANTHROPIC_API_KEY", "fallback-key");
    expect(env.anthropicApiKey).toBe("fallback-key");
  });

  it("uses fixture copy when neither is set", () => {
    vi.stubEnv("APP_ANTHROPIC_API_KEY", "");
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    expect(env.anthropicApiKey).toBeUndefined();
    expect(fixtureModes().copy).toBe(true);
  });
});
