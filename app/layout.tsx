import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Bloom — Grow daily. Bloom endlessly.",
  description:
    "Your goals, habits, focus, and reflections in one growing garden.",
  icons: { icon: "/favicon.ico" },
  manifest: '/site.webmanifest',
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
