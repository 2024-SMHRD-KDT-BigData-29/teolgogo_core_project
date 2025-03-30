import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { MainProvider } from '@/context/MainProvider';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Script from 'next/script';
import Footer from '@/components/layout/Footer';
import './globals.css';




// Inter 폰트 설정 (variable 속성 추가)
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: '털고고 | 반려동물 미용 서비스 견적 비교 플랫폼',
  description: '내 주변 반려동물 미용 서비스 견적을 간편하게 받아보고 비교해보세요. 반려견, 반려묘를 위한 다양한 미용 서비스를 한 곳에서.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  themeColor: '#3f51b5',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '털고고',
  },
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
  // 오픈 그래프 태그 추가 (SEO 개선)
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://teolgogo.com',
    siteName: '털고고',
    title: '털고고 | 반려동물 미용 서비스 견적 비교 플랫폼',
    description: '내 주변 반려동물 미용 서비스 견적을 간편하게 받아보고 비교해보세요.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: '털고고 - 반려동물 미용 서비스 견적 비교 플랫폼',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={inter.variable}>
      <head>
        {/* 파비콘 및 기타 메타 태그 */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="stylesheet" href="/css/pwa-styles.css" />
        <meta name="theme-color" content="#3f51b5" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="털고고" />
        
        {/* 초기 테마 적용을 위한 인라인 스크립트 */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                const theme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.classList.toggle('dark', theme === 'dark');
              } catch (e) {}
            })();
          `
        }} />
      </head>
      <body className={`flex flex-col min-h-screen ${inter.className}`}>
        {/* 전체 범위가 제한된 최대 너비 컨테이너 */}
        <div className="w-full max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-6xl 2xl:max-w-7xl mx-auto flex-grow">
          <AuthProvider>
            <ThemeProvider>
              <MainProvider>
                {children}
              </MainProvider>
            </ThemeProvider>
          </AuthProvider>
        </div>
        
        {/* 푸터도 컨테이너로 감싸기 */}
        <div className="w-full max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-6xl 2xl:max-w-7xl mx-auto">
          <Footer />
        </div>
        
        {/* 서비스 워커 등록 스크립트 */}
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/service-worker.js')
                  .then(function(registration) {
                    console.log('서비스 워커 등록 성공:', registration.scope);
                  })
                  .catch(function(err) {
                    console.log('서비스 워커 등록 실패:', err);
                  });
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}