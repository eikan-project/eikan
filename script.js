const translations = [
    { jp: "現金のみ", en: "Cash Only", tag: "Pay", context: "クレジットカードが使えない場合に。" },
    { jp: "段差注意", en: "Watch your step", tag: "Sign", context: "足元に段差がある場所に。" },
    { jp: "お通し代", en: "Table charge", tag: "Menu", context: "居酒屋などの席料の説明に。" },
    { jp: "立入禁止", en: "No Entry / Staff Only", tag: "Sign", context: "関係者以外入ってほしくない場所に。" },
    { jp: "カード使えます", en: "Credit Cards OK", tag: "Pay", context: "レジ横の案内に。" },
    { jp: "満席です", en: "We are fully booked", tag: "Hotel", context: "予約がいっぱいの時に。" },
    { jp: "禁煙", en: "No Smoking", tag: "Sign", context: "タバコ禁止エリアに。" },
    { jp: "お持ち帰り", en: "To go / Take out", tag: "Menu", context: "テイクアウトの確認に。" },
    { jp: "少々お待ちください", en: "Please wait a moment", tag: "Hotel", context: "お客様を待たせる時に。" },
    { jp: "免税", en: "Tax Free", tag: "Pay", context: "免税対応店舗で。" }
];

const grid = document.getElementById('translationGrid');
const searchInput = document.getElementById('searchInput');

function displayTranslations(filter = "", category = "All") {
    grid.innerHTML = "";
    
    const filtered = translations.filter(item => {
        const matchesSearch = item.jp.includes(filter) || item.en.toLowerCase().includes(filter.toLowerCase());
        const matchesCategory = category === "All" || item.tag === category;
        return matchesSearch && matchesCategory;
    });

    filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-top">
                <h3>${item.jp}</h3>
                <button class="copy-btn" onclick="copyText('${item.en}')">📋 コピー</button>
            </div>
            <div class="en-text">${item.en}</div>
            <div class="context">${item.context}</div>
        `;
        grid.appendChild(card);
    });
}

function filterTag(tag) {
    searchInput.value = "";
    displayTranslations("", tag);
}

function copyText(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Simple visual feedback instead of a messy alert
        const btn = event.target;
        const originalText = btn.innerText;
        btn.innerText = "✅ OK!";
        setTimeout(() => btn.innerText = originalText, 1500);
    });
}

searchInput.addEventListener('input', (e) => {
    displayTranslations(e.target.value);
});

// Initial Load
displayTranslations();
