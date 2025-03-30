'use client';

import { useTheme } from '@/context/ThemeContext';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  const { theme } = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 dark:text-gray-400">
      {/* 인라인 스타일 제거하고 반응형 컨테이너 클래스 적용 */}
      <div className="w-full max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-4 py-8">
        {/* 로고 및 설명 */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center mb-4 justify-center">
            <div className="relative w-8 h-8 mr-2">
              <Image 
                src="/logo-white.svg"
                alt="털고고 로고" 
                width={32}
                height={32}
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
            {/* 인스타그램 */}
            <a href="#" className="text-gray-400 hover:text-white transition">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
            {/* 카카오톡 */}
            <a href="#" className="text-gray-400 hover:text-white transition">
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,2C6.48,2,2,5.52,2,10c0,2.81,1.47,5.26,3.68,6.74L4.55,20.5c-0.08,0.28,0.19,0.53,0.46,0.43l4.06-1.56 C10.26,19.61,11.11,19.8,12,19.8c5.52,0,10-3.52,10-8S17.52,2,12,2z"/>
              </svg>
            </a>
            {/* 유튜브 */}
            <a href="#" className="text-gray-400 hover:text-white transition">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>
        </div>

        {/* 링크 섹션 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
          {/* 서비스 */}
          <div>
            <h3 className="text-white font-medium mb-2 text-sm">서비스</h3>
            <ul className="space-y-1 text-sm">
              <li><Link href="/quotation/new" className="hover:text-white transition">견적 요청하기</Link></li>
              <li><Link href="/signup?type=business" className="hover:text-white transition">펫샵 등록하기</Link></li>
              <li><Link href="/businesses" className="hover:text-white transition">주변 펫샵 찾기</Link></li>
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
              className="inline-block bg-gray-800 hover:bg-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 px-3 py-2 rounded transition text-sm"
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