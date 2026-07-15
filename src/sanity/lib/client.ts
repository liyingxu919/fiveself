import { createClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "penxmsws",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2025-07-02",
  useCdn: false,
  timeout: 10000,
});

// Stega-enabled client for visual editing / Presentation tool
export const stegaClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "penxmsws",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2025-07-02",
  useCdn: false,
  timeout: 10000,
  stega: {
    enabled: true,
    studioUrl: "http://localhost:3333",
  },
});

const builder = createImageUrlBuilder(client);

export function urlFor(source: Parameters<typeof builder.image>[0]): string {
  return builder.image(source).auto("format").quality(85).url();
}
