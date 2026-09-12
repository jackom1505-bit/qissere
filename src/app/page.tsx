import App from "@/App";
import type { Metadata } from "next";
import { SITE_URL, SITE_TITLE, SITE_DESCRIPTION } from "@/lib/site";
import { INSTAGRAM_URL } from "@/data/seed";

export const metadata: Metadata = {
  alternates: { canonical: SITE_URL },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "Qissare",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "QISSARÉ — The Story That Never Stays Still. Opening 2028." }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/opengraph-image"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "QISSARÉ",
      alternateName: ["Qissare", "Qissare Cafe"],
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      sameAs: [INSTAGRAM_URL],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "Qissare",
      alternateName: "QISSARÉ",
      url: SITE_URL,
      inLanguage: "en-IN",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export default function HomePage() {
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    <App />
  </>;
}
