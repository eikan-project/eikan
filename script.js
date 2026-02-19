const themeToggle = document.getElementById('themeToggle');
const body = document.body;
const grid = document.getElementById('translationGrid');
const searchInput = document.getElementById('searchInput');

let allData = []; 
let currentActiveCategory = "All";

const toKatakana = (str) => {
    return str.replace(/[\u3041-\u3096]/g, m => String.fromCharCode(m.charCodeAt(0) + 0x60));
};

async function initializeApp() {
    grid.innerHTML = "<p class='loading'>データを読み込み中...</p>";
    const categories = ['menu', 'sign', 'pay', 'hotel', 'admin'];
    try {
        const fetchPromises = categories.map(cat => 
            fetch(`./data/${cat}.json`).then(res => res.json())
        );
        const results = await Promise.all(fetchPromises);
        allData = results.flat(); 
        displayTranslations(); 

        searchInput.addEventListener('input', () => displayTranslations(currentActiveCategory));
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tag = btn.getAttribute('data-tag');
                currentActiveCategory = tag;
                displayTranslations(tag);
            });
        });
    } catch (e) {
        grid.innerHTML = `<p style="color:red; padding:20px;">エラー: データを読み込めませんでした。</p>`;
    }
}

function displayTranslations(categoryFilter = "All") {
    const term = searchInput.value.toLowerCase();
    const katakanaTerm = toKatakana(term);
    grid.innerHTML = "";

        let filtered = allData.filter(item => {
            const matchesCategory = (categoryFilter === "All" || item.tag === categoryFilter);
            const searchPool = (item.jp + item.en + (item.keywords || "")).toLowerCase();
            const searchPoolKatakana = toKatakana(searchPool);
            const matchesSearch = searchPool.includes(term) || searchPoolKatakana.includes(katakanaTerm);
            return matchesCategory && matchesSearch;
        });

        for (let i = filtered.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
        }
        // Limit to 8
        const limited = filtered.slice(0, 12);

    limited.forEach(item => {
        // Prepare Report URL
        const reportSummary = `${item.jp}\n${item.en}${item.context ? `\n${item.context}` : ''}`;
        const reportUrl = `https://docs.google.com/forms/d/e/1FAIpQLSfpbhutXoLYXMmI6aKyk0huRF_zpWxHVUwzdPWBwE8Q79xeIQ/viewform?usp=dialog&entry.1588045473=${encodeURIComponent(reportSummary)}`;

        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-header-row">
                <div class="jp-text">${item.jp}</div>
                <div class="menu-container">
                    <button class="menu-btn" onclick="toggleMenu(event)">⋮</button>
                    <div class="menu-content">
                        <a href="#" onclick="downloadPhraseImage('${item.jp}', '${item.en}')">画像を保存</a>
                        <a href="#" onclick="printPhrase('${item.jp}', '${item.en}')">印刷</a>
                        <div class ="report-item"><a href="${reportUrl}" target="_blank">報告</a></div>
                    </div>
                </div>
            </div>
            <div class="en-text">${item.en}</div>
                ${item.context ? `<p class="context-text">${item.context}</p>` : ''}
            <div class="card-actions">
                <button class="copy-btn" onclick="handleCopy(this, '${item.en}')">コピー</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

window.toggleMenu = (e) => {
    e.stopPropagation();
    const menu = e.target.nextElementSibling;
    document.querySelectorAll('.menu-content').forEach(m => {
        if (m !== menu) m.classList.remove('show');
    });
    menu.classList.toggle('show');
};

const getVisualTemplate = (jp, en) => `
    <div id="capture-target" style="
        box-sizing: border-box;
        width: 800px; /* Fixed width for consistent high-res output */
        padding: 10px; 
        background: linear-gradient(135deg, #a8edea 0%, #fed6e3 50%, #fac1eb 100%);
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: 'Helvetica Neue', Arial, 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', sans-serif;
    ">
        <div style="
            background: rgba(255, 255, 255, 0.95);
            padding: 60px 40px;
            border-radius: 12px;
            text-align: center;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
            position: relative;
            overflow: hidden;
        ">
            <div style="
                position: absolute; top: -50px; right: -50px;
                width: 150px; height: 150px;
                background: linear-gradient(135deg, #a8edea 0%, #fac1eb 100%);
                opacity: 0.05; border-radius: 80%;
            "></div>

            <div style="
                font-size: 24px; 
                color: #7f8c8d; 
                margin-bottom: 20px; 
                font-weight: 500;
                letter-spacing: 0.05em;
            ">${jp}</div>
            
            <div style="
                font-size: 52px; 
                color: #2c3e50; 
                font-weight: 800; 
                line-height: 1.2;
                margin-bottom: 40px;
                word-wrap: break-word;
            ">${en}</div>
            
            <div style="
                border-top: 2px solid #f1f2f6;
                padding-top: 20px;
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 10px;
            ">
                <span style="
                    font-size: 14px; 
                    color: #bdc3c7; 
                    font-weight: bold; 
                    letter-spacing: 2px;
                    text-transform: uppercase;
                ">英換 EI-KAN PROJECT</span>
            </div>
        </div>
    </div>
`;

window.downloadPhraseImage = (jp, en) => {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px'; // Hide it off-screen
    container.style.top = '0';
    container.innerHTML = getVisualTemplate(jp, en);
    document.body.appendChild(container);

    const target = container.querySelector('#capture-target');

    html2canvas(target, { 
        backgroundColor: null, 
        scale: 3, // Retina quality
        logging: false 
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `EiKan_${jp.replace(/\s+/g, '_').substring(0, 20)}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        
        // Cleanup
        document.body.removeChild(container);
    }).catch(err => {
        console.error("Image generation failed:", err);
        alert("画像の保存に失敗しました。");
        document.body.removeChild(container);
    });
};

window.printPhrase = (jp, en) => {
    const win = window.open('', '', 'width=900,height=700');
    
    // We inject the EXACT same gradient HTML into the print window
    win.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Print - 英換</title>
            <style>
                body { 
                    margin: 0; 
                    padding: 0; 
                    display: flex; 
                    justify-content: center; 
                    align-items: center; 
                    min-height: 100vh;
                    background: #f0f0f0; 
                }
                /* Print specific overrides */
                @media print {
                    body { -webkit-print-color-adjust: exact; }
                    @page { margin: 0; }
                }
            </style>
        </head>
        <body>
            ${getVisualTemplate(jp, en)}
            <script>
                // Wait for the window to load, then print
                window.onload = () => {
                    setTimeout(() => {
                        window.print();
                        window.close();
                    }, 500);
                };
            </script>
        </body>
        </html>
    `);
    win.document.close();
};

window.handleCopy = (btn, text) => {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = btn.innerText;
        
        // Visual feedback
        btn.innerText = "OK!";
        btn.classList.add('copied'); // Use CSS class for style if possible
        btn.style.background = "#2ecc71";
        btn.style.color = "white";
        btn.style.borderColor = "#2ecc71";

        setTimeout(() => {
            btn.innerText = originalText;
            btn.classList.remove('copied');
            // Reset inline styles
            btn.style.background = "";
            btn.style.color = "";
            btn.style.borderColor = "";
        }, 1500);
    });
};

document.addEventListener('click', (e) => {
    if (!e.target.closest('.menu-container')) {
        document.querySelectorAll('.menu-content').forEach(m => m.classList.remove('show'));
    }
});

initializeApp();