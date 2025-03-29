// 메인 랜딩 페이지

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import EnhancedKakaoMap from '@/components/map/EnhancedKakaoMap';
import Navbar from '@/components/layout/Navbar';
import AddToHomeScreen from '@/components/AddToHomeScreen';
import Footer from '@/components/layout/Footer';
import BeforeAfterReviewSlider from '@/components/slider/BeforeAfterReviewSlider';

// 서비스 유형 정의
const serviceTypes = [
  { id: 'dog', name: '반려견 미용', icon: '/icons/dog.svg' },
  { id: 'cat', name: '반려묘 미용', icon: '/icons/cat.svg' },
  { id: 'special', name: '스페셜 케어', icon: '/icons/special.svg' },
  { id: 'bath', name: '목욕/위생', icon: '/icons/bath.svg' }
];

// 서비스 이용 단계 정의
const serviceSteps = [
  {
    title: '위치 선택 및 서비스 요청',
    description: '원하시는 위치를 선택하고 반려동물에게 필요한 미용 서비스를 요청해주세요.',
    icon: '/icons/map-pin.svg',
  },
  {
    title: '다양한 견적 비교',
    description: '주변 펫 미용업체들이 제안한 견적을 한눈에 비교해보세요.',
    icon: '/icons/compare.svg',
  },
  {
    title: '마음에 드는 업체 선택',
    description: '가격, 리뷰, 포트폴리오를 보고 반려동물에게 맞는 업체를 선택하세요.',
    icon: '/icons/select.svg',
  },
  {
    title: '채팅으로 세부사항 조율',
    description: '예약 확정 후 업체와 1:1 채팅으로 반려동물의 특성이나 요구사항을 상담할 수 있어요.',
    icon: '/icons/chat.svg',
  },
];

// 주요 서비스 기능 정의
const mainFeatures = [
  {
    title: '지도 기능',
    description: '카카오 지도 API를 활용한 위치 기반 서비스',
    link: '/map',
    icon: '🗺️'
  },
  {
    title: 'AI 추천',
    description: 'TensorFlow.js를 활용한 개인화된 추천 시스템',
    link: '/recommendation',
    icon: '🤖'
  },
  {
    title: '결제 시스템',
    description: 'Toss, KakaoPay 등을 활용한 간편결제',
    link: '/payment',
    icon: '💳'
  },
  {
    title: '푸시알림',
    description: '카카오톡 푸시알림 연동',
    link: '#',
    icon: '🔔'
  }
];

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const [userCoords, setUserCoords] = useState({ lat: 37.566826, lng: 126.9786567 }); // 기본 서울시청
  const [isPwaReady, setIsPwaReady] = useState(false);
  
  // 사용자 위치 정보 가져오기
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('위치 정보를 가져오는데 실패했습니다:', error);
        }
      );
    }
    
    // PWA 컴포넌트는 클라이언트 사이드에서만 렌더링
    setIsPwaReady(true);
  }, []);
  
  // 서비스 선택 핸들러
  const handleServiceSelect = (serviceId: string) => {
    if (isAuthenticated) {
      // 로그인 상태면 견적 요청 페이지로 이동
      router.push(`/quotation/new?service=${serviceId}`);
    } else {
      // 비로그인 상태면 로그인 페이지로 이동
      router.push(`/login?redirect=/quotation/new&service=${serviceId}`);
    }
  };

  // 견적 요청 핸들러 (로그인 상태 확인 추가)
  const handleQuotationRequest = () => {
    if (isAuthenticated) {
      router.push('/quotation/new');
    } else {
      router.push('/login?redirect=/quotation/new');
    }
  };

  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* 홈 화면에 추가 컴포넌트 (클라이언트 사이드에서만 렌더링) */}
      {isPwaReady && <AddToHomeScreen />}
      
      {/* 히어로 섹션 */}
      <section className="relative min-h-[70vh] flex items-center">
        {/* 배경 이미지 */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white opacity-90"></div>
          <Image
            src="/images/pet-grooming-hero.jpg"
            alt="반려동물 미용 서비스 배경 이미지"
            layout="fill"
            objectFit="cover"
            priority
          />
        </div>
        
        {/* 히어로 콘텐츠 */}
        <div className="container mx-auto px-4 z-10 relative" style={{ maxWidth: '500px' }}>
          <div className="w-full">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              내 주변 반려동물 미용 서비스, 간편하게 견적받고 예약하세요
            </h1>
            
            {/* 로그인 상태에 따른 콘텐츠 */}
            {loading ? (
              <p className="text-gray-600 mb-6">로딩 중...</p>
            ) : isAuthenticated ? (
              <div className="mb-6">
                <p className="text-lg text-gray-600 mb-2">
                  환영합니다, <span className="font-semibold">{user?.name || '고객'}</span>님!
                </p>
                <p className="text-gray-600">
                  소중한 반려동물을 위한 미용 서비스를 시작해보세요.
                </p>
              </div>
            ) : (
              <p className="text-lg text-gray-600 mb-6">
                소중한 반려동물에게 가장 편안한 미용 경험을 선사해 드립니다.
              </p>
            )}
            
            <div className="flex flex-col gap-3">
              <Link href="/quotation/new" className="w-full">
                <button className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition text-lg">
                  견적 요청하기
                </button>
              </Link>
              {!isAuthenticated && (
                <div className="flex gap-3">
                  <Link href="/login" className="w-1/2">
                    <button className="w-full py-4 bg-white hover:bg-gray-100 text-gray-800 font-medium rounded-lg border border-gray-300 transition">
                      로그인
                    </button>
                  </Link>
                  <Link href="/signup" className="w-1/2">
                    <button className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg border border-gray-300 transition">
                      회원가입
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* 나머지 섹션들은 변경 없음 */}
      {/* 주요 기능 섹션 */}
      <section className="py-12 bg-white">
        {/* 내용 유지 */}
        <div className="container mx-auto px-4" style={{ maxWidth: '500px' }}>
          <h2 className="text-2xl font-bold text-center mb-8">주요 서비스 기능</h2>
          
          <div className="grid grid-cols-1 gap-4">
            {mainFeatures.map((feature, index) => (
              <Link 
                key={index} 
                href={feature.link}
                className="bg-gray-50 hover:bg-gray-100 rounded-xl p-5 shadow-sm transition flex items-center"
              >
                <div className="text-3xl mr-4">{feature.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* 기존 코드 계속 유지... */}
      
      {/* 서비스 유형 선택 섹션 */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4" style={{ maxWidth: '500px' }}>
          <h2 className="text-2xl font-bold text-center mb-4">반려동물을 위한 어떤 미용 서비스를 찾으시나요?</h2>
          <p className="text-gray-600 text-center mx-auto mb-8">
            원하시는 서비스 유형을 선택하시면 소중한 반려동물에게 맞는 맞춤형 견적을 받아보실 수 있습니다.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            {serviceTypes.map((service) => (
              <button
                key={service.id}
                className="bg-white rounded-xl shadow-sm p-4 text-center hover:shadow-md transition cursor-pointer h-full flex flex-col items-center justify-center"
                onClick={() => handleServiceSelect(service.id)}
              >
                <div className="w-12 h-12 mx-auto mb-3 relative">
                  <Image
                    src={service.icon}
                    alt={service.name}
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <h3 className="text-base font-medium">{service.name}</h3>
              </button>
            ))}
          </div>
        </div>
      </section>
      
      {/* 지도 미리보기 섹션 */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4" style={{ maxWidth: '500px' }}>
          <h2 className="text-2xl font-bold mb-4 text-center">내 주변 반려동물 미용업체</h2>
          <p className="text-gray-600 mb-6 text-center">
            현재 위치 기준으로 주변의 펫 미용 전문샵들을 살펴보세요.
          </p>
          
          <div className="rounded-lg overflow-hidden shadow-lg mb-6 h-64">
            <EnhancedKakaoMap
              initialLatitude={userCoords.lat}
              initialLongitude={userCoords.lng}
              height="100%"
            />
          </div>
          
          <Link href="/quotation/new">
            <button className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition text-lg">
              견적 요청하러 가기
            </button>
          </Link>
        </div>
      </section>

      {/* 미용 전/후 리뷰 슬라이더 섹션 */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4" style={{ maxWidth: '900px' }}>
          <BeforeAfterReviewSlider />
        </div>
      </section>
      
      {/* 서비스 이용 단계 섹션 */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4" style={{ maxWidth: '500px' }}>
          <h2 className="text-2xl font-bold text-center mb-8">서비스 이용 방법</h2>
          
          <div className="space-y-4">
            {serviceSteps.map((step, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-start">
                  <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center text-blue-700 font-bold text-lg shrink-0 mt-1">
                    {index + 1}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold mb-1">{step.title}</h3>
                    <p className="text-gray-600 text-sm">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* 사용자 유형별 섹션 */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4" style={{ maxWidth: '500px' }}>
          <div className="space-y-4">
            {/* 반려동물 보호자용 */}
            <div className="bg-blue-50 rounded-xl p-6 text-center">
              <h3 className="text-xl font-bold mb-3">반려동물 미용 서비스를 찾고 계신가요?</h3>
              <p className="text-gray-600 mb-4">
                소중한 반려동물을 위한 미용 서비스 견적을 간편하게 받아보세요.
              </p>
              <Link href="/quotation/new">
                <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition">
                  견적 요청하기
                </button>
              </Link>
            </div>
            
            {/* 펫 미용샵용 */}
            <div className="bg-purple-50 rounded-xl p-6 text-center">
              <h3 className="text-xl font-bold mb-3">반려동물 미용업체이신가요?</h3>
              <p className="text-gray-600 mb-4">
                새로운 반려동물 고객을 만나고 비즈니스를 성장시킬 기회입니다. 
              </p>
              <Link href="/business/register">
                <button className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition">
                  업체 등록하기
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* 통계 섹션 */}
      <section className="py-10 bg-gray-800 text-white">
        <div className="container mx-auto px-4" style={{ maxWidth: '500px' }}>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-gray-700 p-4 rounded-lg">
              <p className="text-3xl font-bold mb-1">1,000+</p>
              <p className="text-sm text-gray-300">등록된 펫샵</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <p className="text-3xl font-bold mb-1">5,000+</p>
              <p className="text-sm text-gray-300">성사된 미용 예약</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <p className="text-3xl font-bold mb-1">95%</p>
              <p className="text-sm text-gray-300">반려동물 만족도</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <p className="text-3xl font-bold mb-1">30+</p>
              <p className="text-sm text-gray-300">서비스 지역</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA 섹션 */}
      <section className="py-10 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center" style={{ maxWidth: '500px' }}>
          <h2 className="text-2xl font-bold mb-4">지금 바로 시작해보세요</h2>
          <p className="text-lg mb-6 mx-auto">
            소중한 반려동물에게 가장 적합한 미용 서비스를 찾아보세요.
          </p>
          <Link href="/quotation/new">
            <button className="w-full py-4 bg-white text-blue-600 hover:bg-blue-50 font-medium rounded-lg transition text-lg">
              견적 요청하기
            </button>
          </Link>
        </div>
      </section>
    </main>
  );
}