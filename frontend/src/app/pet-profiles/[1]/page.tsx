'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getPetProfile, getPetGroomingHistory } from '@/api/petProfile';
import { PetProfile, PetType, PetGender, GroomingHistory } from '@/types/petProfile';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import Image from 'next/image';
import ErrorBoundary from '@/components/common/ErrorBoundary';

export default function PetProfileDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [petProfile, setPetProfile] = useState<PetProfile | null>(null);
  const [groomingHistory, setGroomingHistory] = useState<GroomingHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 인증 상태 및 프로필 로드
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push(`/login?redirect=/pet-profiles/${params.id}`);
        return;
      }

      const fetchProfileData = async () => {
        try {
          setIsLoading(true);
          const profileId = Number(params.id);
          
          // 프로필 정보 조회
          const profileData = await getPetProfile(profileId);
          setPetProfile(profileData);
          
          // 미용 히스토리 조회
          const historyData = await getPetGroomingHistory(profileId);
          setGroomingHistory(historyData);
          
          setError(null);
        } catch (err) {
          console.error('반려동물 프로필 로드 실패:', err);
          setError('반려동물 프로필을 불러오는데 실패했습니다.');
        } finally {
          setIsLoading(false);
        }
      };

      fetchProfileData();
    }
  }, [params.id, isAuthenticated, loading, router]);

  // 반려동물 타입 표시 함수
  const getPetTypeDisplay = (type: PetType) => {
    switch (type) {
      case PetType.DOG:
        return '강아지';
      case PetType.CAT:
        return '고양이';
      case PetType.OTHER:
        return '기타';
      default:
        return '알 수 없음';
    }
  };

  // 반려동물 성별 표시 함수
  const getPetGenderDisplay = (gender: PetGender) => {
    switch (gender) {
      case PetGender.MALE:
        return '수컷';
      case PetGender.FEMALE:
        return '암컷';
      default:
        return '알 수 없음';
    }
  };

  // 날짜 포맷 함수
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 로딩 중 표시
  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="container mx-auto max-w-screen-sm px-4 py-8">
          <div className="text-center py-16">
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 dark:text-gray-300">로딩 중...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="container mx-auto max-w-screen-sm px-4 py-8">
          <div className="mb-6 flex items-center">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">반려동물 상세 정보</h1>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg dark:bg-red-900 dark:text-red-200">
              {error}
            </div>
          )}

          {petProfile ? (
            <div className="space-y-6">
              {/* 프로필 카드 */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-6">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mr-4">
                    {petProfile.imageUrl ? (
                      <Image
                        src={petProfile.imageUrl}
                        alt={petProfile.name}
                        layout="fill"
                        objectFit="cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{petProfile.name}</h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      {getPetTypeDisplay(petProfile.type)} • {petProfile.breed}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">나이</h3>
                    <p className="text-gray-800 dark:text-white">{petProfile.age}세</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">체중</h3>
                    <p className="text-gray-800 dark:text-white">{petProfile.weight}kg</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">성별</h3>
                    <p className="text-gray-800 dark:text-white">{getPetGenderDisplay(petProfile.gender)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">중성화 여부</h3>
                    <p className="text-gray-800 dark:text-white">{petProfile.neutered ? '완료' : '미완료'}</p>
                  </div>
                </div>

                {petProfile.description && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">소개</h3>
                    <p className="text-gray-800 dark:text-white">{petProfile.description}</p>
                  </div>
                )}

                {petProfile.specialNeeds && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">특별 관리 사항</h3>
                    <p className="text-gray-800 dark:text-white">{petProfile.specialNeeds}</p>
                  </div>
                )}

                {petProfile.medicalHistory && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">건강 정보</h3>
                    <p className="text-gray-800 dark:text-white">{petProfile.medicalHistory}</p>
                  </div>
                )}

                {petProfile.preferredStyles && petProfile.preferredStyles.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">선호하는 미용 스타일</h3>
                    <div className="flex flex-wrap gap-2">
                      {petProfile.preferredStyles.map((style, index) => (
                        <span
                          key={index}
                          className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded"
                        >
                          {style}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 미용 히스토리 */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">미용 히스토리</h2>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    최근 {groomingHistory.length}건
                  </span>
                </div>

                {groomingHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500 dark:text-gray-400 mb-2">
                      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">아직 미용 기록이 없습니다.</p>
                    <Link href="/quotation/new">
                      <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 transition text-sm">
                        견적 요청하기
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {groomingHistory.map((history) => (
                      <div key={history.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex justify-between mb-2">
                          <span className="font-medium text-gray-800 dark:text-white">{history.serviceName}</span>
                          <span className="text-gray-600 dark:text-gray-300 text-sm">{formatDate(history.date)}</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                          {history.businessName}
                        </p>
                        {history.notes && (
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{history.notes}</p>
                        )}

                        {(history.beforeImageUrl || history.afterImageUrl) && (
                          <div className="flex space-x-2 my-3">
                            {history.beforeImageUrl && (
                              <div className="relative w-1/2 aspect-square rounded overflow-hidden">
                                <Image
                                  src={history.beforeImageUrl}
                                  alt="Before"
                                  layout="fill"
                                  objectFit="cover"
                                />
                                <div className="absolute bottom-0 left-0 bg-black bg-opacity-50 text-white text-xs py-1 px-2">
                                  Before
                                </div>
                              </div>
                            )}
                            {history.afterImageUrl && (
                              <div className="relative w-1/2 aspect-square rounded overflow-hidden">
                                <Image
                                  src={history.afterImageUrl}
                                  alt="After"
                                  layout="fill"
                                  objectFit="cover"
                                />
                                <div className="absolute bottom-0 left-0 bg-black bg-opacity-50 text-white text-xs py-1 px-2">
                                  After
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex justify-between items-center">
                          <span className="text-gray-800 dark:text-white font-medium">
                            {history.price.toLocaleString()}원
                          </span>
                          {history.quoteResponseId && (
                            <Link href={`/quotation/${history.quoteResponseId?.toString() || ''}`}>
                                <button className="text-primary-600 dark:text-primary-400 text-sm hover:underline">
                                상세 보기
                                </button>
                            </Link>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 버튼 */}
              <div className="flex space-x-3">
                <Link href={`/pet-profiles/edit/${petProfile?.id?.toString() || params.id}`} className="flex-1">
                    <button className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 transition">
                    프로필 수정
                    </button>
                </Link>
                <Link href="/quotation/new" className="flex-1">
                    <button className="w-full py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 transition">
                    견적 요청하기
                    </button>
                </Link>
                </div>
            </div>
          ) : !error && !isLoading && (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="text-gray-500 dark:text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                반려동물 프로필을 찾을 수 없습니다.
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                해당 프로필이 존재하지 않거나 접근 권한이 없습니다.
              </p>
              <Link href="/pet-profiles">
                <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 transition">
                  프로필 목록으로 돌아가기
                </button>
              </Link>
            </div>
          )}
        </div>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}