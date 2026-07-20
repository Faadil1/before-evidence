import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Before Evidence", description: "Register the standard before the evidence." };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html>; }
