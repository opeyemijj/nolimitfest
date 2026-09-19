import { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/admin"],
      },
      {
        userAgent: ["Googlebot", "Bingbot", "Applebot", "DuckDuckBot"],
        allow: "/",
        disallow: ["/api/", "/admin/", "/admin"],
      },
      {
        userAgent: [
          "Twitterbot",
          "facebookexternalhit",
          "WhatsApp",
          "LinkedInBot",
          "TelegramBot",
        ],
        allow: "/",
        disallow: ["/api/", "/admin/", "/admin"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
