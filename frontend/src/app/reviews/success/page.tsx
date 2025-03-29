'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const ReviewSuccessPage: React.FC = () => {
  const router = useRouter();
  
  return (
    <div className="container mx-auto px-4 py-20 max-w-lg">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="bg-green-100 text-green-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold mb-4">리뷰가 성공적으로 등록되었습니다!</h1>
        
        <p className="text-gray-600 mb-8">
          소중한 리뷰를 남겨주셔서 감사합니다. 귀하의 리뷰는 다른 고객들의 선택에 큰 도움이 될 것입니다.
        </p>
        
        <div className="flex flex-col space-y-3">
          <Link 
            href="/reviews/my"
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            내 리뷰 목록 보기
          </Link>
          
          <Link 
            href="/quotes"
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            견적 요청 목록으로 이동
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ReviewSuccessPage;