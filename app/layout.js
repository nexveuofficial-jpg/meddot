import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
// Trigger Vercel Rebuild - Verified HTML nesting fixes
import { AuthProvider } from "./context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
import { Toaster } from "sonner";
import { FeatureFlagProvider } from "./context/FeatureFlagContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Meddot | Medical Student Community",
  description: "A comprehensive platform for medical students.",
  icons: {
    icon: '/icon.png',
    shortcut: '/favicon.ico',
    apple: '/icon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <div className="snow-container">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="snowflake"
              style={{
                left: `${(i * 17) % 100}vw`,
                animationDuration: `${(i % 5) + 3}s`,
                animationDelay: `${(i % 5)}s`,
                width: `${(i % 6) + 4}px`,
                height: `${(i % 6) + 4}px`,
                filter: 'blur(1px)'
              }}
            />
          ))}
        </div>
        <AuthProvider>
          <FeatureFlagProvider>
            {children}
            <Toaster position="top-center" richColors />
          </FeatureFlagProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
