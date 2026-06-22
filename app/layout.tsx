import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Serena編集室",
  description: "占い・癒し・恋愛コンテンツ AI支援制作ツール",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
