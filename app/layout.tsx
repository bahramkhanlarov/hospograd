import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import "./globals.css";

// Display serif for headings/wordmark. Swapped from Instrument Serif (a
// banned AI-default display serif) to Cormorant Garamond, a heritage
// editorial serif that fits a hospitality-school community without reaching
// for the same two fonts every AI-generated site defaults to.
const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
  // Don't preload so the font isn't on the LCP critical path; it loads in its
  // own time and swap-in replaces the fallback (keeps the brand serif without
  // delaying first paint). Fixes PSI "Avoid chaining critical requests".
  preload: false,
});

// UI/body sans. Swapped from the system-UI stack to Outfit, a geometric
// grotesk that pairs on a contrast axis with the serif above, rather than
// defaulting to Inter.
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ui",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://gradnetwork.ch"),
  title: "GradNetwork",
  description:
    "GradNetwork is a community for Swiss hotel management students and alumni to discuss housing, insurance, visas, jobs, and school life.",
  openGraph: {
    siteName: "GradNetwork",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${cormorantGaramond.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://gradnetwork.ch/#organization",
                  name: "GradNetwork",
                  url: "https://gradnetwork.ch",
                  description:
                    "A community for Swiss hospitality-management school students and alumni.",
                },
                {
                  "@type": "WebSite",
                  "@id": "https://gradnetwork.ch/#website",
                  url: "https://gradnetwork.ch",
                  name: "GradNetwork",
                  publisher: { "@id": "https://gradnetwork.ch/#organization" },
                },
              ],
            }),
          }}
        />
        <main className="flex-1">{children}</main>
        <footer className="py-5 text-center text-[0.75rem]">
          <a
            href="https://rivierahost.ch"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#8f6600] transition-colors hover:text-[#6f5000] hover:underline"
          >
            Housing &amp; short-term rentals in Montreux — RivieraHost
          </a>
          <span className="mx-2 text-border">·</span>
          <a
            href="https://khanlogeanalytics.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#8f6600] transition-colors hover:text-[#6f5000] hover:underline"
          >
            Site préparé par Khanlogeanalytics.com
          </a>
        </footer>
      </body>
    </html>
  );
}
