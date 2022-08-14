import { Game } from "./game.js";
import { KeyboardInput } from "./input.js";

const playerInput = new KeyboardInput();

const size = 3;
const game = new Game(size);

function render(cells: Array<Array<number>>) {
    let playArea = document.getElementById("player-0");
    if (playArea === null) {
        return;
    }

    playArea.innerHTML = "";

    for (let x = 0; x < size; ++x) {
        for (let y = 0; y < size; ++y) {
            const value = cells[y][x];
            if (value !== 0) {
                const cell = document.createElement("div");
                cell.style.gridRow = (y + 1).toString();
                cell.style.gridColumn = (x + 1).toString();
                cell.innerText = value.toString();
                cell.classList.add("cell");
                playArea.appendChild(cell);
            } 
        }
    }
}

render(game.grid);
