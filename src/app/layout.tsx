import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Football Guy Soundboard",
  description: "A retro 90s football soundboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
