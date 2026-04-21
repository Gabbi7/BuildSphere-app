const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyAh9f6RKRY5-rag3bTHnt_YE8krXP3mIUc");

async function listModels() {
  try {
    const models = await genAI.listModels();
    console.log("--- AVAILABLE MODELS ---");
    models.models.forEach(m => {
        console.log(`Name: ${m.name}, Display: ${m.displayName}, Methods: ${m.supportedMethods.join(', ')}`);
    });
  } catch (error) {
    console.error("LIST_MODELS_ERROR:", error.message);
    if (error.response) {
        console.error("DATA:", error.response.data);
    }
  }
}

listModels();
