import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Audio Enhancement Demo | Subtractive vs. Generative",
  description: "Compare subtractive AI and generative AI audio enhancement through visual spectrograms and audio playback",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
