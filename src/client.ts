import { Card, Game } from "./game.js";
import { KeyboardInput } from "./input.js";
import { Bot } from "./bot.js";

const playerInput = new KeyboardInput();

const size = 3;
const games = new Array<Game>();

for (let i = 0; i < 9; ++i) {
    games.push(new Game(size));
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

    console.log(pos, offsetX, offsetY);

    ctx.translate(offsetX, offsetY);
    ctx.clearRect(0, 0, cellSize * size, cellSize * size);

    for (const card of cards) {
        ctx.fillStyle = "rgb(173,255,47)";
        ctx.fillRect(
            (card.x + 0.1) * cellSize,
            (card.y + 0.1) * cellSize,
            0.8 * cellSize,
            0.8 * cellSize);

        ctx.fillStyle = "rgb(0,0,0)";
        ctx.fillText(
            card.val.toString(),
            (card.x + 0.5) * cellSize,
            (card.y + 0.5) * cellSize,
            0.8 * cellSize);
    }

    ctx.restore();
}

function renderHud(game: { score: number, next: number }) {
    document.getElementById("score")!.innerText = game.score.toString();
    document.getElementById("next")!.innerText = game.next.toString();    
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
