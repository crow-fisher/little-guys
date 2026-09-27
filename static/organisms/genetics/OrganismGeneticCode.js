export class OrganismGeneticCode {
    constructor(string) {
        if (string)
            this.code = JSON.parse(string)
    }
    addTag(tag) {
        this.code.append(tag);
    }

}