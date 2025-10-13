import { getBaseSize, zoomCanvasFillCircleRelPos } from "../../canvas.js";
import { invlerp } from "../../common.js";
import { MAIN_CONTEXT } from "../../index.js";

export class StarHandler {
    constructor() {
        this.initalizeData();

    }

    initalizeData() {
        this.data = new Array();
        fetch("./static/climate/stars/lib/bsc/catalog").then((resp) => resp.text())
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

        let netRa = raHours + raMinutes / 60 + raSeconds / 3600;
        let netDec = (signDec == "+" ? 1 : -1) * degressDec + minutesDec / 60 + secondsDec / 3600;

        if (isNaN(netRa) || isNaN(netDec) || isNaN(brightness)) {
            return;
        }

        console.log(
            "\nId: ", row.substr(0, 4),
            "\nraHours: ", raHours,
            "\nraMinutes: ", raMinutes,
            "\nraSeconds: ", raSeconds,
            "\nsignDec: ", signDec,
            "\ndegressDec: ", degressDec,
            "\nminutesDec: ", minutesDec,
            "\nsecondsDec: ", secondsDec,
            "\nbrightness: ", brightness,
            "\netRa: ", netRa,
            "\netDec: ", netDec
        )


        this.data.push([netRa, netDec, brightness]);

        console.log("Data for ", row.substr(0, 4), ":\t", [netRa, netDec, brightness]);


    }

    render() {
        MAIN_CONTEXT.fillStyle = "#FFFFFF";

        for (let i = 0; i < this.data.length; i++) {
            let row = this.data[i];
            zoomCanvasFillCircleRelPos(invlerp(0, 24, row[0]), invlerp(-90, 90, row[1]), row[2] * 2);
        }
    }


}