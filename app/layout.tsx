import type { Metadata } from "next";
import "./globals.css";
import "./services/services.css";
import "./auth.css";
export const metadata: Metadata={title:"BOOKING — Service Booking",description:"Book everyday services easily."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="rw"><body>{children}</body></html>}