import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://ielts-lexicon.phat19061970.chatgpt.site"),
  title: "LexiBloom — IELTS Vocabulary",
  description:
    "Học từ vựng IELTS bằng phát âm, collocation, đồng nghĩa, active recall, trắc nghiệm, tự gõ đáp án, XP và streak.",
  openGraph: {
    title: "LexiBloom — IELTS Vocabulary",
    description: "Learn. Recall. Grow. Học từ, cụm và collocation IELTS như một ứng dụng thực thụ.",
    type: "website",
    locale: "vi_VN",
    url: "https://ielts-lexicon.phat19061970.chatgpt.site",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "LexiBloom — IELTS Vocabulary" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "LexiBloom — IELTS Vocabulary",
    description: "Learn. Recall. Grow. Học từ, cụm và collocation IELTS như một ứng dụng thực thụ.",
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
