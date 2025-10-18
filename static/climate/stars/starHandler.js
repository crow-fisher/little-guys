import { getBaseSize, getCanvasHeight, getCanvasSquaresX, getCanvasSquaresY, getCanvasWidth, zoomCanvasFillCircleRelPos } from "../../canvas.js";
import { COLOR_BLUE, COLOR_OTHER_BLUE, COLOR_VERY_FUCKING_RED } from "../../colors.js";
import { invlerp, lerp, randRange, rgb2hsv } from "../../common.js";
import { MAIN_CONTEXT } from "../../index.js";
import { loadGD, saveGD, UI_STARMAP_FOV, UI_STARMAP_XROTATION, UI_STARMAP_XROTATION_SPEED, UI_STARMAP_YROTATION, UI_STARMAP_YROTATION_SPEED, UI_STARMAP_ZROTATION, UI_STARMAP_ZROTATION_SPEED } from "../../ui/UIData.js";
import { getCurDay, tempToRgbaForStar } from "../time.js";
import { multiplyMatrices, multiplyMatrixAndPoint, normalizeXYZVector } from "./matrix.js";

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

    renderTransformed(transformed, size) {
        if (transformed)
            zoomCanvasFillCircleRelPos(
                invlerp(-1, 1, transformed[0]),
                invlerp(-1, 1, transformed[1]),
                size);
    }

    renderWireframe() {
        let steps = 40;
        MAIN_CONTEXT.strokeStyle = COLOR_VERY_FUCKING_RED;
        MAIN_CONTEXT.lineWidth = 1;

        let cw = getCanvasWidth();
        let ch = getCanvasHeight();

        let startPhi, startTheta, phi, theta, transformed;

        for (let i = 0; i < steps; i++) {

            if (i % (steps / 4) == 0) {
                MAIN_CONTEXT.strokeStyle = COLOR_VERY_FUCKING_RED;
            } else {
                MAIN_CONTEXT.strokeStyle = COLOR_BLUE;
            }

            MAIN_CONTEXT.beginPath();
            phi = i * (Math.PI * 2 / steps);
            startPhi = null;
            for (let j = 0; j <= steps; j++) {
                theta = j * (Math.PI * 2 / steps);
                transformed = this.sphericalToScreen(phi, theta);
                if (transformed != null) {
                    if (startPhi == null) {
                        startPhi = transformed;
                        MAIN_CONTEXT.moveTo(cw * invlerp(-1, 1, startPhi[0]), ch * invlerp(-1, 1, startPhi[1]))
                    } else {
                        MAIN_CONTEXT.lineTo(cw * invlerp(-1, 1, transformed[0]), ch * invlerp(-1, 1, transformed[1]))
                    }
                } else {
                    startPhi = null;
                }
            }
            MAIN_CONTEXT.stroke();
        }
        for (let i = 0; i < steps; i++) {
            MAIN_CONTEXT.beginPath();
            if (i % (steps / 4) == 0) {
                MAIN_CONTEXT.strokeStyle = COLOR_VERY_FUCKING_RED;
            } else {
                MAIN_CONTEXT.strokeStyle = COLOR_BLUE;
            }

            theta = i * (Math.PI * 2 / steps);
            startTheta = null;
            for (let j = 0; j <= steps; j++) {
                phi = j * (Math.PI * 2 / steps);
                transformed = this.sphericalToScreen(phi, theta);
                if (transformed != null) {
                    if (startTheta == null) {
                        startTheta = transformed;
                        MAIN_CONTEXT.moveTo(cw * invlerp(-1, 1, startTheta[0]), ch * invlerp(-1, 1, startTheta[1]))
                    } else {
                        MAIN_CONTEXT.lineTo(cw * invlerp(-1, 1, transformed[0]), ch * invlerp(-1, 1, transformed[1]))
                    }
                } else {
                    startTheta = null;
                }
            }
            MAIN_CONTEXT.stroke();
        }
    }

    renderCompass() {
        let unit = 2;

        this.renderCompassDir(0, 0, 0, unit)
        this.renderCompassDir(0, 0, 1, unit)
        this.renderCompassDir(0, 0, 0.5, unit)
        this.renderCompassDir(0, 0, -0.5, unit)

    }

    renderCompassDir(dirX, dirY, dirZ, unit) {
        let totalWidth = getCanvasSquaresX() * getBaseSize();
        let totalHeight = getCanvasSquaresY() * getBaseSize();

        let cameraX = loadGD(UI_STARMAP_XROTATION);
        let cameraY = loadGD(UI_STARMAP_YROTATION);
        let cameraZ = loadGD(UI_STARMAP_ZROTATION);

        let sublines = 50;
        for (let i = 0; i < sublines; i++) {
            let cur = unit * (i / sublines);
            let next = unit * ((i + 1) / sublines);

            let startVec = [cur, 0, -unit, 1];
            let endVec = [next, 0, -unit, 1];

            startVec = this.rotatePoint(startVec, Math.PI * dirX, Math.PI * dirY, Math.PI * dirZ)
            endVec = this.rotatePoint(endVec, Math.PI * dirX, Math.PI * dirY, Math.PI * dirZ)

            startVec = this.rotatePoint(startVec, cameraX, cameraY, cameraZ);
            endVec = this.rotatePoint(endVec, cameraX, cameraY, cameraZ);

            let startVecNormalized = normalizeXYZVector(startVec, 0.5);
            let endVecNormalized = normalizeXYZVector(endVec, 0.5);

            let sp = this.cartesianToScreen(...startVec, true);
            let ep = this.cartesianToScreen(...endVec, true);

            let spn = this.cartesianToScreen(...startVecNormalized, true);
            let epn = this.cartesianToScreen(...endVecNormalized, true);

            if (spn[2] <= sp[2] && epn[2] <= ep[2]) {
                MAIN_CONTEXT.strokeStyle = COLOR_BLUE;
                MAIN_CONTEXT.lineWidth = 4;
                MAIN_CONTEXT.beginPath();
                MAIN_CONTEXT.moveTo(totalWidth * invlerp(-1, 1, spn[0]), totalHeight * invlerp(-1, 1, spn[1]));
                MAIN_CONTEXT.lineTo(totalWidth * invlerp(-1, 1, epn[0]), totalHeight * invlerp(-1, 1, epn[1]));
                MAIN_CONTEXT.closePath();
                MAIN_CONTEXT.stroke();
            }
        }


    }


    render() {
        // https://www.scratchapixel.com/lessons/3d-basic-rendering/perspective-and-orthographic-projection-matrix/building-basic-perspective-projection-matrix.html
        this.cameraHandling();
        this.renderWireframe();
        this.renderCompass();
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

            let transformed = this.sphericalToScreen(phi, theta);
            this.renderTransformed(transformed, rowBrightness * 3);
        }
    }
    cameraHandling() {
        saveGD(UI_STARMAP_XROTATION, loadGD(UI_STARMAP_XROTATION) + loadGD(UI_STARMAP_XROTATION_SPEED));
        saveGD(UI_STARMAP_YROTATION, loadGD(UI_STARMAP_YROTATION) + loadGD(UI_STARMAP_YROTATION_SPEED));
        saveGD(UI_STARMAP_ZROTATION, loadGD(UI_STARMAP_ZROTATION) + loadGD(UI_STARMAP_ZROTATION_SPEED));
        saveGD(UI_STARMAP_XROTATION_SPEED, loadGD(UI_STARMAP_XROTATION_SPEED) * 0.97);
        saveGD(UI_STARMAP_YROTATION_SPEED, loadGD(UI_STARMAP_YROTATION_SPEED) * 0.97);
        saveGD(UI_STARMAP_ZROTATION_SPEED, loadGD(UI_STARMAP_ZROTATION_SPEED) * 0.97);
    }

    cartesianToScreen(x, y, z, w, force = false) {
        // https://www.scratchapixel.com/lessons/3d-basic-rendering/perspective-and-orthographic-projection-matrix/building-basic-perspective-projection-matrix.html

        let fov = loadGD(UI_STARMAP_FOV);
        let r2d = 57.2958;
        let S = 1 / (Math.tan((fov / r2d) / 2) * (Math.PI / (180 / r2d)));
        let perspectiveMatrix = [
            [S, 0, 0, 0],
            [0, S, 0, 0],
            [0, 0, S, -1],
            [0, 0, 1, 0]
        ];
        let dayTheta = Math.PI * 2 * (getCurDay() % 1);
        let cameraX = loadGD(UI_STARMAP_XROTATION) + dayTheta;
        let cameraY = loadGD(UI_STARMAP_YROTATION) + dayTheta;
        let cameraZ = loadGD(UI_STARMAP_ZROTATION) + dayTheta;
        let rotated = this.rotatePoint([x, y, z, w], cameraX, cameraY, cameraZ);
        let transformed = multiplyMatrixAndPoint(perspectiveMatrix, rotated);

        if (rotated[2] < 0 && !force)
            return null;
        return transformed;
    }

    sphericalToScreen(phi, theta) {
        let x = 2 * Math.sin(phi) * Math.cos(theta);
        let y = 2 * Math.sin(phi) * Math.sin(theta);
        let z = 2 * Math.cos(phi);
        let w = 1;
        return this.cartesianToScreen(x, y, z, w)
    }

    rotatePoint(point, rX, rY, rZ) {
        return this.rotatePointRx(this.rotatePointRy(this.rotatePointRz(point, rZ), rY), rX);
    }

    rotatePointRx(point, theta) {
        let rotationMatrix = [
            [1, 0, 0, 0],
            [0, Math.cos(theta), -Math.sin(theta), 0],
            [0, Math.sin(theta), Math.cos(theta), 0],
            [0, 0, 0, 1]
        ];
        return multiplyMatrixAndPoint(rotationMatrix, point);
    }

    rotatePointRy(point, theta) {
        let rotationMatrix = [
            [Math.cos(theta), 0, Math.sin(theta), 0],
            [0, 1, 0, 0],
            [-Math.sin(theta), 0, Math.cos(theta), 0],
            [0, 0, 0, 1]
        ]
        return multiplyMatrixAndPoint(rotationMatrix, point);
    }
    rotatePointRz(point, theta) {
        let rotationMatrix = [
            [Math.cos(theta), -Math.sin(theta), 0, 0],
            [Math.sin(theta), Math.cos(theta), 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ]
        return multiplyMatrixAndPoint(rotationMatrix, point);
    }



}