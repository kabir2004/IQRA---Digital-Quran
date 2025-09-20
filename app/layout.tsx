import { Inter, Nunito } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { MobileNav } from "@/components/navigation/mobile-nav"
import { AccessibilityProvider } from "@/components/accessibility/accessibility-provider"
import { MetricsProvider } from "@/components/providers/metrics-provider"

const inter = Inter({ subsets: ["latin"] })
const nunito = Nunito({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-nunito"
})

export const metadata = {
  title: "IQRA - Digital Quran",
  description: "Read, search, and reflect on the Holy Quran with translations and pronunciation guides",
  generator: 'Next.js',
  keywords: ['Quran', 'Islam', 'Learning', 'Digital', 'Arabic', 'Translation'],
  authors: [{ name: 'IQRA Team' }],
  creator: 'IQRA Digital Quran',
  publisher: 'IQRA Digital Quran',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://iqra-quran.com'),
  openGraph: {
    title: 'IQRA - Digital Quran',
    description: 'Modern Quran learning platform with advanced features',
    url: 'https://iqra-quran.com',
    siteName: 'IQRA Digital Quran',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'IQRA Digital Quran',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IQRA - Digital Quran',
    description: 'Modern Quran learning platform with advanced features',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${nunito.variable} ${inter.className}`}>
        <MetricsProvider>
          <AccessibilityProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
              {children}
              <MobileNav />
              <Toaster />
            </ThemeProvider>
          </AccessibilityProvider>
        </MetricsProvider>
      </body>
    </html>
  )
}
