
const form = document.querySelector("form");
const input = document.querySelector("input");
const resultBox = document.querySelector(".result");

// Clear result when input is empty
input.addEventListener("input", () => {
    if (input.value.trim() === "") {
        resultBox.innerHTML = "";
    }
});

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const word = input.value.trim();

    if (!word) {
        resultBox.innerHTML = `<p style="color:red;">⚠️ Please enter a word</p>`;
        return;
    }

    resultBox.innerHTML = `<p>🔍 Searching for "<b>${word}</b>"...</p>`;

    try {
        // 1️⃣ Dictionary API (English meaning)
        const dictRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        if (!dictRes.ok) throw new Error("Word not found in dictionary");
        const dictData = await dictRes.json();
        const meaningData = dictData[0].meanings[0];

        const partOfSpeech = meaningData.partOfSpeech || "N/A";
        const definitionEn = meaningData.definitions[0]?.definition || "No definition found";

        // 2️⃣ Hindi meaning (via translation API)
        const transRes = await fetch(`https://api.mymemory.translated.net/get?q=${word}&langpair=en|hi`);
        const transData = await transRes.json();
        const definitionHi = transData.responseData.translatedText || "No Hindi meaning found";

        // 3️⃣ Synonyms
        const synRes = await fetch(`https://api.datamuse.com/words?rel_syn=${word}`);
        const synData = await synRes.json();
        const synonyms = synData.length ? synData.slice(0, 5).map(w => w.word).join(", ") : "No synonyms found";

        // 4️⃣ Antonyms
        const antRes = await fetch(`https://api.datamuse.com/words?rel_ant=${word}`);
        const antData = await antRes.json();
        const antonyms = antData.length ? antData.slice(0, 5).map(w => w.word).join(", ") : "No antonyms found";

        // 5️⃣ Show all results (center aligned) + 🔊 buttons
        resultBox.innerHTML = `
            <div style="text-align:center;">
                <h2>📖 ${word}</h2>
                <button onclick="speakWord('${word}','en-US')">🔊 English</button>
                <button onclick="speakWord('${word}','hi-IN')">🔊 Hindi</button>
                <p><b>Part of Speech:</b> ${partOfSpeech}</p>
                <p><b>Meaning (English):</b> ${definitionEn}</p>
                <p><b>Meaning (Hindi):</b> ${definitionHi}</p>
                <p><b>Synonyms:</b> ${synonyms}</p>
                <p><b>Antonyms:</b> ${antonyms}</p>
            </div>
        `;
    } catch (error) {
        resultBox.innerHTML = `<p style="color:red;">❌ Word not found. Try another one.</p>`;
        console.error(error);
    }
});

// 🔊 Function for pronunciation
function speakWord(text, lang = "en-US") {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    speechSynthesis.speak(utterance);
}
