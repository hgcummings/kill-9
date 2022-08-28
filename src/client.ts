import { Card, Game } from "./game.js";
import { KeyboardInput } from "./input.js";
import { Bot } from "./bot.js";

const playerInput = new KeyboardInput();

const size = 3;
const games = new Array<Game>();
const lastRenderedState = new Array<Array<{val:number, since:number}>>();

for (let i = 0; i < 9; ++i) {
    games.push(new Game(size));
    const initState = new Array<{val:number, since:number}>();
    for (let j = 0; j < size * size; ++j) {
        initState.push({ val: 0, since: 0 });
    }
    lastRenderedState.push(initState);
}

function grpIdx(idx: number, size: number) {
    return Math.floor(idx / size);
}

let canvas: HTMLCanvasElement | null;

function renderCards(cards: Array<Card>, pos: number) {
    if (!canvas) {
        let gameElem = document.getElementById("game");
        if (gameElem === null) {
            return;
        }
        canvas = document.createElement("canvas");
        canvas.width = window.innerWidth;
        canvas.height = Math.round(window.innerWidth * 3 / 8);
        gameElem.appendChild(canvas);
    }

    const cellSize = pos === 0 ? canvas.width / 12 : canvas.width / 16;
    const ctx = canvas.getContext("2d")!;
    ctx.save();

    const offsetX = pos === 0
        ? canvas.width * 3 / 8
        : canvas.width * ((grpIdx(pos - 1, 2) * 3 / 16) + (grpIdx(pos - 1, 4) / 4));
    const offsetY = (pos === 0 || pos % 2 === 0) ? 0 : canvas.height / 2;

    ctx.translate(offsetX, offsetY);
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    ctx.fillRect(0, 0, cellSize * size, cellSize * size);
    
    ctx.fillStyle = "rgb(173,255,47)";
    ctx.strokeStyle = "rgb(173,255,47)";
    ctx.shadowColor = "rgba(173,255,47,0.5)";
    ctx.shadowBlur = 3;
    ctx.strokeRect(
        cellSize / 12,
        cellSize / 12,
        cellSize * size - cellSize / 6,
        cellSize * size - cellSize / 6
    );
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(173,255,47,0.25)";

    const renderState = lastRenderedState[pos];
    for (let i = 0; i < renderState.length; ++i) {
        const card = cards.find(c => c.x === i % size && c.y === Math.floor(i / size));
        if (!card) {
            renderState[i].val = 0;
        } else {
            if (card.val != renderState[i].val) {
                renderState[i].val = card.val;
                renderState[i].since = Date.now();
            }

            const dt = Date.now() - renderState[i].since;
            ctx.save();

            if (card.val === 8) {
                ctx.fillStyle = "rgb(255,173,47)";
                ctx.strokeStyle = "rgba(255,173,47,0.25)";
            }

            const margin = (1 - size) / 2;
            ctx.translate(
                cellSize * (card.x + 0.5 - (card.x + margin) / 6),
                cellSize * (card.y + 0.5 - (card.y + margin) / 6)
            );
            const path = (card.val > 1) ? new Path2D() : null;
            for (let j = 0; j < card.val; ++j) {
                const angle = 2 * Math.PI * ((dt / 2000) + (j / card.val));
                const radius = cellSize / 3;
                const x = Math.sin(-angle) * radius;
                const y = Math.cos(-angle) * radius;
                const size = cellSize / 32;
                ctx.fillRect(x - size / 2, y - size / 2, size, size);

                if (path) {
                    if (j === 0) {
                        path.moveTo(x, y);
                    } else {
                        path.lineTo(x, y);
                    }
                }
            }
            if (path) {
                path.closePath();
                ctx.stroke(path);
            }
            ctx.restore();
        }
    }

    ctx.restore();
}

function renderHud(game: { score: number }) {
    document.getElementById("score")!.innerText = game.score.toString();
}

playerInput.start(dir => {
    games[0].update(dir);
});

const bot = new Bot();
for (let i = 1; i < 9; ++i) {
    const game = games[i];
    function update() {
        game.update(bot.chooseNextMove(game));
        window.setTimeout(update, 1000 + 1000 * Math.random());
    }
    
    window.setTimeout(update, 1000 + 1000 * Math.random());
}

function render() {
    games.forEach((game, i) => {
        renderCards(game.cards, i);
    });
    renderHud(games[0]);
    window.requestAnimationFrame(render);
}

window.requestAnimationFrame(render);
