import { LightSource } from "./LightSource.js";

export class StaticLightSource extends LightSource{
    processLightConfig(lightConfig) {
        this.color = lightConfig.color;
        this.lumens = lightConfig.lumens;
    }

}