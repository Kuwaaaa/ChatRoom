import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WebRTC 一起看视频",
  description: "基于 WebRTC P2P 的实时视频观看室",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
      </body>
    </html>
  );
}
