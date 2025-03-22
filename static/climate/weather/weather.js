import { setRestingGradientStrength, setRestingHumidityGradient, setRestingTemperatureGradient } from "../temperatureHumidity.js";

export class Weather {
    constructor(type, hg, tg, strength, f) {
        this.type = type;
        this.hg = hg;
        this.tg = tg;
        this.strength = strength;
        this.f = f;
    }
    weather() {
        this.setRestingValues();
        this.f();
    }

    setRestingValues() {
        setRestingHumidityGradient(this.hg);
        setRestingTemperatureGradient(this.tg);
        setRestingGradientStrength(this.strength);
    }
}