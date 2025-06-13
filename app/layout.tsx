import { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Službot k službám",
  description: "Prototyp chatbota pro prezentaci výzkumu ze Služeb.Digital",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
