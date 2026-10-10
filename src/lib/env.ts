import "server-only";

/**
 * Server-side environment access. Values are read lazily so a missing optional
 * key (Anthropic, Google Places) switches that feature to fixtures instead of
 * crashing the app.
 */

function read(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() !== "" ? value.trim() : undefined;
}

function required(name: string): string {
  const value = read(name);
  if (!value) {
    throw new Error(`Missing environment variable ${name}. See .env.example.`);
  }
  return value;
}

export const env = {
  get supabaseUrl() {
    return required("NEXT_PUBLIC_SUPABASE_URL");
  },
  get supabasePublishableKey() {
    return required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  },
  get supabaseSecretKey() {
    return required("SUPABASE_SECRET_KEY");
  },
  get adminEmail() {
    return required("ADMIN_EMAIL").toLowerCase();
  },
  get rootDomain() {
    return required("ROOT_DOMAIN");
  },
  get salesPhone() {
    return read("SALES_PHONE");
  },
  /** APP_ANTHROPIC_API_KEY wins; ANTHROPIC_API_KEY is the fallback. */
  get anthropicApiKey() {
    return read("APP_ANTHROPIC_API_KEY") ?? read("ANTHROPIC_API_KEY");
  },
  /** Model for site copy. Defaults to the current Claude Opus. */
  get anthropicModel() {
    return read("ANTHROPIC_MODEL") ?? "claude-opus-5-5";
  },
  get googlePlacesApiKey() {
    return read("GOOGLE_PLACES_API_KEY");
  },
  get workerSecret() {
    return read("WORKER_SECRET");
  },
  /** Public contact email for the Minitebuild site footer; hidden when unset. */
  get contactEmail() {
    const value = read("CONTACT_EMAIL");
    return value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? value : undefined;
  },
  get isProduction() {
    return process.env.NODE_ENV === "production";
  },
};

export function fixtureModes() {
  return {
    places: !env.googlePlacesApiKey,
    copy: !env.anthropicApiKey,
  };
}
