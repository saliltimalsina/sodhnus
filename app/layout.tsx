import type { Metadata, Viewport } from "next";
import { Inter, Newsreader, Noto_Sans_Devanagari, Noto_Serif_Devanagari } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", axes: ["opsz"] });
const newsreader = Newsreader({ subsets: ["latin"], variable: "--font-newsreader", axes: ["opsz"] });
const notoSansDev = Noto_Sans_Devanagari({ subsets: ["devanagari"], variable: "--font-noto-sans-dev" });
const notoSerifDev = Noto_Serif_Devanagari({ subsets: ["devanagari"], variable: "--font-noto-serif-dev" });

export const metadata: Metadata = {
  title: "Sodhnus — Ask anything about government in Nepal",
  description:
    "Ask in English, Nepali or Roman Nepali and get simple answers from official Government of Nepal sources. An independent service.",
};

export const viewport: Viewport = { themeColor: "#ffffff", viewportFit: "cover" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${newsreader.variable} ${notoSansDev.variable} ${notoSerifDev.variable}`}
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
