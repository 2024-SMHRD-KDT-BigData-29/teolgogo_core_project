'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getUserPetProfiles, deletePetProfile } from '@/api/petProfile';
import { PetProfile, PetType, PetGender } from '@/types/petProfile';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import Image from 'next/image';

export default function PetProfiles() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [petProfiles, setPetProfiles] = useState<PetProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<number | null>(null);

  // 반려동물 프로필 목록 로드
  useEffect(() => {
    // 인증 로딩이 완료되면 실행
    if (!loading) {
      if (!isAuthenticated) {
        // 비로그인 상태면 로그인 페이지로 리다이렉트
        router.push('/login?redirect=/pet-profiles');
        return;
      }

      // 반려동물 프로필 목록 조회
      const fetchPetProfiles = async () => {
        try {
          setIsLoading(true);
          const profiles = await getUserPetProfiles();
          setPetProfiles(profiles);
          setError(null);
        } catch (err) {
          console.error('반려동물 프로필 로드 실패:', err);
          setError('반려동물 프로필을 불러오는데 실패했습니다.');
        } finally {
          setIsLoading(false);
        }
      };

      fetchPetProfiles();
    }
  }, [isAuthenticated, loading, router]);

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

  // 반려동물 프로필 삭제 함수
  const handleDeletePetProfile = async (id: number) => {
    try {
      await deletePetProfile(id);
      // 삭제 성공 시 목록에서 제거
      setPetProfiles(prev => prev.filter(profile => profile.id !== id));
      setDeleteConfirmation(null);
    } catch (err) {
      console.error('반려동물 프로필 삭제 실패:', err);
      setError('반려동물 프로필 삭제에 실패했습니다.');
    }
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto max-w-screen-sm px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">내 반려동물 프로필</h1>
          <Link href="/pet-profiles/add">
            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 transition">
              새 프로필 추가
            </button>
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg dark:bg-red-900 dark:text-red-200">
            {error}
          </div>
        )}

        {petProfiles.length === 0 ? (
          <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">등록된 반려동물이 없습니다.</p>
            <Link href="/pet-profiles/add">
              <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 transition">
                반려동물 등록하기
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {petProfiles.map((pet) => (
              <div key={pet.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                <div className="flex items-center">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mr-4">
                    {pet.imageUrl ? (
                      <Image
                        src={pet.imageUrl}
                        alt={pet.name}
                        layout="fill"
                        objectFit="cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">{pet.name}</h2>
                    <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      <p>{`${getPetTypeDisplay(pet.type)} / ${pet.breed} / ${pet.age}세 / ${getPetGenderDisplay(pet.gender)}`}</p>
                      <p>{`${pet.weight}kg / ${pet.neutered ? '중성화 완료' : '중성화 안함'}`}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Link href={`/pet-profiles/${pet.id}`}>
                      <button className="p-2 text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </Link>
                    <Link href={`/pet-profiles/edit/${pet.id}`}>
                      <button className="p-2 text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </Link>
                    <button 
                      className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                      onClick={() => setDeleteConfirmation(pet.id as number)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* 삭제 확인 모달 */}
      {deleteConfirmation !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">반려동물 프로필 삭제</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              정말로 이 반려동물 프로필을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition"
              >
                취소
              </button>
              <button 
                onClick={() => handleDeletePetProfile(deleteConfirmation)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 transition"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
}