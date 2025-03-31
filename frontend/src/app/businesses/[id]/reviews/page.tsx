'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import { getBusinessReviews, getBusinessReviewStats, Review } from '../../../../api/review';
import { getBusinessProfileById } from '../../../../api/business';

// 타입 정의 수정 - searchParams 추가
interface BusinessReviewsPageProps {
    params: {
      id: string;
    };
    searchParams?: { [key: string]: string | string[] | undefined };
  }

const BusinessReviewsPage: React.FC<BusinessReviewsPageProps> = ({ params }) => {
  const businessId = parseInt(params.id);
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [businessInfo, setBusinessInfo] = useState<any>(null);
  const [reviewStats, setReviewStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<{ minRating?: number; tags?: string[] }>({});
  
  useEffect(() => {
    // 비로그인 상태여도 리뷰 조회는 가능하게 함
    fetchBusinessInfo();
    fetchReviewStats();
    fetchReviews();
  }, [businessId]);
  
  // 필터 변경 시 리뷰 다시 불러오기
  useEffect(() => {
    fetchReviews();
  }, [filter]);
  
  // 업체 정보 가져오기
  const fetchBusinessInfo = async () => {
    try {
      const response = await getBusinessProfileById(businessId);
      setBusinessInfo(response);
    } catch (error: any) {
      console.error('업체 정보 조회 실패:', error);
      setError('업체 정보를 불러오는데 실패했습니다.');
    }
  };
  
  // 리뷰 통계 가져오기
  const fetchReviewStats = async () => {
    try {
      const response = await getBusinessReviewStats(businessId);
      setReviewStats(response);
    } catch (error: any) {
      console.error('리뷰 통계 조회 실패:', error);
      // 통계 조회 실패는 치명적이지 않으므로 에러 메시지를 표시하지 않음
    }
  };
  
  // 리뷰 목록 가져오기
  const fetchReviews = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await getBusinessReviews(businessId, filter);
      
      // 최신 리뷰 순으로 정렬
      const sortedReviews = response.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      setReviews(sortedReviews);
    } catch (error: any) {
      console.error('리뷰 목록 조회 실패:', error);
      setError(error.response?.data?.message || '리뷰 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 별점 필터 핸들러
  const handleRatingFilter = (minRating: number) => {
    setFilter(prev => ({
      ...prev,
      minRating: prev.minRating === minRating ? undefined : minRating
    }));
  };
  
  // 태그 필터 핸들러
  const handleTagFilter = (tag: string) => {
    setFilter(prev => {
      const tags = prev.tags || [];
      const index = tags.indexOf(tag);
      
      if (index === -1) {
        // 태그 추가
        return { ...prev, tags: [...tags, tag] };
      } else {
        // 태그 제거
        const newTags = [...tags];
        newTags.splice(index, 1);
        return { ...prev, tags: newTags.length ? newTags : undefined };
      }
    });
  };
  
  // 별점 컴포넌트
  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex text-yellow-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star}>{star <= rating ? '★' : '☆'}</span>
        ))}
      </div>
    );
  };
  
  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 업체 정보 */}
      {businessInfo && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{businessInfo.businessName || businessInfo.name}</h1>
              {businessInfo.address && (
                <p className="text-gray-600 mt-1">{businessInfo.address}</p>
              )}
            </div>
            <div className="text-right">
              {reviewStats && (
                <>
                  <div className="flex items-center justify-end space-x-1">
                    <StarRating rating={Math.round(reviewStats.averageRating)} />
                    <span className="font-bold ml-2">{reviewStats.averageRating.toFixed(1)}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    리뷰 {reviewStats.totalReviews}개
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 필터 사이드바 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
            <h2 className="text-lg font-semibold mb-4">필터</h2>
            
            {/* 별점 필터 */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">별점</h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleRatingFilter(rating)}
                    className={`flex items-center w-full px-3 py-2 rounded ${
                      filter.minRating === rating ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex text-yellow-400 mr-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star}>{star <= rating ? '★' : '☆'}</span>
                      ))}
                    </div>
                    <span>{rating}점 이상</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* 태그 필터 */}
            {reviewStats && reviewStats.popularTags && reviewStats.popularTags.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">리뷰 키워드</h3>
                <div className="flex flex-wrap gap-2">
                  {reviewStats.popularTags.map((tagInfo: { tag: string; count: number }) => (
                    <button
                      key={tagInfo.tag}
                      onClick={() => handleTagFilter(tagInfo.tag)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        filter.tags?.includes(tagInfo.tag)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      }`}
                    >
                      #{tagInfo.tag} ({tagInfo.count})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* 리뷰 목록 */}
        <div className="lg:col-span-3">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
              <p>{error}</p>
            </div>
          )}
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-white p-12 rounded-lg shadow text-center">
              <h2 className="text-xl font-medium text-gray-700 mb-4">아직 리뷰가 없습니다.</h2>
              <p className="text-gray-500">
                {filter.minRating || filter.tags?.length
                  ? '선택한 필터에 해당하는 리뷰가 없습니다. 필터를 변경해보세요.'
                  : '이 업체의 첫 번째 리뷰를 작성해보세요.'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-lg font-semibold">{review.customerName}</h2>
                        <div className="mt-1">
                          <StarRating rating={review.rating} />
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(review.createdAt)}
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-4 whitespace-pre-line">
                      {review.content}
                    </p>
                    
                    {review.tags && review.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {review.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessReviewsPage;