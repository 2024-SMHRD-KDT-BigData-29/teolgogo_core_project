'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import {
  prepareTossPayment,
  prepareKakaoPayment,
  confirmTossPayment,
  confirmKakaoPayment,
  processVirtualPayment,
  Payment
} from '../../../../api/payment';
import { getQuoteRequestDetails } from '../../../../api/quotation';

interface PaymentProcessPageProps {
  params: {
    quoteResponseId: string;
  };
}

const PaymentProcessPage: React.FC<PaymentProcessPageProps> = ({ params }) => {
  const quoteResponseId = parseInt(params.quoteResponseId);
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [quoteDetails, setQuoteDetails] = useState<any>(null);
  const [selectedQuoteResponse, setSelectedQuoteResponse] = useState<any>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('CARD');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentResult, setPaymentResult] = useState<Payment | null>(null);
  
  useEffect(() => {
    // 비로그인 상태 또는 고객 회원이 아닌 경우 리디렉션
    if (!isAuthenticated) {
      router.push(`/login?redirect=/payments/process/${quoteResponseId}`);
      return;
    }
    
    if (user && user.role !== 'CUSTOMER') {
      router.push('/dashboard');
      return;
    }
    
    // 결제 콜백 파라미터 처리
    const paymentProvider = searchParams.get('provider');
    
    if (paymentProvider) {
      handlePaymentCallback(paymentProvider);
    } else {
      fetchQuoteDetails();
    }
  }, [isAuthenticated, user, quoteResponseId, router, searchParams]);
  
  // 견적 상세 정보 가져오기
  const fetchQuoteDetails = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const requestId = localStorage.getItem(`quote_request_id_${quoteResponseId}`);
      
      if (!requestId) {
        throw new Error('견적 요청 정보를 찾을 수 없습니다.');
      }
      
      const response = await getQuoteRequestDetails(parseInt(requestId));
      setQuoteDetails(response);
      
      // 선택된 견적 응답 찾기
      let selectedResponse;
      
      if (response.offers) {
        selectedResponse = response.offers.find((offer: any) => offer.id === quoteResponseId);
      }
      
      if (!selectedResponse) {
        throw new Error('선택한 견적 제안을 찾을 수 없습니다.');
      }
      
      setSelectedQuoteResponse(selectedResponse);
    } catch (error: any) {
      console.error('견적 상세 조회 실패:', error);
      setError(error.message || '견적 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 결제 콜백 처리
  const handlePaymentCallback = async (provider: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      if (provider === 'toss') {
        const paymentKey = searchParams.get('paymentKey');
        const orderId = searchParams.get('orderId');
        const amount = searchParams.get('amount');
        
        if (!paymentKey || !orderId || !amount) {
          throw new Error('결제 정보가 없습니다.');
        }
        
        const response = await confirmTossPayment(
          paymentKey,
          orderId,
          parseInt(amount)
        );
        
        setPaymentResult(response);
        setIsSuccess(true);
      } else if (provider === 'kakao') {
        const pgToken = searchParams.get('pg_token');
        const orderId = searchParams.get('partner_order_id');
        const userId = searchParams.get('partner_user_id');
        const tid = searchParams.get('tid');
        
        if (!pgToken || !orderId || !userId || !tid) {
          throw new Error('결제 정보가 없습니다.');
        }
        
        const response = await confirmKakaoPayment(
          pgToken,
          orderId,
          userId,
          tid
        );
        
        setPaymentResult(response);
        setIsSuccess(true);
      }
    } catch (error: any) {
      console.error('결제 처리 실패:', error);
      setError(error.message || '결제 처리에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 결제 방법 선택 핸들러
  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPaymentMethod(e.target.value);
  };
  
  // 토스 결제 준비
  const handleTossPayment = async () => {
    setIsProcessing(true);
    setError('');
    
    try {
      const response = await prepareTossPayment(quoteResponseId);
      
      // 결제 요청 ID 임시 저장
      if (quoteDetails && quoteDetails.request) {
        localStorage.setItem(`quote_request_id_${quoteResponseId}`, quoteDetails.request.id);
      }
      
      // 토스페이먼츠 결제 페이지로 리디렉션
      window.location.href = response.checkoutUrl;
    } catch (error: any) {
      console.error('토스페이먼츠 결제 준비 실패:', error);
      setError(error.response?.data?.message || '결제 준비 중 오류가 발생했습니다.');
      setIsProcessing(false);
    }
  };
  
  // 카카오페이 결제 준비
  const handleKakaoPayment = async () => {
    setIsProcessing(true);
    setError('');
    
    try {
      const response = await prepareKakaoPayment(quoteResponseId);
      
      // 결제 요청 ID 임시 저장
      if (quoteDetails && quoteDetails.request) {
        localStorage.setItem(`quote_request_id_${quoteResponseId}`, quoteDetails.request.id);
      }
      
      // 카카오페이 결제 페이지로 리디렉션
      window.location.href = response.next_redirect_pc_url;
    } catch (error: any) {
      console.error('카카오페이 결제 준비 실패:', error);
      setError(error.response?.data?.message || '결제 준비 중 오류가 발생했습니다.');
      setIsProcessing(false);
    }
  };
  
  // 가상 결제 처리 (개발 및 테스트용)
  const handleVirtualPayment = async () => {
    setIsProcessing(true);
    setError('');
    
    try {
      const response = await processVirtualPayment(quoteResponseId, selectedPaymentMethod as any);
      setPaymentResult(response);
      setIsSuccess(true);
    } catch (error: any) {
      console.error('가상 결제 처리 실패:', error);
      setError(error.response?.data?.message || '결제 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // 결제 시작 핸들러
  const handleStartPayment = () => {
    if (selectedPaymentMethod === 'TOSS_PAY') {
      handleTossPayment();
    } else if (selectedPaymentMethod === 'KAKAO_PAY') {
      handleKakaoPayment();
    } else {
      // 개발 환경에서는 가상 결제 사용
      handleVirtualPayment();
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="bg-green-100 text-green-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">결제가 완료되었습니다</h1>
          <p className="text-gray-600 mb-6">결제가 성공적으로, 서비스 예약이 확정되었습니다.</p>
          
          {paymentResult && (
            <div className="bg-gray-50 p-4 rounded-lg text-left mb-6">
              <h2 className="font-semibold mb-2">결제 정보</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div><span className="text-gray-600">결제 금액:</span> {paymentResult.amount.toLocaleString()}원</div>
                <div><span className="text-gray-600">결제 방법:</span> {paymentResult.paymentMethod}</div>
                <div><span className="text-gray-600">주문 번호:</span> {paymentResult.orderId}</div>
                <div><span className="text-gray-600">결제 시간:</span> {new Date(paymentResult.paidAt || '').toLocaleString('ko-KR')}</div>
              </div>
            </div>
          )}
          
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <button
              onClick={() => router.push('/chat')}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              채팅으로 이동
            </button>
            <button
              onClick={() => router.push('/payments/history')}
              className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              결제 내역 보기
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
        >
          뒤로 가기
        </button>
      </div>
    );
  }
  
  if (!selectedQuoteResponse) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
          <p>선택한 견적 정보를 찾을 수 없습니다.</p>
        </div>
        <button
          onClick={() => router.push('/quotes')}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
        >
          견적 목록으로 돌아가기
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">결제하기</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 결제 정보 요약 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">서비스 내역</h2>
            
            <div className="border-b pb-4 mb-4">
              <p className="font-medium text-lg">{selectedQuoteResponse.businessName}의 펫 미용 서비스</p>
              <p className="text-gray-600">
                {quoteDetails.request.petBreed} ({quoteDetails.request.petWeight}kg)
              </p>
              {selectedQuoteResponse.availableDate && (
                <p className="text-gray-600">
                  예약일: {new Date(selectedQuoteResponse.availableDate).toLocaleString('ko-KR')}
                </p>
              )}
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">서비스 비용</span>
                <span>{selectedQuoteResponse.price.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                <span>부가세 (포함)</span>
                <span>{Math.round(selectedQuoteResponse.price / 11).toLocaleString()}원</span>
              </div>
            </div>
            
            <div className="border-t pt-4 flex justify-between items-center font-bold">
              <span>최종 결제 금액</span>
              <span className="text-xl text-blue-600">{selectedQuoteResponse.price.toLocaleString()}원</span>
            </div>
          </div>
        </div>
        
        {/* 결제 수단 선택 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">결제 수단</h2>
            
            <div className="space-y-3 mb-6">
              <label className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="CARD"
                  checked={selectedPaymentMethod === 'CARD'}
                  onChange={handlePaymentMethodChange}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2">신용카드</span>
              </label>
              
              <label className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="KAKAO_PAY"
                  checked={selectedPaymentMethod === 'KAKAO_PAY'}
                  onChange={handlePaymentMethodChange}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2">카카오페이</span>
              </label>
              
              <label className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="TOSS_PAY"
                  checked={selectedPaymentMethod === 'TOSS_PAY'}
                  onChange={handlePaymentMethodChange}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2">토스페이</span>
              </label>
              
              <label className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="VIRTUAL_ACCOUNT"
                  checked={selectedPaymentMethod === 'VIRTUAL_ACCOUNT'}
                  onChange={handlePaymentMethodChange}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2">가상계좌</span>
              </label>
            </div>
            
            <button
              onClick={handleStartPayment}
              disabled={isProcessing}
              className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isProcessing ? '처리 중...' : '결제하기'}
            </button>
            
            <p className="text-xs text-gray-500 mt-4">
              결제하기 버튼을 클릭하면 선택한 결제수단으로 결제가 진행됩니다. 
              결제 완료 후 서비스가 예약됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentProcessPage;