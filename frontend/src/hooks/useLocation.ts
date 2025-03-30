// hooks/useLocation.ts
'use client';

import { useState } from 'react';

interface Location {
  latitude: number;
  longitude: number;
}

export const useLocation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 현재 위치 가져오기
  const getCurrentLocation = (): Promise<Location> => {
    setIsLoading(true);
    setError(null);

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        setIsLoading(false);
        const errorMsg = '브라우저에서 Geolocation을 지원하지 않습니다.';
        setError(errorMsg);
        reject(new Error(errorMsg));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setIsLoading(false);
          resolve({ latitude, longitude });
        },
        (err) => {
          setIsLoading(false);
          let errorMsg = '위치 정보를 가져오는데 실패했습니다.';
          
          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMsg = '위치 정보 접근 권한이 거부되었습니다. 브라우저 설정에서 위치 액세스를 허용해주세요.';
              break;
            case err.POSITION_UNAVAILABLE:
              errorMsg = '현재 위치 정보를 사용할 수 없습니다.';
              break;
            case err.TIMEOUT:
              errorMsg = '위치 정보 요청 시간이 초과되었습니다.';
              break;
          }
          
          setError(errorMsg);
          reject(new Error(errorMsg));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  };

  // 좌표로부터 주소 정보 가져오기
  const getAddressFromCoords = async (latitude: number, longitude: number): Promise<string | null> => {
    try {
      // Kakao Maps SDK가 로드되어 있는지 확인
      if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
        console.error('Kakao Maps API가 로드되지 않았거나 services 라이브러리가 없습니다.');
        return null;
      }

      return new Promise((resolve) => {
        // 좌표 -> 주소 변환 객체 생성
        const geocoder = new window.kakao.maps.services.Geocoder();
        
        // 좌표로 주소 정보 요청
        geocoder.coord2Address(longitude, latitude, (result: any, status: any) => {
          if (status === window.kakao.maps.services.Status.OK) {
            if (result[0]) {
              // 도로명 주소 우선, 없으면 지번 주소 사용
              const address = result[0].road_address 
                ? result[0].road_address.address_name
                : result[0].address.address_name;
              
              resolve(address);
            } else {
              resolve(null);
            }
          } else {
            console.error('주소 변환 실패:', status);
            resolve(null);
          }
        });
      });
    } catch (error) {
      console.error('주소 정보 변환 중 오류 발생:', error);
      return null;
    }
  };

  return {
    getCurrentLocation,
    getAddressFromCoords,
    isLoading,
    error
  };
};

export default useLocation;