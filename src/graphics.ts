import { Card } from "./game.js";

function grpIdx(idx: number, size: number) {
    return Math.floor(idx / size);
}

export class ArenaView {
    private lastRenderedState = new Array<Array<{val:number, since:number}>>();
    private canvas?: HTMLCanvasElement;

    constructor(sizes: Array<number>) {
        for (const size of sizes) {
            const initState = new Array<{val:number, since:number}>();
            for (let j = 0; j < size * size; ++j) {
                initState.push({ val: 0, since: 0 });
            }
            this.lastRenderedState.push(initState);
        }
    }

    renderCards(cards: Array<Card>, size: number, id: number, ownId: number) {
        const pos = id === ownId ? 0 : (id === 0 ? ownId : id);
    
        if (!this.canvas) {
            let gameElem = document.getElementById("game");
            if (gameElem === null) {
                return;
            }
            this.canvas = document.createElement("canvas");
            this.canvas.width = window.innerWidth;
            this.canvas.height = Math.round(window.innerWidth * 3 / 8);
            gameElem.appendChild(this.canvas);
        }
    
        const cellSize = pos === 0 ? this.canvas.width / 12 : this.canvas.width / 16;
        const ctx = this.canvas.getContext("2d")!;
        ctx.save();
    
        const offsetX = pos === 0
            ? this.canvas.width * 3 / 8
            : this.canvas.width * ((grpIdx(pos - 1, 2) * 3 / 16) + (grpIdx(pos - 1, 4) / 4));
        const offsetY = (pos === 0 || pos % 2 === 1) ? 0 : this.canvas.height / 2;
    
        ctx.translate(offsetX, offsetY);
        ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
        ctx.fillRect(0, 0, cellSize * size, cellSize * size);
        
        ctx.fillStyle = "rgb(173,255,47)";
        ctx.strokeStyle = "rgb(173,255,47)";
        ctx.shadowColor = "rgba(173,255,47,0.5)";
        ctx.shadowBlur = 3;
        ctx.strokeRect(
            cellSize / 12,
            cellSize / 12,
            cellSize * size - cellSize / 6,
            cellSize * size - cellSize / 6
        );
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(173,255,47,0.25)";
    
        const renderState = this.lastRenderedState[pos];
        for (let i = 0; i < renderState.length; ++i) {
            const card = cards.find(c => c.x === i % size && c.y === Math.floor(i / size));
            if (!card) {
                renderState[i].val = 0;
            } else {
                if (card.val != renderState[i].val) {
                    renderState[i].val = card.val;
                    renderState[i].since = Date.now();
                }
    
                const dt = Date.now() - renderState[i].since;
                ctx.save();
    
                if (card.val === 8) {
                    ctx.fillStyle = "rgb(255,47,47)";
                    ctx.strokeStyle = "rgba(255,47,47,0.25)";
                }
    
                const margin = (1 - size) / 2;
                ctx.translate(
                    cellSize * (card.x + 0.5 - (card.x + margin) / 6),
                    cellSize * (card.y + 0.5 - (card.y + margin) / 6)
                );
                const path = (card.val > 1) ? new Path2D() : null;
                for (let j = 0; j < card.val; ++j) {
                    const angle = 2 * Math.PI * ((dt / 2000) + (j / card.val));
                    const radius = cellSize / 3;
                    const x = Math.sin(-angle) * radius;
                    const y = Math.cos(-angle) * radius;
                    const size = cellSize / 32;
                    ctx.fillRect(x - size / 2, y - size / 2, size, size);
    
                    if (path) {
                        if (j === 0) {
                            path.moveTo(x, y);
                        } else {
                            path.lineTo(x, y);
                        }
                    }
                }
                if (path) {
                    path.closePath();
                    ctx.stroke(path);
                }
                ctx.restore();
            }
        }
    
        ctx.restore();
    }
    
    renderHud(kills: number, score: number) {
        document.getElementById("kills")!.innerText = kills.toString();
        document.getElementById("score")!.innerText = score.toString();
    } 
}
