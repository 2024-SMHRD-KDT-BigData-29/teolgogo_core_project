// components/map/EnhancedKakaoMap.tsx
import React, { useEffect, useRef, useState } from 'react';

interface EnhancedKakaoMapProps {
  width?: string;
  height?: string;
  initialLatitude?: number;
  initialLongitude?: number;
  level?: number;
  selectable?: boolean;
  readOnly?: boolean;
  onLocationSelect?: (latitude: number, longitude: number, address: string) => void;
}

declare global {
  interface Window {
    kakao: any;
  }
}

const EnhancedKakaoMap: React.FC<EnhancedKakaoMapProps> = ({
  width = '100%',
  height = '400px',
  initialLatitude = 37.5665,
  initialLongitude = 126.9780,
  level = 3,
  selectable = false,
  readOnly = false,
  onLocationSelect
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState<boolean>(false);
  const [address, setAddress] = useState<string>('');
  
  // 카카오 맵 스크립트 로드
  useEffect(() => {
    // 이미 로드된 경우 바로 처리
    if (window.kakao && window.kakao.maps) {
      setIsScriptLoaded(true);
      return;
    }
    
    const script = document.createElement('script');
    script.async = true;
    script.src = `http://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&libraries=services,clusterer,drawing&autoload=false`;
    
    script.onload = () => {
      window.kakao.maps.load(() => {
        setIsScriptLoaded(true);
      });
    };
    
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, []);
  
  // 맵 초기화
  useEffect(() => {
    if (!isScriptLoaded || !mapContainerRef.current) return;
    
    try {
      console.log('카카오 맵 초기화 시도');
      
      // 맵 생성
      const mapOption = {
        center: new window.kakao.maps.LatLng(initialLatitude, initialLongitude),
        level: level
      };
      
      const map = new window.kakao.maps.Map(mapContainerRef.current, mapOption);
      
      // 마커 생성
      const markerPosition = new window.kakao.maps.LatLng(initialLatitude, initialLongitude);
      const marker = new window.kakao.maps.Marker({
        position: markerPosition
      });
      
      // 마커 표시
      marker.setMap(map);
      
      // 주소 표시 인포윈도우 생성
      const infowindow = new window.kakao.maps.InfoWindow({ zindex: 1 });
      
      // 좌표 -> 주소 변환 객체 생성
      const geocoder = new window.kakao.maps.services.Geocoder();
      
      // 초기 주소 가져오기
      geocoder.coord2Address(initialLongitude, initialLatitude, (result: any, status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          if (result[0]) {
            const addr = result[0].road_address
              ? result[0].road_address.address_name
              : result[0].address.address_name;
            
            setAddress(addr);
            
            if (!readOnly) {
              infowindow.setContent(`<div style="padding:5px;font-size:12px;">${addr}</div>`);
              infowindow.open(map, marker);
            }
          }
        }
      });
      
      // 선택 기능 활성화 (selectable이 true인 경우)
      if (selectable && !readOnly) {
        // 맵 클릭 이벤트 등록
        window.kakao.maps.event.addListener(map, 'click', (mouseEvent: any) => {
          const clickPosition = mouseEvent.latLng;
          const clickLatitude = clickPosition.getLat();
          const clickLongitude = clickPosition.getLng();
          
          // 마커 위치 업데이트
          marker.setPosition(clickPosition);
          
          // 주소 가져오기
          geocoder.coord2Address(clickLongitude, clickLatitude, (result: any, status: any) => {
            if (status === window.kakao.maps.services.Status.OK) {
              if (result[0]) {
                const addr = result[0].road_address
                  ? result[0].road_address.address_name
                  : result[0].address.address_name;
                
                setAddress(addr);
                
                infowindow.setContent(`<div style="padding:5px;font-size:12px;">${addr}</div>`);
                infowindow.open(map, marker);
                
                // 위치 선택 콜백 호출
                if (onLocationSelect) {
                  onLocationSelect(clickLatitude, clickLongitude, addr);
                }
              }
            }
          });
        });
        
        // 마커 드래그 기능 활성화
        marker.setDraggable(true);
        
        // 마커 드래그 이벤트 등록
        window.kakao.maps.event.addListener(marker, 'dragend', () => {
          const dragPosition = marker.getPosition();
          const dragLatitude = dragPosition.getLat();
          const dragLongitude = dragPosition.getLng();
          
          // 주소 가져오기
          geocoder.coord2Address(dragLongitude, dragLatitude, (result: any, status: any) => {
            if (status === window.kakao.maps.services.Status.OK) {
              if (result[0]) {
                const addr = result[0].road_address
                  ? result[0].road_address.address_name
                  : result[0].address.address_name;
                
                setAddress(addr);
                
                infowindow.setContent(`<div style="padding:5px;font-size:12px;">${addr}</div>`);
                infowindow.open(map, marker);
                
                // 위치 선택 콜백 호출
                if (onLocationSelect) {
                  onLocationSelect(dragLatitude, dragLongitude, addr);
                }
              }
            }
          });
        });
      }
      
      // 맵 크기 변경 시 리사이즈 이벤트 처리
      const resizeMap = () => {
        const mapCenter = map.getCenter();
        window.kakao.maps.event.trigger(map, 'resize');
        map.setCenter(mapCenter);
      };
      
      window.addEventListener('resize', resizeMap);
      
      // 맵 로드 완료
      setIsMapLoaded(true);
      console.log('카카오 맵 초기화 성공');
      
      return () => {
        window.removeEventListener('resize', resizeMap);
      };
    } catch (error) {
      console.error('카카오 맵 초기화 중 오류 발생:', error);
    }
  }, [isScriptLoaded, initialLatitude, initialLongitude, level, selectable, readOnly, onLocationSelect]);

  return (
    <div>
      {!isMapLoaded && <div>지도를 불러오는 중...</div>}
      <div 
        ref={mapContainerRef} 
        style={{ 
          width, 
          height, 
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          opacity: isMapLoaded ? 1 : 0.6,
          transition: 'opacity 0.3s ease-in-out'
        }}
      ></div>
      {address && selectable && (
        <div className="mt-2 text-sm text-gray-600">
          선택한 위치: {address}
        </div>
      )}
    </div>
  );
};

export default EnhancedKakaoMap;