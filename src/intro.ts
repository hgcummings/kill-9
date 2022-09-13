import { Game } from "./game";
import { ArenaView } from "./graphics";
import { KeyboardInput } from "./input";
import { seedFromSystemRandom } from "./rng";

const game = new Game(seedFromSystemRandom());

const view = new ArenaView();
const playerInput = new KeyboardInput();

function defaultNextPrompt() {
    if (!game.alive) {
        return "death";
    } else if (game.doneCards.some(c => c.val === 9)) {
        return "nines";
    } else if (game.cards.some(c => c.val === 8)) {
        return "eights";
    } else {
        return "merging";
    }
}

const prompts = {
    intro: {
        next: () => "movement",
        text: "This is a CPU core. Your aim is to keep it running and disable enemy cores.\n\nYou can do this by managing the processes on your core.\n\nTry pressing one of the arrow keys to re-arrange the processes on the core."
    },
    movement: {
        next: () => game.cards.some(card => card.val > 2) ? "merging" : "movement",
        text: "Each time you move processes a new one appears.\n\nYour core only has capacity for up to nine processes. But you can merge them.\n\nThese processes all have one or two threads.\nTry merging a one-thread process into a two-thread process..."
    },
    merging: {
        next: defaultNextPrompt,
        text: "You can merge a process into another process that has exactly 2 or 3 times the number of threads\n(1 goes into 2 or 3, 2 goes into 4 or 6, etc.).\n\nYou can have up to nine threads running in a single process. Can you make that happen?"
    },
    eights: {
        next: defaultNextPrompt,
        text: "Uh oh! You have a process with eight threads. Can you clear it?\n\nThe only way to clear this process is to overload it with more than nine threads, causing it to crash.\n\n(Remember: processes can merge if one of them has exactly 2 or 3 times the threads of the other.)"
    },
    nines: {
        next: defaultNextPrompt,
        text: "Congratulations! You got nine threads running in one process!\n\nThis will allow the process to calculate an attack vector for an enemy core,\nafter which the process will complete, freeing up more space on your own core."
    },
    death: {
        next: defaultNextPrompt,
        text: "Oh no! You ran out of space on your core."
    }
};

let prompt = prompts["intro"];
let completed = false;

playerInput.start(dir => {
    if (game.alive) {
        game.update(dir);
        prompt = prompts[prompt.next()];
        if (!completed && game.doneCards.some(card => card.val === 9)) {
            completed = true;
            localStorage.setItem("kill-9-intro-completed", "true");
            document.getElementById("continue")!.style.display = "block";
        }
    } else {
        playerInput.stop();
        document.getElementById("retry")!.style.display = "block";
    }
});

function render() {
    view.renderBackground(1);
    view.renderCards(game, 0, 0);
    
    document.getElementById("info")!.innerText = prompt.text;

    window.requestAnimationFrame(render);
}

window.requestAnimationFrame(render);
