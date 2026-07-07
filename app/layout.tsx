import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Captionly',
  description:
    'All in one',
  keywords: 'Anas, Full Stack Developer, React, Django, Web Developer, UI/UX',
  authors: [{ name: 'Anas Puthukkolli' }],
  creator: 'Anas Puthukkolli',
  icons: {
    icon: './images/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex h-screen flex-col  bg-white text-black">
        <Header />

        <main className="flex-1 ">{children}</main>

        <Footer />
      </body>
    </html>
  );
}