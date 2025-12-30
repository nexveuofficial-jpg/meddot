import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
import { FeatureFlagProvider } from "./context/FeatureFlagContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Meddot | Medical Student Community",
  description: "A comprehensive platform for medical students.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <FeatureFlagProvider>
            {children}
          </FeatureFlagProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
