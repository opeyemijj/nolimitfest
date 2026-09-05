import { MetadataRoute } from "next";
import { festivalEvents } from "@/data/events";
import { siteConfig } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url;

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/lineup`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/vip`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/experience`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/info`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.75,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  const dynamicRoutes: MetadataRoute.Sitemap = festivalEvents.map((evt) => ({
    url: `${baseUrl}/events/${evt.slug}`,
    lastModified: new Date(),
    changeFrequency: evt.isCurrentEdition ? "daily" : "weekly",
    priority: evt.isCurrentEdition ? 0.95 : evt.status === "waitlist" ? 0.85 : 0.75,
  }));

  return [...staticRoutes, ...dynamicRoutes];
}
