import { BaseSquare } from "./squares/BaseSqaure.js";
import { PlantSquare } from "./squares/PlantSquare.js";
import { RainSquare } from "./squares/parameterized/RainSquare.js";
import { HeavyRainSquare } from "./squares/parameterized/RainSquare.js";
import { WaterSquare } from "./squares/WaterSquare.js";
import { BaseLifeSquare } from "./lifeSquares/BaseLifeSquare.js";
import { BaseOrganism } from "./organisms/BaseOrganism.js";
import { SeedLifeSquare } from "./lifeSquares/SeedLifeSquare.js";
import { SeedSquare } from "./squares/SeedSquare.js";
import { AquiferSquare } from "./squares/parameterized/RainSquare.js";
import { SoilSquare } from "./squares/parameterized/SoilSquare.js";
import { RockSquare } from "./squares/parameterized/RockSquare.js";
import { WheatGreenSquare } from "./lifeSquares/parameterized/agriculture/grasses/WheatGreenSquare.js";
import { GenericParameterizedRootSquare } from "./lifeSquares/parameterized/GenericParameterizedRootSquare.js";
import { WheatOrganism, WheatSeedOrganism } from "./organisms/parameterized/agriculture/grasses/WheatOrganism.js";
import { ElephantEarGreenSquare } from "./lifeSquares/parameterized/tropical/ElephantEarGreenSquare.js";
import { PalmTreeGreenSquare } from "./lifeSquares/parameterized/tropical/PalmTreeGreenSquare.js";
import { ElephantEarOrganism } from "./organisms/parameterized/tropical/ElephantEarOrganism.js";
import { TropicalGrassOrganism } from "./organisms/parameterized/tropical/TropicalGrassOrganism.js";
import { PalmTreeOrganism } from "./organisms/parameterized/tropical/PalmTreeOrganism.js";
import { TropicalGrassGreenSquare } from "./lifeSquares/parameterized/tropical/TropicalGrassGreenSquare.js";


var ProtoMap = {
    "BaseSquare": BaseSquare.prototype,
    "PlantSquare": PlantSquare.prototype,
    "RainSquare": RainSquare.prototype,
    "HeavyRainSquare": HeavyRainSquare.prototype,
    "SoilSquare": SoilSquare.prototype,
    "RockSquare": RockSquare.prototype,
    "SoilSquare": SoilSquare.prototype,
    "WaterSquare": WaterSquare.prototype,
    "BaseLifeSquare": BaseLifeSquare.prototype,
    "BaseOrganism": BaseOrganism.prototype,
    "SeedLifeSquare": SeedLifeSquare.prototype,
    "SeedSquare": SeedSquare.prototype,
    "AquiferSquare": AquiferSquare.prototype,
    "WheatGreenSquare": WheatGreenSquare.prototype,
    "GenericParameterizedRootSquare": GenericParameterizedRootSquare.prototype,
    "WheatOrganism": WheatOrganism.prototype,
    "WheatSeedOrganism": WheatSeedOrganism.prototype,
    "ElephantEarGreenSquare": ElephantEarGreenSquare.prototype,
    "PalmTreeGreenSquare": PalmTreeGreenSquare.prototype,
    "TropicalGrassGreenSquare": TropicalGrassGreenSquare.prototype,
    "ElephantEarOrganism": ElephantEarOrganism.prototype,
    "TropicalGrassOrganism": TropicalGrassOrganism.prototype,
    "PalmTreeOrganism": PalmTreeOrganism.prototype
    
}

var TypeMap = {
    [GenericParameterizedRootSquare.name]: GenericParameterizedRootSquare,
    [WheatGreenSquare.name] : WheatGreenSquare
}

var TypeNameMap = {
    GenericParameterizedRootSquare: GenericParameterizedRootSquare.name,
    WheatGreenSquare: WheatGreenSquare.name
}

export { ProtoMap, TypeMap, TypeNameMap}