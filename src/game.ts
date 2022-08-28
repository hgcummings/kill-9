export type Direction = [0,-1] | [1,0] | [0,1] | [-1,0]
export const ALL_DIRECTIONS: Array<Direction> = [[0,-1], [1,0], [0,1], [-1,0]];
export const WIN_VAL = 9;

export class Card {
    x: number
    y: number
    val: number
    
    copy() {
        const newCard = new Card();
        newCard.x = this.x;
        newCard.y = this.y;
        newCard.val = this.val;
        return newCard;
    }

    valid() {
        return this.val > 0 && this.val < WIN_VAL;
    }
}

export class Game {
    cards = Array<Card>()
    size: number
    next: number
    iterator: Generator<number>
    score = 0
    garbageIn = new Array<number>()
    garbageOut = 0

    constructor(size: number) {
        this.size = size;
        this.iterator = this.generateNext();

        while (this.cards.length < size) {
            const x = Math.floor(Math.random() * size);
            const y = Math.floor(Math.random() * size);

            if (this.cardAt(x, y)) {
                continue;
            }

            const card = new Card();
            card.x = x;
            card.y = y;
            card.val = this.iterator.next().value;

            this.cards.push(card);
        }
        this.next = this.iterator.next().value
    }

    update(direction: Direction) {
        let { newCards, areChanged } = this.existingCardsAfterMove(direction);

        if (areChanged) {
            this.cards = newCards;
            for (const card of this.cards) {
                if (card.val === WIN_VAL) {
                    this.score += card.val;
                    this.garbageOut++;
                }
            }            

            this.cards = this.cards.filter(card => card.valid());

            const newCard = this.newCardAfterMove(direction);

            this.cards.push(newCard);
        }
    }

    existingCardsAfterMove(direction: Direction) {
        let cardsToProcess = this.cards.concat();
        let newCards = new Array<Card>();
        let areChanged = false;
        let finalPass = false;

        while(true) {
            const remainingCardsToProcess = Array<Card>();
            for (const card of cardsToProcess) {
                let newX = card.x + direction[0];
                let newY = card.y + direction[1];
    
                if (newX < 0 || newX >= this.size) {
                    newX = card.x;
                }
                if (newY < 0 || newY >= this.size) {
                    newY = card.y;
                }
    
                if (newX === card.x && newY === card.y) {
                    // Case 1: card can't move because it's against a wall
                    newCards.push(card.copy());
                } else {
                    const cardAtTarget = newCards.find(c => c.x === newX && c.y === newY);
                    if (cardAtTarget) {
                        if (this.canMerge(card.val, cardAtTarget.val)) {
                            // Case 2: card can merge into another card
                            cardAtTarget.val += card.val;
                            areChanged = true;
                        } else {
                            // Case 3: card can't move because it's against another card
                            newCards.push(card.copy());
                        }
                    } else {
                        // Case 4: card might be able to move into a space, but we can only be sure
                        // the space exists once we've finished processing all the other cases
                        if (!finalPass) {
                            remainingCardsToProcess.push(card);
                        } else {
                            const newCard = new Card();
                            newCard.x = newX;
                            newCard.y = newY;
                            newCard.val = card.val;
                            newCards.push(newCard);
                            areChanged = true;
                        }
                    }
                }
            }
            if (remainingCardsToProcess.length === 0) {
                break;
            } else if (remainingCardsToProcess.length === cardsToProcess.length) {
                finalPass = true;
            } else {
                cardsToProcess = remainingCardsToProcess;
            }
        }

        return {
            newCards,
            areChanged
        }
    }

    private *generateNext() {
        const bag = new Array<number>();

        while (true) {
            if (bag.length === 0) {
                const allItems = [1,2];
                while (allItems.length) {
                    const randomItem = allItems.splice(Math.floor(Math.random() * allItems.length), 1)[0];
                    bag.push(randomItem);
                }
            }
    
            yield bag.pop()!;
        }
    }

    private cardAt(x: number, y: number) {
        return this.cards.find(c => c.x === x && c.y === y);
    }

    private newCardAfterMove(direction: Direction) {
        let newLocation = [-1, -1];
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
        if (this.garbageIn.length) {
            newCard.val = this.garbageIn.shift()!;
        } else {
            newCard.val = this.next;
            this.next = this.iterator.next().value;
        }
        return newCard;
    }

    private canMerge(a: number, b: number) {
        return a === 2 * b || a === 3 * b ||
               b === 2 * a || b === 3 * a;
    }
}