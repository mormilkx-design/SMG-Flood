import type { Metadata } from "next";
import "./globals.css";
import "./print-report.css";
import {companies} from "@/lib/flood";

export const metadata: Metadata = {
  title: `SMG MANUFACTURING CLUB | สถานการณ์น้ำท่วม ${companies.length} บริษัท`,
  description: "Dashboard สถานการณ์น้ำท่วม SMG Manufacturing Club พร้อมรายงานประจำวันและภาพหลักฐาน",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="antialiased">{children}</body>
    </html>
  );
}
