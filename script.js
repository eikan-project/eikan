const themeToggle = document.getElementById('themeToggle');
const body = document.body;
const grid = document.getElementById('translationGrid');
const searchInput = document.getElementById('searchInput');

let allData = []; 
let currentActiveCategory = "All";

const toKatakana = (str) => {
    return str.replace(/[\u3041-\u3096]/g, m => String.fromCharCode(m.charCodeAt(0) + 0x60));
};

// 1. Initial Load: Fetch all files once for Global Search
async function initializeApp() {
    grid.innerHTML = "<p class='loading'>データを読み込み中...</p>";
    
    // Make sure these match your filenames in the /data/ folder
    const categories = ['menu', 'sign', 'pay', 'hotel','admin'];
    try {
        const fetchPromises = categories.map(cat => 
            fetch(`./data/${cat}.json`).then(res => res.json())
        );
        
        const results = await Promise.all(fetchPromises);
        allData = results.flat(); 
        
        displayTranslations(); 
        // Event wiring for search
        searchInput.addEventListener('input', () => displayTranslations(currentActiveCategory));
        // Event wiring for filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tag = btn.getAttribute('data-tag');
                currentActiveCategory = tag;
                displayTranslations(tag);
                // Optional: highlight active
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    } catch (e) {
        console.error(e);
        grid.innerHTML = `<p style="color:red; padding:20px;">エラー: /data/ フォルダ内のJSONファイルを読み込めませんでした。</p>`;
    }
}

// 2. Display Logic
function displayTranslations(categoryFilter = "All") {
    const term = searchInput.value.toLowerCase();
    const katakanaTerm = toKatakana(term);
    grid.innerHTML = "";

    // 1. Filter by Category AND Search Term
        let filtered = allData.filter(item => {
            const matchesCategory = (categoryFilter === "All" || item.tag === categoryFilter);
            const searchPool = (item.jp + item.en + (item.keywords || "")).toLowerCase();
            const searchPoolKatakana = toKatakana(searchPool);
            const matchesSearch = searchPool.includes(term) || searchPoolKatakana.includes(katakanaTerm);
            return matchesCategory && matchesSearch;
        });

        // Shuffle filtered array (Fisher-Yates)
        for (let i = filtered.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
        }
        // Limit to 8
        const limited = filtered.slice(0, 8);

        // 2. Handle Empty Results
        if (limited.length === 0) {
            grid.innerHTML = "<p class='no-results'>該当するフレーズが見つかりません。</p>";
            return;
        }

        // 3. Render (Compact Design)
        limited.forEach(item => {
            const card = document.createElement('div');
            card.className = 'translation-card';
            // Google Form prefill: entry.2120499648 (Japanese), entry.1201813702 (English)
            const reportSummary = `${item.jp}\n${item.en}${item.context ? `\n${item.context}` : ''}`;
            const reportUrl = `https://docs.google.com/forms/d/e/1FAIpQLSfpbhutXoLYXMmI6aKyk0huRF_zpWxHVUwzdPWBwE8Q79xeIQ/viewform?usp=dialog&entry.1588045473=${encodeURIComponent(reportSummary)}`;
            card.innerHTML = `
                <div class="card-header-row">
                    <span class="jp-text">${item.jp}</span>
                    <div class="menu-container">
                        <button class="menu-btn" onclick="window.toggleMenu(event)">⋮</button>
                        <div class="menu-content">
                            <a href="${reportUrl}" target="_blank" class="report-link" title="${reportSummary}">報告</a>
                        </div>
                    </div>
                </div>
                <h3 class="en-text">${item.en}</h3>
                ${item.context ? `<p class="context-text">${item.context}</p>` : ''}
                <div class="card-btns-row">
                    <div class="card-btns">
                        <button class="print-btn" onclick="window.printPhrase('${item.jp.replace(/'/g, '\'')}', '${item.en.replace(/'/g, '\'')}')">印刷</button>
                        <button class="copy-btn" data-text="${item.en}">コピー</button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
}

// 4. Unified Copy Function with "OK!" feedback
grid.addEventListener('click', (e) => {
    if (e.target.classList.contains('copy-btn')) {
        const text = e.target.getAttribute('data-text');
        navigator.clipboard.writeText(text).then(() => {
            const originalText = e.target.innerText;
            e.target.innerText = "OK!";
            e.target.style.background = "#2ecc71"; // Temporary green feedback
            e.target.style.color = "white";
            
            setTimeout(() => {
                e.target.innerText = originalText;
                e.target.style.background = ""; // Revert to CSS default
                e.target.style.color = "";
            }, 1200);
        });
    }
});

// Helper to open/close card menus
window.toggleMenu = (e) => {
    e.stopPropagation();
    const menu = e.target.closest('.menu-container').querySelector('.menu-content');
    document.querySelectorAll('.menu-content').forEach(m => {
        if (m !== menu) m.classList.remove('show');
    });
    menu.classList.toggle('show');
};

// Close menus when clicking anywhere else
document.addEventListener('click', () => {
    document.querySelectorAll('.menu-content').forEach(m => m.classList.remove('show'));
});

// Theme and Print
themeToggle.addEventListener('click', () => body.classList.toggle('dark-mode'));

window.printPhrase = (jp, en) => {
    const win = window.open('', '_blank');
    
    win.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                @page {
                    size: auto;
                    margin: 0; /* Removes browser headers/footers */
                }
                
                * {
                    box-sizing: border-box;
                }

                body {
                    font-family: sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh; /* Changed from height to min-height */
                    margin: 0;
                    padding: 0;
                    overflow: hidden; /* Prevents stray pixels from triggering page 2 */
                }
                
                .box {
                    border: 2px solid #3498db;
                    padding: 40px;
                    border-radius: 15px;
                    text-align: center;
                    width: 85%;
                    max-width: 600px;
                    background: white;
                }

                .jp {
                    font-size: 18px;
                    color: #7f8c8d;
                    margin-bottom: 12px;
                }

                .en {
                    font-size: 36px;
                    color: #2c3e50;
                    font-weight: bold;
                    line-height: 1.2;
                }

                .mark {
                    margin-top: 30px;
                    color: #bdc3c7;
                    font-size: 6px;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                }
            </style>
        </head>
        <body>
            <div class="box">
                <div class="jp">${jp}</div>
                <div class="en">${en}</div>
                <div class="mark">英換 (Ei-Kan Project)</div>
            </div>
            <script>
                // We use a small delay to ensure the DOM is painted 
                // and the "about:blank" title is ready to be bypassed
                window.onload = () => {
                    setTimeout(() => {
                        window.print();
                        window.close();
                    }, 300);
                };
            </script>
        </body>
        </html>
    `);
    win.document.close();
};

// Start
initializeApp();