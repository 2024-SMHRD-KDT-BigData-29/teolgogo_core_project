// 푸터 컴포넌트

'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-8" style={{ maxWidth: '500px' }}>
        {/* 로고 및 설명 */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center mb-4 justify-center">
            <div className="relative w-8 h-8 mr-2">
              <Image 
                src="/logo-white.svg" 
                alt="털고고 로고" 
                layout="fill" 
                objectFit="contain"
              />
            </div>
            <span className="text-lg font-bold text-white">털고고</span>
          </Link>
          <p className="text-sm mb-4">
            내 주변 반려동물 미용 서비스 견적 비교 플랫폼
          </p>

          {/* 소셜 아이콘 */}
          <div className="flex justify-center space-x-4 mt-4">
            {/* 예시: 페이스북 */}
            <a href="#" className="text-gray-400 hover:text-white transition">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="..." />
              </svg>
            </a>
            {/* 다른 아이콘들 필요 시 추가 */}
          </div>
        </div>

        {/* 링크 섹션 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
          {/* 서비스 */}
          <div>
            <h3 className="text-white font-medium mb-2 text-sm">서비스</h3>
            <ul className="space-y-1 text-sm">
              <li><Link href="/quotation/new" className="hover:text-white transition">견적 요청하기</Link></li>
              <li><Link href="/business/register" className="hover:text-white transition">펫샵 등록하기</Link></li>
              <li><Link href="/search/shops" className="hover:text-white transition">주변 펫샵 찾기</Link></li>
              <li><Link href="/help" className="hover:text-white transition">이용 가이드</Link></li>
            </ul>
          </div>

          {/* 회사 정보 */}
          <div>
            <h3 className="text-white font-medium mb-2 text-sm">회사 정보</h3>
            <ul className="space-y-1 text-sm">
              <li><Link href="/about" className="hover:text-white transition">회사 소개</Link></li>
              <li><Link href="/terms" className="hover:text-white transition">이용약관</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition">개인정보처리방침</Link></li>
              <li><Link href="/contact" className="hover:text-white transition">문의하기</Link></li>
            </ul>
          </div>

          {/* 고객센터 */}
          <div>
            <h3 className="text-white font-medium mb-2 text-sm">고객센터</h3>
            <p className="mb-2">
              <span className="text-sm">운영시간</span><br />
              평일 09:00 - 18:00
            </p>
            <p className="mb-4">
              <span className="text-sm">문의 이메일</span><br />
              <a href="mailto:help@teolgogo.com" className="hover:text-white transition">
                help@teolgogo.com
              </a>
            </p>
            <Link 
              href="/faq" 
              className="inline-block bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded transition text-sm"
            >
              자주 묻는 질문
            </Link>
          </div>
        </div>

        {/* 바닥 정보 */}
        <div className="border-t border-gray-800 pt-4 text-xs text-gray-400 text-center">
          <p>
            (주)털고고 | 사업자등록번호: 123-45-67890<br />
            주소: 서울특별시 강남구 테헤란로 123, 4층<br />
            통신판매업 신고번호: 제2024-서울강남-1234호
          </p>
          <p className="mt-2">
            © {currentYear} 털고고. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
