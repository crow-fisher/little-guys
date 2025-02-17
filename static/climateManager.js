import { Midwest } from "./climates/midwest.js";


var climate_midwest = new Midwest();

var all_climates = [climate_midwest]

var active_climate = climate_midwest;

export function getActiveClimate() {
    return active_climate;
}