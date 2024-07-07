import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/home"].map((route) => ({
    url: `https://story-node.com${route}`,
    lastModified: new Date(),
  }));

  return [...routes];
}
