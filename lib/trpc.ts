import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "@/server/routers";
import { getApiBaseUrl } from "@/constants/oauth";
import * as Auth from "@/lib/_core/auth";
import { encryptionService } from "@/lib/encryption-service";

/**
 * tRPC React client for type-safe API calls.
 *
 * IMPORTANT (tRPC v11): The `transformer` must be inside `httpBatchLink`,
 * NOT at the root createClient level. This ensures client and server
 * use the same serialization format (superjson).
 */
export const trpc = createTRPCReact<AppRouter>();

/**
 * Creates the tRPC client with proper configuration.
 * Call this once in your app's root layout.
 */
export function createTRPCClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: `${getApiBaseUrl()}/api/trpc`,
        // tRPC v11: transformer MUST be inside httpBatchLink, not at root
        transformer: superjson,
        async headers() {
          const token = await Auth.getSessionToken();
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
        // Custom fetch to include credentials and payload encryption
        async fetch(url, options) {
          const modifiedOptions: RequestInit = { 
            ...options, 
            credentials: "include",
            headers: options?.headers ? { ...options.headers } : {}
          };
          
          // Encrypt payload if it's a POST request and has a body
          if (options?.method === "POST" && options.body && typeof options.body === "string") {
            try {
              const encryptedBody = await encryptionService.encrypt(options.body);
              modifiedOptions.body = JSON.stringify({ _enc: encryptedBody });
              (modifiedOptions.headers as Record<string, string>)["X-Content-Encrypted"] = "true";
            } catch (e) {
              console.error("Payload encryption failed", e);
            }
          }
          
          return fetch(url, modifiedOptions);
        }
      }),
    ],
  });
}
