export type Direction = [0,-1] | [1,0] | [0,1] | [-1,0]

class Game {
    grid = Array<Array<number>>()

    constructor(size = 3) {
        for (let y = 0; y < size; ++y) {
            this.grid[y] = new Array<number>();
            for (let x = 0; x < size; ++x) {
                this.grid[y][x] = 0;
            }
        }
    }
}