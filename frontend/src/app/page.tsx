'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import EnhancedKakaoMap from '@/components/map/EnhancedKakaoMap';
import Navbar from '@/components/layout/Navbar';
import AddToHomeScreen from '@/components/AddToHomeScreen';
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

// 주요 서비스 소개 정의
const mainFeatures = [
  {
    title: '지도 기능',
    description: '카카오 지도 API를 활용한 위치 기반 서비스',
    link: '/map',
    isClickable: true,
    icon: '🗺️',
    details: '현재 위치를 기반으로 주변의 반려동물 미용 서비스를 손쉽게 찾아보세요. 원하는 위치에서 가까운 업체를 지도에서 직접 확인할 수 있습니다.'
  },
  {
    title: 'AI 추천',
    description: 'TensorFlow.js를 활용한 개인화된 추천 시스템',
    link: '/recommendation',
    isClickable: true,
    icon: '🤖',
    details: '인공지능이 반려동물의 품종, 털 길이, 피부 상태 등을 분석하여 가장 적합한 미용 스타일을 추천해 드립니다. 사진만 업로드하면 최적의 스타일을 알려드려요.'
  },
  {
    title: '결제 시스템',
    description: 'Toss, KakaoPay 등을 활용한 간편결제',
    isClickable: false,
    icon: '💳',
    details: '안전하고 편리한 온라인 결제 시스템을 제공합니다. 토스페이먼츠와 카카오페이를 지원하여 원하는 방식으로 간편하게 결제할 수 있습니다. 결제 내역도 언제든지 확인 가능합니다.'
  },
  {
    title: '푸시알림',
    description: '카카오톡 푸시알림 연동',
    isClickable: false,
    icon: '🔔',
    details: '견적 요청, 견적 제안, 예약 확정 등 중요한 알림을 카카오톡으로 바로 받아볼 수 있습니다. 언제 어디서든 중요한 소식을 놓치지 않고 확인하세요!'
  }
];

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, loading } = useAuth();
  const { theme } = useTheme();
  const [userCoords, setUserCoords] = useState({ lat: 37.566826, lng: 126.9786567 }); // 기본 서울시청
  const [isPwaReady, setIsPwaReady] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  
  // 섹션 레퍼런스
  const mapRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);
  
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
  
  // URL 파라미터로 특정 섹션으로 스크롤
  useEffect(() => {
    const section = searchParams.get('section');
    if (section) {
      scrollToSection(section);
    }
  }, [searchParams]);
  
  // 특정 섹션으로 스크롤하는 함수
  const scrollToSection = (sectionId: string) => {
    let targetRef;
    
    switch(sectionId) {
      case 'map':
        targetRef = mapRef;
        break;
      case 'reviews':
        targetRef = reviewsRef;
        break;
      default:
        return;
    }
    
    if (targetRef && targetRef.current) {
      targetRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };
  
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
      <Navbar scrollToSection={scrollToSection} />
      
      {/* 홈 화면에 추가 컴포넌트 (클라이언트 사이드에서만 렌더링) */}
      {isPwaReady && <AddToHomeScreen />}
      
      {/* 히어로 섹션 */}
      <section className="relative min-h-[70vh] flex items-center">
        {/* 배경 이미지 */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white dark:to-gray-900 opacity-90"></div>
          <Image
            src="/images/pet-grooming-hero.jpg"
            alt="반려동물 미용 서비스 배경 이미지"
            layout="fill"
            objectFit="cover"
            priority
          />
        </div>
        
        {/* 히어로 콘텐츠 - 반응형 컨테이너 적용 */}
        <div className="w-full max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-4 relative z-10">
          <div className="w-full max-w-lg">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
              내 주변 반려동물 미용 서비스, 간편하게 견적받고 예약하세요
            </h1>
            
            {/* 로그인 상태에 따른 콘텐츠 */}
            {loading ? (
              <p className="text-gray-600 dark:text-gray-300 mb-6">로딩 중...</p>
            ) : isAuthenticated ? (
              <div className="mb-6">
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
                  환영합니다, <span className="font-semibold">{user?.name || '고객'}</span>님!
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  소중한 반려동물을 위한 미용 서비스를 시작해보세요.
                </p>
              </div>
            ) : (
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                소중한 반려동물에게 가장 편안한 미용 경험을 선사해 드립니다.
              </p>
            )}
            
            <div className="flex flex-col gap-3 sm:flex-row">
              <button 
                onClick={handleQuotationRequest}
                className="w-full sm:w-auto sm:flex-grow py-4 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white font-medium rounded-lg transition text-lg"
              >
                견적 요청하기
              </button>
              {!isAuthenticated && (
                <div className="flex gap-3 w-full sm:w-auto">
                  <Link href="/login" className="w-1/2 sm:w-auto">
                    <button className="w-full py-4 px-6 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium rounded-lg border border-gray-300 dark:border-gray-600 transition">
                      로그인
                    </button>
                  </Link>
                  <Link href="/signup" className="w-1/2 sm:w-auto">
                    <button className="w-full py-4 px-6 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg border border-gray-300 dark:border-gray-600 transition">
                      회원가입
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* 주요 서비스 소개 섹션 - 반응형 컨테이너 적용 */}
      <section className="py-12 bg-white dark:bg-gray-900">
        <div className="w-full max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-800 dark:text-white">주요 서비스 소개</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mainFeatures.map((feature, index) => (
                feature.isClickable ? (
                  <Link 
                    key={index} 
                    href={feature.link || '#'} // 기본값 '#' 제공
                    className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl p-5 shadow-sm transition flex items-center"
                  >
                    <div className="text-3xl mr-4">{feature.icon}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{feature.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">{feature.description}</p>
                    </div>
                  </Link>
                ) : (
                <div 
                  key={index}
                  className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl p-5 shadow-sm transition flex items-center cursor-pointer"
                  onClick={() => setActiveModal(feature.title)}
                >
                  <div className="text-3xl mr-4">{feature.icon}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{feature.description}</p>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      </section>
      
      {/* 서비스 유형 선택 섹션 - 반응형 컨테이너 적용 */}
      <section className="py-12 bg-gray-50 dark:bg-gray-800">
        <div className="w-full max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-4 text-gray-800 dark:text-white">반려동물을 위한 어떤 미용 서비스를 찾으시나요?</h2>
          <p className="text-gray-600 dark:text-gray-300 text-center mx-auto mb-8 max-w-2xl">
            원하시는 서비스 유형을 선택하시면 소중한 반려동물에게 맞는 맞춤형 견적을 받아보실 수 있습니다.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {serviceTypes.map((service) => (
              <button
                key={service.id}
                className="bg-white dark:bg-gray-700 rounded-xl shadow-sm p-4 text-center hover:shadow-md transition cursor-pointer h-full flex flex-col items-center justify-center"
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
                <h3 className="text-base font-medium text-gray-800 dark:text-white">{service.name}</h3>
              </button>
            ))}
          </div>
        </div>
      </section>
      
      {/* 지도 미리보기 섹션 - 반응형 컨테이너 적용 */}
      <section className="py-12 bg-white dark:bg-gray-900" ref={mapRef}>
        <div className="w-full max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-4 text-center text-gray-800 dark:text-white">내 주변 반려동물 미용업체</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
            현재 위치 기준으로 주변의 펫 미용 전문샵들을 살펴보세요.
          </p>
          
          <div className="rounded-lg overflow-hidden shadow-lg mb-6 h-64 sm:h-80 md:h-96">
            <EnhancedKakaoMap
              initialLatitude={userCoords.lat}
              initialLongitude={userCoords.lng}
              height="100%"
            />
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={handleQuotationRequest}
              className="w-full md:w-auto md:px-8 py-4 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white font-medium rounded-lg transition text-lg"
            >
              견적 요청하러 가기
            </button>
          </div>
        </div>
      </section>

      {/* 미용 전/후 리뷰 슬라이더 섹션 - 반응형 컨테이너 적용 */}
      <section className="py-12 bg-gray-50 dark:bg-gray-800" ref={reviewsRef}>
        <div className="w-full max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-4 text-center text-gray-800 dark:text-white">고객님들의 생생한 미용 후기</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
            반려동물들의 변신을 확인해보세요!
          </p>
          <BeforeAfterReviewSlider />
        </div>
      </section>
      
      {/* 서비스 이용 단계 섹션 - 반응형 컨테이너 적용 */}
      <section className="py-12 bg-white dark:bg-gray-900">
        <div className="w-full max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-800 dark:text-white">서비스 이용 방법</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {serviceSteps.map((step, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-xl shadow-sm p-4 h-full">
                <div className="flex items-start md:flex-col md:items-center">
                  <div className="bg-primary-100 dark:bg-primary-800 w-10 h-10 rounded-full flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-lg shrink-0 mt-1 md:mb-4">
                    {index + 1}
                  </div>
                  <div className="ml-4 md:ml-0 md:text-center">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">{step.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* 사용자 유형별 섹션 - 반응형 컨테이너 적용 */}
      <section className="py-12 bg-gray-50 dark:bg-gray-800">
        <div className="w-full max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 반려동물 보호자용 */}
            <div className="bg-primary-50 dark:bg-primary-900 rounded-xl p-6 text-center">
              <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-white">반려동물 미용 서비스를 찾고 계신가요?</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                소중한 반려동물을 위한 미용 서비스 견적을 간편하게 받아보세요.
              </p>
              <button
                onClick={handleQuotationRequest}
                className="w-full sm:w-auto px-6 py-3 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white font-medium rounded-lg transition"
              >
                견적 요청하기
              </button>
            </div>
            
            {/* 펫 미용샵용 */}
            <div className="bg-secondary-50 dark:bg-secondary-900 rounded-xl p-6 text-center">
              <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-white">반려동물 미용업체이신가요?</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                새로운 반려동물 고객을 만나고 비즈니스를 성장시킬 기회입니다. 
              </p>
              <Link href="/signup?type=business">
                <button className="w-full sm:w-auto px-6 py-3 bg-secondary-600 hover:bg-secondary-700 dark:bg-secondary-500 dark:hover:bg-secondary-600 text-white font-medium rounded-lg transition">
                  업체 등록하기
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* 통계 섹션 - 반응형 컨테이너 적용 */}
      <section className="py-10 bg-gray-800 dark:bg-gray-900 text-white">
        <div className="w-full max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-gray-700 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-3xl font-bold mb-1">1,000+</p>
              <p className="text-sm text-gray-300">등록된 펫샵</p>
            </div>
            <div className="bg-gray-700 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-3xl font-bold mb-1">5,000+</p>
              <p className="text-sm text-gray-300">성사된 미용 예약</p>
            </div>
            <div className="bg-gray-700 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-3xl font-bold mb-1">95%</p>
              <p className="text-sm text-gray-300">반려동물 만족도</p>
            </div>
            <div className="bg-gray-700 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-3xl font-bold mb-1">30+</p>
              <p className="text-sm text-gray-300">서비스 지역</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA 섹션 - 반응형 컨테이너 적용 */}
      <section className="py-10 bg-primary-600 dark:bg-primary-700 text-white">
        <div className="w-full max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">다양한 미용 전문가들을 만나보세요</h2>
            <p className="text-lg mb-6 max-w-2xl mx-auto">
              털고고와 함께하는 수준 높은 미용 전문가들의 포트폴리오를 확인해보세요.
            </p>
            <Link href="/businesses">
              <button className="w-full sm:w-auto px-8 py-4 bg-white text-primary-600 hover:bg-primary-50 font-medium rounded-lg transition text-lg">
                입점 업체 둘러보기
              </button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* 모달 팝업 */}
      {activeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                <span className="text-2xl mr-2">
                  {mainFeatures.find(f => f.title === activeModal)?.icon}
                </span>
                {activeModal}
              </h3>
              <button 
                onClick={() => setActiveModal(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {mainFeatures.find(f => f.title === activeModal)?.details}
            </p>
            <button 
              onClick={() => setActiveModal(null)}
              className="w-full py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white rounded-lg transition"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </main>
  );
}