import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dairy Flat Airline Booking System",
  description: "159.352 Assignment 2 airline booking system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
