import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthProvider";

//always run npm run lint to heck errors before deployment 
import CookieConsent from "@/components/CookieConsent"
import ChatWidget from "@/components/ChatWidget"
import { Toaster} from "sonner"


export const metadata: Metadata = {
  title: "Builders-Liability-AMMC - Digital Claims & Insurance Platform",
  description: "Comprehensive digital platform for managing insurance claims, property surveys, and policy administration for FCT builders.",
  icons: {
    icon: "/logo.svg"
  },
  openGraph: {
    title: "Builders-Liability-AMMC - Digital Claims & Insurance Platform",
    description: "Comprehensive digital platform for managing insurance claims, property surveys, and policy administration for FCT builders.",
    url: "https://www.fctbuilders.gladfaith.com",
    siteName: "Builders-Liability-AMMC",
    images: [
      {
        url: "/logo.svg",
        width: 1200,
        height: 630,
        alt: "Builders-Liability-AMMC Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Builders-Liability-AMMC - Digital Claims & Insurance Platform",
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
        <CookieConsent />
        <ChatWidget />
        <Toaster
          richColors
          position="top-right"
          toastOptions={{
            duration: 4000, // 4s auto-close
            classNames: {
              toast: "rounded-lg shadow-md font-semibold",
              title: "text-base",
              description: "text-sm text-gray-200",
            },
          }}
        />
      </body>


    </html>
  );
}