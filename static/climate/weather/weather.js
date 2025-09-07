import { loadGD, UI_SIMULATION_CLOUDS } from "../../ui/UIData.js";
import { setRestingGradientStrength, setRestingHumidityGradient, setRestingTemperatureGradient } from "../simulation/temperatureHumidity.js";

export class Weather {
    constructor(type, hg, tg, strength, f, getCurWeatherInterval) {
        this.type = type;
        this.hg = hg;
        this.tg = tg;
        this.strength = strength;
        this.f = f;
        this.getCurWeatherInterval = getCurWeatherInterval;
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
        if (!loadGD(UI_SIMULATION_CLOUDS))
            return ""

        return this.type + ", " + convertMinutesToTimeUnit(this.getCurWeatherInterval(), true);
    }
    weatherStringLong() {
        if (!loadGD(UI_SIMULATION_CLOUDS))
            return "weather disabled"
    
        return this.type + " for " + convertMinutesToTimeUnit(this.getCurWeatherInterval());
    }
}

export function convertMinutesToTimeUnit(minutes, short = false) {
    minutes = Math.max(0, minutes);
    const totalSeconds = minutes * 60; // convert total minutes to total seconds
    const days = Math.floor(totalSeconds / 86400); // 86400 seconds in a day
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = Math.floor(totalSeconds % 60);

    if (days > 0) {
        return days + (short ? " day" : " day" + (days > 1 ? "s" : ""));
    } else if (hours > 0) {
        return hours + (short ? " hr" : " hour" + (hours > 1 ? "s" : ""));
    } else if (mins > 0) {
        return mins + (short ? " min" : " minute" + (mins > 1 ? "s" : ""));
    } else {
        return secs + (short ? " sec" : " second" + (secs !== 1 ? "s" : ""));
    }
}
