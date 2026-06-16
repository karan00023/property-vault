import type { Metadata } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import "./globals.css";

const sans = Manrope({ subsets: ["latin"], variable: "--font-sans" });
const serif = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "PropertyVault — Building-direct luxury rentals",
  description: "Verified, building-direct luxury rental discovery across New York and Jersey City."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${serif.variable}`}>
        <header className="site-header">
          <Link href="/" className="wordmark" aria-label="PropertyVault home"><span>Property</span>Vault</Link>
          <nav aria-label="Primary navigation">
            <Link href="/">Discover</Link>
            <Link href="/markets">Markets</Link>
            <Link href="/data-standard">Data standard</Link>
            <Link href="/submit">Submit a building</Link>
            <Link href="/admin">Operations</Link>
          </nav>
          <Link href="/submit" className="header-cta">List your building <ArrowUpRight size={15} /></Link>
        </header>
        {children}
        <footer>
          <div><span className="wordmark"><span>Property</span>Vault</span><p>Building-direct. Human-verified.</p></div>
          <div><strong>Coverage</strong><p>Manhattan · Brooklyn · Downtown Jersey City</p></div>
          <div><strong>Trust standard</strong><p>No listing is published without human review.</p></div>
        </footer>
      </body>
    </html>
  );
}
