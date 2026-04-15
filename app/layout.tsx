import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Team Accec control",
  description: "Role-based access control system"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-black text-white" >{children}</body>
    </html>
  );
}
