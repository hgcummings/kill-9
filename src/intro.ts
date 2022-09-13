import { Game } from "./game";
import { ArenaView } from "./graphics";
import { KeyboardInput } from "./input";
import { seedFromSystemRandom } from "./rng";

const game = new Game(seedFromSystemRandom());

const view = new ArenaView();
const playerInput = new KeyboardInput();

playerInput.start(dir => {
    if (game.alive) {
        game.update(dir);
    } else {
        playerInput.stop();
    }
});

function render() {
    view.renderBackground();
    view.renderCards(game, 0, 0);

    window.requestAnimationFrame(render);
}

window.requestAnimationFrame(render);
