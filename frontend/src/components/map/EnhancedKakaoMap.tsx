// components/map/EnhancedKakaoMap.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import KakaoMap from './KakaoMap';
import useLocation from '@/hooks/useLocation';
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
  // 훅 가져오기
  const { getAddressFromCoords } = useLocation();
  
  // useRef를 사용하여 마운트 상태 추적 - 불필요한 리렌더링 방지
  const isMounted = useRef(false);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  
  // 상태 관리
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number}>({
    lat: initialLatitude || 37.566826, // 기본값: 서울시청
    lng: initialLongitude || 126.9786567
  });
  
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);
  
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  
  // 위치 선택 시 콜백 처리
  const handleLocationSelected = (lat: number, lng: number, address: string) => {
    setSelectedLocation({ lat, lng, address });
    if (onLocationSelect) {
      onLocationSelect(lat, lng, address);
    }
  };
  
  // 주소 가져오기 처리
  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const address = await getAddressFromCoords(lat, lng);
      handleLocationSelected(lat, lng, address || '주소를 찾을 수 없습니다');
    } catch (error) {
      console.error('주소 변환 실패:', error);
      handleLocationSelected(lat, lng, '주소를 찾을 수 없습니다');
    }
  };
  
  // 지도 초기화 콜백
  const handleMapInitialized = (map: any, kakao: any) => {
    // mapRef에 인스턴스 저장
    mapRef.current = map;
    setIsScriptLoaded(true);
    setIsMapReady(true);
    
    if (!selectable) return;
    
    // 정확한 좌표로 마커 생성
    const markerPosition = new kakao.maps.LatLng(coordinates.lat, coordinates.lng);
    
    const newMarker = new kakao.maps.Marker({
      position: markerPosition,
      draggable: selectable
    });
    
    newMarker.setMap(map);
    markerRef.current = newMarker;
    
    // 지도 클릭 이벤트
    kakao.maps.event.addListener(map, 'click', function(mouseEvent: any) {
      const latlng = mouseEvent.latLng;
      
      // 마커 위치 이동
      newMarker.setPosition(latlng);
      
      // 좌표를 주소로 변환
      fetchAddress(latlng.getLat(), latlng.getLng());
    });
    
    // 마커 드래그 종료 이벤트
    kakao.maps.event.addListener(newMarker, 'dragend', function() {
      const position = newMarker.getPosition();
      fetchAddress(position.getLat(), position.getLng());
    });
    
    // 초기 위치의 주소 가져오기
    fetchAddress(coordinates.lat, coordinates.lng);
  };
  
  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    const initializeLocation = async () => {
      // 이미 마운트된 경우 중복 실행 방지
      if (isMounted.current) return;
      isMounted.current = true;
      
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
          // 기본값 유지
        }
      }
    };
    
    initializeLocation();
    
    // 컴포넌트 언마운트 시 정리 작업
    return () => {
      isMounted.current = false;
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, [initialLatitude, initialLongitude]);
  
  // coordinates가 변경되면 지도 중심과 마커 위치 업데이트
  useEffect(() => {
    if (!isMapReady || !mapRef.current || !markerRef.current) return;
    
    // window.kakao 객체가 있는지 확인
    if (typeof window !== 'undefined' && window.kakao && window.kakao.maps) {
      const { kakao } = window;
      const newPosition = new kakao.maps.LatLng(coordinates.lat, coordinates.lng);
      
      // 지도 중심 변경
      mapRef.current.setCenter(newPosition);
      
      // 마커 위치 변경
      markerRef.current.setPosition(newPosition);
      
      // 주소 업데이트
      fetchAddress(coordinates.lat, coordinates.lng);
    }
  }, [coordinates, isMapReady]);
  
  // 로딩 상태를 처리하는 대신 항상 KakaoMap 컴포넌트 렌더링
  return (
    <div className="w-full flex flex-col">
      <KakaoMap
        width={width}
        height={height}
        latitude={coordinates.lat}
        longitude={coordinates.lng}
        level={level}
        onMapInitialized={handleMapInitialized}
        useLibraries="services" // 주소 변환을 위해 services 라이브러리 필요
      />
      
      {selectable && selectedLocation && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
          <p className="text-sm font-medium text-gray-700">선택한 위치:</p>
          <p className="text-sm text-gray-600">{selectedLocation.address}</p>
          <p className="text-xs text-gray-500">
            좌표: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
}