import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Providers } from "@/components/providers";
import { apiSafe } from "@/lib/api.server";
import type { ContactSettings } from "@/types/contact";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Riya — Pure Goodness for Every Kitchen",
  description: "Quality cooking oils made for everyday kitchens.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const contact = await apiSafe<ContactSettings | null>("/content/contact", null);

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${outfit.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer contact={contact.data} />
        </Providers>
      </body>
    </html>
  );
}
