import { BaseSquare } from "./squares/BaseSqaure.js";
import { PlantSquare } from "./squares/PlantSquare.js";
import { WaterSquare } from "./squares/WaterSquare.js";
import { BaseLifeSquare } from "./lifeSquares/BaseLifeSquare.js";
import { BaseOrganism } from "./organisms/BaseOrganism.js";
import { SeedLifeSquare } from "./lifeSquares/SeedLifeSquare.js";
import { SeedSquare } from "./squares/SeedSquare.js";
import { AquiferSquare } from "./squares/parameterized/RainSquare.js";
import { SoilSquare } from "./squares/parameterized/SoilSquare.js";
import { RockSquare } from "./squares/parameterized/RockSquare.js";
import { WheatGreenSquare } from "./lifeSquares/grasses/WheatGreenSquare.js";
import { RootLifeSquare } from "./lifeSquares/RootLifeSquare.js";
import { WheatOrganism, WheatSeedOrganism } from "./organisms/grasses/WheatOrganism.js";
import { KentuckyBluegrassGreenSquare } from "./lifeSquares/grasses/KentuckyBluegrassGreenSquare.js";
import { KentuckyBluegrassOrganism, KentuckyBluegrassSeedOrganism } from "./organisms/grasses/KentuckyBluegrassOrganism.js";
import { PalmTreeOrganism, PalmTreeSeedOrganism } from "./organisms/trees/PalmTreeOrganism.js";
import { CattailOrganism, CattailSeedOrganism } from "./organisms/grasses/CattailOrganism.js";
import { CattailGreenSquare } from "./lifeSquares/grasses/CattailGreenSquare.js";
import { PalmTreeGreenSquare } from "./lifeSquares/trees/PalmTreeGreenSquare.js";
import { ConeflowerOrganism, ConeflowerSeedOrganism } from "./organisms/flowers/ConeflowerOrganism.js";
import { ConeflowerGreenSqaure } from "./lifeSquares/flowers/ConeflowerGreenSqaure.js";
import { PleurocarpMossGreenSquare } from "./lifeSquares/mosses/PleurocarpMossGreenSquare.js";
import { PleurocarpMossOrganism } from "./organisms/mosses/PleurocarpMossOrganism.js";
import { BackgroundImageSquare, ImageSquare, RigidImageSquare, StaticImageSquare } from "./squares/ImageSquare.js";
import { MagnoliaTreeOrganism, MagnoliaTreeOrganismSeedOrganism } from "./organisms/trees/deciduous/MagnoliaTreeOrganism.js";
import { MagnoliaTreeOrganismGreenSquare } from "./lifeSquares/trees/deciduous/MagnoliaTreeGreenSquare.js";

let ProtoMap = {
    "BaseSquare": BaseSquare.prototype,
    "PlantSquare": PlantSquare.prototype,
    "SoilSquare": SoilSquare.prototype,
    "RockSquare": RockSquare.prototype,
    "SoilSquare": SoilSquare.prototype,
    "WaterSquare": WaterSquare.prototype, 
    "AquiferSquare": AquiferSquare.prototype,

    "ImageSquare": ImageSquare.prototype,
    "StaticImageSquare": StaticImageSquare.prototype,
    "BackgroundImageSquare": BackgroundImageSquare.prototype,
    "RigidImageSquare": RigidImageSquare.prototype,

    "BaseOrganism": BaseOrganism.prototype,
    "WheatOrganism": WheatOrganism.prototype,
    "PalmTreeOrganism": PalmTreeOrganism.prototype,
    "KentuckyBluegrassOrganism": KentuckyBluegrassOrganism.prototype,
    "CattailOrganism": CattailOrganism.prototype,
    "ConeflowerOrganism": ConeflowerOrganism.prototype,
    "PleurocarpMossOrganism": PleurocarpMossOrganism.prototype,
    "MagnoliaTreeOrganism": MagnoliaTreeOrganism.prototype,

    "BaseLifeSquare": BaseLifeSquare.prototype,
    "WheatGreenSquare": WheatGreenSquare.prototype,
    "PalmTreeGreenSquare": PalmTreeGreenSquare.prototype,
    "KentuckyBluegrassGreenSquare": KentuckyBluegrassGreenSquare.prototype,
    "CattailGreenSquare": CattailGreenSquare.prototype,
    "ConeflowerGreenSqaure": ConeflowerGreenSqaure.prototype,
    "RootLifeSquare": RootLifeSquare.prototype,
    "PleurocarpMossGreenSquare": PleurocarpMossGreenSquare.prototype,
    "MagnoliaTreeOrganismGreenSquare": MagnoliaTreeOrganismGreenSquare.prototype,

    "SeedSquare": SeedSquare.prototype,
    "SeedLifeSquare": SeedLifeSquare.prototype,
    "WheatSeedOrganism": WheatSeedOrganism.prototype,
    "PalmTreeSeedOrganism": PalmTreeSeedOrganism.prototype,
    "KentuckyBluegrassSeedOrganism": KentuckyBluegrassSeedOrganism.prototype,
    "CattailSeedOrganism": CattailSeedOrganism.prototype,
    "ConeflowerSeedOrganism": ConeflowerSeedOrganism.prototype,
    "MagnoliaTreeOrganismSeedOrganism": MagnoliaTreeOrganismSeedOrganism.prototype
}

let TypeMap = {
    [RootLifeSquare.name]: RootLifeSquare,
    [WheatGreenSquare.name] : WheatGreenSquare,
    [PalmTreeGreenSquare.name]: PalmTreeGreenSquare,
    [KentuckyBluegrassGreenSquare.name]: KentuckyBluegrassGreenSquare,
    [CattailGreenSquare.name]: CattailGreenSquare,
    [ConeflowerGreenSqaure.name]: ConeflowerGreenSqaure,
    [PleurocarpMossGreenSquare.name]: PleurocarpMossGreenSquare,
    [MagnoliaTreeOrganismGreenSquare.name]: MagnoliaTreeOrganismGreenSquare
}

let TypeNameMap = {
    RootLifeSquare: RootLifeSquare.name,
    WheatGreenSquare: WheatGreenSquare.name,
    PalmTreeGreenSquare: PalmTreeGreenSquare.name,
    KentuckyBluegrassGreenSquare: KentuckyBluegrassGreenSquare.name,
    CattailGreenSquare: CattailGreenSquare.name,
    ConeflowerGreenSqaure: ConeflowerGreenSqaure.name,
    PleurocarpMossGreenSquare: PleurocarpMossGreenSquare.name,
    MagnoliaTreeOrganismGreenSquare: MagnoliaTreeOrganismGreenSquare.name
}

export { ProtoMap, TypeMap, TypeNameMap}