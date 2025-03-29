'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createPetProfile } from '@/api/petProfile';
import { PetType, PetGender } from '@/types/petProfile';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import Image from 'next/image';

export default function AddPetProfile() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  
  // 폼 상태
  const [name, setName] = useState<string>('');
  const [type, setType] = useState<PetType>(PetType.DOG); // 기본값은 강아지
  const [breed, setBreed] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [gender, setGender] = useState<PetGender>(PetGender.MALE); // 기본값은 수컷
  const [neutered, setNeutered] = useState<boolean>(false);
  const [description, setDescription] = useState<string>('');
  const [specialNeeds, setSpecialNeeds] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // 상태
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // 이미지 파일 선택 핸들러
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // 파일 크기 체크 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        setError('이미지 크기는 5MB 이하여야 합니다.');
        return;
      }
      
      // 파일 타입 체크
      if (!file.type.startsWith('image/')) {
        setError('이미지 파일만 업로드 가능합니다.');
        return;
      }
      
      setImageFile(file);
      
      // 이미지 미리보기 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      setError(null);
    }
  };
  
  // 폼 제출 핸들러
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // 필수 필드 검증
    if (!name || !breed || !age || !weight) {
      setError('이름, 품종, 나이, 체중은 필수 입력 항목입니다.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // 반려동물 프로필 생성 API 호출
      await createPetProfile({
        name,
        type,
        breed,
        age: parseInt(age, 10),
        weight: parseFloat(weight),
        gender,
        neutered,
        description,
        specialNeeds,
        imageFile: imageFile || undefined
      });
      
      // 성공 시 목록 페이지로 이동
      router.push('/pet-profiles');
      router.refresh(); // 페이지 목록 갱신을 위한 새로고침
      
    } catch (err) {
      console.error('반려동물 프로필 생성 실패:', err);
      setError('반려동물 프로필을 생성하는데 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 인증 상태 확인
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login?redirect=/pet-profiles/add');
    }
  }, [isAuthenticated, loading, router]);
  
  // 로딩 중 표시
  if (loading) {
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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">새 반려동물 프로필 등록</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            반려동물의 정보를 입력하여 프로필을 생성해주세요.
          </p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg dark:bg-red-900 dark:text-red-200">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          {/* 반려동물 기본 정보 */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">기본 정보</h2>
            
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                이름 <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="반려동물 이름"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                종류 <span className="text-red-600">*</span>
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as PetType)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value={PetType.DOG}>강아지</option>
                <option value={PetType.CAT}>고양이</option>
                <option value={PetType.OTHER}>기타</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label htmlFor="breed" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                품종 <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="breed"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder={type === PetType.DOG ? '예: 말티즈, 푸들' : type === PetType.CAT ? '예: 코숏, 페르시안' : '품종'}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  나이 (세) <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  id="age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min="0"
                  max="30"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="나이"
                  required
                />
              </div>
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  체중 (kg) <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  id="weight"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  min="0.1"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="체중"
                  required
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                성별 <span className="text-red-600">*</span>
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    checked={gender === PetGender.MALE}
                    onChange={() => setGender(PetGender.MALE)}
                    className="form-radio h-4 w-4 text-primary-600 dark:text-primary-500"
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">수컷</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    checked={gender === PetGender.FEMALE}
                    onChange={() => setGender(PetGender.FEMALE)}
                    className="form-radio h-4 w-4 text-primary-600 dark:text-primary-500"
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">암컷</span>
                </label>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                중성화 여부
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="neutered"
                  checked={neutered}
                  onChange={(e) => setNeutered(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-primary-600 dark:text-primary-500"
                />
                <label htmlFor="neutered" className="ml-2 text-gray-700 dark:text-gray-300">
                  중성화 완료
                </label>
              </div>
            </div>
          </div>
          
          {/* 추가 정보 */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">추가 정보</h2>
            
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                반려동물 소개
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="반려동물에 대한 간단한 소개를 작성해주세요."
              ></textarea>
            </div>
            
            <div className="mb-4">
              <label htmlFor="specialNeeds" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                특별 관리 사항
              </label>
              <textarea
                id="specialNeeds"
                value={specialNeeds}
                onChange={(e) => setSpecialNeeds(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="알러지, 만성 질환, 특별히 주의해야 할 사항 등"
              ></textarea>
            </div>
          </div>
          
          {/* 프로필 이미지 */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">프로필 이미지</h2>
            
            <div className="flex items-center mb-4">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mr-4">
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="프로필 이미지 미리보기"
                    layout="fill"
                    objectFit="cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div>
                <label 
                  htmlFor="profileImage" 
                  className="inline-block px-4 py-2 bg-gray-200 text-gray-700 rounded-md cursor-pointer hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition"
                >
                  이미지 선택
                </label>
                <input
                  type="file"
                  id="profileImage"
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  최대 5MB, JPG, PNG, GIF 파일 형식
                </p>
              </div>
            </div>
          </div>
          
          {/* 버튼 */}
          <div className="flex justify-end space-x-3">
            <Link href="/pet-profiles">
              <button 
                type="button"
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition"
              >
                취소
              </button>
            </Link>
            <button 
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 transition"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span>처리 중...</span>
                </div>
              ) : '등록하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}