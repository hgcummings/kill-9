declare const io:any

import { Direction, Game } from "./game";
import { ArenaView, SpinnerView } from "./graphics";
import { KeyboardInput } from "./input";

const games = new Array<Game>();

window.addEventListener("load", () => {
    const socket = io({ upgrade: false, transports: ["websocket"] });

    let ownId: number;
    let kills: number;

    let arena: ArenaView;
    let playerCount = 1;

    const spinner = new SpinnerView();
    
    function updatePlayerCount(count: number) {
        playerCount = count;
    }

    function startGame(id: number, seed: number[]) {
        document.getElementById("wait").remove();

        ownId = id;
        kills = 0;
    
        for (let i = 0; i < 9; ++i) {
            games.push(new Game(seed));
        }

        arena = new ArenaView();
        document.getElementById("hud").style.display = "block";
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

    socket.on("updatePlayerCount", updatePlayerCount);
    socket.on("startGame", startGame);
    socket.on("scoreKill", scoreKill);
    socket.on("notifyGarbage", notifyGarbage);
    socket.on("updateOpponent", updateOpponent)

    function render() {
        if (arena && games.length) {
            arena.renderBackground(games.length);
            games.forEach((game, id) => {
                arena.renderCards(game, id, ownId);
            });
            arena.renderHud(kills, games[ownId].score);
        } else {
            spinner.render(playerCount);
        }

        window.requestAnimationFrame(render);
    }
    
    window.requestAnimationFrame(render);
});
