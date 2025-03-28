import { AuthProvider } from '@/context/AuthContext';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Script from 'next/script';

// Inter 폰트 설정 (variable 속성 추가)
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: '털고고 | 반려동물 미용 서비스 견적 비교 플랫폼',
  description: '내 주변 반려동물 미용 서비스 견적을 간편하게 받아보고 비교해보세요. 반려견, 반려묘를 위한 다양한 미용 서비스를 한 곳에서.',
  manifest: '/manifest.json',
  themeColor: '#3f51b5',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '털고고',
  },
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
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
      </head>
      <body className={`flex flex-col min-h-screen bg-gray-50 ${inter.className}`}>
  <div className="w-full max-w-screen-sm mx-auto">
    <AuthProvider>
      {/* children에 Navbar가 포함된 페이지도 있으므로 Header는 조건부로 렌더링할 수 있음 */}
      {children}
    </AuthProvider>
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