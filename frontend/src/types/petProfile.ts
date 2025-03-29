// 반려동물 프로필 타입 정의

export interface PetProfile {
    id?: number;
    userId: number;
    name: string;
    type: PetType;
    breed: string;
    age: number;
    weight: number;
    gender: PetGender;
    imageUrl?: string;
    description?: string;
    specialNeeds?: string;
    medicalHistory?: string;
    neutered: boolean; // 중성화 여부
    lastGroomingDate?: string; // 마지막 미용 날짜
    preferredStyles?: string[]; // 선호하는 미용 스타일
    createdAt?: string;
    updatedAt?: string;
  }
  
  // 반려동물 타입 열거형
  export enum PetType {
    DOG = 'DOG',
    CAT = 'CAT',
    OTHER = 'OTHER'
  }
  
  // 반려동물 성별 열거형
  export enum PetGender {
    MALE = 'MALE',
    FEMALE = 'FEMALE'
  }
  
  // 새 반려동물 프로필 생성 요청 타입
  export interface CreatePetProfileRequest {
    name: string;
    type: PetType;
    breed: string;
    age: number;
    weight: number;
    gender: PetGender;
    description?: string;
    specialNeeds?: string;
    neutered: boolean;
    imageFile?: File; // 이미지 파일은 별도로 처리
  }
  
  // 반려동물 프로필 업데이트 요청 타입
  export interface UpdatePetProfileRequest {
    id: number;
    name?: string;
    breed?: string;
    age?: number;
    weight?: number;
    gender?: PetGender;
    description?: string;
    specialNeeds?: string;
    medicalHistory?: string;
    neutered?: boolean;
    preferredStyles?: string[];
    imageFile?: File; // 이미지 파일은 별도로 처리
  }
  
  // 반려동물 미용 내역 타입
  export interface GroomingHistory {
    id: number;
    petProfileId: number;
    date: string;
    serviceName: string;
    businessName: string;
    businessId: number;
    price: number;
    notes?: string;
    beforeImageUrl?: string;
    afterImageUrl?: string;
    rating?: number; // 리뷰 평점
    quoteResponseId?: number; // 연결된 견적 응답 ID
  }