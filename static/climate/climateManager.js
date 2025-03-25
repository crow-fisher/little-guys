import { loadGD, UI_CLIMATE_DESERT, UI_CLIMATE_FANTASY, UI_CLIMATE_MIDWEST, UI_CLIMATE_SELECT } from "../ui/UIData.js";
import { Desert } from "./climates/desert.js";
import { Fantasy } from "./climates/fantasy.js";
import { Midwest } from "./climates/midwest.js"

let climate_midwest = new Midwest();
let climate_desert = new Desert();
let climate_fantasy = new Fantasy();

let all_climates = new Map();

all_climates.set(UI_CLIMATE_MIDWEST, climate_midwest);
all_climates.set(UI_CLIMATE_DESERT, climate_desert);
all_climates.set(UI_CLIMATE_FANTASY, climate_fantasy);

export function getActiveClimate() {
    return all_climates.get(loadGD(UI_CLIMATE_SELECT));
}