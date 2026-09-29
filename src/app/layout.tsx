import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/components/StoreProvider";
import { PortalProvider } from "@/components/PortalProvider";
import Toast from "@/components/Toast";

export const metadata: Metadata = {
  title: "RAAR — Modern Fashion, Delivered",
  description: "Shop the RAAR collection or become a Virtual Dealer and build your own digital store.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Oswald:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans">
        <StoreProvider>
          <PortalProvider>
            {children}
            <Toast />
          </PortalProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
