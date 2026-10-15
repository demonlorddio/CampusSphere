import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CampusSphere",
    short_name: "CampusSphere",
    description: "A connected home for campus clubs, events, and community.",
    start_url: "/",
    display: "standalone",
    background_color: "#f3f5f1",
    theme_color: "#0d7f78",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
