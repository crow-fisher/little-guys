import { getBaseSize, zoomCanvasFillCircleRelPos } from "../../canvas.js";
import { invlerp, lerp, randRange } from "../../common.js";
import { MAIN_CONTEXT } from "../../index.js";
import { loadGD, UI_STARMAP_ASC, UI_STARMAP_DEC } from "../../ui/UIData.js";
import { tempToRgbaForStar } from "../time.js";

export class StarHandler {
    constructor() {
        this.initalizeData();
    }

    initalizeData() {
        this.data = new Array();
        this.dataAsc = new Map();
        this.dataDec = new Map();

        fetch("./static/climate/stars/lib/bsc/catalog.txt").then((resp) => resp.text())
            .then((text) => this.loadData(text))
    }

    loadData(data) {
        let rows = data.split("\n");
        for (let i = 0; i < rows.length; i++) {
            this.loadRow(rows.at(i));
        }
    }

    loadRow(row) {
        // for equinox J2000, epoch 2000.0

        // right ascension - goes from 0 to 24 hours 
        // declination - goes from -90 to 90 degrees    

        let raHours = Number.parseFloat(row.substr(75, 2));
        let raMinutes = Number.parseFloat(row.substr(77, 2));
        let raSeconds = Number.parseFloat(row.substr(79, 3));
        let signDec = row.substr(83, 1);
        let degressDec = Number.parseFloat(row.substr(84, 2));
        let minutesDec = Number.parseFloat(row.substr(86, 2));
        let secondsDec = Number.parseFloat(row.substr(88, 2));
        let brightness = Number.parseFloat(row.substr(104, 4));
        let bv = Number.parseFloat(row.substr(110, 4));

        if (isNaN(bv))
            return;

        let netRa = raHours + raMinutes / 60 + raSeconds / 3600;
        let netDec = (signDec == "+" ? 1 : -1) * degressDec + minutesDec / 60 + secondsDec / 3600;
        let temperature = this.calculateStarTemperature(bv);
        let middleSqueeze = 4000;
        let factor = 200;

        // temperature = (temperature + (middleSqueeze * factor - 1)) / factor;;
        let hex = tempToRgbaForStar(temperature);
        if (isNaN(netRa) || isNaN(netDec) || isNaN(brightness)) {
            return;
        }

        // console.log(
        //     "\nId: ", row.substr(0, 4),
        //     "\nraHours: ", raHours,
        //     "\nraMinutes: ", raMinutes,
        //     "\nraSeconds: ", raSeconds,
        //     "\nsignDec: ", signDec,
        //     "\ndegressDec: ", degressDec,
        //     "\nminutesDec: ", minutesDec,
        //     "\nsecondsDec: ", secondsDec,
        //     "\nbrightness: ", brightness,
        //     "\netRa: ", netRa,
        //     "\nbv: ", bv,
        //     "\ntemperature: ", temperature,
        //     "\nhex: ", hex,
        // )

        let objArr = [netRa, netDec, brightness, hex];
        this.data.push(objArr);

    }

    calculateStarTemperature(bv) {
        // https://web.archive.org/web/20230315074349/https://spiff.rit.edu/classes/phys445/lectures/colors/colors.html
        // https://iopscience.iop.org/article/10.1086/301490/pdf
        // https://stackoverflow.com/questions/21977786/star-b-v-color-index-to-apparent-rgb-color
        return 4600 * ((1 / ((0.92 * bv) + 1.7)) + (1 / ((0.92 * bv) + 0.62)));
    }

    render() {
        // render all stars within a circle of degrees 'fov' 
        // fov in degrees

        let ascension = loadGD(UI_STARMAP_ASC);
        let declination = loadGD(UI_STARMAP_DEC);

        let fov = 180;
        for (let i = 0; i < this.data.length; i++) {
            let row = this.data[i];
            // ascension ranges between 0 and 24 corresponding to a complete circle
            // declination ranges from -90 to 90 corresponding to a hemisphere

            let rowAsc = lerp(invlerp(0, 24, row[0]), 0, Math.PI * 2);
            let rowDec = lerp(invlerp(-90, 90, row[1]), 0, Math.PI * 2);

            let rowBrightness = row[2];
            let rowColor = row[3];

            MAIN_CONTEXT.fillStyle = rowColor;
            // we are in sphericasl coordinates 
            let phi = rowDec - declination;
            let theta = rowAsc - ascension;

            let x = Math.sin(phi) * Math.cos(theta);
            let y = Math.sin(phi) * Math.sin(theta);
            let z = Math.cos(phi);

            let X = x / (1 - z);
            let Y = y / (1 - z);

            zoomCanvasFillCircleRelPos(
                invlerp(-2, 2, X),
                invlerp(-2, 2, Y),
                rowBrightness * 3);
            // so if we're at 0 0, we are at the prime meridian looking straight out

            // 




        }



    }


}