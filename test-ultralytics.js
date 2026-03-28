const fs = require('fs');
const path = require('path');

// ULTRALYTICS_API_KEY: Provided by the user
const API_KEY = 'ul_810231e888ab45eb4edf6798c0f71047bbea7514';
const MODEL_ID = 'yolov8n'; // Replace with your Model ID from HUB if different

async function testUltralytics(imagePath) {
  try {
    if (!fs.existsSync(imagePath)) {
      console.error(`❌ Image not found at: ${imagePath}`);
      return;
    }

    const stats = fs.statSync(imagePath);
    const fileSizeInBytes = stats.size;
    const imageBuffer = fs.readFileSync(imagePath);
    const ext = path.extname(imagePath).replace('.', '').toLowerCase();
    const mimeType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;

    console.log(`📸 Image: ${imagePath} (${(fileSizeInBytes / 1024).toFixed(0)} KB)`);
    console.log(`🚀 Sending to Ultralytics model: ${MODEL_ID}...`);

    // Ultralytics Inference API expects multipart/form-data with file upload
    const blob = new Blob([imageBuffer], { type: mimeType });
    const formData = new FormData();
    formData.append('file', blob, path.basename(imagePath));
    formData.append('model', MODEL_ID);
    formData.append('imgsz', '640');

    const response = await fetch(`https://api.ultralytics.com/v1/predict/${MODEL_ID}?api_key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`❌ Ultralytics Error (${response.status}):`, errorBody.substring(0, 500));
      return;
    }

    const data = await response.json();
    console.log('✅ Ultralytics Response:', JSON.stringify(data, null, 2));

    // Handle both possible response formats
    const detections = data.data || data.results || data.images?.[0]?.results || [];
    if (Array.isArray(detections) && detections.length > 0) {
      console.log(`✅ Success! Detected ${detections.length} objects.`);
      detections.forEach((det, i) => {
        console.log(`  [${i + 1}] ${det.name || det.class || 'unknown'} — confidence: ${(det.confidence || 0).toFixed(2)}`);
      });
    } else {
      console.log('⚠️ No objects detected in this image.');
    }

    fs.writeFileSync('ultralytics_test.json', JSON.stringify(data, null, 2));
    console.log('💾 Debug saved to ultralytics_test.json');
  } catch (error) {
    console.error('❌ Error with Ultralytics:', error.message || error);
  }
}

// --- Run the test ---
(async () => {
  console.log('🚀 Starting Ultralytics Test...\n');

  // UPDATE THIS PATH to your test image
  const testImagePath = 'C:/Users/rama_/Downloads/52 glass.jpg';
  await testUltralytics(testImagePath);
  console.log('\n✅ Test complete.');
})();
