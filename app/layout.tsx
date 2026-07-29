import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RuralBank DataNavigator｜农商数据领航员",
  description:
    "基于大模型与NL2SQL的银行业智能问数系统演示，覆盖智能问数、分级权限、管理审批、指标治理、安全评测与审计。",
  openGraph: {
    title: "RuralBank DataNavigator｜农商数据领航员",
    description: "让每一次问数，都有口径、有依据、可追溯。",
    type: "website",
    url: "https://xinxin825.github.io/RuralBankDataNavigator_demo/",
    images: [
      {
        url: "https://raw.githubusercontent.com/xinxin825/RuralBankDataNavigator_demo/main/public/og.png",
        width: 1536,
        height: 864,
        alt: "RuralBank DataNavigator 农商数据领航员",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RuralBank DataNavigator｜农商数据领航员",
    description: "让每一次问数，都有口径、有依据、可追溯。",
    images: [
      "https://raw.githubusercontent.com/xinxin825/RuralBankDataNavigator_demo/main/public/og.png",
    ],
  },
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
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
