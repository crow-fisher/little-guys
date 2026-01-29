export class Constellation {
    constructor(data) {
        let row = data.split(" ");
        this.name = row[0];
        this.numbers = Array.from(row.slice(1).map((x) => parseInt(x)));
        this.length = this.numbers[0];
        this.segments = new Array(this.length);

        this.uniqueStars = new Set(this.numbers.slice(1));

        for (let i = 0; i < this.length; i++) {
            let startIdx = 1 + (i * 2);
            let endIdx = startIdx + 1;
            this.segments[i] = [parseInt(this.numbers[startIdx]), parseInt(this.numbers[endIdx])];
        }
    }
}