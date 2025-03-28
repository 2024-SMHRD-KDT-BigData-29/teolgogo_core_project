// src/components/map/EnhancedKakaoMap.tsx
// KakaoMap 컴포넌트를 활용하여 견적의뢰 시스템에 맞게 개선하는 컴포넌트입니다.

'use client';

import { useEffect, useState, useRef } from 'react';
import KakaoMap from './KakaoMap'; // 기본 KakaoMap 컴포넌트 임포트
import { getCurrentLocation } from '@/utils/locationUtils';

interface EnhancedKakaoMapProps {
  width?: string;
  height?: string;
  initialLatitude?: number;
  initialLongitude?: number;
  level?: number;
  selectable?: boolean;
  onLocationSelect?: (lat: number, lng: number, address: string) => void;
}

export default function EnhancedKakaoMap({
  width = '100%',
  height = '400px',
  initialLatitude,
  initialLongitude,
  level = 3,
  selectable = false,
  onLocationSelect
}: EnhancedKakaoMapProps) {
  // 지도 초기 좌표 상태
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number}>({
    lat: initialLatitude || 37.566826, // 기본값: 서울시청
    lng: initialLongitude || 126.9786567
  });
  
  // 선택된 위치 상태
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);
  
  // 지도 및 마커 참조를 위한 상태
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [markerInstance, setMarkerInstance] = useState<any>(null);
  
  // 스크립트 로드 상태
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  
  // 지도 초기화 후 작업을 위한 콜백 함수
  const handleMapInitialized = (map: any, kakao: any) => {
    // 지도 인스턴스 저장
    setMapInstance(map);
    setIsScriptLoaded(true);
    
    if (!selectable) return; // 선택 모드가 아니면 추가 기능 설정 안함
    
    // 초기 마커 생성
    const markerPosition = new kakao.maps.LatLng(coordinates.lat, coordinates.lng);
    const newMarker = new kakao.maps.Marker({
      position: markerPosition,
      draggable: selectable // 선택 가능 모드에서는 마커 드래그 가능
    });
    
    // 마커를 지도에 표시
    newMarker.setMap(map);
    setMarkerInstance(newMarker);
    
    // 지도 클릭 이벤트
    kakao.maps.event.addListener(map, 'click', function(mouseEvent: any) {
      // 클릭한 위치의 좌표 가져오기
      const latlng = mouseEvent.latLng;
      
      // 마커 위치 이동
      newMarker.setPosition(latlng);
      
      // 좌표를 주소로 변환
      getAddressFromCoords(kakao, latlng.getLat(), latlng.getLng());
    });
    
    // 마커 드래그 종료 이벤트
    kakao.maps.event.addListener(newMarker, 'dragend', function() {
      const position = newMarker.getPosition();
      getAddressFromCoords(kakao, position.getLat(), position.getLng());
    });
    
    // 초기 위치의 주소 가져오기
    getAddressFromCoords(kakao, coordinates.lat, coordinates.lng);
  };
  
  // 컴포넌트 마운트 시 현재 위치 가져오기
  useEffect(() => {
    const initializeLocation = async () => {
      // 초기 위도/경도가 제공된 경우 사용
      if (initialLatitude && initialLongitude) {
        setCoordinates({
          lat: initialLatitude,
          lng: initialLongitude
        });
      } else {
        // 아니면 사용자 현재 위치 사용 시도
        try {
          const position = await getCurrentLocation();
          setCoordinates({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        } catch (error) {
          console.error('현재 위치를 가져오는데 실패했습니다:', error);
          // 기본값 사용 (이미 설정됨)
        }
      }
    };
    
    initializeLocation();
  }, [initialLatitude, initialLongitude]);
  
  // 좌표를 주소로 변환하는 함수
  const getAddressFromCoords = (kakao: any, lat: number, lng: number) => {
    // 주소-좌표 변환 객체 생성
    const geocoder = new kakao.maps.services.Geocoder();
    
    // 좌표로 주소 정보 요청
    geocoder.coord2Address(lng, lat, (result: any, status: any) => {
      if (status === kakao.maps.services.Status.OK) {
        const addressInfo = result[0];
        const address = addressInfo.address.address_name;
        
        // 선택된 위치 정보 업데이트
        setSelectedLocation({
          lat,
          lng,
          address
        });
        
        // 콜백 호출 (있는 경우)
        if (onLocationSelect) {
          onLocationSelect(lat, lng, address);
        }
      }
    });
  };
  
  // 스크립트가 로드되면 마커 초기화
  useEffect(() => {
    // mapInstance와 스크립트가 로드되었는지 확인
    if (!mapInstance || !isScriptLoaded || !window.kakao) return;
    
    // selectable 속성이 변경될 때 마커 재설정
    if (selectable && !markerInstance) {
      const markerPosition = new window.kakao.maps.LatLng(coordinates.lat, coordinates.lng);
      const newMarker = new window.kakao.maps.Marker({
        position: markerPosition,
        draggable: selectable
      });
      
      newMarker.setMap(mapInstance);
      setMarkerInstance(newMarker);
      
      // 초기 위치의 주소 가져오기
      getAddressFromCoords(window.kakao, coordinates.lat, coordinates.lng);
    } else if (!selectable && markerInstance) {
      // selectable이 false로 변경되면 마커 제거
      markerInstance.setMap(null);
      setMarkerInstance(null);
      setSelectedLocation(null);
    }
  }, [selectable, mapInstance, isScriptLoaded]);
  
  return (
    <div className="w-full flex flex-col">
      {/* 기본 KakaoMap 컴포넌트 사용 */}
      <KakaoMap
        width={width}
        height={height}
        latitude={coordinates.lat}
        longitude={coordinates.lng}
        level={level}
        onMapInitialized={handleMapInitialized}
        useLibraries={selectable ? "services" : ""} // 주소 변환을 위해 services 라이브러리 필요
      />
      
      {/* 선택된 위치 정보 표시 (선택 가능 모드일 때만) */}
      {selectable && selectedLocation && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
          <p className="text-sm font-medium text-gray-700">선택한 위치:</p>
          <p className="text-sm text-gray-600">
            {selectedLocation.address}
          </p>
          <p className="text-xs text-gray-500">
            좌표: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
}