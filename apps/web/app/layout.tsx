import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "CASCADE", description: "CASCADE: semiconductor chip architecture, thermal and yield intelligence platform. All data is synthetic." };
export const viewport: Viewport = { themeColor: "#08090B", width: "device-width", initialScale: 1 };
export default function Root({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
