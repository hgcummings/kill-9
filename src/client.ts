import { Card, Game } from "./game.js";
import { KeyboardInput } from "./input.js";

const playerInput = new KeyboardInput();

const size = 3;
const cellSize = 120;
const game = new Game(size);

const canvas = new Array<HTMLCanvasElement>();

function renderCards(cards: Array<Card>) {
    if (!canvas[0]) {
        let playArea = document.getElementById("player-0");
        if (playArea === null) {
            return;
        }
        let canvasElem = document.createElement("canvas");
        canvasElem.width = size * cellSize;
        canvasElem.height = size * cellSize;
        playArea.appendChild(canvasElem);
        canvas[0] = canvasElem;
    }

    const ctx = canvas[0].getContext("2d")!;
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
}

function renderHud(game: { score: number, next: number }) {
    document.getElementById("score")!.innerText = game.score.toString();
    document.getElementById("next")!.innerText = game.next.toString();    
}

renderCards(game.cards);
renderHud(game);

playerInput.start(dir => {
    game.update(dir);
    renderCards(game.cards);
    renderHud(game);
});
