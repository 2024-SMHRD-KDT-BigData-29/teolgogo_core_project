// src/app/quotes/create/page.tsx
// 견적 요청 폼 - 반려동물 미용 서비스 요청을 위한 페이지

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createQuotationRequest, QuoteItem } from '@/api/quotation';
import { useLocation } from '@/hooks/useLocation';
import EnhancedKakaoMap from '@/components/map/EnhancedKakaoMap';

// 반려동물 사진 타입 정의
interface PetPhoto {
  file: File;
  preview: string;
}

export default function CreateQuoteRequestPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const { getCurrentLocation, getAddressFromCoords } = useLocation();
  
  // 폼 상태 관리
  const [formData, setFormData] = useState({
    title: '',
    petType: 'DOG' as 'DOG' | 'CAT' | 'OTHER',
    petBreed: '',
    petAge: 0,
    petWeight: 0,
    serviceType: 'BASIC' as 'BASIC' | 'SPECIAL' | 'BATH' | 'STYLING',
    description: '',
    latitude: 0,
    longitude: 0,
    address: '',
    addressDetail: '',
    preferredDate: '',
  });
  
  // 항목 관리
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [newItem, setNewItem] = useState<QuoteItem>({
    name: '',
    description: '',
    price: 0,
    type: 'BASIC_GROOMING',
  });
  
  // 사진 관리
  const [petPhotos, setPetPhotos] = useState<PetPhoto[]>([]);
  
  // 상태 관리
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationSelected, setLocationSelected] = useState(false);
  
  // 비로그인 상태 또는 업체 회원인 경우 리디렉션
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/quotes/create');
    } else if (user && user.role !== 'CUSTOMER') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, router]);
  
  // 현재 위치 가져오기
  const fetchCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const { latitude, longitude } = await getCurrentLocation();
      const address = await getAddressFromCoords(latitude, longitude);
      
      setFormData(prev => ({
        ...prev,
        latitude,
        longitude,
        address: address || prev.address,
      }));
      setLocationSelected(true);
    } catch (error) {
      console.error('위치 정보를 가져오는데 실패했습니다:', error);
      setErrors(prev => ({
        ...prev,
        location: '위치 정보를 가져오는데 실패했습니다. 주소를 직접 입력해주세요.'
      }));
    } finally {
      setLocationLoading(false);
    }
  };
  
  // 입력 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 변경 시 해당 필드의 오류 메시지 삭제
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // 새 아이템 입력 핸들러
  const handleNewItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewItem(prev => ({
      ...prev,
      [name]: name === 'price' ? parseInt(value) || 0 : value,
    }));
  };
  
  // 아이템 추가 핸들러
  const handleAddItem = () => {
    if (!newItem.name || newItem.price <= 0) {
      setErrors(prev => ({
        ...prev,
        items: '서비스 이름과 가격을 입력해주세요.'
      }));
      return;
    }
    
    setItems(prev => [...prev, { ...newItem, id: Date.now() }]);
    setNewItem({
      name: '',
      description: '',
      price: 0,
      type: 'BASIC_GROOMING',
    });
    
    // 에러 제거
    if (errors.items) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.items;
        return newErrors;
      });
    }
  };
  
  // 아이템 삭제 핸들러
  const handleRemoveItem = (id: number | undefined) => {
    if (!id) return;
    setItems(prev => prev.filter(item => item.id !== id));
  };
  
  // 위치 선택 핸들러
  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    console.log('위치 선택됨:', lat, lng, address);
    
    setFormData(prev => {
      const newData = {
        ...prev,
        latitude: lat,
        longitude: lng,
        address: address
      };
      console.log('새 폼 데이터:', newData);
      return newData;
    });
    
    setLocationSelected(true);
    
    // 위치 오류 제거
    if (errors.location) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.location;
        return newErrors;
      });
    }
  };
  
  // 사진 업로드 핸들러
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newPhotos: PetPhoto[] = [];
    
    Array.from(files).forEach(file => {
      // 5MB 이하의 이미지 파일만 허용
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          photo: '5MB 이하의 이미지 파일만 업로드 가능합니다.'
        }));
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          photo: '이미지 파일만 업로드 가능합니다.'
        }));
        return;
      }
      
      const preview = URL.createObjectURL(file);
      newPhotos.push({ file, preview });
    });
    
    setPetPhotos(prev => [...prev, ...newPhotos]);
    
    // 사진 오류 제거
    if (errors.photo && newPhotos.length > 0) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.photo;
        return newErrors;
      });
    }
  };

   // 사진 동의 변경 핸들러
   const [photoConsent, setPhotoConsent] = useState<boolean>(false);
  
   const handlePhotoConsentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     setPhotoConsent(e.target.checked);
   };
  
  // 사진 삭제 핸들러
  const handleRemovePhoto = (index: number) => {
    setPetPhotos(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };
  
  // 폼 유효성 검사
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요.';
    }
    
    if (!formData.petBreed.trim()) {
      newErrors.petBreed = '품종을 입력해주세요.';
    }
    
    if (formData.petAge <= 0) {
      newErrors.petAge = '나이를 입력해주세요.';
    }
    
    if (formData.petWeight <= 0) {
      newErrors.petWeight = '체중을 입력해주세요.';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = '상세 설명을 입력해주세요.';
    }
    
    if (!locationSelected) {
      newErrors.location = '위치를 선택해주세요.';
    }
    
    if (!formData.addressDetail.trim()) {
      newErrors.addressDetail = '상세 주소를 입력해주세요.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 인증 체크
    if (!isAuthenticated) {
      router.push('/login?redirect=/quotes/create');
      return;
    }
    
    // 폼 유효성 검사
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // 견적 요청 데이터 준비
      const requestData = {
        ...formData,
        items: items.map(({ id, ...item }) => item), // id 제외
        preferredDate: formData.preferredDate ? new Date(formData.preferredDate).toISOString() : undefined,
      };
      
      // 사진 파일 준비
      const photoFiles = petPhotos.map(photo => photo.file);
      
      // API 호출
      const response = await createQuotationRequest(requestData, photoFiles);
      
      // 성공 시 상세 페이지로 이동
      router.push(`/quotes/${response.id}`);
    } catch (error: any) {
      // 오류 처리
      setErrors({
        submit: error.response?.data?.message || '견적 요청 생성 중 오류가 발생했습니다.'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // 서비스 타입 옵션
  const itemTypes = [
    { value: 'BASIC_GROOMING', label: '기본 미용' },
    { value: 'SPECIAL_CARE', label: '스페셜 케어' },
    { value: 'BATH', label: '목욕' },
    { value: 'NAIL_TRIM', label: '발톱 관리' },
    { value: 'EAR_CLEANING', label: '귀 청소' },
    { value: 'TEETH_BRUSHING', label: '치아 관리' },
    { value: 'STYLING', label: '스타일링' },
    { value: 'DESHEDDING', label: '털 관리' },
    { value: 'FLEA_TREATMENT', label: '벼룩 방지' },
    { value: 'CUSTOM', label: '커스텀 서비스' },
  ];

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-6">새 견적 요청 작성</h1>
      
      {errors.submit && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errors.submit}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 섹션 */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">기본 정보</h2>
          
          {/* 제목 */}
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="견적 요청 제목을 입력하세요"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>
          
          {/* 반려동물 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                반려동물 종류 <span className="text-red-500">*</span>
              </label>
              <select
                name="petType"
                value={formData.petType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="DOG">강아지</option>
                <option value="CAT">고양이</option>
                <option value="OTHER">기타</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                품종 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="petBreed"
                value={formData.petBreed}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예: 말티즈, 푸들, 페르시안 등"
                required
              />
              {errors.petBreed && (
                <p className="mt-1 text-sm text-red-600">{errors.petBreed}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                나이 (개월) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="petAge"
                value={formData.petAge}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                placeholder="예: 24"
                required
              />
              {errors.petAge && (
                <p className="mt-1 text-sm text-red-600">{errors.petAge}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                체중 (kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="petWeight"
                value={formData.petWeight}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0.1"
                step="0.1"
                placeholder="예: 3.5"
                required
              />
              {errors.petWeight && (
                <p className="mt-1 text-sm text-red-600">{errors.petWeight}</p>
              )}
            </div>
          </div>
          
          {/* 반려동물 사진 업로드 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              반려동물 사진 업로드 (최대 5MB)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.photo && (
              <p className="mt-1 text-sm text-red-600">{errors.photo}</p>
            )}
            
            {petPhotos.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {petPhotos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={photo.preview}
                      alt={`Pet ${index + 1}`}
                      className="h-32 w-full object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* 서비스 유형 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              원하는 서비스 종류 <span className="text-red-500">*</span>
            </label>
            <select
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="BASIC">기본 미용</option>
              <option value="SPECIAL">스페셜 케어</option>
              <option value="BATH">목욕/위생</option>
              <option value="STYLING">스타일링</option>
            </select>
          </div>
          
          {/* 희망 날짜 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              희망 날짜
            </label>
            <input
              type="datetime-local"
              name="preferredDate"
              value={formData.preferredDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* 상세 설명 */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              상세 설명 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="원하시는 스타일이나 주의사항 등을 자세히 적어주세요."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>
        </div>
        
        {/* 위치 선택 섹션 */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">위치 정보</h2>
          
          <div className="mb-4">
            <button
              type="button"
              onClick={fetchCurrentLocation}
              disabled={locationLoading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {locationLoading ? '위치 가져오는 중...' : '현재 위치 가져오기'}
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            지도에서 원하는 위치를 클릭하거나 마커를 드래그하여 위치를 선택해주세요.
          </p>
          
          {/* 카카오 맵 */}
          <EnhancedKakaoMap
            width="100%"
            height="400px"
            initialLatitude={37.5665}
            initialLongitude={126.9780}
            level={3}
            selectable={true}
            onLocationSelect={(lat, lng, address) => {
              console.log('선택된 위치:', lat, lng, address);
              // 여기서 폼 데이터 업데이트 등의 작업 수행
            }}
          />
          
          {errors.location && (
            <p className="mt-1 text-sm text-red-600">{errors.location}</p>
          )}
          
          {/* 상세 주소 */}
          <div className="mt-4">
            <label htmlFor="addressDetail" className="block text-sm font-medium text-gray-700 mb-1">
              상세 주소 <span className="text-red-500">*</span>
            </label>
            <input
              id="addressDetail"
              name="addressDetail"
              type="text"
              value={formData.addressDetail}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="건물명, 동/호수 등 상세 주소를 입력하세요"
            />
            {errors.addressDetail && (
              <p className="mt-1 text-sm text-red-600">{errors.addressDetail}</p>
            )}
          </div>
        </div>
        
        {/* 견적 항목 섹션 */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">견적 항목 (선택사항)</h2>
          
          {errors.items && (
            <p className="mb-4 text-sm text-red-600">{errors.items}</p>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                서비스명
              </label>
              <input
                type="text"
                name="name"
                value={newItem.name}
                onChange={handleNewItemChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예: 발톱 관리"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                서비스 타입
              </label>
              <select
                name="type"
                value={newItem.type}
                onChange={handleNewItemChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {itemTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                예상 가격 (원)
              </label>
              <input
                type="number"
                name="price"
                value={newItem.price}
                onChange={handleNewItemChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                placeholder="예: 10000"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              설명
            </label>
            <input
              type="text"
              name="description"
              value={newItem.description}
              onChange={handleNewItemChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="서비스에 대한 간단한 설명"
            />
          </div>
          
          <button
            type="button"
            onClick={handleAddItem}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            항목 추가
          </button>
          
          {items.length > 0 && (
            <div className="overflow-x-auto mt-4">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-700">서비스명</th>
                    <th className="px-4 py-2 text-left text-gray-700">타입</th>
                    <th className="px-4 py-2 text-left text-gray-700">설명</th>
                    <th className="px-4 py-2 text-left text-gray-700">가격</th>
                    <th className="px-4 py-2 text-left text-gray-700">삭제</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const itemType = itemTypes.find(type => type.value === item.type);
                    
                    return (
                      <tr key={item.id} className="border-b">
                        <td className="px-4 py-2">{item.name}</td>
                        <td className="px-4 py-2">{itemType?.label || item.type}</td>
                        <td className="px-4 py-2">{item.description}</td>
                        <td className="px-4 py-2">{item.price.toLocaleString()}원</td>
                        <td className="px-4 py-2">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            삭제
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* 제출 버튼 */}
        <div className="flex justify-between">
          {/* 뒤로가기 버튼 - 아이콘 추가하고 스타일 수정 */}
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-4 py-2 flex items-center border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            뒤로가기
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? '처리 중...' : '견적 요청하기'}
          </button>
        </div>
      </form>
    </div>
  );
}