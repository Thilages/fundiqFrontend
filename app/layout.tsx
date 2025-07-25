import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pitch Deck Evaluator",
  description: "AI-powered pitch deck evaluation dashboard",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-screen">
      <body className={inter.className + " h-screen"}>
        <SidebarProvider>
          <div className="flex h-screen">
            <AppSidebar />
            <main className="w-[80vw]">{children}</main>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
