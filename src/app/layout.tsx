import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthProvider";

//always run npm run lint to heck errors before deployment 
export const metadata: Metadata = {
  title: "FCT-DCIP - Digital Claims & Insurance Platform",
  description: "Comprehensive digital platform for managing insurance claims, property surveys, and policy administration for FCT builders.",
  icons: {
    icon: "/logo.svg"
  },
  openGraph: {
    title: "FCT-DCIP - Digital Claims & Insurance Platform",
    description: "Comprehensive digital platform for managing insurance claims, property surveys, and policy administration for FCT builders.",
    url: "https://www.fctbuilders.gladfaith.com",
    siteName: "FCT-DCIP",
    images: [
      {
        url: "/logo.svg",
        width: 1200,
        height: 630,
        alt: "FCT-DCIP Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FCT-DCIP - Digital Claims & Insurance Platform",
    description: "Comprehensive digital platform for managing insurance claims, property surveys, and policy administration for FCT builders.",
    images: ["/logo.svg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL("https://www.fctbuilders.gladfaith.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>


    </html>
  );
}