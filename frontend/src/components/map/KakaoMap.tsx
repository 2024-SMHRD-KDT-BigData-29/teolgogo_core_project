// app/components/map/KakaoMap.tsx
// 카카오 지도 API를 연동하는 예시 컴포넌트(2차 개발 예정)

'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

// 카카오 지도 컴포넌트 Props 타입 정의
interface KakaoMapProps {
  width?: string;
  height?: string;
  latitude?: number;
  longitude?: number;
  level?: number;
  onMapInitialized?: (map: any, kakao: any) => void; // 이 속성 추가
  useLibraries?: string; // 이 속성도 필요해 보입니다
}

// 기본값이 포함된 카카오 지도 컴포넌트
export default function KakaoMap({
  width = '100%',
  height = '400px',
  latitude = 37.566826,  // 기본값: 서울시청
  longitude = 126.9786567,
  level = 3,
  onMapInitialized, // 이 속성 추가
  useLibraries = "" // 이 속성도 추가
}: KakaoMapProps) {
  // 지도 인스턴스를 상태로 관리
  const [map, setMap] = useState<any>(null);
  // 카카오 맵 스크립트 로드 상태 관리
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // 스크립트 로드 후 지도 초기화
  useEffect(() => {
    // 카카오 맵 스크립트가 로드되었고, window.kakao 객체가 존재하는 경우에만 지도 초기화
    if (isScriptLoaded && window.kakao) {
      const mapContainer = document.getElementById('kakao-map');
      
      // 지도 옵션 설정
      const options = {
        center: new window.kakao.maps.LatLng(latitude, longitude), // 지도 중심 좌표
        level: level // 확대 레벨
      };
      
      // 지도 생성 및 상태 저장
      const kakaoMap = new window.kakao.maps.Map(mapContainer, options);
      setMap(kakaoMap);
      
      // 마커 생성
      const markerPosition = new window.kakao.maps.LatLng(latitude, longitude);
      const marker = new window.kakao.maps.Marker({
        position: markerPosition
      });
      
      // 마커를 지도에 표시
      marker.setMap(kakaoMap);
      
      // onMapInitialized 콜백 호출 (존재하는 경우)
      if (onMapInitialized) {
        onMapInitialized(kakaoMap, window.kakao);
      }
    }
  }, [latitude, longitude, level, isScriptLoaded, onMapInitialized]);
  
  // 카카오맵 로드 확인 함수
  const checkKakaoMapLoaded = () => {
    // window.kakao가 정의되었고, maps 속성이 있는지 확인
    if (typeof window !== 'undefined' && window.kakao && window.kakao.maps) {
      try {
        window.kakao.maps.load(() => {
          setIsScriptLoaded(true);
        });
      } catch (error) {
        console.error("카카오맵 초기화 오류:", error);
        // 이미 로드되었으면 바로 설정
        setIsScriptLoaded(true);
      }
    } else {
      // 아직 로드되지 않았으면 1초 후 재시도
      setTimeout(checkKakaoMapLoaded, 1000);
    }
  };

  return (
    <>
      {/* 카카오 맵 스크립트 로드 */}
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_KAKAO_APP_KEY&libraries=${useLibraries}&autoload=false`}
        onLoad={() => {
          // 브라우저 환경인지 확인
          if (typeof window !== 'undefined') {
            try {
              if (window.kakao && window.kakao.maps) {
                window.kakao.maps.load(() => {
                  setIsScriptLoaded(true);
                });
              } else {
                // kakao 객체가 아직 정의되지 않았거나 maps 속성이 없는 경우
                console.log("카카오맵 객체 로딩 중...");
                // 타이머 설정하여 kakao 객체 로딩 확인
                checkKakaoMapLoaded();
              }
            } catch (error) {
              console.error("카카오맵 초기화 오류:", error);
            }
          }
        }}
        strategy="afterInteractive"
      />
      
      {/* 지도가 표시될 div */}
      <div 
        id="kakao-map" 
        style={{ width, height }}
      >
        {!isScriptLoaded && (
          <div className="flex items-center justify-center h-full bg-gray-100">
            <p>지도를 불러오는 중입니다...</p>
          </div>
        )}
      </div>
    </>
  );
}

// 전역 window 타입 확장 (TypeScript)
declare global {
  interface Window {
    kakao: any;
  }
}