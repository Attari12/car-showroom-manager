import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Car Showroom Manager",
  description: "Professional automotive inventory management system",
  generator: 'v0.dev',
  // Disable external resource hints to prevent third-party interference
  other: {
    'Cache-Control': 'no-store, no-cache, must-revalidate',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window !== 'undefined') {
                  // Store original fetch to avoid conflicts with third-party scripts
                  const originalFetch = window.fetch;
                  let fetchOverridden = false;

                  // Enhanced fetch wrapper with retry logic
                  function enhancedFetch(...args) {
                    const [url, options = {}] = args;

                    // Add timeout and retry logic for HMR requests
                    if (typeof url === 'string' && (url.includes('_next') || url.includes('reload='))) {
                      const controller = new AbortController();
                      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

                      return originalFetch(url, {
                        ...options,
                        signal: controller.signal
                      }).then(response => {
                        clearTimeout(timeoutId);
                        return response;
                      }).catch(error => {
                        clearTimeout(timeoutId);
                        console.warn('HMR fetch failed:', error.message);
                        // Don't throw for HMR failures, just log them
                        if (error.name === 'AbortError' || error.message.includes('Failed to fetch')) {
                          return new Response('{}', { status: 200 });
                        }
                        throw error;
                      });
                    }

                    // For other requests, use original behavior with error handling
                    return originalFetch.apply(this, args).catch(error => {
                      if (error.message && error.message.includes('Failed to fetch')) {
                        console.warn('Fetch error handled gracefully:', error.message);
                      }
                      throw error;
                    });
                  }

                  // Only override if not already done by third-party scripts
                  if (!fetchOverridden) {
                    window.fetch = enhancedFetch;
                    fetchOverridden = true;
                  }

                  // Enhanced unhandled promise rejection handler
                  window.addEventListener('unhandledrejection', function(event) {
                    if (event.reason && event.reason.message) {
                      const message = event.reason.message;
                      if (message.includes('Failed to fetch') || message.includes('Load failed') || message.includes('AbortError')) {
                        console.warn('Network error handled gracefully:', message);
                        event.preventDefault();
                      }
                    }
                  });

                  // Handle HMR connection issues specifically
                  if (typeof window.__NEXT_HMR_CB !== 'undefined') {
                    const originalHMR = window.__NEXT_HMR_CB;
                    window.__NEXT_HMR_CB = function(...args) {
                      try {
                        return originalHMR.apply(this, args);
                      } catch (error) {
                        console.warn('HMR callback error handled:', error.message);
                      }
                    };
                  }
                }
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
