// components/quotation/QuotationRequestDetail.tsx
// 견적 요청 상세 정보를 표시하는 컴포넌트

import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface QuotationRequest {
  id: string;
  customerName: string;
  description: string;
  serviceType: string;
  address: string;
  createdAt: string;
  status: 'PENDING' | 'OFFERED' | 'ACCEPTED' | 'COMPLETED';
}

interface QuotationRequestDetailProps {
  request: QuotationRequest;
}

export default function QuotationRequestDetail({ request }: QuotationRequestDetailProps) {
  // 상태 표시 문구 및 색상
  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { text: '대기 중', color: 'bg-yellow-100 text-yellow-800' };
      case 'OFFERED': 
        return { text: '견적 제안됨', color: 'bg-blue-100 text-blue-800' };
      case 'ACCEPTED':
        return { text: '견적 수락됨', color: 'bg-green-100 text-green-800' };
      case 'COMPLETED':
        return { text: '완료됨', color: 'bg-gray-100 text-gray-800' };
      default:
        return { text: '알 수 없음', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const statusDetails = getStatusDetails(request.status);
  const formattedDate = format(new Date(request.createdAt), 'yyyy년 MM월 dd일 HH:mm', { locale: ko });

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold">{request.serviceType} 서비스 요청</h2>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusDetails.color}`}>
          {statusDetails.text}
        </span>
      </div>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">요청자</p>
          <p className="font-medium">{request.customerName}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">위치</p>
          <p className="font-medium">{request.address}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">요청 내용</p>
          <p className="whitespace-pre-line">{request.description}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">요청 시간</p>
          <p className="font-medium">{formattedDate}</p>
        </div>
      </div>
    </div>
  );
}