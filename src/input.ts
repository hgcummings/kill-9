import { Direction } from "./game";

interface Input {
    start(callback: (dir: Direction) => void): void
    stop(): void
}

export class KeyboardInput implements Input {
    listener? : (event : KeyboardEvent) => void

    createListener(callback) {
        return (event: KeyboardEvent) => {
            switch (event.key) {
                case "ArrowUp":
                    callback([0,-1]);
                    break;
                case "ArrowRight":
                    callback([1,0]);
                    break;
                case "ArrowDown":
                    callback([0,1]);
                    break;
                case "ArrowLeft":
                    callback([-1, 0]);
                    break;
                default:
                    break;
            }
        }
    }

    start(callback: (dir: Direction) => void): void {
        this.listener = this.createListener(callback)
        window.addEventListener("keydown", this.listener )
    }

    stop(): void {
        if (this.listener) {
            window.removeEventListener("keydown", this.listener)
            delete this.listener;
        }
    }    
}