import "./globals.css";
import type { Metadata } from "next";
export const metadata:Metadata={title:"AI Decision Flow",description:"Visual AI decision workflow builder"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
