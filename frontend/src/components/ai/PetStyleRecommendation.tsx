// frontend/src/components/ai/PetStyleRecommendation.tsx
// TensorFlow.js와 OpenCV.js를 활용하여 반려동물 사진을 분석하고
// 적합한 미용 스타일을 추천하는 AI 컴포넌트

'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as tf from 'tensorflow';
import { useRouter } from 'next/navigation';

// 반려동물 미용 스타일 타입 정의
interface GroomingStyle {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  confidence: number; // AI 추천 신뢰도 (0~1)
  petType: 'DOG' | 'CAT'; // 반려동물 종류
}

// 컴포넌트 props 정의
interface PetStyleRecommendationProps {
  onSelectStyle?: (style: GroomingStyle) => void;
}

// 미리 정의된 미용 스타일 목록
const DOG_STYLES: Omit<GroomingStyle, 'confidence'>[] = [
  {
    id: 'puppy-cut',
    name: '퍼피 컷',
    description: '강아지의 전체적인 털 길이를 균일하게 짧게 자르는 스타일로, 관리가 용이하고 귀여운 외모를 유지할 수 있습니다.',
    imageUrl: '/images/styles/puppy-cut.jpg',
    petType: 'DOG'
  },
  {
    id: 'teddy-bear-cut',
    name: '테디베어 컷',
    description: '둥글고 푹신한 외형으로 테디베어와 같은 모습을 연출하는 스타일입니다. 얼굴은 둥글게, 몸통은 적당한 길이로 유지합니다.',
    imageUrl: '/images/styles/teddy-bear-cut.jpg',
    petType: 'DOG'
  },
  {
    id: 'korean-cut',
    name: '코리안 컷',
    description: '한국에서 인기 있는 스타일로, 얼굴은 둥글게 다듬고 몸통은 짧게 정리하는 스타일입니다.',
    imageUrl: '/images/styles/korean-cut.jpg',
    petType: 'DOG'
  },
  {
    id: 'show-cut',
    name: '쇼 컷',
    description: '견종 표준에 맞게 다듬어 전문적인 도그쇼에 출전할 수 있는 스타일입니다.',
    imageUrl: '/images/styles/show-cut.jpg',
    petType: 'DOG'
  },
  {
    id: 'lion-cut',
    name: '라이언 컷',
    description: '몸통은 짧게 깎고 머리와 목 부분의 털은 길게 남겨 사자 모양으로 연출하는 스타일입니다.',
    imageUrl: '/images/styles/lion-cut.jpg',
    petType: 'DOG'
  }
];

const CAT_STYLES: Omit<GroomingStyle, 'confidence'>[] = [
  {
    id: 'lion-cut-cat',
    name: '라이언 컷',
    description: '몸통의 털은 짧게 깎고 머리, 목, 발끝의 털은 남겨두어 사자와 같은 모습을 연출하는 스타일입니다.',
    imageUrl: '/images/styles/lion-cut-cat.jpg',
    petType: 'CAT'
  },
  {
    id: 'persian-cut',
    name: '페르시안 컷',
    description: '장모종 고양이를 위한 스타일로, 털은 전체적으로 긴 길이를 유지하면서 매트를 제거하고 깔끔하게 정리합니다.',
    imageUrl: '/images/styles/persian-cut.jpg',
    petType: 'CAT'
  },
  {
    id: 'sanitary-cut',
    name: '위생 컷',
    description: '위생을 위해 주요 부위(항문 주변, 복부, 발바닥 등)의 털만 깎는 최소한의 미용 스타일입니다.',
    imageUrl: '/images/styles/sanitary-cut.jpg',
    petType: 'CAT'
  }
];

// AI 펫 미용 스타일 추천 컴포넌트
const PetStyleRecommendation: React.FC<PetStyleRecommendationProps> = ({ onSelectStyle }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [petType, setPetType] = useState<'DOG' | 'CAT'>('DOG');
  const [breedType, setBreedType] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendedStyles, setRecommendedStyles] = useState<GroomingStyle[]>([]);
  const [modelLoaded, setModelLoaded] = useState<boolean>(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const modelRef = useRef<tf.GraphModel | null>(null);
  
  // 모델 로드
  useEffect(() => {
    const loadModel = async () => {
      try {
        // TensorFlow.js 모델 로드 (모델 경로는 실제 모델에 맞게 수정 필요)
        // 실제 프로덕션에서는 public/models 폴더에 모델 파일을 저장하고 로드
        // modelRef.current = await tf.loadGraphModel('/models/pet_classifier/model.json');
        
        // 예시: 여기서는 간단히 모델이 로드된 것으로 가정
        setTimeout(() => {
          setModelLoaded(true);
        }, 1000);
        
      } catch (err) {
        console.error('모델 로드 실패:', err);
        setError('AI 모델을 로드하는데 실패했습니다. 다시 시도해주세요.');
      }
    };

    loadModel();
    
    // OpenCV.js 로드
    const loadOpenCV = () => {
      if (window.cv) {
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://docs.opencv.org/4.5.5/opencv.js';
      script.async = true;
      script.onload = () => console.log('OpenCV.js 로드 완료');
      script.onerror = () => {
        console.error('OpenCV.js 로드 실패');
        setError('OpenCV.js를 로드하는데 실패했습니다.');
      };
      
      document.body.appendChild(script);
    };
    
    loadOpenCV();
    
    return () => {
      // 정리 작업
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, []);

  // 파일 선택 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // 이미지 파일 검증
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다.');
      return;
    }
    
    // 파일 크기 검증 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      setError('이미지 크기는 5MB 이하여야 합니다.');
      return;
    }
    
    setSelectedFile(file);
    setError(null);
    
    // 이미지 미리보기 생성
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  // 반려동물 타입 변경 핸들러
  const handlePetTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPetType(e.target.value as 'DOG' | 'CAT');
    setRecommendedStyles([]);  // 추천 스타일 초기화
  };

  // 이미지 분석 및 스타일 추천
  const analyzeImage = async () => {
    if (!selectedFile || !previewUrl) {
      setError('이미지를 선택해주세요.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // 이미지 로드 및 전처리
      await preprocessImage();
      
      // 반려동물 품종 분석 (실제로는 AI 모델을 사용하지만, 여기서는 간단히 시뮬레이션)
      const simulatedBreed = simulateBreedDetection(petType);
      setBreedType(simulatedBreed);
      
      // 반려동물 타입에 따라 스타일 추천
      const baseStyles = petType === 'DOG' ? DOG_STYLES : CAT_STYLES;
      
      // AI 추천 로직 (실제로는 모델을 사용하여 추천하지만, 여기서는 랜덤하게 점수 부여)
      const recommendedStyles = baseStyles.map(style => ({
        ...style,
        confidence: Math.random() * 0.5 + 0.5 // 0.5 ~ 1.0 사이의 랜덤 신뢰도
      }))
      .sort((a, b) => b.confidence - a.confidence); // 신뢰도 기준 내림차순 정렬
      
      setRecommendedStyles(recommendedStyles);
    } catch (err) {
      console.error('이미지 분석 실패:', err);
      setError('이미지 분석에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // 이미지 전처리 함수
  const preprocessImage = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!canvasRef.current || !imageRef.current || !previewUrl) {
        reject(new Error('이미지 또는 캔버스 요소가 준비되지 않았습니다.'));
        return;
      }
      
      // 이미지가 로드되면 OpenCV.js로 전처리
      imageRef.current.onload = () => {
        if (!window.cv) {
          console.warn('OpenCV.js가 로드되지 않았습니다. 전처리를 건너뜁니다.');
          resolve();
          return;
        }
        
        try {
          const img = imageRef.current!;
          const canvas = canvasRef.current!;
          
          // 캔버스 크기 설정
          canvas.width = img.width;
          canvas.height = img.height;
          
          // 이미지를 캔버스에 그리기
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, img.width, img.height);
          
          // 캔버스에서 이미지 데이터 가져오기
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          // OpenCV.js로 이미지 처리 (예: 노이즈 제거, 밝기 조정 등)
          // 여기서는 간단히 시뮬레이션
          
          resolve();
        } catch (err) {
          console.error('이미지 전처리 실패:', err);
          reject(err);
        }
      };
      
      imageRef.current.onerror = () => {
        reject(new Error('이미지 로드에 실패했습니다.'));
      };
      
      // 이미지 소스 설정 (이미 위에서 설정했을 수 있음)
      if (imageRef.current.src !== previewUrl) {
        imageRef.current.src = previewUrl;
      }
    });
  };

  // 반려동물 품종 감지 시뮬레이션 함수
  const simulateBreedDetection = (petType: 'DOG' | 'CAT'): string => {
    // 실제로는 AI 모델을 사용하여 품종을 감지하지만, 여기서는 간단히 시뮬레이션
    const dogBreeds = ['말티즈', '푸들', '포메라니안', '시츄', '비숑 프리제', '치와와', '골든 리트리버'];
    const catBreeds = ['페르시안', '브리티시 숏헤어', '러시안 블루', '먼치킨', '아메리칸 숏헤어'];
    
    const breeds = petType === 'DOG' ? dogBreeds : catBreeds;
    return breeds[Math.floor(Math.random() * breeds.length)];
  };

  // 스타일 선택 핸들러
  const handleSelectStyle = (style: GroomingStyle) => {
    if (onSelectStyle) {
      onSelectStyle(style);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">AI 미용 스타일 추천</h2>
      
      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          {error}
        </div>
      )}
      
      {/* 반려동물 타입 선택 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          반려동물 타입
        </label>
        <div className="flex space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio"
              name="petType"
              value="DOG"
              checked={petType === 'DOG'}
              onChange={handlePetTypeChange}
            />
            <span className="ml-2">강아지</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio"
              name="petType"
              value="CAT"
              checked={petType === 'CAT'}
              onChange={handlePetTypeChange}
            />
            <span className="ml-2">고양이</span>
          </label>
        </div>
      </div>
      
      {/* 이미지 업로드 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          반려동물 사진 업로드
        </label>
        <input
          type="file"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
          accept="image/*"
        />
        <p className="mt-1 text-sm text-gray-500">
          5MB 이하의 이미지 파일을 업로드해주세요.
        </p>
      </div>
      
      {/* 이미지 미리보기 */}
      {previewUrl && (
        <div className="mb-4">
          <h3 className="text-md font-medium mb-2">이미지 미리보기</h3>
          <div className="relative w-full max-w-md mx-auto">
            <img
              ref={imageRef}
              src={previewUrl}
              alt="미리보기"
              className="rounded-lg max-h-60 mx-auto"
            />
            <canvas 
              ref={canvasRef} 
              className="hidden" // 처리용 캔버스는 화면에 표시하지 않음
            />
          </div>
        </div>
      )}
      
      {/* 분석 버튼 */}
      <div className="mb-6">
        <button
          onClick={analyzeImage}
          disabled={!selectedFile || loading || !modelLoaded}
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              분석 중...
            </span>
          ) : !modelLoaded ? (
            'AI 모델 로드 중...'
          ) : (
            '반려동물 이미지 분석'
          )}
        </button>
      </div>
      
      {/* 분석 결과 */}
      {breedType && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-md font-medium mb-2">분석 결과</h3>
          <p><span className="font-medium">추정 품종:</span> {breedType}</p>
        </div>
      )}
      
      {/* 추천 스타일 */}
      {recommendedStyles.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">추천 미용 스타일</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recommendedStyles.map((style) => (
              <div 
                key={style.id}
                className="border rounded-lg p-4 hover:border-blue-500 cursor-pointer transition-colors"
                onClick={() => handleSelectStyle(style)}
              >
                <div className="flex items-start justify-between">
                  <h4 className="font-medium">{style.name}</h4>
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {Math.round(style.confidence * 100)}% 매치
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2 mb-3">{style.description}</p>
                
                {/* 스타일 이미지 */}
                <div className="w-full h-40 bg-gray-200 rounded-md flex items-center justify-center">
                  {/* 실제 이미지가 있으면 표시, 없으면 플레이스홀더 */}
                  <span className="text-gray-500">스타일 이미지</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PetStyleRecommendation;