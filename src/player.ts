import { Direction, Game } from "./game";
import { chooseNextMove } from "./bot";

export interface ParentBattle {
    ackGarbage(id: number, value: any);
    notifyMove(id: number, direction: Direction);
    hasViewingPlayers();
    removePlayer(player: Player);
}

export interface Player {
	scoreKill();
	isAlive(): boolean;
    isViewing(): boolean;
    notifyGarbage(id: number, value: number);
    updatePlayerCount(count: number);
	startGame(id: number, seed: number[]);
	updateOpponent(opponentId: number, direction: Direction);
    lastAttacker?: Player;
    getGarbageOut(): number;
    decrementGarbageOut(): void;
}

const botMinTurn = 500;
const botMaxTurn = 1000;

export class BotPlayer implements Player {
    viewing = false;
    // TODO: Make different bot players faster/slower or otherwise better/worse than others
    game: Game;
    lastAttacker?: Player;
    parent: ParentBattle;
    id: number;

    constructor(parent: ParentBattle) {
        this.parent = parent;
    }

    makeMove() {
        if (this.game.alive && this.parent.hasViewingPlayers) {
            const move = chooseNextMove(this.game);
            this.game.update(move);
            this.parent.notifyMove(this.id, move);
            setTimeout(() => this.makeMove(), botMinTurn + (botMaxTurn - botMinTurn) * Math.random());
        } else {
            if (this.lastAttacker) {
                this.lastAttacker.scoreKill();
            }
        }
    }

    startGame(id:number, seed: number[]) {
        this.game = new Game(seed);
        this.id = id;
        setTimeout(() => this.makeMove(), botMinTurn + (botMaxTurn - botMinTurn) * Math.random());
    }
    notifyGarbage(id:number, value: number) {
        if (id === this.id) {
            this.game.garbageIn.push(value);
            this.parent.ackGarbage(this.id, value);
        }
    }

    isAlive(): boolean {
        return this.game.alive;
    }

    getGarbageOut(): number {
        return this.game.garbageOut;
    }

    decrementGarbageOut() {
        this.game.garbageOut--;
    }
    
    isViewing(): boolean {
        return this.viewing;
    }

    updatePlayerCount(count: number) {
        // No-op (don't display player count)
    }
    updateOpponent(opponentId: number, direction: Direction) {
        // No-op (don't react to other players moving)
    }
    scoreKill() {
        // No-op (not tracking kills)
    }
}

