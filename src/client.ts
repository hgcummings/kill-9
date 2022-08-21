import { Card, Game } from "./game.js";
import { KeyboardInput } from "./input.js";

const playerInput = new KeyboardInput();

const size = 3;
const game = new Game(size);

function renderCards(cards: Array<Card>) {
    let playArea = document.getElementById("player-0");
    if (playArea === null) {
        return;
    }

    playArea.innerHTML = "";

    for (const card of cards) {
        const elem = document.createElement("div");
        elem.style.gridColumn = (card.x + 1).toString();
        elem.style.gridRow = (card.y + 1).toString();
        elem.innerText = card.val.toString();
        elem.classList.add("card");
        playArea.appendChild(elem);
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
