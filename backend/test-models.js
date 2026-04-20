// node test-models.js
require("dotenv").config();
const key = process.env.GEMINI_API_KEY;

async function listModels(apiVer) {
    const res = await fetch(`https://generativelanguage.googleapis.com/${apiVer}/models?key=${key}`);
    const data = await res.json();
    if (!res.ok) { console.log(`[${apiVer}] ERROR:`, data.error?.message); return; }
    const names = (data.models || []).map(m => m.name).filter(n => n.includes("flash") || n.includes("pro"));
    console.log(`[${apiVer}] Models found:`, names.join(", ") || "none");
}

async function tryGenerate(model, apiVer) {
    const res = await fetch(
        `https://generativelanguage.googleapis.com/${apiVer}/models/${model}:generateContent?key=${key}`,
        {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: "Hi" }] }] })
        }
    );
    const data = await res.json();
    if (res.ok) {
        console.log(`✅ ${apiVer}/${model} WORKS: "${data.candidates?.[0]?.content?.parts?.[0]?.text?.slice(0, 30)}"`);
        return true;
    }
    console.log(`❌ ${apiVer}/${model}: [${res.status}] ${data.error?.message?.slice(0, 80)}`);
    return false;
}

(async () => {
    await listModels("v1");
    await listModels("v1beta");

    const combos = [
        ["gemini-1.5-flash", "v1"],
        ["gemini-1.5-flash", "v1beta"],
        ["gemini-1.5-flash-latest", "v1"],
        ["gemini-1.5-flash-latest", "v1beta"],
        ["gemini-1.5-flash-001", "v1"],
        ["gemini-1.5-pro", "v1"],
        ["gemini-pro", "v1beta"],
    ];
    for (const [model, ver] of combos) {
        const ok = await tryGenerate(model, ver);
        if (ok) break;
    }
})();
