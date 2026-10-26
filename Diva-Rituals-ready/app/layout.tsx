import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://diva-rituals-beauty.tania-nikitina74.chatgpt.site"),
  title: "Diva Rituals — косметика та догляд",
  description: "Догляд для обличчя й тіла, декоративна косметика та красиві ритуали на щодень. Концептуальний інтернет-магазин Diva Rituals.",
  openGraph: {
    title: "Diva Rituals — косметика та догляд",
    description: "Догляд для обличчя й тіла, декоративна косметика та красиві ритуали на щодень.",
    images: [{ url: "/og.png", width: 1732, height: 909, alt: "Diva Rituals — Beauty & Self-Care" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Diva Rituals — косметика та догляд",
    description: "Догляд для обличчя й тіла, декоративна косметика та красиві ритуали на щодень.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uk">
      <body>{children}</body>
    </html>
  );
}
