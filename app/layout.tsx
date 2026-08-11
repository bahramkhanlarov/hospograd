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
});

// UI/body sans. Swapped from the system-UI stack to Outfit, a geometric
// grotesk that pairs on a contrast axis with the serif above, rather than
// defaulting to Inter.
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ui",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HospoGrad",
  description:
    "HospoGrad is a community for Swiss hotel management students and alumni to discuss housing, insurance, visas, jobs, and school life.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${cormorantGaramond.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
