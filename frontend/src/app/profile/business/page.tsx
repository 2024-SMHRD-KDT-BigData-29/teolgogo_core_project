'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { updateBusinessProfile, uploadBusinessLicense } from '../../../api/user';
import { useLocation } from '../../../hooks/useLocation';

// User 인터페이스 수정
interface User {
    id: string | number;
    name: string;
    email: string;
    role: 'CUSTOMER' | 'BUSINESS' | 'ADMIN';
    profileImage?: string;
    businessName?: string;
    businessDescription?: string;
    businessLicense?: string; // 추가된 속성
  }

const BusinessProfilePage: React.FC = () => {
  const { isAuthenticated, user, refreshUser } = useAuth();
  const router = useRouter();
  const { getCurrentLocation, getAddressFromCoords } = useLocation();
  
  const [profileData, setProfileData] = useState({
    businessName: '',
    businessDescription: '',
    address: '',
    latitude: 0,
    longitude: 0,
    specialties: [] as string[],
  });
  
  const [selectedLicense, setSelectedLicense] = useState<File | null>(null);
  const [licensePreview, setLicensePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // 전문 분야 선택 목록
  const specialtyOptions = [
    '소형견전문',
    '중형견전문',
    '대형견전문',
    '고양이전문',
    '장모종전문',
    '단모종전문',
    '스타일컷전문',
    '스포팅컷전문',
    '위생미용전문',
    '스페셜케어전문',
  ];
  
  useEffect(() => {
    // 비로그인 상태 또는 업체 회원이 아닌 경우 리디렉션
    if (!isAuthenticated) {
      router.push('/login?redirect=/profile/business');
      return;
    }
    
    if (user && user.role !== 'BUSINESS') {
      router.push('/profile');
      return;
    }
    
    // 사용자 정보로 폼 초기화
    if (user) {
      setProfileData({
        businessName: user.businessName || '',
        businessDescription: user.businessDescription || '',
        address: user.address || '',
        latitude: user.latitude || 0,
        longitude: user.longitude || 0,
        specialties: user.specialties || [],
      });
    }
  }, [isAuthenticated, user, router]);
  
  // 일반 정보 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // 현재 위치 가져오기
  const fetchCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const { latitude, longitude } = await getCurrentLocation();
      const address = await getAddressFromCoords(latitude, longitude);
      
      setProfileData(prev => ({
        ...prev,
        latitude,
        longitude,
        address: address || prev.address,
      }));
    } catch (error) {
      console.error('위치 정보를 가져오는데 실패했습니다:', error);
      setError('위치 정보를 가져오는데 실패했습니다. 주소를 직접 입력해주세요.');
    } finally {
      setLocationLoading(false);
    }
  };
  
  // 전문 분야 변경 핸들러
  const handleSpecialtyChange = (specialty: string) => {
    setProfileData(prev => {
      const specialties = [...prev.specialties];
      const index = specialties.indexOf(specialty);
      
      if (index === -1) {
        // 태그 추가
        return { ...prev, specialties: [...specialties, specialty] };
      } else {
        // 태그 제거
        specialties.splice(index, 1);
        return { ...prev, specialties };
      }
    });
  };
  
  // 사업자등록증 변경 핸들러
  const handleLicenseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // 파일 타입 검증
    if (!file.type.match('image.*') && !file.type.match('application/pdf')) {
      setError('이미지 또는 PDF 파일만 업로드 가능합니다.');
      return;
    }
    
    // 파일 크기 검증 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      setError('파일 크기는 5MB 이하여야 합니다.');
      return;
    }
    
    setSelectedLicense(file);
    
    // 이미지인 경우 미리보기 생성
    if (file.type.match('image.*')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLicensePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // PDF인 경우 기본 아이콘 표시
      setLicensePreview(null);
    }
  };
  
  // 프로필 정보 업데이트 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);
    
    try {
      // 업체 프로필 정보 업데이트
      await updateBusinessProfile(profileData);
      
      // 사업자등록증 업로드
      if (selectedLicense) {
        await uploadBusinessLicense(selectedLicense);
      }
      
      // 사용자 정보 새로고침
      await refreshUser();
      
      setSuccessMessage('업체 정보가 성공적으로 업데이트되었습니다.');
    } catch (error: any) {
      console.error('업체 정보 업데이트 실패:', error);
      setError(error.response?.data?.message || '업체 정보 업데이트에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">업체 프로필</h1>
      
      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
          <p>{successMessage}</p>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">업체 정보</h2>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 mb-6">
            <div>
              <label htmlFor="businessName" className="block text-gray-700 font-medium mb-2">
                업체명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={profileData.businessName}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="업체명을 입력하세요"
                required
              />
            </div>
            
            <div>
              <label htmlFor="businessDescription" className="block text-gray-700 font-medium mb-2">
                업체 소개
              </label>
              <textarea
                id="businessDescription"
                name="businessDescription"
                value={profileData.businessDescription}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="업체에 대한 소개를 작성해주세요"
                rows={4}
              ></textarea>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="address" className="block text-gray-700 font-medium">
                  주소 <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={fetchCurrentLocation}
                  disabled={locationLoading}
                  className="text-sm text-blue-600 hover:text-blue-800 disabled:text-blue-300"
                >
                  {locationLoading ? '위치 가져오는 중...' : '현재 위치 사용'}
                </button>
              </div>
              <input
                type="text"
                id="address"
                name="address"
                value={profileData.address}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="주소를 입력하세요"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="latitude" className="block text-gray-700 font-medium mb-2">
                  위도
                </label>
                <input
                  type="number"
                  id="latitude"
                  name="latitude"
                  value={profileData.latitude}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
                  placeholder="위도"
                  step="0.000001"
                  disabled
                />
              </div>
              
              <div>
                <label htmlFor="longitude" className="block text-gray-700 font-medium mb-2">
                  경도
                </label>
                <input
                  type="number"
                  id="longitude"
                  name="longitude"
                  value={profileData.longitude}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
                  placeholder="경도"
                  step="0.000001"
                  disabled
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                전문 분야
              </label>
              <div className="flex flex-wrap gap-2">
                {specialtyOptions.map((specialty) => (
                  <button
                    key={specialty}
                    type="button"
                    onClick={() => handleSpecialtyChange(specialty)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      profileData.specialties.includes(specialty)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    {specialty}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                사업자등록증
              </label>
              
              <div className="flex items-center mb-2">
                {licensePreview ? (
                  <div className="w-32 h-32 relative rounded overflow-hidden bg-gray-200 mr-4">
                    <img
                      src={licensePreview}
                      alt="Business License"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : selectedLicense && selectedLicense.type.match('application/pdf') ? (
                  <div className="w-32 h-32 relative rounded overflow-hidden bg-gray-200 mr-4 flex items-center justify-center text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="absolute bottom-1 text-xs">PDF</span>
                  </div>
                ) : user.businessLicense ? (
                  <div className="w-32 h-32 relative rounded overflow-hidden bg-gray-200 mr-4 flex items-center justify-center text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="absolute bottom-1 text-xs">업로드 완료</span>
                  </div>
                ) : null}
                
                <div>
                  <input
                    type="file"
                    onChange={handleLicenseChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                    accept="image/*,application/pdf"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    5MB 이하의 이미지 또는 PDF 파일
                  </p>
                </div>
              </div>
              
              {user.businessLicense && !selectedLicense && (
                <p className="text-sm text-green-600">
                  사업자등록증이 이미 등록되어 있습니다. 변경하려면 새 파일을 업로드하세요.
                </p>
              )}
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isLoading ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </form>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">기본 정보 수정</h2>
        <p className="text-gray-600 mb-4">
          이름, 이메일, 전화번호 등의 기본 정보를 수정하려면 아래 버튼을 클릭하세요.
        </p>
        <button
          onClick={() => router.push('/profile')}
          className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          기본 정보 수정하기
        </button>
      </div>
    </div>
  );
};

export default BusinessProfilePage;