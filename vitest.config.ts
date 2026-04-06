import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/__tests__/**/*.test.ts"],
    // Suppress console output from route handlers and external service mocks
    onConsoleLog() {
      return false;
    },
    coverage: {
      provider: "v8",
      include: ["src/app/api/**", "src/lib/**"],
      exclude: ["src/lib/types/**", "src/lib/supabase/client.ts"],
    },
  },
});
