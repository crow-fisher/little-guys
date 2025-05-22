import { hexToRgb } from "../common.js";
import { BaseLifeSquare } from "./BaseLifeSquare.js";

export class GenericRootSquare extends BaseLifeSquare {
    constructor(square, organism) {
        super(square, organism);
        this.proto = "GenericRootSquare";
        this.type = "root";
        this.opacity = this.linkedOrganism.rootOpacity;
        
        this.baseColor = "#6b6254";
        this.darkColor = "#615a48";
        this.accentColor = "#5c5648";

        this.baseColor_rgb = hexToRgb(this.baseColor); 
        this.darkColor_rgb = hexToRgb(this.darkColor); 
        this.accentColor_rgb = hexToRgb(this.accentColor); 
    }
}