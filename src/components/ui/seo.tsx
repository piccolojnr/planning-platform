// seo.tsx with tailwindcss and shadcn components
import { Helmet } from "react-helmet";
import { useLocation } from "react-router-dom";
import { useSiteMetadata } from "@/hooks/use-site-metadata";

export interface SeoProps {
  title?: string;
  description?: string;
  image?: string;
  article?: boolean;
}

export function Seo({ title, description, image, article }: SeoProps) {
  const { pathname } = useLocation();
  const { siteTitle, siteDescription, siteUrl, siteImage } = useSiteMetadata();

  const seo = {
    title: title || siteTitle,
    description: description || siteDescription,
    image: `${siteUrl}${image || siteImage}`,
    url: `${siteUrl}${pathname}`,
  };

  return (
    <Helmet title={seo.title}>
      <meta name="description" content={seo.description} />
      <meta name="image" content={seo.image} />

      {seo.url && <meta property="og:url" content={seo.url} />}
      {(article ? true : null) && <meta property="og:type" content="article" />}
      {seo.title && <meta property="og:title" content={seo.title} />}
      {seo.description && (
        <meta property="og:description" content={seo.description} />
      )}
      {seo.image && <meta property="og:image" content={seo.image} />}
    </Helmet>
  );
}
