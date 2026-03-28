const fs = require('fs');
const path = require('path');

// ROBOFLOW CONFIGURATION
const API_KEY = "9Q996Y4PkYBZPNuYJ3AP";
const WORKSPACE = "gavin-ralph-rama";
const WORKFLOW_ID = "general-segmentation-api";

async function testRoboflowWorkflow(imagePath) {
  try {
    if (!fs.existsSync(imagePath)) {
      console.error(`❌ Image not found at: ${imagePath}`);
      return;
    }

    console.log(`📸 Reading image: ${imagePath}`);
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    console.log(`📦 Image size: ${(imageBuffer.length / 1024).toFixed(0)} KB`);

    console.log(`🚀 Sending to Workflow: ${WORKFLOW_ID}...`);

    // THIS FORMAT WORKED EARLIER (returned 200 OK with predictions)
    const response = await fetch(`https://detect.roboflow.com/infer/workflows/${WORKSPACE}/${WORKFLOW_ID}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: API_KEY,
        inputs: {
          image: { type: "base64", value: base64Image },
          classes: "0, 1, 2, Glass, glassss"
        }
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`❌ Roboflow Error (${response.status}):`, errorBody.substring(0, 500));
      return;
    }

    const data = await response.json();
    console.log('✅ Response Received!');
    console.log('🔑 Top-level keys:', Object.keys(data));

    // DETECTION ANALYSIS
    console.log('--- DETECTION SUMMARY ---');
    let totalCount = 0;
    const classCounts = {};

    if (data.outputs && data.outputs.length > 0) {
      data.outputs.forEach((out, i) => {
        let preds = out.predictions;
        if (preds && preds.predictions && Array.isArray(preds.predictions)) {
          preds = preds.predictions;
        }

        if (Array.isArray(preds)) {
          preds.forEach(p => {
            const className = (p.class || '').toLowerCase();
            const isConfident = (p.confidence || 0) > 0.6;
            const isSignificant = (p.width || 0) > 30 && (p.height || 0) > 30;
            const isGlass = className.includes('glass') || p.class_id === 0 || className === '';

            if (isConfident && isSignificant && isGlass) {
              classCounts[className || 'glass'] = (classCounts[className || 'glass'] || 0) + 1;
              totalCount++;
            }
          });
          console.log(`🔍 Raw Detections: ${preds.length} | Filtered Panels: ${totalCount}`);
        }
      });
    }

    console.log(`\n🏆 FINAL FILTERED COUNT: ${totalCount} Panels!`);
    console.log('📦 Breakdown:', JSON.stringify(classCounts, null, 2));

    // Save debug output
    const debugData = JSON.parse(JSON.stringify(data));
    if (debugData.outputs) {
      debugData.outputs.forEach(o => {
        if (o.annotated_image) o.annotated_image = '[BASE64_IMAGE_REMOVED]';
      });
    }
    fs.writeFileSync('roboflow_output_debug.json', JSON.stringify(debugData, null, 2));
    console.log('💾 Debug saved to roboflow_output_debug.json');

  } catch (error) {
    console.error('❌ Error:', error.message || error);
  }
}

(async () => {
  console.log('🚀 Starting Roboflow 42-Glass Verification...\n');
  
  // TESTING AGAINST THE IMAGE FOUND IN DOWNLOADS
  const downloadPath = 'C:/Users/rama_/Downloads/52 glass.jpg';
  
  await testRoboflowWorkflow(downloadPath);
  console.log('\n✅ Test complete.');
})();
