import { Socket } from "socket.io";
import { Direction } from "./game";
import { seedFromSystemRandom } from "./rng";
import { BotPlayer, ParentBattle, Player } from "./player";

declare const storage: {
    get(key:string, defaultValue:any, json?:boolean): Promise<any>
    set(key:string, value:any, json?:boolean): Promise<boolean>
}

const users = Array<UserPlayer>();

function removeUser(user) {
    users.splice(users.indexOf(user), 1);
}

class UserPlayer implements Player {
    viewing = true;
    socket: Socket
    alive: boolean;
    parent: ParentBattle;
    id: number;
    garbageOut: number;

    constructor(socket: any, parent: ParentBattle) {
        this.parent = parent;
        this.socket = socket;
        this.alive = true;
        this.garbageOut = 0;

        socket.on("move", (direction: Direction) => {
            parent.notifyMove(this.id, direction);
        });

        socket.on("sendGarbage", () => {
            this.garbageOut++;
        });

        socket.on("ackGarbage", (value) => {
            parent.ackGarbage(this.id, value);
        });

        socket.on("death", () => {
            this.alive = false;
            if (this.lastAttacker) {
                this.lastAttacker.scoreKill();
            }
        });
    }
    isAlive(): boolean {
        return this.alive;
    }
    isViewing(): boolean {
        return this.viewing;
    }
    getGarbageOut(): number {
        return this.garbageOut;
    }
    decrementGarbageOut(): void {
        this.garbageOut--;
    }
    scoreKill() {
        this.socket.emit("scoreKill");
    }

    notifyGarbage(target: number, value: number) {
        this.socket.emit("notifyGarbage", target, value);
    }

    startGame(id: number, seed: number[]) {		
        this.socket.emit("startGame", id, seed);
        this.id = id;
    }

    updateOpponent(opponentId: number, direction: Direction) {
        this.socket.emit("updateOpponent", opponentId, direction);
    }

    lastAttacker?: Player;
    kills: number;
}

/**
 * Socket.IO on connect event
 * @param {Socket} socket
 */
global.module.exports = {
    io: (socket) => {
        //TODO: actual matchmaking
        const battle = new Battle();

        const user = new UserPlayer(socket, battle);
        users.push(user);

        battle.addPlayer(user);
        for (let i = 0; i < 8; ++i) {
            battle.addPlayer(new BotPlayer(battle));
        }

        battle.start();

        socket.on("disconnect", () => {
            console.log("Disconnected: " + socket.id);
            removeUser(user);
            user.viewing = false;
        });

        console.log("Connected: " + socket.id);
    }
};

class Battle implements ParentBattle {
    private players = new Array<Player>();

    start() {
        const seed = seedFromSystemRandom();
        for (let id = 0; id < this.players.length; ++id) {
            this.players[id].startGame(id, seed);
        }
    }

    addPlayer(player: Player) {
        this.players.push(player);
    }

    notifyMove(sourceId: number, direction: Direction) {
        for (let playerId = 0; playerId < this.players.length; ++playerId) {
            if (playerId !== sourceId) {
                this.players[playerId].updateOpponent(sourceId, direction);
                this.distributeGarbage(sourceId);
            }
        }
    }

    hasViewingPlayers() {
        return this.players.some(p => p.isViewing);
    }

    distributeGarbage(attacker: number) {
        while (this.players[attacker].getGarbageOut() > 0) {
            this.players[attacker].decrementGarbageOut();
    
            let target = attacker;
            while (target === attacker || !this.players[target].isAlive) {
                target = Math.floor(Math.random() * this.players.length);
            }

            this.players[target].notifyGarbage(target, 8);
            this.players[target].notifyGarbage(target, 1);
            this.players[target].lastAttacker = this.players[attacker];
        }
    }

    ackGarbage(target: number, value: any) {
        for (let i = 0; i < this.players.length; ++i) {
            if (i !== target) {
                this.players[i].notifyGarbage(target, value);
            }
        }
    }
}
