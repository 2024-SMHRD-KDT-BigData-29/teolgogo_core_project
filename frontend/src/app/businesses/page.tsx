'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import ErrorBoundary from '@/components/common/ErrorBoundary';

// 임시 업체 데이터 (실제로는 API에서 가져와야 함)
const MOCK_BUSINESSES = [
  {
    id: 1,
    name: '댕댕이 미용샵',
    businessName: '댕댕이 미용샵',
    description: '10년 경력의 전문가가 운영하는 프리미엄 반려견 미용샵입니다. 소형견 전문.',
    address: '서울시 강남구 역삼동 123-45',
    rating: 4.8,
    reviewCount: 56,
    imageUrl: '/images/business/shop1.jpg',
    specialties: ['소형견', '미용', '스파'],
    completedServices: 245,
  },
  {
    id: 2,
    name: '고양이나라',
    businessName: '고양이나라',
    description: '고양이 전문 미용샵입니다. 스트레스 없는 미용 서비스를 제공합니다.',
    address: '서울시 서초구 서초동 456-78',
    rating: 4.9,
    reviewCount: 42,
    imageUrl: '/images/business/shop2.jpg',
    specialties: ['고양이', '미용', '발톱관리'],
    completedServices: 189,
  },
  {
    id: 3,
    name: '대형견 스페셜리스트',
    businessName: '대형견 스페셜리스트',
    description: '대형견 미용 전문점입니다. 넓은 공간에서 편안하게 미용을 받을 수 있습니다.',
    address: '서울시 송파구 잠실동 789-10',
    rating: 4.7,
    reviewCount: 38,
    imageUrl: '/images/business/shop3.jpg',
    specialties: ['대형견', '목욕', '스타일링'],
    completedServices: 156,
  },
  {
    id: 4,
    name: '펫뷰티살롱',
    businessName: '펫뷰티살롱',
    description: '다양한 스타일링과 컬러링 서비스를 제공하는 펫 미용 전문점입니다.',
    address: '서울시 마포구 합정동 234-56',
    rating: 4.6,
    reviewCount: 29,
    imageUrl: '/images/business/shop4.jpg',
    specialties: ['스타일링', '컬러링', '모든 견종'],
    completedServices: 134,
  },
  {
    id: 5,
    name: '헬로펫 그루밍',
    businessName: '헬로펫 그루밍',
    description: '반려동물 스트레스를 최소화하는 헬로펫 그루밍입니다. 예약제로 운영됩니다.',
    address: '서울시 종로구 종로동 567-89',
    rating: 4.5,
    reviewCount: 24,
    imageUrl: '/images/business/shop5.jpg',
    specialties: ['스트레스 최소화', '특수견', '노령견'],
    completedServices: 98,
  },
];

// 필터 옵션 타입
interface FilterOptions {
  search: string;
  petType: string;
  specialty: string;
  minRating: number;
  sort: 'rating' | 'reviewCount' | 'completedServices';
}

export default function BusinessesPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const [businesses, setBusinesses] = useState(MOCK_BUSINESSES);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 필터 상태
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    petType: 'all',
    specialty: 'all',
    minRating: 0,
    sort: 'rating'
  });
  
  // 페이지 로드 시 데이터 가져오기 (실제로는 API 호출)
  useEffect(() => {
    // 실제 API 구현 시 여기서 업체 목록을 가져옵니다
    const fetchBusinesses = async () => {
      try {
        setIsLoading(true);
        // API 호출 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 목업 데이터로 상태 설정
        setBusinesses(MOCK_BUSINESSES);
        setError(null);
      } catch (err) {
        console.error('업체 목록 로드 실패:', err);
        setError('업체 목록을 불러오는데 실패했습니다. 다시 시도해주세요.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBusinesses();
  }, []);
  
  // 필터링된 업체 목록
  const filteredBusinesses = businesses.filter(business => {
    // 검색어 필터링
    if (filters.search && !business.businessName.toLowerCase().includes(filters.search.toLowerCase()) &&
        !business.description.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    // 펫 타입 필터링
    if (filters.petType !== 'all') {
      const hasMatchingPetType = business.specialties.some(spec => 
        spec.toLowerCase() === filters.petType.toLowerCase() ||
        (filters.petType === 'dog' && (spec.includes('견') || spec.includes('강아지'))) ||
        (filters.petType === 'cat' && (spec.includes('묘') || spec.includes('고양이')))
      );
      
      if (!hasMatchingPetType) return false;
    }
    
    // 특수 서비스 필터링
    if (filters.specialty !== 'all') {
      const hasMatchingSpecialty = business.specialties.some(spec => 
        spec.toLowerCase().includes(filters.specialty.toLowerCase())
      );
      
      if (!hasMatchingSpecialty) return false;
    }
    
    // 최소 평점 필터링
    if (business.rating < filters.minRating) {
      return false;
    }
    
    return true;
  }).sort((a, b) => {
    // 정렬
    switch (filters.sort) {
      case 'rating':
        return b.rating - a.rating;
      case 'reviewCount':
        return b.reviewCount - a.reviewCount;
      case 'completedServices':
        return b.completedServices - a.completedServices;
      default:
        return 0;
    }
  });
  
  // 필터 변경 핸들러
  const handleFilterChange = (name: keyof FilterOptions, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // 검색 폼 제출 핸들러
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 이미 필터링은 실시간으로 적용되므로 여기서는 추가 작업 불필요
  };
  
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8" style={{ maxWidth: '500px' }}>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">입점 업체 목록</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            털고고에 등록된 전문 미용 서비스 업체들을 찾아보세요.
          </p>
          
          {/* 필터 섹션 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
            <form onSubmit={handleSearchSubmit}>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="업체명 또는 서비스 검색"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    반려동물 유형
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    value={filters.petType}
                    onChange={(e) => handleFilterChange('petType', e.target.value)}
                  >
                    <option value="all">모든 유형</option>
                    <option value="dog">강아지</option>
                    <option value="cat">고양이</option>
                    <option value="special">특수동물</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    특수 서비스
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    value={filters.specialty}
                    onChange={(e) => handleFilterChange('specialty', e.target.value)}
                  >
                    <option value="all">모든 서비스</option>
                    <option value="미용">미용</option>
                    <option value="스파">스파</option>
                    <option value="목욕">목욕</option>
                    <option value="스타일링">스타일링</option>
                    <option value="컬러링">컬러링</option>
                    <option value="노령견">노령견 케어</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    최소 평점
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    value={filters.minRating}
                    onChange={(e) => handleFilterChange('minRating', Number(e.target.value))}
                  >
                    <option value="0">모든 평점</option>
                    <option value="3">3점 이상</option>
                    <option value="4">4점 이상</option>
                    <option value="4.5">4.5점 이상</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    정렬
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    value={filters.sort}
                    onChange={(e) => handleFilterChange('sort', e.target.value as 'rating' | 'reviewCount' | 'completedServices')}
                  >
                    <option value="rating">평점 순</option>
                    <option value="reviewCount">리뷰 많은 순</option>
                    <option value="completedServices">시술 많은 순</option>
                  </select>
                </div>
              </div>
            </form>
          </div>
          
          {/* 에러 메시지 */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg dark:bg-red-900 dark:text-red-200">
              {error}
            </div>
          )}
          
          {/* 로딩 상태 */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 mx-auto mb-4 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 dark:text-gray-300">업체 정보를 불러오는 중...</p>
            </div>
          ) : (
            <>
              {/* 결과 카운트 */}
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                총 {filteredBusinesses.length}개의 업체를 찾았습니다.
              </p>
              
              {/* 업체 목록 */}
              {filteredBusinesses.length === 0 ? (
                <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <div className="text-gray-500 dark:text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">조건에 맞는 업체가 없습니다.</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">다른 검색 조건을 시도해보세요.</p>
                  <button
                    onClick={() => setFilters({
                      search: '',
                      petType: 'all',
                      specialty: 'all',
                      minRating: 0,
                      sort: 'rating'
                    })}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 transition"
                  >
                    필터 초기화
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBusinesses.map((business) => (
                    <div key={business.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                      <div className="relative h-48 w-full">
                        <Image
                          src={business.imageUrl || '/images/placeholder-shop.jpg'}
                          alt={business.businessName}
                          layout="fill"
                          objectFit="cover"
                        />
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{business.businessName}</h2>
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-gray-700 dark:text-gray-300 ml-1">{business.rating.toFixed(1)}</span>
                            <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">({business.reviewCount})</span>
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{business.address}</p>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">{business.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {business.specialties.map((specialty, index) => (
                            <span 
                              key={index} 
                              className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400 text-sm">
                            시술 {business.completedServices}회
                          </span>
                          <Link href={`/businesses/${business.id}`}>
                            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 transition text-sm">
                              업체 보기
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          
          {/* 견적 요청 CTA */}
          <div className="mt-8 bg-primary-50 dark:bg-primary-900 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              원하는 업체를 못 찾으셨나요?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              맞춤형 견적을 받아보세요. 주변의 모든 반려동물 미용 업체에게 견적을 요청합니다.
            </p>
            <button 
              onClick={() => router.push('/quotation/new')}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white font-medium rounded-lg transition"
            >
              견적 요청하기
            </button>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}