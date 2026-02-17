const themeToggle = document.getElementById('themeToggle');
const body = document.body;
const grid = document.getElementById('translationGrid');
const searchInput = document.getElementById('searchInput');

let translations = []; 
let currentCategory = "All";

// 1. Fetch Data (Supports individual files)
async function loadData(category = "All") {
    currentCategory = category;
    grid.innerHTML = "<p class='loading'>読み込み中...</p>";
    
    try {
        // If "All", we load the original master data.json, otherwise load from /data/
        const path = (category === "All") ? './data.json' : `./data/${category.toLowerCase()}.json`;
        
        const response = await fetch(path);
        if (!response.ok) throw new Error(`Could not load ${path}`);
        
        translations = await response.json();
        displayTranslations(""); 
    } catch (error) {
        console.error("Fetch Error:", error);
        grid.innerHTML = `<p style="color:red; padding:20px;">エラー: ${category} のデータを読み込めませんでした。</p>`;
    }
}

// 2. Display Logic
function displayTranslations(searchTerm = "") {
    grid.innerHTML = "";
    
    const filtered = translations.filter(item => {
        return item.jp.includes(searchTerm) || 
               item.en.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (filtered.length === 0) {
        grid.innerHTML = "<p class='no-results'>見つかりませんでした。リクエストしてください！</p>";
        return;
    }

    filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-top">
                <h3>${item.jp}</h3>
                <button class="copy-btn" data-text="${item.en}">📋 コピー</button>
            </div>
            <div class="en-text">${item.en}</div>
            <div class="context">${item.context}</div>
        `;
        grid.appendChild(card);
    });
}

// 3. Event Listeners
themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    localStorage.setItem('theme', body.classList.contains('dark-mode') ? 'dark' : 'light');
});

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tag = btn.getAttribute('data-tag');
        searchInput.value = "";
        loadData(tag);
    });
});

searchInput.addEventListener('input', (e) => {
    displayTranslations(e.target.value);
});

grid.addEventListener('click', (e) => {
    if (e.target.classList.contains('copy-btn')) {
        const text = e.target.getAttribute('data-text');
        navigator.clipboard.writeText(text).then(() => {
            const originalText = e.target.innerText;
            e.target.innerText = "✅ OK!";
            setTimeout(() => e.target.innerText = originalText, 1500);
        });
    }
});

// Initialize
if (localStorage.getItem('theme') === 'dark') body.classList.add('dark-mode');
loadData("All");