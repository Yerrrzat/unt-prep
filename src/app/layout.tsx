import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "ҰБТ Информатика", template: "%s · ҰБТ Информатика" },
  description: "Информатика пәнінен ҰБТ-ға дайындық: сынақ нұсқалары, балл және әр тапсырманың талдауы.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1d4ed8",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="kk">
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
