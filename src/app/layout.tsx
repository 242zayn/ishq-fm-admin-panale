import Providers from '@/components/layout/providers';
import { Toaster } from '@/components/ui/sonner';
import { fontVariables } from '@/components/themes/font.config';
import { DEFAULT_THEME, THEMES } from '@/components/themes/theme.config';
import ThemeProvider from '@/components/themes/theme-provider';
import { cn } from '@/lib/utils';
import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import Script from 'next/script';
import NextTopLoader from 'nextjs-toploader';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import '../styles/globals.css';

const META_THEME_COLORS = {
  light: '#ffffff',
  dark: '#09090b'
};

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: 'Ishq FM - Admin Dashboard',
    template: '%s | Ishq FM'
  },
  description:
    'Administration dashboard for Ishq FM. Manage stories, chapters, audio, categories, users, and referrals.',
  applicationName: 'Ishq FM Admin',
  authors: [{ name: 'Ishq FM Team' }],
  creator: 'Ishq FM',
  publisher: 'Ishq FM',
  keywords: [
    'Ishq FM',
    'Admin Dashboard',
    'Stories',
    'Audio Stories',
    'Podcasts',
    'Content Management System'
  ],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/images/ishq-fm-logo.png', type: 'image/png' }
    ],
    shortcut: '/favicon.ico',
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }]
  },
  openGraph: {
    title: 'Ishq FM - Admin Dashboard',
    description:
      'Administration dashboard for Ishq FM. Manage stories, chapters, audio, categories, users, and referrals.',
    siteName: 'Ishq FM',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/images/ishq-fm-logo.png',
        width: 1200,
        height: 1200,
        alt: 'Ishq FM Logo'
      }
    ]
  },
  twitter: {
    card: 'summary',
    title: 'Ishq FM - Admin Dashboard',
    description:
      'Administration dashboard for Ishq FM. Manage stories, chapters, audio, categories, users, and referrals.',
    images: ['/images/ishq-fm-logo.png']
  },
  robots: {
    index: false,
    follow: false
  }
};

export const viewport: Viewport = {
  themeColor: META_THEME_COLORS.light
};

type RootLayoutProps = {
  readonly children: React.ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProps) {
  const cookieStore = await cookies();
  const activeThemeValue = cookieStore.get('active_theme')?.value;
  const isValidTheme = THEMES.some((t) => t.value === activeThemeValue);
  const themeToApply = isValidTheme ? activeThemeValue! : DEFAULT_THEME;

  return (
    <html lang='en' suppressHydrationWarning data-theme={themeToApply}>
      <head>
        <Script
          id='theme-color-init'
          strategy='beforeInteractive'
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '${META_THEME_COLORS.dark}')
                }
              } catch (_) {}
            `
          }}
        />
      </head>
      <body
        className={cn(
          'bg-background overflow-x-hidden overscroll-none font-sans antialiased',
          fontVariables
        )}
      >
        <NextTopLoader color='var(--primary)' showSpinner={false} />
        <NuqsAdapter>
          <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
            disableTransitionOnChange
            enableColorScheme
          >
            <Providers activeThemeValue={themeToApply}>
              <Toaster />
              {children}
            </Providers>
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
