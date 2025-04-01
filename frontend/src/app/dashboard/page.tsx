// app/dashboard/page.tsx
// 대시보드 구현
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// 대시보드 페이지 - 역할에 따라 적절한 대시보드로 리디렉션
export default function DashboardPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // 로딩 중이면 아무것도 하지 않음
    
    if (!isAuthenticated) {
      // 로그인되지 않은 경우 로그인 페이지로 리디렉션
      router.push('/login?redirect=/dashboard');
      return;
    }
    
    if (user) {
      if (user.role === 'BUSINESS') {
        // 업체 회원인 경우 업체 대시보드로 리디렉션
        router.push('/business/quotation/dashboard');
      } else if (user.role === 'CUSTOMER') {
        // 고객인 경우 고객 대시보드로 리디렉션
        router.push('/customer/dashboard');
      }
    }
  }, [isAuthenticated, user, loading, router]);

  // 로딩 중 표시
  return <LoadingSpinner />;
}