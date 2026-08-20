import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ?? "https://ielts-lexicon.phat19061970.chatgpt.site";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "LexiBloom — IELTS Vocabulary",
  description:
    "Học từ vựng IELTS bằng phát âm, collocation, đồng nghĩa, active recall, trắc nghiệm, tự gõ đáp án, XP và streak.",
  openGraph: {
    title: "LexiBloom — IELTS Vocabulary",
    description: "Learn. Recall. Grow. Học từ, cụm và collocation IELTS như một ứng dụng thực thụ.",
    type: "website",
    locale: "vi_VN",
    url: siteUrl,
    images: [{ url: `${basePath}/og.png`, width: 1200, height: 630, alt: "LexiBloom — IELTS Vocabulary" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "LexiBloom — IELTS Vocabulary",
    description: "Learn. Recall. Grow. Học từ, cụm và collocation IELTS như một ứng dụng thực thụ.",
    images: [`${basePath}/og.png`],
  },
  icons: {
    icon: `${basePath}/favicon.svg`,
    shortcut: `${basePath}/favicon.svg`,
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
