const themeToggle = document.getElementById('themeToggle');
const body = document.body;
const grid = document.getElementById('translationGrid');
const searchInput = document.getElementById('searchInput');

let translations = []; 

// 1. Fetch data with improved error logging for that 404
async function loadData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        translations = await response.json();
        displayTranslations(); 
    } catch (error) {
        console.error("404 Check: Is data.json in the same folder as index.html?", error);
        grid.innerHTML = `<p style="color: red; text-align: center; padding: 20px;">
            Error: Could not find data.json. Check your file location!</p>`;
    }
}

// 2. Display Logic
function displayTranslations(filter = "", category = "All") {
    grid.innerHTML = "";
    
    const filtered = translations.filter(item => {
        const matchesSearch = item.jp.includes(filter) || 
                              item.en.toLowerCase().includes(filter.toLowerCase());
        const matchesCategory = category === "All" || item.tag === category;
        return matchesSearch && matchesCategory;
    });

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

// 3. SECURE EVENT LISTENERS (No more CSP errors!)

// Theme Toggle
themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    localStorage.setItem('theme', body.classList.contains('dark-mode') ? 'dark' : 'light');
});

// Category Filter Buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tag = btn.getAttribute('data-tag');
        searchInput.value = ""; // Clear search when switching categories
        displayTranslations("", tag);
    });
});

// Search Input
searchInput.addEventListener('input', (e) => {
    displayTranslations(e.target.value);
});

// Copy Button (Event Delegation)
grid.addEventListener('click', (e) => {
    if (e.target.classList.contains('copy-btn')) {
        const text = e.target.getAttribute('data-text');
        navigator.clipboard.writeText(text).then(() => {
            const btn = e.target;
            const originalText = btn.innerText;
            btn.innerText = "✅ OK!";
            setTimeout(() => btn.innerText = originalText, 1500);
        });
    }
});

// Initialize
if (localStorage.getItem('theme') === 'dark') body.classList.add('dark-mode');
loadData();