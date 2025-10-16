import { getBaseSize, zoomCanvasFillCircleRelPos } from "../../canvas.js";
import { invlerp, lerp, randRange, rgb2hsv } from "../../common.js";
import { MAIN_CONTEXT } from "../../index.js";
import { loadGD, saveGD, UI_STARMAP_XROTATION, UI_STARMAP_XROTATION_SPEED, UI_STARMAP_YROTATION, UI_STARMAP_YROTATION_SPEED, UI_STARMAP_ZROTATION, UI_STARMAP_ZROTATION_SPEED } from "../../ui/UIData.js";
import { tempToRgbaForStar } from "../time.js";
import { multiplyMatrices, multiplyMatrixAndPoint } from "./matrix.js";

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



        // this is what i need 
        // https://www.scratchapixel.com/lessons/3d-basic-rendering/perspective-and-orthographic-projection-matrix/building-basic-perspective-projection-matrix.html

        // render all stars within a circle of degrees 'fov' 
        // fov in degrees

        saveGD(UI_STARMAP_XROTATION, loadGD(UI_STARMAP_XROTATION) + loadGD(UI_STARMAP_XROTATION_SPEED));
        saveGD(UI_STARMAP_YROTATION, loadGD(UI_STARMAP_YROTATION) + loadGD(UI_STARMAP_YROTATION_SPEED));
        saveGD(UI_STARMAP_ZROTATION, loadGD(UI_STARMAP_ZROTATION) + loadGD(UI_STARMAP_ZROTATION_SPEED));

        saveGD(UI_STARMAP_XROTATION_SPEED, loadGD(UI_STARMAP_XROTATION_SPEED) * 0.97);
        saveGD(UI_STARMAP_YROTATION_SPEED, loadGD(UI_STARMAP_YROTATION_SPEED) * 0.97);
        saveGD(UI_STARMAP_ZROTATION_SPEED, loadGD(UI_STARMAP_ZROTATION_SPEED) * 0.97);

        let cameraX = loadGD(UI_STARMAP_XROTATION);
        let cameraY = loadGD(UI_STARMAP_YROTATION);
        let cameraZ = loadGD(UI_STARMAP_ZROTATION);

        let fov = 80;
        let r2d = 57.2958;

        for (let i = 0; i < this.data.length; i++) {
            let row = this.data[i];
            let rowAsc = lerp(invlerp(0, 24, row[0]), 0, Math.PI * 2);
            let rowDec = lerp(invlerp(-90, 90, row[1]), 0, Math.PI * 2);
            let rowBrightness = row[2];
            let rowColor = row[3];
            MAIN_CONTEXT.fillStyle = rowColor;
            // we are in sphericasl coordinates 
            let phi = rowDec;
            let theta = rowAsc;

            let x = 2 * Math.sin(phi) * Math.cos(theta);
            let y = 2 * Math.sin(phi) * Math.sin(theta);
            let z = 2 * Math.cos(phi);
            let w = 1;

            let rotated = rotatePointRx([x, y, z, w], cameraX);
            rotated = rotatePointRy(rotated, cameraY);
            rotated = rotatePointRz(rotated, cameraZ);

            x = rotated[0];
            y = rotated[1];
            z = rotated[2];
            w = rotated[3];

            if (z < 0)
                continue;

            // scaling factor for FOV calculation 


            let S = 1 / (Math.tan((fov / r2d) / 2) * (Math.PI / (180 / r2d)));
            let perspectiveMatrix = [
                [S, 0, 0, 0],
                [0, S, 0, 0],
                [0, 0, S, -1],
                [0, 0, 1, 0]
            ];

            // https://www.scratchapixel.com/lessons/3d-basic-rendering/perspective-and-orthographic-projection-matrix/building-basic-perspective-projection-matrix.html

            let transformed = multiplyMatrixAndPoint(perspectiveMatrix, [x, y, z, w]);

            zoomCanvasFillCircleRelPos(
                invlerp(-1, 1, transformed[0] / transformed[2]),
                invlerp(-1, 1, transformed[1] / transformed[2]),
                rowBrightness * 3);

        }


        function rotatePointRx(point, theta) {
            let rotationMatrix = [
                [1, 0, 0, 0],
                [0, Math.cos(theta), -Math.sin(theta), 0],
                [0, Math.sin(theta), Math.cos(theta), 0],
                [0, 0, 0, 1]
            ];
            return multiplyMatrixAndPoint(rotationMatrix, point);
        }

        function rotatePointRy(point, theta) {
            let rotationMatrix = [
                [Math.cos(theta), 0, Math.sin(theta), 0],
                [0, 1, 0, 0],
                [-Math.sin(theta), 0, Math.cos(theta), 0],
                [0, 0, 0, 1]
            ]
            return multiplyMatrixAndPoint(rotationMatrix, point);
        }


        function rotatePointRz(point, theta) {
            let rotationMatrix = [
                [Math.cos(theta), -Math.sin(theta), 0, 0],
                [Math.sin(theta), Math.cos(theta), 0, 0],
                [0, 0, 1, 0],
                [0, 0, 0, 1]
            ]
            return multiplyMatrixAndPoint(rotationMatrix, point);
        }



    }


}