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
  const markerRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const KAKAO_API_KEY = '4f54433235c316d62370e1276a8c6e6d';
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // 카카오맵 초기화 함수
  const initializeMap = () => {
    if (!window.kakao || !window.kakao.maps || !mapContainerRef.current) return;
    
    console.log("지도 초기화 시작");
    
    try {
      const options = {
        center: new window.kakao.maps.LatLng(latitude, longitude),
        level: level
      };
      
      const map = new window.kakao.maps.Map(mapContainerRef.current, options);
      setMapInstance(map);
      
      // 마커 생성 및 저장
      const position = new window.kakao.maps.LatLng(latitude, longitude);
      const marker = new window.kakao.maps.Marker({
        position: position,
        map: map
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

  // 스크립트 로드 후 지도 초기화
  useEffect(() => {
    if (isScriptLoaded && mapContainerRef.current) {
      const timer = setTimeout(() => {
        initializeMap();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isScriptLoaded]);

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
        src={`http://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_API_KEY}&libraries=${useLibraries}&autoload=false`}
        onLoad={() => {
          if (window.kakao) {
            window.kakao.maps.load(() => {
              console.log("카카오맵 SDK 로드됨");
              setIsScriptLoaded(true);
            });
          }
        }}
        strategy="beforeInteractive"
      />
      
      <div 
        ref={mapContainerRef}
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