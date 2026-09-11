const ApiError = require("../utils/ApiError")

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`

const generateAIContent = async (prompt) => {
    const response = await fetch(GEMINI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
        })
    })

    const data = await response.json()

    if (!response.ok) {
        throw new ApiError(data.error?.message || "AI Request Failed", 502)
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
        throw new ApiError("AI Did Not Return Any Content", 502)
    }

    return text.trim()
}

module.exports = { generateAIContent }
