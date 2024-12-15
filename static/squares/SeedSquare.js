
class SeedSquare extends BaseSquare {
    constructor(posX, posY) {
        super(posX, posY);
        this.proto = "SeedSquare";
        this.colorBase = "#709775";
        this.nutrientValue = d_sq_nutrientValue;
        this.rootable = true;
        this.organic = true;
    }
    physics() {
        super.physics();

        getSquares(this.posX, this.posY + 1)
            .filter((sq) => sq.rootable)
            .forEach((sqBelow) => {
                var organismsBelow = getOrganismsAtSquare(sqBelow.posX, sqBelow.posY) ;
                if (organismsBelow.length == 0) {
                    getOrganismsAtSquare(this.posX, this.posY).forEach((org) => {
                        removeOrganism(org);
                        org.posY += 1;
                        org.associatedSquares.forEach((sq) => sq.posY += 1);
                        getObjectArrFromMap(ALL_ORGANISMS, org.posX, org.posY).push(org);
                    });
                }
                removeSquare(this);
            })
    }
}

export {SeedSquare}