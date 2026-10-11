import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { siteContentJsonSchema } from "@/lib/content/schema";
import type { CallModel } from "./copy";

/** Models that accept the server-side refusal fallback ("fallbacks": "default"). */
const FALLBACK_MODELS = new Set(["claude-opus-5-5", "claude-opus-5", "claude-fable-5-1", "claude-sonnet-5-5"]);

export class ModelError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ModelError";
  }
}

type ContentBlock =
  | { type: "text"; text: string }
  | { type: "image"; source: { type: "base64"; media_type: "image/jpeg" | "image/png" | "image/webp"; data: string } };

export type JsonMessage = { role: "user" | "assistant"; content: string | ContentBlock[] };

/**
 * One Claude request with structured outputs: the reply is JSON in `schema`.
 * Shared by the copywriter and photo placement; maps API failures to
 * ModelError messages an admin can act on.
 */
export async function requestJson(opts: {
  apiKey: string;
  model: string;
  system: string;
  messages: JsonMessage[];
  schema: Record<string, unknown>;
  maxTokens?: number;
}): Promise<string> {
  const client = new Anthropic({ apiKey: opts.apiKey, maxRetries: 2, timeout: 120_000 });
  const useFallbacks = FALLBACK_MODELS.has(opts.model);
  let response;
  try {
    response = await client.beta.messages.create({
      model: opts.model,
      max_tokens: opts.maxTokens ?? 16000,
      system: opts.system,
      messages: opts.messages,
      output_config: { effort: "medium", format: { type: "json_schema", schema: opts.schema } },
      ...(useFallbacks ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const } : {}),
    });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      throw new ModelError("The Anthropic API key was rejected. Check APP_ANTHROPIC_API_KEY (or ANTHROPIC_API_KEY).");
    }
    if (error instanceof Anthropic.NotFoundError) {
      throw new ModelError(`The model "${opts.model}" was not found. Check ANTHROPIC_MODEL.`);
    }
    if (error instanceof Anthropic.RateLimitError) {
      throw new ModelError("Claude is rate limiting requests. The row will be retried.");
    }
    if (error instanceof Anthropic.APIError) {
      throw new ModelError(`Claude request failed (HTTP ${error.status ?? "?"}): ${error.message}`);
    }
    throw error;
  }

  if (response.stop_reason === "refusal") {
    throw new ModelError("Claude declined to write copy for this business.");
  }
  if (response.stop_reason === "max_tokens") {
    throw new ModelError("Claude's reply was cut off before it finished.");
  }
  const text = response.content
    .filter((block): block is Extract<typeof block, { type: "text" }> => block.type === "text")
    .map((block) => block.text)
    .join("");
  if (!text.trim()) throw new ModelError("Claude returned an empty reply.");
  return text;
}

/**
 * Calls Claude with structured outputs so the reply is JSON in the site-copy
 * shape. Length limits and the no-HTML rule are checked afterwards by Zod.
 */
export function createAnthropicCaller(apiKey: string, model: string): CallModel {
  return (messages, system) =>
    requestJson({
      apiKey,
      model,
      system,
      messages,
      schema: siteContentJsonSchema as unknown as Record<string, unknown>,
    });
}
