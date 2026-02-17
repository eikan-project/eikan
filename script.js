const themeToggle = document.getElementById('themeToggle');
const body = document.body;
const grid = document.getElementById('translationGrid');
const searchInput = document.getElementById('searchInput');

let translations = []; 

// 1. Function to load a specific file
async function loadData(category = "All") {
    grid.innerHTML = "<p class='loading'>Loading...</p>";
    
    // Logic: If All, load data.json. Otherwise load from the data folder.
    const path = (category === "All") ? './data.json' : `./data/${category.toLowerCase()}.json`;
    
    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`File not found: ${path}`);
        
        translations = await response.json();
        displayTranslations(); // Show everything in the new file
    } catch (error) {
        console.error("Fetch Error:", error);
        grid.innerHTML = `<p style="color:red; padding:20px;">Error: Could not find ${category.toLowerCase()}.json in the /data/ folder.</p>`;
    }
}

// 2. Logic to display and search
function displayTranslations() {
    const searchTerm = searchInput.value.toLowerCase();
    grid.innerHTML = "";
    
    const filtered = translations.filter(item => {
        return item.jp.includes(searchTerm) || 
               item.en.toLowerCase().includes(searchTerm);
    });

    if (filtered.length === 0) {
        grid.innerHTML = "<p class='no-results'>見つかりませんでした。下でリクエストできます。</p>";
        return;
    }

    filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-top">
                <h3>${item.jp}</h3>
                <button class="copy-btn" data-text="${item.en}">コピー</button>
            </div>
            <div class="en-text">${item.en}</div>
            <div class="context">${item.context}</div>
        `;
        grid.appendChild(card);
    });
}

// 3. Event Listeners
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tag = btn.getAttribute('data-tag');
        searchInput.value = ""; // Clear search when switching files
        loadData(tag); // Load the specific JSON file
    });
});

searchInput.addEventListener('input', () => {
    displayTranslations(); // Filter the currently loaded file
});

// Copy and Theme logic...
grid.addEventListener('click', (e) => {
    if (e.target.classList.contains('copy-btn')) {
        const text = e.target.getAttribute('data-text');
        navigator.clipboard.writeText(text).then(() => {
            const originalText = e.target.innerText;
            e.target.innerText = "✅ Done";
            setTimeout(() => e.target.innerText = originalText, 1500);
        });
    }
});

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
});

// Start by loading the main file
loadData("All");