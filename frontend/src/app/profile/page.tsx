'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { updateUserProfile, updateProfileImage, changePassword } from '../../api/user';
import { UserInfo } from '../../api/auth';
import NotificationSettings from '@/components/common/NotificationSettings';

const ProfilePage: React.FC = () => {
  const { isAuthenticated, user, refreshUser } = useAuth();
  const router = useRouter();
  
  const [profileData, setProfileData] = useState<Partial<UserInfo>>({
    name: '',
    email: '',
    phone: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  useEffect(() => {
    // 비로그인 상태인 경우 리디렉션
    if (!isAuthenticated) {
      router.push('/login?redirect=/profile');
      return;
    }
    
    // 사용자 정보로 폼 초기화
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [isAuthenticated, user, router]);
  
  // 일반 정보 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // 비밀번호 변경 핸들러
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // 이미지 변경 핸들러
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // 이미지 파일 검증
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다.');
      return;
    }
    
    // 파일 크기 검증 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      setError('이미지 크기는 5MB 이하여야 합니다.');
      return;
    }
    
    setSelectedImage(file);
    
    // 이미지 미리보기 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  // 프로필 정보 업데이트 핸들러
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);
    
    try {
      // 프로필 정보 업데이트
      await updateUserProfile(profileData);
      
      // 프로필 이미지 업데이트
      if (selectedImage) {
        await updateProfileImage(selectedImage);
      }
      
      // 사용자 정보 새로고침
      await refreshUser();
      
      setSuccessMessage('프로필이 성공적으로 업데이트되었습니다.');
    } catch (error: any) {
      console.error('프로필 업데이트 실패:', error);
      setError(error.response?.data?.message || '프로필 업데이트에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 비밀번호 변경 핸들러
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    
    // 비밀번호 검증
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setPasswordError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    
    setIsPasswordLoading(true);
    
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      
      // 폼 초기화
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      setSuccessMessage('비밀번호가 성공적으로 변경되었습니다.');
    } catch (error: any) {
      console.error('비밀번호 변경 실패:', error);
      setPasswordError(error.response?.data?.message || '비밀번호 변경에 실패했습니다.');
    } finally {
      setIsPasswordLoading(false);
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
      <h1 className="text-2xl font-bold mb-6">내 프로필</h1>
      
      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
          <p>{successMessage}</p>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">프로필 정보</h2>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>




        )}
        
        <form onSubmit={handleProfileSubmit}>
          <div className="mb-6">
            <div className="flex items-center">
              <div className="w-24 h-24 relative rounded-full overflow-hidden bg-gray-200 mr-6">
                {(imagePreview || user.profileImage) ? (
                  <img
                    src={imagePreview || user.profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  프로필 이미지
                </label>
                <input
                  type="file"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                  accept="image/*"
                />
                <p className="mt-1 text-sm text-gray-500">
                  5MB 이하의 이미지 파일
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                이름
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={profileData.name}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                이메일
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={profileData.email}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
                disabled={user.provider !== 'LOCAL'} // 소셜 로그인 사용자는 이메일 변경 불가
                required
              />
              {user.provider !== 'LOCAL' && (
                <p className="mt-1 text-sm text-gray-500">
                  소셜 로그인 사용자는 이메일을 변경할 수 없습니다.
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                전화번호
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={profileData.phone}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예: 010-1234-5678"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                회원 유형
              </label>
              <input
                type="text"
                value={user.role === 'CUSTOMER' ? '고객 회원' : user.role === 'BUSINESS' ? '업체 회원' : '관리자'}
                className="w-full p-3 border border-gray-300 rounded bg-gray-100"
                disabled
              />
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
      
      {/* 비밀번호 변경 폼 (소셜 로그인 사용자는 표시 안 함) */}
      {user.provider === 'LOCAL' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">비밀번호 변경</h2>
          
          {passwordError && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
              <p>{passwordError}</p>
            </div>
          )}
          
          <form onSubmit={handlePasswordSubmit}>
            <div className="space-y-4 mb-6">
              <div>
                <label htmlFor="currentPassword" className="block text-gray-700 font-medium mb-2">
                  현재 비밀번호
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="newPassword" className="block text-gray-700 font-medium mb-2">
                  새 비밀번호
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  minLength={8}
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  8자 이상 입력해주세요.
                </p>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
                  새 비밀번호 확인
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  minLength={8}
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isPasswordLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
              >
                {isPasswordLoading ? '변경 중...' : '비밀번호 변경'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 알림 설정 컴포넌트 추가 */}
      <NotificationSettings className="bg-white rounded-lg shadow-md p-6 mb-6" />
      
      {/* 소셜 로그인 연동 정보 */}
      <div className="mt-6 text-center">
        <p className="text-gray-600 text-sm">
          {user.provider !== 'LOCAL'
            ? `${user.provider === 'GOOGLE' ? 'Google' : user.provider === 'KAKAO' ? 'Kakao' : 'Naver'} 계정으로 로그인 중입니다.`
            : '일반 이메일 계정으로 로그인 중입니다.'}
        </p>
      </div>
    </div>
  );
};

export default ProfilePage;