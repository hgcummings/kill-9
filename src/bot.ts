import { ALL_DIRECTIONS, Game, WIN_VAL } from "./game.js";

export function chooseNextMove(game: Game) {
    const options = ALL_DIRECTIONS.map(direction => {
        const { newCards, areChanged } = game.existingCardsAfterMove(direction);

        let score = areChanged ? 0 : -Infinity;

        for (const card of newCards) {
            if (card.val === WIN_VAL) {
                score += card.val * 2;
            } else if (card.val === 8) {
                score -= card.val * 2;
            } else if (card.val === 6) {
                score += card.val;
            }
        }

        score -= newCards.length;

        return {
            direction,
            score
        }
    });

    options.sort((a, b) => a.score - b.score);
    return options.pop()!.direction;
}
