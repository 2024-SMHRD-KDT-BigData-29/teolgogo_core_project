// src/types/user.ts

export interface User {
    id: string | number;
    name: string;
    email: string;
    role: 'CUSTOMER' | 'BUSINESS' | 'ADMIN';
    profileImage?: string;
    // 업체 관련 속성
    businessName?: string;
    businessDescription?: string;
    businessLicense?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    specialties?: string[];
    // 기타 필요한 속성들
    phone?: string;
    averageRating?: number;
    completedServices?: number;
    // 백엔드 엔티티에 있는 다른 속성들도 필요하면 추가
  }