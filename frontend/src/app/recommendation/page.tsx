// frontend/src/app/recommendation/page.tsx
// AI 미용 스타일 추천 페이지 컴포넌트
// TensorFlow.js와 OpenCV.js를 활용한 반려동물 미용 스타일 추천 시스템을 표시합니다.

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
// PetStyleRecommendation 컴포넌트를 동적으로 import하여 서버사이드 렌더링 방지
import dynamic from 'next/dynamic';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';

// PetStyleRecommendation 컴포넌트를 클라이언트 사이드에서만 로드하도록 설정
// 이렇게 하면 OpenCV.js가 서버에서 로드되지 않아 "IntVector" 등록 충돌 문제 방지
const PetStyleRecommendation = dynamic(
  () => import('@/components/ai/PetStyleRecommendation'),
  { ssr: false } // 서버 사이드 렌더링 비활성화
);

// 미용 스타일 타입 정의
interface GroomingStyle {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  confidence: number;
  petType: 'DOG' | 'CAT';
}

export default function RecommendationPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  
  // 상태 관리
  const [selectedStyle, setSelectedStyle] = useState<GroomingStyle | null>(null);
  const [showStyleDetails, setShowStyleDetails] = useState<boolean>(false);
  const [popularStyles, setPopularStyles] = useState<Array<Partial<GroomingStyle>>>([]);
  
  // 인기 스타일 데이터 가져오기 (실제로는 API 호출을 통해 가져옴)
  useEffect(() => {
    // 인기 스타일 샘플 데이터
    const samplePopularStyles: Partial<GroomingStyle>[] = [
      {
        id: 'teddy-bear-cut',
        name: '테디베어 컷',
        description: '둥글고 푹신한 외형으로 테디베어와 같은 모습을 연출하는 스타일입니다.',
        imageUrl: '/images/styles/teddy-bear-cut.jpg',
        petType: 'DOG' as 'DOG'
      },
      {
        id: 'korean-cut',
        name: '코리안 컷',
        description: '한국에서 인기 있는 스타일로, 얼굴은 둥글게 다듬고 몸통은 짧게 정리하는 스타일입니다.',
        imageUrl: '/images/styles/korean-cut.jpg',
        petType: 'DOG' as 'DOG'
      },
      {
        id: 'lion-cut-cat',
        name: '라이언 컷 (고양이)',
        description: '몸통의 털은 짧게 깎고 머리, 목, 발끝의 털은 남겨두어 사자와 같은 모습을 연출하는 스타일입니다.',
        imageUrl: '/images/styles/lion-cut-cat.jpg',
        petType: 'CAT' as 'CAT'
      }
    ];
    
    setPopularStyles(samplePopularStyles);
  }, []);

  // AI 추천 스타일 선택 핸들러
  const handleStyleSelect = (style: GroomingStyle) => {
    setSelectedStyle(style);
    setShowStyleDetails(true);
    
    // 화면을 스타일 상세 섹션으로 스크롤
    setTimeout(() => {
      const detailsSection = document.getElementById('style-details');
      if (detailsSection) {
        detailsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // 견적 요청 페이지로 이동하는 핸들러
  const handleRequestQuotation = () => {
    if (!isAuthenticated) {
      // 로그인이 필요한 경우 로그인 페이지로 리디렉션
      router.push(`/login?redirect=/quotation/new&style=${selectedStyle?.id}`);
      return;
    }
    
    // 견적 요청 페이지로 이동하며 선택한 스타일 정보 전달
    if (selectedStyle) {
      try {
        // 세션 스토리지에 스타일 정보 저장
        sessionStorage.setItem('recommendedStyle', JSON.stringify(selectedStyle));
        
        // 견적 요청 페이지로 이동
        router.push(`/quotation/new?style=${selectedStyle.id}&pet_type=${selectedStyle.petType}`);
      } catch (error) {
        console.error('스타일 정보 저장 오류:', error);
        // 오류 발생 시에도 기본 페이지로는 이동
        router.push('/quotation/new');
      }
    } else {
      // 스타일 미선택 시 기본 견적 요청 페이지로 이동
      router.push('/quotation/new');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8" style={{ maxWidth: '960px' }}>
        <h1 className="text-3xl font-bold mb-6">AI 반려동물 미용 스타일 추천</h1>
        
        {/* 안내 문구 */}
        <div className="bg-blue-50 rounded-lg p-4 mb-8 border border-blue-200">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">AI 추천 시스템 이용 안내</h2>
          <p className="text-blue-700">
            반려동물의 사진을 업로드하면 AI가 최적의 미용 스타일을 추천해드립니다. 
            반려동물의 품종, 털 상태, 얼굴형 등을 분석하여 가장 어울리는 미용 스타일을 제안합니다.
          </p>
        </div>
        
        {/* AI 추천 컴포넌트 - 에러 방지를 위해 try-catch로 감싸기 */}
        <div className="mb-8">
          {/* 클라이언트 사이드에서만 렌더링되도록 동적으로 import된 컴포넌트 */}
          <PetStyleRecommendation onSelectStyle={handleStyleSelect} />
        </div>
        
        {/* 선택된 스타일 상세 정보 */}
        {showStyleDetails && selectedStyle && (
          <div id="style-details" className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              {selectedStyle.name} <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full ml-2">
                {Math.round(selectedStyle.confidence * 100)}% 매치
              </span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 스타일 이미지 */}
              <div className="w-full h-64 bg-gray-200 rounded-md flex items-center justify-center">
                {/* 실제 이미지가 있으면 표시, 없으면 플레이스홀더 */}
                <span className="text-gray-500">스타일 이미지</span>
              </div>
              
              {/* 스타일 설명 */}
              <div>
                <p className="text-gray-700 mb-4">{selectedStyle.description}</p>
                
                <h3 className="font-medium mb-2">이런 반려동물에게 추천해요</h3>
                <ul className="list-disc pl-5 mb-4 text-gray-600">
                  <li>중소형견 또는 장모종 고양이</li>
                  <li>정기적인 미용 관리가 필요한 반려동물</li>
                  <li>털 엉킴이 자주 발생하는 경우</li>
                </ul>
                
                <h3 className="font-medium mb-2">관리 난이도</h3>
                <div className="flex items-center mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${selectedStyle.id === 'teddy-bear-cut' ? '60%' : '40%'}` }}></div>
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    {selectedStyle.id === 'teddy-bear-cut' ? '보통' : '쉬움'}
                  </span>
                </div>
                
                <button 
                  onClick={handleRequestQuotation}
                  className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  이 스타일로 견적 요청하기
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* 인기 스타일 섹션 */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">인기 미용 스타일</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {popularStyles.map((style) => (
              <div key={style.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition">
                {/* 스타일 이미지 (실제 이미지로 대체 필요) */}
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">{style.name} 이미지</span>
                </div>
                
                <div className="p-4">
                  <h3 className="font-medium mb-2">{style.name}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{style.description}</p>
                  
                  <div className="flex items-center text-xs text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded-full">
                      {style.petType === 'DOG' ? '강아지' : '고양이'}
                    </span>
                    <span className="ml-2 bg-gray-100 px-2 py-1 rounded-full">인기 스타일</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* AI 기술 설명 섹션 */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">털고고 AI 미용 추천 기술</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">TensorFlow.js 기반 분석</h3>
              <p className="text-gray-600 mb-4">
                반려동물의 품종, 털 상태, 얼굴형 등을 분석하여 최적의 미용 스타일을 추천합니다.
                머신러닝 모델을 통해 지속적으로 학습하며 더 정확한 추천을 제공합니다.
              </p>
              
              <h3 className="font-medium mb-2">OpenCV.js 이미지 처리</h3>
              <p className="text-gray-600">
                이미지 처리 기술을 활용하여 반려동물의 특징을 정확하게 파악하고,
                털 밀도, 길이, 색상 등을 고려한 맞춤형 스타일 추천을 제공합니다.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">왜 AI 추천이 필요한가요?</h3>
              <p className="text-gray-600 mb-4">
                반려동물의 품종, 털 질감, 생활 환경 등에 따라 적합한 미용 스타일이 달라집니다.
                AI 추천을 통해 반려동물의 특성에 맞는 최적의 미용 스타일을 찾아보세요.
              </p>
              
              <h3 className="font-medium mb-2">맞춤형 케어 가이드</h3>
              <p className="text-gray-600">
                추천받은 스타일에 대한 관리 방법과 주기, 홈케어 팁 등을 함께 제공받으실 수 있습니다.
                정기적인 미용 관리로 반려동물의 건강과 아름다움을 유지하세요.
              </p>
            </div>
          </div>
        </div>
        
        {/* CTA 섹션 */}
        <div className="mt-12 bg-blue-600 rounded-lg shadow-md p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">지금 바로 AI 미용 스타일 추천받기</h2>
          <p className="mb-6">
            소중한 반려동물에게 가장 잘 어울리는 미용 스타일을 찾아보세요.
            전문 미용사의 견적과 함께 맞춤형 미용 서비스를 경험하실 수 있습니다.
          </p>
          
          <button 
            onClick={() => {
              // 페이지 상단의 AI 추천 컴포넌트로 스크롤
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-6 py-3 bg-white text-blue-600 rounded-md hover:bg-blue-50 transition font-medium"
          >
            AI 추천 시작하기
          </button>
        </div>
      </div>
    </main>
  );
}