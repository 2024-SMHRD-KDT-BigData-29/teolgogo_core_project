// src/app/quotes/create/page.tsx
// 견적 요청 폼

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import EnhancedKakaoMap from '@/components/map/EnhancedKakaoMap';
import { createQuoteRequest } from '@/api/quote';
import { useAuth } from '@/context/AuthContext';

export default function CreateQuoteRequestPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  // 폼 상태 관리
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    latitude: 0,
    longitude: 0,
    address: '',
    addressDetail: '',
    items: [{ name: '', quantity: 1, description: '' }]
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  
  // 위치가 선택되었는지 확인
  const [locationSelected, setLocationSelected] = useState(false);
  
  // 입력 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
  
  // 항목 변경 핸들러
  const handleItemChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updatedItems = [...formData.items];
    
    updatedItems[index] = {
      ...updatedItems[index],
      [name]: name === 'quantity' ? parseInt(value) || 0 : value
    };
    
    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };
  
  // 항목 추가 핸들러
  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', quantity: 1, description: '' }]
    }));
  };
  
  // 항목 삭제 핸들러
  const handleRemoveItem = (index: number) => {
    const updatedItems = [...formData.items];
    updatedItems.splice(index, 1);
    
    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };
  
  // 위치 선택 핸들러
  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      address: address
    }));
    setLocationSelected(true);
  };
  
  // 폼 유효성 검사
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요.';
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
    
    // 항목 유효성 검사
    const invalidItems = formData.items.filter(item => !item.name.trim());
    if (invalidItems.length > 0) {
      newErrors.items = '모든 항목에 이름을 입력해주세요.';
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
      // API 호출
      const response = await createQuoteRequest(formData);
      
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
              placeholder="필요한 서비스에 대해 자세히 설명해주세요"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>
        </div>
        
        {/* 위치 선택 섹션 */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">위치 정보</h2>
          
          <p className="text-sm text-gray-600 mb-4">
            지도에서 원하는 위치를 클릭하거나 마커를 드래그하여 위치를 선택해주세요.
          </p>
          
          {/* 카카오 맵 */}
          <EnhancedKakaoMap
            height="400px"
            selectable={true}
            onLocationSelect={handleLocationSelect}
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
          <h2 className="text-lg font-medium mb-4">견적 항목</h2>
          
          {errors.items && (
            <p className="mb-4 text-sm text-red-600">{errors.items}</p>
          )}
          
          {formData.items.map((item, index) => (
            <div 
              key={index} 
              className="mb-6 pb-6 border-b border-gray-200 last:border-0 last:mb-0 last:pb-0"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">항목 {index + 1}</h3>
                {formData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    삭제
                  </button>
                )}
              </div>
              
              {/* 항목 이름 */}
              <div className="mb-3">
                <label htmlFor={`items[${index}].name`} className="block text-sm font-medium text-gray-700 mb-1">
                  항목 이름 <span className="text-red-500">*</span>
                </label>
                <input
                  id={`items[${index}].name`}
                  name="name"
                  type="text"
                  value={item.name}
                  onChange={(e) => handleItemChange(index, e)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="항목 이름을 입력하세요"
                />
              </div>
              
              {/* 수량 */}
              <div className="mb-3">
                <label htmlFor={`items[${index}].quantity`} className="block text-sm font-medium text-gray-700 mb-1">
                  수량
                </label>
                <input
                  id={`items[${index}].quantity`}
                  name="quantity"
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, e)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* 항목 설명 */}
              <div>
                <label htmlFor={`items[${index}].description`} className="block text-sm font-medium text-gray-700 mb-1">
                  항목 설명
                </label>
                <textarea
                  id={`items[${index}].description`}
                  name="description"
                  rows={2}
                  value={item.description}
                  onChange={(e) => handleItemChange(index, e)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="항목에 대한 설명을 입력하세요"
                />
              </div>
            </div>
          ))}
          
          {/* 항목 추가 버튼 */}
          <button
            type="button"
            onClick={handleAddItem}
            className="mt-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            + 항목 추가
          </button>
        </div>
        
        {/* 제출 버튼 */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="mr-4 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            취소
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