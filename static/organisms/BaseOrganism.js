class BaseOrganism {
    constructor(posX, posY) {
        this.proto = "BaseOrganism";
        this.posX = Math.floor(posX);
        this.posY = Math.floor(posY);
        this.associatedSquares = new Array();
        this.type = "base";
        this.law = new Law();
        this.spawnedEntityId = 0;

        this.spawnTime = Date.now();
        this.currentEnergy = 0;
        this.totalEnergy = 0;

        // life cycle properties
        this.maxLifeTime = 1000 * 40 * 1;
        this.reproductionEnergy = 100;
        this.reproductionEnergyUnit = 5;
    }

    addAssociatedSquare(lifeSquare) {
        lifeSquare.spawnedEntityId = this.spawnedEntityId;
        this.associatedSquares.push(lifeSquare);
    }

    spawnSeed() {
        var seedSquare = this.getSeedSquare();
        if (seedSquare != null) {
            seedSquare.speedX = Math.floor(randNumber(-3, 3));
            seedSquare.speedY = Math.floor(randNumber(-3, -1));
            return true;
        } else {
            return false;
        }
    }

    getSeedSquare() {
        return null; // should be a SeedSquare with a contained PlantSeedOrganism or similar
    }

    getCountOfAssociatedSquaresOfProto(proto) {
        return Array.from(this.associatedSquares.filter((org) => org.proto == proto)).length;
    }
    getCountOfAssociatedSquaresOfType(type) {
        return Array.from(this.associatedSquares.filter((org) => org.type == type)).length;
    }

    growInitialSquares() { return new Array(); }

    render() {
        this.associatedSquares.forEach((sp) => sp.render())
    }

    destroy() {
        this.associatedSquares.forEach((asq) => {
            if (asq.linkedSquare != null) {
                removeSquareAndChildren(asq.linkedSquare);
            }
            removeOrganismSquare(asq)
        });
        removeOrganism(this);
    }

    process() {
        this.tick();
        this.postTick();
    }

    tick() {
        this.associatedSquares.forEach((sp) => sp.tick())
    }

    postTick() { }
}

export {BaseOrganism}