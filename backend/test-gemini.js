// Run this with: node test-gemini.js
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
    console.log("API Key:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.slice(0, 10) + "..." : "MISSING");

    const modelsToTry = [
        "gemini-2.0-flash",
        "gemini-1.5-pro",
        "gemini-1.5-pro-latest",
        "gemini-1.0-pro",
        "gemini-pro",
    ];

    for (const modelName of modelsToTry) {
        try {
            console.log(`\nTrying model: ${modelName} ...`);
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Say hello in one word.");
            const text = result.response.text();
            console.log(`  ✅ SUCCESS with ${modelName}: "${text.trim()}"`);
            break; // stop at first success
        } catch (err) {
            console.log(`  ❌ FAILED: ${err.message.slice(0, 120)}`);
        }
    }
}

test();
