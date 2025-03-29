'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { getCustomerReviews, Review, deleteReview } from '../../../api/review';

const MyReviewsPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // 비로그인 상태 또는 고객 회원이 아닌 경우 리디렉션
    if (!isAuthenticated) {
      router.push('/login?redirect=/reviews/my');
      return;
    }
    
    if (user && user.role !== 'CUSTOMER') {
      router.push('/dashboard');
      return;
    }
    
    fetchMyReviews();
  }, [isAuthenticated, user, router]);
  
  // 내 리뷰 목록 가져오기
  const fetchMyReviews = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await getCustomerReviews();
      
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
  
  // 리뷰 삭제 핸들러
  const handleDeleteReview = async (reviewId: number) => {
    if (!window.confirm('정말로 이 리뷰를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }
    
    try {
      await deleteReview(reviewId);
      
      // 리뷰 목록 갱신
      fetchMyReviews();
    } catch (error: any) {
      console.error('리뷰 삭제 실패:', error);
      alert(error.response?.data?.message || '리뷰 삭제에 실패했습니다.');
    }
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
      <h1 className="text-2xl font-bold mb-6">내가 작성한 리뷰</h1>
      
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
          <h2 className="text-xl font-medium text-gray-700 mb-4">작성한 리뷰가 없습니다.</h2>
          <p className="text-gray-500 mb-6">
            서비스를 이용한 후 리뷰를 작성해보세요.
          </p>
          <Link 
            href="/payments/history"
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            결제 내역으로 이동
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">{review.businessName}</h2>
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
                  <div className="flex flex-wrap gap-2 mb-4">
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
                
                <div className="flex items-center text-sm text-gray-500">
                  <span className={review.isPublic ? 'text-green-600' : 'text-orange-600'}>
                    {review.isPublic ? '공개' : '비공개'} 리뷰
                  </span>
                </div>
                
                <div className="flex justify-end mt-4 space-x-2">
                  <Link
                    href={`/reviews/edit/${review.id}`}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    수정
                  </Link>
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReviewsPage;