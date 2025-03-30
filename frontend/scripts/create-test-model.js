// scripts/create-test-model.js
const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');
const path = require('path');

async function createAndSaveModel() {
  // 모델 저장 경로 설정
  const modelDir = path.join(__dirname, '../public/models/pet_style_model');
  
  // 디렉토리 생성 (없는 경우)
  if (!fs.existsSync(modelDir)) {
    fs.mkdirSync(modelDir, { recursive: true });
  }
  
  console.log('간단한 테스트 모델 생성 중...');
  
  // 간단한 모델 생성
  const model = tf.sequential();
  
  // 입력 레이어: 224x224 RGB 이미지를 받음
  model.add(tf.layers.conv2d({
    inputShape: [224, 224, 3],
    filters: 16,
    kernelSize: 3,
    activation: 'relu'
  }));
  
  model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
  model.add(tf.layers.flatten());
  
  // 출력 레이어: 5개의 스타일 클래스로 분류
  model.add(tf.layers.dense({
    units: 5,
    activation: 'softmax'
  }));
  
  // 모델 컴파일
  model.compile({
    optimizer: 'adam',
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy']
  });
  
  // 모델 요약 정보 출력
  model.summary();
  
  // 모델 저장 경로
  const modelPath = `file://${modelDir}`;
  console.log(`모델을 ${modelPath}에 저장합니다...`);
  
  // 모델 저장
  await model.save(modelPath);
  
  console.log('모델 저장 완료!');
}

// 모델 생성 및 저장 실행
createAndSaveModel().catch(err => {
  console.error('모델 생성 오류:', err);
});