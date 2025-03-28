// components/quotation/QuotationOffersList.tsx
// 견적 제안 목록을 표시하는 컴포넌트

import { useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface QuotationOffer {
  id: string;
  businessName: string;
  description: string;
  price: number;
  estimatedTime: string;
  createdAt: string;
}

interface QuotationOffersListProps {
  offers: QuotationOffer[];
  onAcceptOffer: (offerId: string) => void;
}

export default function QuotationOffersList({ offers, onAcceptOffer }: QuotationOffersListProps) {
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);

  // 견적 제안 선택 처리
  const handleSelectOffer = (offerId: string) => {
    setSelectedOfferId(offerId);
  };

  // 견적 제안 수락 처리
  const handleAcceptOffer = () => {
    if (selectedOfferId) {
      onAcceptOffer(selectedOfferId);
    }
  };

  return (
    <div className="space-y-6">
      {offers.map((offer) => (
        <div 
          key={offer.id} 
          className={`bg-white rounded-lg p-4 border-2 transition-all ${
            selectedOfferId === offer.id ? 'border-blue-500 shadow-md' : 'border-gray-200'
          }`}
          onClick={() => handleSelectOffer(offer.id)}
        >
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-medium">{offer.businessName}</h3>
            <p className="text-xl font-bold">{offer.price.toLocaleString()}원</p>
          </div>
          
          <div className="mb-3">
            <p className="text-sm text-gray-500">견적 설명</p>
            <p className="whitespace-pre-line">{offer.description}</p>
          </div>
          
          <div className="flex justify-between text-sm text-gray-500">
            <p>예상 소요시간: {offer.estimatedTime}</p>
            <p>제안일: {format(new Date(offer.createdAt), 'MM/dd HH:mm', { locale: ko })}</p>
          </div>
          
          {selectedOfferId === offer.id && (
            <div className="mt-4 flex justify-end">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                onClick={handleAcceptOffer}
              >
                이 견적 선택하기
              </button>
            </div>
          )}
        </div>
      ))}
      
      {offers.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="font-medium">견적 선택 시 주의사항:</p>
          <ul className="list-disc pl-5 text-sm text-gray-600 mt-2">
            <li>견적을 선택하면 해당 업체와 예약이 확정됩니다.</li>
            <li>예약 확정 후에는 업체와 채팅으로 소통할 수 있습니다.</li>
            <li>부득이한 사정으로 취소해야 할 경우, 빠른 시일 내에 업체에 연락해주세요.</li>
          </ul>
        </div>
      )}
    </div>
  );
}