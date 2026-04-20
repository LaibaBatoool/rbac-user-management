// Quick direct HTTP test — no SDK
// Run: node test-direct.js
require("dotenv").config();

const key = process.env.GEMINI_API_KEY;
console.log("Key prefix:", key ? key.slice(0, 12) + "..." : "MISSING");

const models = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-pro",
];

async function testModel(modelName) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`;
    const body = {
        contents: [{ parts: [{ text: "Say hello." }] }]
    };

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        if (res.ok) {
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            console.log(`✅ ${modelName}: "${text?.trim()}"`);
            return true;
        } else {
            console.log(`❌ ${modelName}: [${res.status}] ${data.error?.message?.slice(0, 120)}`);
            return false;
        }
    } catch (e) {
        console.log(`❌ ${modelName}: NET ERROR - ${e.message}`);
        return false;
    }
}

(async () => {
    for (const m of models) {
        const ok = await testModel(m);
        if (ok) break;
    }
})();
