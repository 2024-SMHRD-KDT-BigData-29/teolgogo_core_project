// components/ai/PetStyleRecommendation.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import Script from 'next/script';
import Image from 'next/image';

interface PetStyleRecommendationProps {
  petImage?: string;
  onStyleSelected?: (style: string) => void;
}

// 스타일 점수 인터페이스 정의
interface StyleScore {
  style: string;
  score: number;
}

// 스타일 정보 인터페이스
interface StyleInfo {
  id: string;
  name: string;
  description: string;
  exampleImage: string;
  characteristics: string[];
  suitableFor: string[];
}

export default function PetStyleRecommendation({
  petImage: initialPetImage,
  onStyleSelected
}: PetStyleRecommendationProps) {
  // 모델 및 라이브러리 로딩 상태
  const [tensorflowLoaded, setTensorflowLoaded] = useState(false);
  const [opencvLoaded, setOpencvLoaded] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendedStyles, setRecommendedStyles] = useState<string[]>([]);
  
  // 이미지 관련 상태
  const [petImage, setPetImage] = useState<string | undefined>(initialPetImage);
  const [previewImage, setPreviewImage] = useState<string | undefined>(initialPetImage);
  
  // 선택된 스타일 상태
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  
  // 파일 입력 참조
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 모델 및 OpenCV 참조
  const modelRef = useRef<any>(null);
  const cvRef = useRef<any>(null);
  const tfRef = useRef<any>(null);
  
  // 이미지 처리용 캔버스
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // 스크립트 로딩 상태 추적
  const tfScriptLoadedRef = useRef<boolean>(false);
  const cvScriptLoadedRef = useRef<boolean>(false);

  // 스타일 정보 데이터
  const styleInfoData: Record<string, StyleInfo> = {
    '짧은 컷': {
      id: 'short-cut',
      name: '짧은 컷',
      description: '짧고 깔끔한 스타일로, 관리가 쉽고 더운 날씨에 적합합니다. 털이 짧아 옷이나 집안에 털이 덜 날립니다.',
      exampleImage: '/images/pet-styles/short-cut.jpg',
      characteristics: ['관리 용이', '시원함', '청결함'],
      suitableFor: ['더운 날씨', '활동적인 반려동물', '털 관리가 어려운 보호자']
    },
    '중간 길이 컷': {
      id: 'medium-cut',
      name: '중간 길이 컷',
      description: '짧은 컷과 긴 스타일의 중간 형태로, 적당한 보온성과 관리의 용이함을 모두 갖추고 있습니다.',
      exampleImage: '/images/pet-styles/medium-cut.jpg',
      characteristics: ['균형감', '다양한 스타일링', '적당한 보온성'],
      suitableFor: ['사계절', '대부분의 반려동물', '일반적인 환경']
    },
    '긴 스타일': {
      id: 'long-style',
      name: '긴 스타일',
      description: '우아하고 풍성한 느낌의 스타일로, 추운 날씨에 보온성이 좋습니다. 정기적인 브러싱과 관리가 필요합니다.',
      exampleImage: '/images/pet-styles/long-style.jpg',
      characteristics: ['우아함', '보온성', '풍성함'],
      suitableFor: ['추운 날씨', '쇼 견/묘', '정기적 그루밍이 가능한 경우']
    },
    '테디베어 컷': {
      id: 'teddy-bear',
      name: '테디베어 컷',
      description: '얼굴과 몸을 동그랗게 다듬어 테디베어처럼 귀여운 느낌을 주는 스타일입니다. 푹신한 질감이 특징입니다.',
      exampleImage: '/images/pet-styles/teddy-bear.jpg',
      characteristics: ['귀여움', '부드러움', '동그란 실루엣'],
      suitableFor: ['푸들', '비숑', '말티즈', '포메라니안']
    },
    '라이언 컷': {
      id: 'lion-cut',
      name: '라이언 컷',
      description: '얼굴 주변의 털은 남기고 몸은 짧게 깎아 사자와 같은 모습을 연출하는 스타일입니다. 독특하고 개성 있는 룩을 원하는 경우 적합합니다.',
      exampleImage: '/images/pet-styles/lion-cut.jpg',
      characteristics: ['독특함', '개성', '시원함'],
      suitableFor: ['장모종 고양이', '푸들', '포메라니안']
    }
  };
  
  // 디버깅을 위한 useEffect
  useEffect(() => {
    console.log('상태 변경:', { 
      tensorflowLoaded, 
      opencvLoaded, 
      tfScriptLoadedRef: tfScriptLoadedRef.current, 
      cvScriptLoadedRef: cvScriptLoadedRef.current 
    });
    
    // 두 라이브러리가 모두 로드되었다면 모델 로드 시도
    if (tensorflowLoaded && opencvLoaded) {
      console.log('두 라이브러리 모두 로드됨, 모델 로드 시도');
      loadModel();
    }
  }, [tensorflowLoaded, opencvLoaded]);

  // TensorFlow.js 로드 완료 핸들러
  const handleTensorflowLoad = () => {
    console.log('TensorFlow.js 로드 완료');
    
    // window.tf 객체가 존재하는지 확인
    if (typeof window !== 'undefined' && (window as any).tf) {
      tfRef.current = (window as any).tf;
      tfScriptLoadedRef.current = true;
      setTensorflowLoaded(true);
      
      console.log('TF 로드 완료 후 상태:', { 
        tf: tfRef.current ? '존재' : '없음',
        tfLoaded: tfScriptLoadedRef.current, 
        cvLoaded: cvScriptLoadedRef.current 
      });
    } else {
      console.error('TensorFlow 객체를 찾을 수 없음');
      setError('TensorFlow 객체를 찾을 수 없습니다');
    }
  };

  // OpenCV.js 로드 완료 핸들러
  const handleOpenCVLoad = () => {
    console.log('OpenCV.js 로드 완료');
    
    // window.cv 객체가 존재하는지 확인
    if (typeof window !== 'undefined' && (window as any).cv) {
      cvRef.current = (window as any).cv;
      cvScriptLoadedRef.current = true;
      setOpencvLoaded(true);
      
      console.log('CV 로드 완료 후 상태:', { 
        cv: cvRef.current ? '존재' : '없음',
        tfLoaded: tfScriptLoadedRef.current, 
        cvLoaded: cvScriptLoadedRef.current 
      });
    } else {
      console.error('OpenCV 객체를 찾을 수 없음');
      setError('OpenCV 객체를 찾을 수 없습니다');
    }
  };

  // 모델 로드 함수 - 더미 모델 사용
  const loadModel = async () => {
    // 명시적으로 참조 상태 확인
    if (!tfRef.current || !cvRef.current) {
      console.error('TF 또는 CV 참조가 없음:', {
        tf: tfRef.current ? '존재' : '없음',
        cv: cvRef.current ? '존재' : '없음'
      });
      return;
    }
    
    // 이미 모델이 로드된 경우 중복 로드 방지
    if (modelRef.current) {
      console.log('모델이 이미 로드되어 있음');
      return;
    }
    
    try {
      console.log('테스트용 더미 모델 초기화...');
      
      // 더미 모델 객체 생성
      const dummyModel = {
        predict: (tensor: any) => {
          console.log('더미 모델이 이미지를 분석 중...');
          return {
            data: async () => {
              // 5개 스타일 클래스에 대한 더미 점수 (합계 1)
              return new Float32Array([0.35, 0.25, 0.2, 0.15, 0.05]);
            }
          };
        }
      };
      
      // 모델 참조에 더미 모델 저장
      modelRef.current = dummyModel;
      console.log('더미 모델 초기화 완료');
      
      // 약간의 지연 후 로드 완료 상태로 변경 (실제 로딩 시뮬레이션)
      setTimeout(() => {
        setModelLoaded(true);
        console.log('AI 모델 로드 완료(더미)');
        
        // 초기 이미지 처리
        if (petImage) {
          processImage(petImage);
        }
      }, 1500);
      
    } catch (err) {
      console.error('모델 로드 오류:', err);
      setError(`모델 로드 실패: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // 파일 업로드 핸들러
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // 이미지 파일 타입 확인
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드할 수 있습니다.');
      return;
    }
    
    // 파일 크기 확인 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
      setError('파일 크기는 10MB 이하여야 합니다.');
      return;
    }
    
    // 파일 읽기
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && event.target.result) {
        const imageDataUrl = event.target.result as string;
        setPetImage(imageDataUrl);
        setPreviewImage(imageDataUrl);
        setSelectedStyle(null); // 새 이미지를 업로드하면 선택된 스타일 초기화
        
        // 에러 초기화
        setError(null);
        
        // 모델이 로드되었으면 이미지 처리 시작
        if (modelLoaded) {
          processImage(imageDataUrl);
        }
      }
    };
    
    reader.onerror = () => {
      setError('파일을 읽는 중 오류가 발생했습니다.');
    };
    
    reader.readAsDataURL(file);
  };

  // 사진 다시 찍기 버튼 핸들러
  const handleRetakePhoto = () => {
    setPetImage(undefined);
    setPreviewImage(undefined);
    setRecommendedStyles([]);
    setSelectedStyle(null);
    
    // 파일 input 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 이미지 처리 함수 - 실제 처리 없이 더미 결과 반환
  const processImage = async (imageUrl: string) => {
    if (!modelRef.current) {
      console.warn('모델이 로드되지 않았습니다');
      return;
    }
    
    setProcessingImage(true);
    console.log('이미지 처리 시작:', imageUrl);
    
    try {
      // 처리 시간 시뮬레이션
      setTimeout(() => {
        try {
          // OpenCV와 TensorFlow 처리를 시뮬레이션하는 더미 코드
          console.log('이미지 전처리 및 분석 완료');
          
          // 더미 예측 결과
          const styleCategories = [
            '짧은 컷',
            '중간 길이 컷',
            '긴 스타일',
            '테디베어 컷',
            '라이언 컷'
          ];
          
          // 더미 점수 (고정값)
          const dummyScores = [0.35, 0.25, 0.2, 0.15, 0.05];
          
          // 스타일 점수 생성
          const styleScores: StyleScore[] = styleCategories.map((style, i) => ({
            style,
            score: dummyScores[i]
          })).sort((a, b) => b.score - a.score);
          
          // 상위 3개 스타일 추천
          const topStyles = styleScores.slice(0, 3).map(item => item.style);
          setRecommendedStyles(topStyles);
          setProcessingImage(false);
          
          console.log('추천 스타일:', topStyles);
        } catch (processError) {
          console.error('이미지 처리 과정 오류:', processError);
          setError('이미지 처리 중 오류가 발생했습니다');
          setProcessingImage(false);
        }
      }, 2000); // 2초 지연으로 처리 시간 시뮬레이션
      
    } catch (err) {
      console.error('이미지 처리 오류:', err);
      setError(`이미지 처리 실패: ${err instanceof Error ? err.message : String(err)}`);
      setProcessingImage(false);
    }
  };

  // 이미지가 변경되면 처리 시작
  useEffect(() => {
    if (petImage && modelLoaded) {
      processImage(petImage);
    }
  }, [petImage, modelLoaded]);

  // 스타일 선택 핸들러
  const handleStyleSelect = (style: string) => {
    setSelectedStyle(style);
    
    // 콜백이 제공된 경우 호출
    if (onStyleSelected) {
      onStyleSelected(style);
    }
  };

  // 선택된 스타일 정보 가져오기
  const getSelectedStyleInfo = () => {
    if (!selectedStyle || !styleInfoData[selectedStyle]) {
      return null;
    }
    
    return styleInfoData[selectedStyle];
  };

  return (
    <div className="w-full">
      {/* 숨겨진 캔버스 */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {/* 스크립트 로딩 */}
      <Script
        id="tensorflow-script"
        src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.1.0/dist/tf.min.js"
        strategy="afterInteractive"
        onLoad={handleTensorflowLoad}
        onError={() => setError('TensorFlow.js 로드 실패')}
      />
      
      <Script
        id="opencv-script"
        src="https://docs.opencv.org/4.7.0/opencv.js"
        strategy="afterInteractive"
        onLoad={handleOpenCVLoad}
        onError={() => setError('OpenCV.js 로드 실패')}
      />
      
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-3">AI 스타일 추천</h3>
        
        {/* 로딩 상태 표시 */}
        {(!tensorflowLoaded || !opencvLoaded || !modelLoaded) && !error && (
          <div className="flex items-center justify-center p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-gray-600">
                {!tensorflowLoaded ? 'TensorFlow.js 로드 중...' : 
                 !opencvLoaded ? 'OpenCV.js 로드 중...' : 
                 'AI 모델 로드 중...'}
              </p>
              {(!tensorflowLoaded || !opencvLoaded) && (
                <p className="text-xs text-gray-500 mt-2">
                  네트워크 상태에 따라 약간의 시간이 소요될 수 있습니다.
                </p>
              )}
            </div>
          </div>
        )}
        
        {/* 에러 메시지 */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md mb-4">
            <p className="text-red-600 text-sm">{error}</p>
            <button 
              className="mt-2 text-xs text-blue-600 hover:underline"
              onClick={() => {
                setError(null);
                
                // 스크립트 로딩 상태 초기화 후 다시 시도
                if (!tensorflowLoaded || !opencvLoaded) {
                  // 스크립트 재로드 로직
                  const reloadScripts = async () => {
                    tfScriptLoadedRef.current = false;
                    cvScriptLoadedRef.current = false;
                    setTensorflowLoaded(false);
                    setOpencvLoaded(false);
                    
                    // 스크립트 엘리먼트 다시 생성
                    const head = document.head;
                    
                    // TensorFlow.js 로드
                    const tfScript = document.createElement('script');
                    tfScript.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.1.0/dist/tf.min.js';
                    tfScript.onload = handleTensorflowLoad;
                    tfScript.onerror = () => setError('TensorFlow.js 로드 실패');
                    
                    // OpenCV.js 로드
                    const cvScript = document.createElement('script');
                    cvScript.src = 'https://docs.opencv.org/4.7.0/opencv.js';
                    cvScript.onload = handleOpenCVLoad;
                    cvScript.onerror = () => setError('OpenCV.js 로드 실패');
                    
                    // 문서에 추가
                    head.appendChild(tfScript);
                    head.appendChild(cvScript);
                  };
                  
                  reloadScripts();
                } else if (!modelLoaded) {
                  // 모델만 다시 로드 시도
                  loadModel();
                }
              }}
            >
              다시 시도
            </button>
          </div>
        )}
        
        {/* 이미지 업로드 섹션 */}
        {modelLoaded && !previewImage && (
          <div className="mt-4">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:bg-gray-50 transition"
                 onClick={() => fileInputRef.current?.click()}
            >
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                <p className="mt-2 text-sm text-gray-600">반려동물 사진을 업로드하세요</p>
                <p className="mt-1 text-xs text-gray-500">JPG, PNG, GIF 형식 지원</p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileUpload}
              />
            </div>
          </div>
        )}
        
        {/* 이미지 미리보기 */}
        {previewImage && (
          <div className="mt-4">
            <div className="relative">
              <div className="rounded-lg overflow-hidden border border-gray-200">
                <img 
                  src={previewImage} 
                  alt="반려동물 이미지" 
                  className="w-full h-auto object-cover max-h-[300px]"
                />
              </div>
              <button 
                onClick={handleRetakePhoto}
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100"
              >
                <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        )}
        
        {/* 이미지 처리 중 */}
        {processingImage && modelLoaded && (
          <div className="flex items-center justify-center p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-gray-600">이미지 분석 중...</p>
            </div>
          </div>
        )}
        
        {/* 추천 결과 */}
        {modelLoaded && !processingImage && recommendedStyles.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">추천 스타일:</h4>
            <div className="grid grid-cols-1 gap-2">
              {recommendedStyles.map((style, index) => (
                <button
                  key={index}
                  className={`p-3 rounded-md border text-left text-sm transition ${
                    selectedStyle === style 
                      ? 'bg-blue-50 border-blue-300 text-blue-700' 
                      : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                  }`}
                  onClick={() => handleStyleSelect(style)}
                >
                  <div className="flex justify-between items-center">
                    <span>{style}</span>
                    {selectedStyle === style && (
                      <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* 선택된 스타일 상세 정보 */}
        {selectedStyle && getSelectedStyleInfo() && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-800 mb-2">{selectedStyle} 스타일 설명</h4>
            <p className="text-sm text-gray-600 mb-3">{getSelectedStyleInfo()?.description}</p>
            
            <div className="mt-3">
              <h5 className="text-xs font-medium text-gray-700 mb-1">특징:</h5>
              <div className="flex flex-wrap gap-1 mb-3">
                {getSelectedStyleInfo()?.characteristics.map((characteristic, idx) => (
                  <span key={idx} className="inline-block px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded">
                    {characteristic}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="mt-2">
              <h5 className="text-xs font-medium text-gray-700 mb-1">이런 반려동물에게 적합:</h5>
              <ul className="list-disc list-inside text-xs text-gray-600 pl-1">
                {getSelectedStyleInfo()?.suitableFor.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
            
            <div className="mt-4">
              <button
                className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded transition"
                onClick={() => {
                  alert(`${selectedStyle} 스타일을 선택하셨습니다. 견적서에 반영됩니다.`);
                  // 여기에 견적서 페이지로 이동하거나 선택 정보를 저장하는 로직 추가
                }}
              >
                이 스타일로 견적 요청하기
              </button>
            </div>
          </div>
        )}
        
        {/* 모델은 로드됐지만 이미지가 없는 경우 안내 */}
        {!previewImage && !error && modelLoaded && !processingImage && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">
              반려동물 이미지를 업로드하면 AI가 최적의 미용 스타일을 추천해 드립니다.
            </p>
          </div>
        )}
        
        {/* 인기 스타일 섹션 */}
        <div className="mt-8">
          <h4 className="text-sm font-medium mb-3">인기 미용 스타일</h4>
          <div className="grid grid-cols-2 gap-3">
            {Object.values(styleInfoData).slice(0, 4).map((style) => (
              <div key={style.id} className="border rounded-lg overflow-hidden bg-white">
                <div className="h-24 bg-gray-200 flex items-center justify-center">
                  {/* 실제 이미지가 없으므로 스타일 이름 표시 */}
                  <span className="text-sm text-gray-500">{style.name} 이미지</span>
                </div>
                <div className="p-2">
                  <h5 className="text-xs font-medium">{style.name}</h5>
                  <p className="text-xs text-gray-500 truncate mt-1">{style.description.substring(0, 36)}...</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}