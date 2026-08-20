import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://ielts-lexicon.phat19061970.chatgpt.site"),
  title: "IELTS Lexicon",
  description:
    "Hệ thống học từ vựng IELTS với phát âm, collocation, đồng nghĩa, word family, trắc nghiệm và tự gõ đáp án.",
  openGraph: {
    title: "IELTS Lexicon",
    description: "Words · Phrases · Collocations — một hệ thống từ vựng IELTS kết nối.",
    type: "website",
    locale: "vi_VN",
    url: "https://ielts-lexicon.phat19061970.chatgpt.site",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "IELTS Lexicon — Words, Phrases, Collocations" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "IELTS Lexicon",
    description: "Words · Phrases · Collocations — một hệ thống từ vựng IELTS kết nối.",
    images: ["/og.png"],
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
    <html lang="vi">
      <body className="antialiased">{children}</body>
    </html>
  );
}
