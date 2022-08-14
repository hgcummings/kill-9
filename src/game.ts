export type Direction = [0,-1] | [1,0] | [0,1] | [-1,0]

export class Card {
    x: number
    y: number
    val: number
}

export class Game {
    cards = Array<Card>()

    constructor(size: number) {
        while (this.cards.length < size) {
            const x = Math.floor(Math.random() * size);
            const y = Math.floor(Math.random() * size);

            if (this.occupied(x, y)) {
                continue;
            }

            const card = new Card();
            card.x = x;
            card.y = y;
            card.val = 1 + Math.floor(Math.random() * 1.5);

            this.cards.push(card);
        }
    }

    occupied(x: number, y: number) {
        return this.cards.some(c => c.x === x && c.y === y);
    }
}