import { defineConfig } from "vitest/config";

// Kept separate from vite.config.ts so the unit suite doesn't load the AWS
// publish middleware or read .env. Tests cover pure logic only (no DOM, no
// WebGL), so the default Node environment is enough.
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
