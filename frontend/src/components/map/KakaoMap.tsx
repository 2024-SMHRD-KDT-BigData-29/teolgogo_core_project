// // src/components/map/KakaoMap.tsx
// 'use client';

// import { useEffect, useState, useRef } from 'react';
// import Script from 'next/script';

// interface KakaoMapProps {
//   width?: string;
//   height?: string;
//   latitude?: number;
//   longitude?: number;
//   level?: number;
//   onMapInitialized?: (map: any, kakao: any) => void;
//   useLibraries?: string;
// }

// export default function KakaoMap({
//   width = '100%',
//   height = '400px',
//   latitude = 37.566826,
//   longitude = 126.9786567,
//   level = 3,
//   onMapInitialized,
//   useLibraries = ""
// }: KakaoMapProps) {
//   const [map, setMap] = useState<any>(null);
//   const [isScriptLoaded, setIsScriptLoaded] = useState(false);
//   const [isMapInitialized, setIsMapInitialized] = useState(false);
//   const mapContainerRef = useRef<HTMLDivElement>(null);
  
//   // 카카오 API 키 설정
//   const KAKAO_API_KEY = '4f54433235c316d62370e1276a8c6e6d';

//   // 스크립트 로딩 상태 체크
//   const checkKakaoMapLoaded = () => {
//     if (typeof window !== 'undefined' && window.kakao && window.kakao.maps) {
//       setIsScriptLoaded(true);
//       return true;
//     }
//     return false;
//   };

//   // 스크립트 로드 완료 후 처리
//   const handleScriptLoad = () => {
//     if (typeof window !== 'undefined') {
//       if (window.kakao && window.kakao.maps) {
//         window.kakao.maps.load(() => {
//           console.log("카카오맵 스크립트 로드 완료");
//           setIsScriptLoaded(true);
//         });
//       } else {
//         // 스크립트 로드 체크 설정
//         const intervalId = setInterval(() => {
//           if (checkKakaoMapLoaded()) {
//             clearInterval(intervalId);
//           }
//         }, 500);
        
//         // 안전장치: 10초 후 인터벌 정리
//         setTimeout(() => clearInterval(intervalId), 10000);
//       }
//     }
//   };

//   // 지도 초기화 함수
//   const initializeMap = () => {
//     if (!isScriptLoaded || isMapInitialized || !mapContainerRef.current || !window.kakao || !window.kakao.maps) return;
    
//     try {
//       console.log("지도 초기화 시작");
//       const options = {
//         center: new window.kakao.maps.LatLng(latitude, longitude),
//         level: level
//       };
      
//       const kakaoMap = new window.kakao.maps.Map(mapContainerRef.current, options);
//       setMap(kakaoMap);
      
//       // 마커 생성 및 표시
//       const markerPosition = new window.kakao.maps.LatLng(latitude, longitude);
//       const marker = new window.kakao.maps.Marker({
//         position: markerPosition
//       });
      
//       marker.setMap(kakaoMap);
      
//       // 콜백 실행
//       if (onMapInitialized) {
//         onMapInitialized(kakaoMap, window.kakao);
//       }
      
//       // 초기화 완료 표시
//       setIsMapInitialized(true);
//       console.log("지도 초기화 완료");
//     } catch (error) {
//       console.error("지도 초기화 중 오류 발생:", error);
//     }
//   };

//   // 스크립트 로드 후 맵 초기화
//   useEffect(() => {
//     if (isScriptLoaded && !isMapInitialized) {
//       initializeMap();
//     }
//   }, [isScriptLoaded, isMapInitialized]);

//   // 좌표나 레벨 변경 시 맵 위치 업데이트
//   useEffect(() => {
//     if (map && window.kakao && isMapInitialized) {
//       const newCenter = new window.kakao.maps.LatLng(latitude, longitude);
//       map.setCenter(newCenter);
//       map.setLevel(level);
      
//       // 마커 위치 업데이트 (기존 마커 제거 후 새로 생성)
//       map.removeOverlayMapTypeId(window.kakao.maps.MapTypeId.MARKER);
//       const markerPosition = new window.kakao.maps.LatLng(latitude, longitude);
//       const marker = new window.kakao.maps.Marker({
//         position: markerPosition
//       });
//       marker.setMap(map);
//     }
//   }, [latitude, longitude, level, map, isMapInitialized]);

//   return (
//     <>
//       <Script
//         src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_API_KEY}&libraries=${useLibraries}&autoload=false`}
//         onLoad={handleScriptLoad}
//         strategy="afterInteractive"
//       />
      
//       <div 
//         ref={mapContainerRef}
//         id="kakao-map" 
//         style={{ 
//           width, 
//           height, 
//           position: 'relative'
//         }} 
//         className="rounded-lg shadow-md"
//       >
//         {!isScriptLoaded && (
//           <div className="flex items-center justify-center h-full w-full absolute top-0 left-0 bg-gray-100 rounded-lg">
//             <p>지도를 불러오는 중입니다...</p>
//           </div>
//         )}
//       </div>
//     </>
//   );
// }

// declare global {
//   interface Window {
//     kakao: any;
//   }
// }

// 단순 버전의 KakaoMap.tsx
// 수정된 KakaoMap.tsx
// 수정된 KakaoMap.tsx - 마커 관련 부분 개선
'use client';

import { useEffect, useState, useRef } from 'react';
import Script from 'next/script';

interface KakaoMapProps {
  width?: string;
  height?: string;
  latitude?: number;
  longitude?: number;
  level?: number;
  onMapInitialized?: (map: any, kakao: any) => void;
  useLibraries?: string;
}

export default function KakaoMap({
  width = '100%',
  height = '400px',
  latitude = 37.566826,
  longitude = 126.9786567,
  level = 3,
  onMapInitialized,
  useLibraries = ""
}: KakaoMapProps) {
  const [mapInstance, setMapInstance] = useState<any>(null);
  const markerRef = useRef<any>(null); // 마커 참조 저장
  const KAKAO_API_KEY = '4f54433235c316d62370e1276a8c6e6d';

  // 카카오맵 초기화 함수
  const initializeMap = () => {
    if (!window.kakao || !window.kakao.maps) return;
    
    console.log("지도 초기화 시작");
    const container = document.getElementById('kakao-map');
    if (!container) {
      console.error("지도 컨테이너를 찾을 수 없습니다");
      return;
    }
    
    console.log("컨테이너 크기:", container.offsetWidth, container.offsetHeight);
    console.log("초기 좌표:", latitude, longitude);
    
    try {
      const options = {
        center: new window.kakao.maps.LatLng(latitude, longitude),
        level: level
      };
      
      const map = new window.kakao.maps.Map(container, options);
      setMapInstance(map);
      
      // 마커 생성 및 저장
      const position = new window.kakao.maps.LatLng(latitude, longitude);
      const marker = new window.kakao.maps.Marker({
        position: position,
        map: map // 지도에 바로 마커 표시
      });
      
      markerRef.current = marker;
      
      console.log("지도 초기화 완료, 마커 위치:", latitude, longitude);
      
      if (onMapInitialized) {
        onMapInitialized(map, window.kakao);
      }
    } catch (error) {
      console.error("지도 초기화 오류:", error);
    }
  };

  // 좌표 변경 시 지도와 마커 업데이트
  useEffect(() => {
    if (mapInstance && window.kakao && window.kakao.maps) {
      console.log("좌표 업데이트:", latitude, longitude);
      
      // 새 좌표 생성
      const newPosition = new window.kakao.maps.LatLng(latitude, longitude);
      
      // 지도 중심 이동
      mapInstance.setCenter(newPosition);
      mapInstance.setLevel(level);
      
      // 마커 위치 업데이트
      if (markerRef.current) {
        markerRef.current.setPosition(newPosition);
      } else {
        // 마커가 없으면 새로 생성
        const marker = new window.kakao.maps.Marker({
          position: newPosition,
          map: mapInstance
        });
        markerRef.current = marker;
      }
    }
  }, [latitude, longitude, level, mapInstance]);

  return (
    <>
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_API_KEY}&libraries=${useLibraries}&autoload=false`}
        onLoad={() => {
          console.log("스크립트 태그 로드됨");
          if (window.kakao) {
            window.kakao.maps.load(() => {
              console.log("카카오맵 SDK 로드됨");
              // 직접 초기화 호출
              setTimeout(initializeMap, 100);
            });
          }
        }}
        strategy="afterInteractive"
      />
      
      <div 
        id="kakao-map" 
        style={{
          width, 
          height,
          position: 'relative',
          minWidth: '300px',
          minHeight: '300px',
          border: '1px solid #ddd'
        }}
        className="rounded-lg shadow-md"
      >
        {!mapInstance && (
          <div className="flex items-center justify-center h-full w-full absolute top-0 left-0 bg-gray-100 rounded-lg">
            <p>지도를 불러오는 중입니다...</p>
          </div>
        )}
      </div>
    </>
  );
}

declare global {
  interface Window {
    kakao: any;
  }
}