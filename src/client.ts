import { Card, Game } from "./game.js";
import { KeyboardInput } from "./input.js";

const playerInput = new KeyboardInput();

const size = 3;
const game = new Game(size);

function render(cards: Array<Card>) {
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

render(game.cards);

playerInput.start(dir => {
    game.update(dir);
    document.getElementById("score")!.innerText = game.score.toString();
    render(game.cards);
});
