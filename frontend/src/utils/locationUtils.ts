// locationUtils.ts - 위치 관련 유틸리티 함수들
// 사용자 위치 정보를 획득하고 카카오 맵을 연동하는 기능

// 사용자의 현재 위치를 가져오는 함수
export const getCurrentLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      // 브라우저가 Geolocation API를 지원하는지 확인
      if (!navigator.geolocation) {
        reject(new Error('이 브라우저에서는 위치 정보를 지원하지 않습니다.'));
        return;
      }
      
      // 사용자 위치 정보 요청
      navigator.geolocation.getCurrentPosition(
        // 성공 시 위치 정보 반환
        (position) => {
          resolve(position);
        },
        // 오류 발생 시 적절한 오류 메시지 제공
        (error) => {
          let errorMessage = '알 수 없는 오류가 발생했습니다.';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = '위치 정보 접근 권한이 거부되었습니다. 브라우저 설정에서 위치 정보 접근을 허용해주세요.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = '위치 정보를 사용할 수 없습니다. 잠시 후 다시 시도해주세요.';
              break;
            case error.TIMEOUT:
              errorMessage = '위치 정보 요청 시간이 초과되었습니다.';
              break;
          }
          
          reject(new Error(errorMessage));
        },
        // 옵션 설정: 높은 정확도, 5초 타임아웃
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    });
  };
  
  // 두 지점 간의 거리를 계산하는 함수 (Haversine 공식 사용)
  export const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    // 지구 반경 (km)
    const R = 6371;
    
    // 위도/경도를 라디안으로 변환
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    // Haversine 공식
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // 거리 (km)
    
    return distance;
  };