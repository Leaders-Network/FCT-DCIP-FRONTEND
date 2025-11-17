import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthProvider";

//always run npm run lint to heck errors before deployment 
export const metadata: Metadata = {
  title: "FCT-DCIP",
  description: "Created by GladFaith",
  icons: {
    icon: "/logo.svg"
  },
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