export type Direction = [0,-1] | [1,0] | [0,1] | [-1,0]

const WIN_VAL = 9;

export class Card {
    x: number
    y: number
    val: number
    target?: { x: number, y: number }

    valid() {
        return this.val > 0 && this.val < WIN_VAL;
    }
}

export class Game {
    cards = Array<Card>()
    size: number
    score = 0

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
            card.val = this.nextValue();

            this.cards.push(card);
        }
    }

    // TODO: Preview next card
    // TODO: Consistently shuffled bag
    // TODO: Allow 3s/4s to appear?
    nextValue() {
        return 1 + Math.floor(Math.random() * 2);
    }

    cardAt(x: number, y: number) {
        return this.cards.find(c => c.x === x && c.y === y);
    }

    canMerge(a: number, b: number) {
        return a === 2 * b || a === 3 * b ||
               b === 2 * a || b === 3 * a;
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

        if (cardsMove) {
            for (const card of this.cards) {
                if (card.target) {
                    const targetCard = this.cardAt(card.target.x, card.target.y);
                    if (targetCard && targetCard.valid()) {
                        console.log(`Merged ${card.val} into ${targetCard.val} to get ${card.val + targetCard.val}`)
                        targetCard.val += card.val;

                        if (targetCard.val === WIN_VAL) {
                            this.score += targetCard.val;
                        }

                        card.val = -1;
                    } else {
                        card.x = card.target.x;
                        card.y = card.target.y;
                    }
                    delete card.target;
                }
            }            

            this.cards = this.cards.filter(card => card.valid());

            let newLocation = [-1,-1];
            do {
                for (let dim = 0; dim < 2; ++dim) {
                    switch (direction[dim]) {
                        case -1:
                            newLocation[dim] = this.size - 1;
                            break;
                        case 0:
                            newLocation[dim] = Math.floor(Math.random() * this.size);
                            break;
                        case 1:
                            newLocation[dim] = 0;
                            break;
                    }
                }
            } while (this.cardAt(newLocation[0], newLocation[1]));

            const newCard = new Card();
            newCard.x = newLocation[0];
            newCard.y = newLocation[1];
            newCard.val = this.nextValue();

            this.cards.push(newCard);
        }
    }
}