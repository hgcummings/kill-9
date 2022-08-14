export type Direction = [0,-1] | [1,0] | [0,1] | [-1,0]

export class Card {
    x: number
    y: number
    val: number
    target?: { x: number, y: number }
}

export class Game {
    cards = Array<Card>()
    size: number

    constructor(size: number) {
        this.size = size;
        while (this.cards.length < size) {
            const x = Math.floor(Math.random() * size);
            const y = Math.floor(Math.random() * size);

            if (this.cardAt(x, y)) {
                continue;
            }

            const card = new Card();
            card.x = x;
            card.y = y;
            card.val = 1 + Math.floor(Math.random() * 1.5);

            this.cards.push(card);
        }
    }

    cardAt(x: number, y: number) {
        return this.cards.find(c => c.x === x && c.y === y);
    }

    canMerge(a: number, b: number) {
        return a !== b && (a % b === 0 || b % a === 0);
    }

    update(direction: Direction) {
        const dir_1dim = direction[0] === 0 ? direction[1] : direction[0];
        const dir_axis = direction[0] === 0 ? 1 : 0;
        const start = dir_1dim === 1 ? this.size - 2 : 1;

        let cardsMove = false;

        for (let line = start; line >= 0 && line < this.size; line -= dir_1dim) {
            for (let slot = 0; slot < this.size; ++slot) {
                let x: number, y: number;
                if (dir_axis === 0) {
                    x = line;
                    y = slot;
                } else {
                    x = slot;
                    y = line;
                }

                let card = this.cardAt(x, y);
                if (!card) {
                    continue;
                }

                let target = {
                    x: x + direction[0],
                    y: y + direction[1]
                };

                const targetCard = this.cardAt(target.x, target.y);
                if (!targetCard || targetCard.target || this.canMerge(card.val, targetCard.val)) {
                    card.target = target;
                    cardsMove = true;
                }
            }
        }

        for (const card of this.cards) {
            if (card.target) {
                const targetCard = this.cardAt(card.target.x, card.target.y);
                if (targetCard) {
                    targetCard.val += card.val;
                    card.val = -1;
                } else {
                    card.x = card.target.x;
                    card.y = card.target.y;
                }
                delete card.target;
            }
        }

        this.cards = this.cards.filter(card => card.val > 0);
    }
}