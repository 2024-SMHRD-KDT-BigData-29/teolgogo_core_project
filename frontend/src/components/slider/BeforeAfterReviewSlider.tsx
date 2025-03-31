// frontend/src/components/slider/BeforeAfterReviewSlider.tsx
// 미용 전/후 사진과 고객 리뷰를 보여주는 슬라이더 컴포넌트

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Star } from 'lucide-react';

// 슬라이더 아이템 타입 정의
interface SliderItem {
  id: string;
  petName: string;
  beforeImageUrl: string;
  afterImageUrl: string;
  review: string;
  rating: number;
  customerName: string;
  serviceDate: string;
}

interface BeforeAfterReviewSliderProps {
  items?: SliderItem[];
  autoplay?: boolean;
  autoplaySpeed?: number;
}

// 샘플 데이터 (실제로는 API에서 가져올 예정)
const sampleItems: SliderItem[] = [
  {
    id: '1',
    petName: '초코',
    beforeImageUrl: '/images/samples/before_1.jpg',
    afterImageUrl: '/images/samples/after_1.jpg',
    review: '전문적인 미용 솜씨에 정말 감동받았어요! 우리 아이가 너무 예뻐졌네요. 다음에도 꼭 방문할게요.',
    rating: 5,
    customerName: '김OO',
    serviceDate: '2024-03-15'
  },
  {
    id: '2',
    petName: '콩이',
    beforeImageUrl: '/images/samples/before_2.jpg',
    afterImageUrl: '/images/samples/after_2.jpg',
    review: '친절하고 세심한 케어에 만족했습니다. 아이도 편안하게 미용을 받은 것 같아요.',
    rating: 4.5,
    customerName: '이OO',
    serviceDate: '2024-03-10'
  },
  {
    id: '3',
    petName: '모모',
    beforeImageUrl: '/images/samples/before_3.jpg',
    afterImageUrl: '/images/samples/after_3.jpg',
    review: '원하는 스타일대로 정확하게 미용해주셔서 너무 좋았어요! 특히 아이가 예민한데도 잘 달래면서 미용해주셔서 감사합니다.',
    rating: 5,
    customerName: '박OO',
    serviceDate: '2024-03-05'
  },
  {
    id: '4',
    petName: '루이',
    beforeImageUrl: '/images/samples/before_4.jpg',
    afterImageUrl: '/images/samples/after_4.jpg',
    review: '매장도 깨끗하고 미용 기술도 좋습니다. 다만 예약 시간보다 조금 기다려야 했어요.',
    rating: 4,
    customerName: '최OO',
    serviceDate: '2024-03-01'
  },
  {
    id: '5',
    petName: '해피',
    beforeImageUrl: '/images/samples/before_5.jpg',
    afterImageUrl: '/images/samples/after_5.jpg',
    review: '정말 꼼꼼하게 미용해주세요! 특히 발톱 관리가 정말 좋았습니다.',
    rating: 5,
    customerName: '정OO',
    serviceDate: '2024-02-25'
  }
];

// 더 많은 샘플 데이터 생성 (총 30개) - Math.random() 사용 제거
const generateMoreSamples = (): SliderItem[] => {
  const moreItems: SliderItem[] = [...sampleItems];
  
  // 고정된 데이터 패턴 사용 (Math.random() 사용하지 않음)
  const ratingPattern = [5, 4.5, 4, 5, 4.5]; // 고정된 패턴으로 별점 지정
  
  for (let i = 6; i <= 30; i++) {
    // 기존 샘플을 기반으로 변형된 데이터 생성
    const baseItem = sampleItems[i % 5];
    moreItems.push({
      id: i.toString(),
      petName: baseItem.petName + (i > 10 ? i.toString() : ''),
      beforeImageUrl: baseItem.beforeImageUrl,
      afterImageUrl: baseItem.afterImageUrl,
      review: baseItem.review + (i > 15 ? ' 정말 만족스러운 서비스였습니다!' : ''),
      rating: ratingPattern[i % 5], // 고정된 패턴의 별점 사용
      customerName: ['김', '이', '박', '최', '정'][i % 5] + 'O' + 'O',
      serviceDate: `2024-${Math.floor(i / 6) + 1}-${Math.max(1, 28 - i % 28)}`
    });
  }
  
  return moreItems;
};

const BeforeAfterReviewSlider: React.FC<BeforeAfterReviewSliderProps> = ({
  items = generateMoreSamples(),
  autoplay = true,
  autoplaySpeed = 5000
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  
  // 자동 재생 효과
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoplay && !isDragging) {
      interval = setInterval(() => {
        nextSlide();
      }, autoplaySpeed);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoplay, autoplaySpeed, isDragging, currentIndex, items.length]);
  
  // 다음 슬라이드로 이동
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    setTranslateX(0);
  };
  
  // 이전 슬라이드로 이동
  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
    setTranslateX(0);
  };
  
  // 터치/마우스 이벤트 핸들러
  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
  };
  
  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    
    const sliderWidth = sliderRef.current?.offsetWidth || 400;
    const diff = clientX - startX;
    const newTranslateX = diff;
    
    // 드래그 거리를 제한 (슬라이더 너비의 50%로 제한)
    if (Math.abs(newTranslateX) < sliderWidth * 0.5) {
      setTranslateX(newTranslateX);
    }
  };
  
  const handleDragEnd = () => {
    if (!isDragging) return;
    
    const threshold = 100; // 슬라이드 전환을 위한 최소 드래그 거리
    
    if (translateX > threshold) {
      prevSlide();
    } else if (translateX < -threshold) {
      nextSlide();
    } else {
      // 드래그 거리가 충분하지 않으면 원래 위치로 복원
      setTranslateX(0);
    }
    
    setIsDragging(false);
  };
  
  // 마우스 이벤트 핸들러
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    handleDragStart(e.clientX);
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    handleDragMove(e.clientX);
  };
  
  const handleMouseUp = () => {
    handleDragEnd();
  };
  
  const handleMouseLeave = () => {
    if (isDragging) {
      handleDragEnd();
    }
  };
  
  // 터치 이벤트 핸들러
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    handleDragStart(e.touches[0].clientX);
  };
  
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    handleDragMove(e.touches[0].clientX);
  };
  
  const handleTouchEnd = () => {
    handleDragEnd();
  };
  
  // 별점 렌더링 함수 (일관성 있는 클래스 사용)
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    // 꽉 찬 별 - 클래스 일관성 유지
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={`full-${i}`} className="text-yellow-400" size={16} />
      );
    }
    
    // 반 별
    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star className="text-yellow-400" size={16} />
          <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
            <Star className="text-yellow-400" size={16} />
          </div>
        </div>
      );
    }
    
    // 빈 별
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="text-yellow-400" size={16} />
      );
    }
    
    return <div className="flex">{stars}</div>;
  };

  return (
    <div className="w-full overflow-hidden">
      <h2 className="text-2xl font-bold text-center mb-6">털고고 고객 리뷰</h2>
      
      <div 
        ref={sliderRef}
        className="relative"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="flex transition-transform duration-300"
          style={{ 
            transform: `translateX(${translateX}px)`,
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
        >
          {items.map((item, index) => (
            <div 
              key={item.id}
              className={`w-full min-w-full px-4 transition-opacity duration-300 ${
                index === currentIndex ? 'opacity-100' : 'opacity-0 absolute'
              }`}
            >
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="md:flex">
                  {/* 미용 전/후 사진 */}
                  <div className="md:w-1/2 p-4">
                    <h3 className="text-lg font-medium mb-2">{item.petName}의 변신</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Before</p>
                        <div className="aspect-square bg-gray-200 rounded-md overflow-hidden relative">
                          {/* 실제 이미지가 있으면 표시, 없으면 플레이스홀더 */}
                          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                            미용 전
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">After</p>
                        <div className="aspect-square bg-gray-200 rounded-md overflow-hidden relative">
                          {/* 실제 이미지가 있으면 표시, 없으면 플레이스홀더 */}
                          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                            미용 후
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 리뷰 및 평점 */}
                  <div className="md:w-1/2 p-4 bg-gray-50">
                    <div className="flex items-center mb-2">
                      {renderStars(item.rating)}
                      <span className="ml-2 text-sm text-gray-600">{item.rating}</span>
                    </div>
                    <p className="text-gray-800 mb-4">"{item.review}"</p>
                    <div className="text-sm text-gray-500">
                      <p>{item.customerName} 고객님</p>
                      <p>서비스 일자: {item.serviceDate}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* 네비게이션 버튼 */}
        <button 
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/60 hover:bg-white/90 rounded-full p-2 shadow-md z-10"
          onClick={(e) => {
            e.stopPropagation();
            prevSlide();
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button 
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/60 hover:bg-white/90 rounded-full p-2 shadow-md z-10"
          onClick={(e) => {
            e.stopPropagation();
            nextSlide();
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* 인디케이터 */}
      <div className="flex justify-center mt-4">
        {items.slice(0, 5).map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 mx-1 rounded-full transition-colors ${
              Math.floor(currentIndex / 6) === Math.floor(index / 6)
                ? 'bg-blue-600'
                : 'bg-gray-300'
            }`}
            onClick={() => {
              setCurrentIndex(index * 6);
              setTranslateX(0);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default BeforeAfterReviewSlider;