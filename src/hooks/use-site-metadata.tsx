// use-site-metadata.tsx
import { useState, useEffect } from "react";

const initialSiteMetadata = {
  siteTitle: "Ai Project Planner",
  siteDescription: "A simple project planner for AI projects",
  siteUrl: "https://planning-platform-two.vercel.app",
  siteImage: "/site-image.png",
};

export function useSiteMetadata() {
  const [siteMetadata, setSiteMetadata] = useState(initialSiteMetadata);

  useEffect(() => {
    async function fetchSiteMetadata() {
      const response = await fetch("/site-metadata.json");
      const data = await response.json();
      setSiteMetadata(data);
    }

    fetchSiteMetadata();
  }, []);

  return siteMetadata;
}
