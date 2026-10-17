const https = require('https');
const readline = require('readline');

const API_KEY = process.env.GROQ_API_KEY || "";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let chatHistory = [
    { 
        role: "system", 
        content: "Senin adın Beyazmet. Termux üzerinde çalışan yapay zeka asistanısın. Türkçe, samimi ve kısa cevaplar ver." 
    }
];

let activeGame = null;

let board = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

function printXOX() {
    console.log(`\n ${board[0]} | ${board[1]} | ${board[2]} `);
    console.log(`-----------`);
    console.log(` ${board[3]} | ${board[4]} | ${board[5]} `);
    console.log(`-----------`);
    console.log(` ${board[6]} | ${board[7]} | ${board[8]} \n`);
}

function checkWinXOX(p) {
    const wins = [
        [0,1,2], [3,4,5], [6,7,8],
        [0,3,6], [1,4,7], [2,5,8],
        [0,4,8], [2,4,6]
    ];
    return wins.some(c => board[c[0]] === p && board[c[1]] === p && board[c[2]] === p);
}

function smartBotMoveXOX() {
    for (let i = 0; i < 9; i++) {
        if (board[i] !== 'X' && board[i] !== 'O') {
            let temp = board[i];
            board[i] = 'O';
            if (checkWinXOX('O')) return;
            board[i] = temp;
        }
    }
    for (let i = 0; i < 9; i++) {
        if (board[i] !== 'X' && board[i] !== 'O') {
            let temp = board[i];
            board[i] = 'X';
            if (checkWinXOX('X')) {
                board[i] = 'O';
                return;
            }
            board[i] = temp;
        }
    }
    if (board[4] === '5') { board[4] = 'O'; return; }
    let emptyIdx = board.map((val, idx) => (val !== 'X' && val !== 'O') ? idx : null).filter(val => val !== null);
    if (emptyIdx.length > 0) {
        let move = emptyIdx[Math.floor(Math.random() * emptyIdx.length)];
        board[move] = 'O';
    }
}

const VIEW_W = 30;
const VIEW_H = 30;

let steve = { x: 15, y: 8 };
let inventory = { toprak: 5, tas: 3, tahta: 4, elma: 2 };
let worldMap = {};

function getBlock(x, y) {
    let key = `${x},${y}`;
    if (worldMap[key]) return worldMap[key];

    let block = '🟦';
    if (y < 8) {
        block = '🟦';
    } else if (y === 8) {
        if (x % 5 === 0) block = '🌲';
        else block = '🟩';
    } else if (y > 8 && y <= 18) {
        block = '🟫';
    } else {
        block = '⬛';
    }

    worldMap[key] = block;
    return block;
}

function render30x30Minecraft() {
    console.clear();
    console.log("===============================================================");
    console.log("         ⛏️ BEYAZMET 30x30 MINECRAFT MOTORU ⛏️          ");
    console.log("===============================================================");

    let startX = steve.x - Math.floor(VIEW_W / 2);
    let startY = steve.y - Math.floor(VIEW_H / 2);

    for (let y = startY; y < startY + VIEW_H; y++) {
        let line = "";
        for (let x = startX; x < startX + VIEW_W; x++) {
            if (x === steve.x && y === steve.y) {
                line += '🧑‍🦰';
            } else {
                line += getBlock(x, y);
            }
        }
        console.log(line);
    }

    console.log("---------------------------------------------------------------");
    console.log(`📍 Konum: X:${steve.x} Y:${steve.y} | 🎒 🟩Toprak:${inventory.toprak} 🟫Tahta:${inventory.tahta} ⬛Taş:${inventory.tas}`);
    console.log("---------------------------------------------------------------");
    console.log("🎮 w,a,s,d (Hareket) | x (Kaz) | p (Koy) | iptal (Çıkış)");
    console.log("===============================================================\n");
}

console.log("\x1b[36m===========================================\x1b[0m");
console.log("\x1b[35m   ⚡ BEYAZMET Termux Yapay Zeka Asistanı ⚡  \x1b[0m");
console.log("\x1b[36m===========================================\x1b[0m");
console.log("\x1b[33mOyunlar: 'xox' | 'minecraft' | Çıkış: 'çıkış'\x1b[0m\n");

function promptUser() {
    rl.question('\x1b[32mSen > \x1b[0m', async (input) => {
        const text = input.trim();
        if (!text) { promptUser(); return; }
        const lower = text.toLowerCase();

        if (lower === 'çıkış' || lower === 'exit') {
            console.log("\x1b[31mBeyazmet kapatılıyor...\x1b[0m");
            rl.close();
            return;
        }

        if (lower === 'iptal' || lower === 'cancel') {
            activeGame = null;
            console.log("\x1b[35mBeyazmet > \x1b[0mSohbet moduna geçildi.");
            promptUser();
            return;
        }

        if (lower.includes('mine') || lower.includes('craft') || lower.includes('başla') || lower.includes('basla')) {
            activeGame = 'minecraft';
            render30x30Minecraft();
            promptUser();
            return;
        }

        if (lower.includes('xox')) {
            activeGame = 'xox';
            board = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
            console.log("\x1b[35mBeyazmet > \x1b[0mXOX Oyunu Başladı!");
            printXOX();
            promptUser();
            return;
        }

        if (activeGame === 'xox') {
            let num = parseInt(text);
            if (!isNaN(num) && num >= 1 && num <= 9) {
                let idx = num - 1;
                if (board[idx] !== 'X' && board[idx] !== 'O') {
                    board[idx] = 'X';
                    if (checkWinXOX('X')) {
                        printXOX();
                        console.log("\x1b[35mBeyazmet > \x1b[0mTebrikler, sen kazandın! 🎉\n");
                        activeGame = null;
                        promptUser();
                        return;
                    }
                    smartBotMoveXOX();
                    if (checkWinXOX('O')) {
                        printXOX();
                        console.log("\x1b[35mBeyazmet > \x1b[0mBen kazandım! 😎\n");
                        activeGame = null;
                        promptUser();
                        return;
                    }
                    printXOX();
                    promptUser();
                    return;
                }
            }
        }

        if (activeGame === 'minecraft') {
            let cmd = lower;

            if (cmd === 'w') steve.y--;
            else if (cmd === 's') steve.y++;
            else if (cmd === 'a') steve.x--;
            else if (cmd === 'd') steve.x++;
            else if (cmd === 'x') {
                let key = `${steve.x},${steve.y}`;
                let current = worldMap[key] || getBlock(steve.x, steve.y);
                if (current === '🟩' || current === '🟫') { inventory.toprak++; worldMap[key] = '🟦'; }
                else if (current === '⬛') { inventory.tas++; worldMap[key] = '🟦'; }
                else if (current === '🌲') { inventory.tahta += 2; worldMap[key] = '🟦'; }
            } else if (cmd === 'p') {
                let key = `${steve.x},${steve.y}`;
                if (inventory.toprak > 0) {
                    inventory.toprak--;
                    worldMap[key] = '🟫';
                } else {
                    console.log("❌ Koyacak blok yok!");
                }
            }

            render30x30Minecraft();
            promptUser();
            return;
        }

        chatHistory.push({ role: "user", content: text });
        process.stdout.write("\x1b[35mBeyazmet > \x1b[0m");

        try {
            const responseText = await streamGroqAPIWithRetry(chatHistory);
            console.log("\n");
            chatHistory.push({ role: "assistant", content: responseText });
        } catch (err) {
            console.log(`\n\x1b[31m[HATA] > \x1b[0m${err.message}\n`);
        }

        promptUser();
    });
}

function streamGroqAPIWithRetry(messages, retries = 3) {
    return new Promise((resolve, reject) => {
        const recentMessages = [messages[0], ...messages.slice(-4)];

        const data = JSON.stringify({
            model: "qwen/qwen3.8-27b",
            messages: recentMessages,
            temperature: 0.7,
            max_tokens: 300,
            stream: true
        });

        const options = {
            hostname: 'api.groq.com',
            path: '/openai/v1/chat/completions',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Length': Buffer.byteLength(data)
            }
        };

        let fullResponse = "";

        const req = https.request(options, (res) => {
            if (res.statusCode === 429 && retries > 0) {
                process.stdout.write("\x1b[33m(Yoğunluk var, 15s bekleniyor...)\x1b[0m");
                setTimeout(async () => {
                    readline.clearLine(process.stdout, 0);
                    readline.cursorTo(process.stdout, 0);
                    process.stdout.write("\x1b[35mBeyazmet > \x1b[0m");
                    try {
                        let result = await streamGroqAPIWithRetry(messages, retries - 1);
                        resolve(result);
                    } catch (e) { reject(e); }
                }, 15000);
                return;
            }

            if (res.statusCode !== 200) {
                let errBody = '';
                res.on('data', chunk => errBody += chunk);
                res.on('end', () => {
                    try {
                        let parsed = JSON.parse(errBody);
                        reject(new Error(parsed.error?.message || `HTTP ${res.statusCode}`));
                    } catch (e) { reject(new Error(`HTTP ${res.statusCode}`)); }
                });
                return;
            }

            res.on('data', chunk => {
                let lines = chunk.toString().split('\n');
                for (let line of lines) {
                    let trimmed = line.trim();
                    if (trimmed.startsWith('data: ') && trimmed !== 'data: [DONE]') {
                        try {
                            let json = JSON.parse(trimmed.replace('data: ', ''));
                            let content = json.choices[0]?.delta?.content || '';
                            if (content) {
                                process.stdout.write(content);
                                fullResponse += content;
                            }
                        } catch (e) {}
                    }
                }
            });

            res.on('end', () => { resolve(fullResponse); });
        });

        req.on('error', (e) => reject(e));
        req.write(data);
        req.end();
    });
}

promptUser();
