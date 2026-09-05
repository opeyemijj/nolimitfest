import { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "No Limit Fest | Global Music & Culture Festival",
    short_name: "No Limit Fest",
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#08090E",
    theme_color: "#FF5722",
    icons: [
      {
        src: "/images/logo.png",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/images/logo.png",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
