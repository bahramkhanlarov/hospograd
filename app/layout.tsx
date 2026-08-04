import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const instrumentSerif = localFont({
  src: [
    { path: "../public/fonts/InstrumentSerif-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/InstrumentSerif-Italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-display",
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
      className={`${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
