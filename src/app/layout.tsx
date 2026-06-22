import type { Metadata } from "next";
import "./globals.css";
import StoreInitializer from "@/components/layout/StoreInitializer";

export const metadata: Metadata = {
  title: "Mailand Cosmetics | Discover Your Glow",
  description:
    "Premium body lotions and sprays crafted for elegance and everyday beauty.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className="antialiased bg-cream text-gray-900">
        <StoreInitializer />
        {children}
      </body>
    </html>
  );
}
