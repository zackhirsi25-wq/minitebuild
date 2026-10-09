import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    // "server-only" throws outside a React Server Components bundle.
    alias: { "server-only": new URL("./tests/server-only-stub.ts", import.meta.url).pathname },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
