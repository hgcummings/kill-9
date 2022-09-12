declare const io:any

import { Direction, Game } from "./game";
import { ArenaView } from "./graphics";
import { KeyboardInput } from "./input";

const games = new Array<Game>();

window.addEventListener("load", () => {
    const socket = io({ upgrade: false, transports: ["websocket"] });

    let ownId: number;
    let kills: number;

    let view: ArenaView;
    
    function startGame(id: number, seed: number[]) {
        ownId = id;
        kills = 0;
    
        for (let i = 0; i < 9; ++i) {
            games.push(new Game(seed));
        }

        view = new ArenaView(games.map(game => game.size));
        const playerInput = new KeyboardInput();

        playerInput.start(dir => {
            const game = games[ownId];
            if (game.alive) {
                game.update(dir);
                socket.emit("move", dir);
                while (game.garbageOut > 0) {
                    game.garbageOut--;
                    socket.emit("sendGarbage");
                }
                if (!game.alive) {
                    socket.emit("death");
                }
            } else {
                playerInput.stop();
            }
        });
    }

    function scoreKill() {
        kills++;
    }

    function notifyGarbage(target:number, value: number) {
        games[target].garbageIn.push(value);
        if (target === ownId) {
            socket.emit("ackGarbage", value);
        }
    }
    
    function updateOpponent(opponentId: number, direction: Direction) {
        games[opponentId].update(direction);
    }

    socket.on("startGame", startGame);
    socket.on("scoreKill", scoreKill);
    socket.on("notifyGarbage", notifyGarbage);
    socket.on("updateOpponent", updateOpponent)

    function render() {
        games.forEach((game, i) => {
            if (game.alive) {
                view.renderCards(game.cards, game.size, i, ownId);
            }
        });
        view.renderHud(kills, games[ownId].score);
        window.requestAnimationFrame(render);
    }
    
    window.requestAnimationFrame(render);
});
