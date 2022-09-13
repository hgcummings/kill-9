import { Card, Game } from "./game";

function grpIdx(idx: number, size: number) {
    return Math.floor(idx / size);
}

function tween(from:number, to:number, portion:number) {
    return from + ((to - from) * portion);
}

const MOVE_ANIM_MS = 250;

export class ArenaView {
    private canvas?: HTMLCanvasElement;

    renderBackground(playerCount: number) {
        if (!this.canvas) {
            let gameElem = document.getElementById("game");
            if (gameElem === null) {
                return;
            }
            this.canvas = document.createElement("canvas");
            this.canvas.width = window.innerWidth;
            this.canvas.height = playerCount === 1 ?
                Math.round(window.innerWidth / 4) : Math.round(window.innerWidth * 3 / 8);
            gameElem.appendChild(this.canvas);
        }
        
        const ctx = this.canvas.getContext("2d")!;
        ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    renderCards(game: Game, id: number, ownId: number) {
        if (!this.canvas) {
            return;
        }

        const pos = id === ownId ? 0 : (id === 0 ? ownId : id);
        const { size } = game;
    
        const cellSize = pos === 0 ? this.canvas.width / 12 : this.canvas.width / 16;
        const ctx = this.canvas.getContext("2d")!;
        ctx.save();
    
        const offsetX = pos === 0
            ? this.canvas.width * 3 / 8
            : this.canvas.width * ((grpIdx(pos - 1, 2) * 3 / 16) + (grpIdx(pos - 1, 4) / 4));
        const offsetY = (pos === 0 || pos % 2 === 1) ? 0 : this.canvas.height / 2;
    
        ctx.translate(offsetX, offsetY);
        
        ctx.fillStyle = "rgb(173,255,47)";
        ctx.strokeStyle = "rgb(173,255,47)";
        ctx.shadowColor = "rgba(173,255,47,0.5)";

        if (!game.alive) {
            ctx.strokeStyle = "rgba(255,47,47,0.25)";
            ctx.shadowColor = "rgba(255,47,47,0.5)";
        }

        ctx.shadowBlur = 3;
        ctx.strokeRect(
            cellSize / 12,
            cellSize / 12,
            cellSize * size - cellSize / 6,
            cellSize * size - cellSize / 6
        );
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(173,255,47,0.25)";
    
        for (let x = 0; x < game.size; ++x) {
            for (let y = 0; y < game.size; ++y) {
                let card = game.cards.find(c => c.x === x && c.y === y);
                const margin = (1 - game.size) / 2;
                if (card) {
                    renderCard(card, game.cardHistory.get(card), cellSize, margin, ctx);
                } else {
                    card = game.doneCards.find(c => c.x === x && c.y === y);
                    if (card) {
                        const now = Date.now();
                        if (now < card.since + MOVE_ANIM_MS) {
                            renderCard(card, game.cardHistory.get(card), cellSize, margin, ctx);
                        } else if (now < card.since + (2 * MOVE_ANIM_MS)) {
                            const scaleRatio = tween(1, 9, (now - card.since - MOVE_ANIM_MS) / MOVE_ANIM_MS);
                            renderCard(card, game.cardHistory.get(card), cellSize, margin, ctx, scaleRatio);
                        }
                    }
                }


            }
        }
    
        ctx.restore();
    }

    renderHud(kills: number, score: number) {
        document.getElementById("kills")!.innerText = kills.toString();
        document.getElementById("score")!.innerText = score.toString();
    }
}
    
function renderCard(card: Card, history: Array<Card>, cellSize: number, margin:number, ctx: CanvasRenderingContext2D, scaleRatio = 1) {
    const dt = Date.now() - card.since;
    const startPoints = new Array<{ x: number; y: number; }>();

    if (dt < MOVE_ANIM_MS && history?.length) {
        let j = 0;
        for (const prevCard of history) {
            for (let k = 0; k < prevCard.val; ++k) {
                const startPoint = particlePosition(dt, j, card.val, cellSize);
                startPoint.x += cellSize * (prevCard.x - card.x);
                startPoint.y += cellSize * (prevCard.y - card.y);
                startPoints.push(startPoint);
                j += 1;
            }
        }
    }

    ctx.save();

    if (card.val === 8 || card.val > 9) {
        ctx.fillStyle = "rgb(255,47,47)";
        ctx.strokeStyle = "rgba(255,47,47,0.25)";
    } else if (card.val === 9) {
        ctx.fillStyle = "rgb(255,173,47)";
        ctx.strokeStyle = "rgba(255,173,47,0.25)";
    }

    ctx.translate(
        cellSize * (card.x + 0.5 - (card.x + margin) / 6),
        cellSize * (card.y + 0.5 - (card.y + margin) / 6)
    );
    const path = (card.val > 1 && scaleRatio === 1) ? new Path2D() : null;
    for (let j = 0; j < card.val; ++j) {
        let { x, y } = particlePosition(dt, j, card.val, cellSize, scaleRatio);

        if (path && startPoints.length < card.val) {
            if (j === 0) {
                path.moveTo(x, y);
            } else {
                path.lineTo(x, y);
            }
        }

        if (startPoints.length > j) {
            x = tween(startPoints[j].x, x, dt / MOVE_ANIM_MS);
            y = tween(startPoints[j].y, y, dt / MOVE_ANIM_MS);
        }

        if (path && startPoints.length === card.val) {
            if (j === 0) {
                path.moveTo(x, y);
            } else {
                path.lineTo(x, y);
            }
        }

        const particleSize = cellSize / 32;
        ctx.fillRect(x - particleSize / 2, y - particleSize / 2, particleSize, particleSize);
    }
    if (path) {
        path.closePath();
        ctx.stroke(path);
    }
    ctx.restore();
}

function particlePosition(dt: number, idx: number, count: number, cellSize: number, scaleRatio = 1) {
    const angle = 2 * Math.PI * ((dt / 2000) + (idx / count));
    const radius = scaleRatio * cellSize / 3;
    let x = Math.sin(-angle) * radius;
    let y = Math.cos(-angle) * radius;
    return { x, y };
}
