import { setRestingGradientStrength, setRestingHumidityGradient, setRestingTemperatureGradient } from "../temperatureHumidity.js";
import { getCurWeatherInterval } from "./weatherManager.js";

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

    weatherStringShort() {
        return this.type + ", " + convertMinutesToTimeUnit(getCurWeatherInterval(), true);
    }
    weatherStringLong() {
        return this.type + " for " + convertMinutesToTimeUnit(getCurWeatherInterval());
    }
}

export function convertMinutesToTimeUnit(minutes, short=false) {
    const days = Math.floor(minutes / 1440); // 1440 minutes in a day
    const hours = Math.floor((minutes % 1440) / 60); // 60 minutes in an hour
    const mins = minutes % 60; // remaining minutes

    if (days > 0) {
        return days + " day" + (days > 1 ? "s" : "");
    } else if (hours > 0) {
        if (short)
            return hours + " hr" + (hours > 1 ? "s" : "");
        return hours + " hour" + (hours > 1 ? "s" : "");
    } else if (mins > 0) {
        if (short)
            return mins + " min"  + (mins > 1 ? "s" : "");
        return mins + " minute" + (mins > 1 ? "s" : "");
    } else {
        if (short)
            return "0 min";

        return "0 minutes";
    }
}