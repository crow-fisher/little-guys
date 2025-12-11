import { cartesianToScreen } from "../../camera.js";
import { getBaseSize, getCanvasHeight, getCanvasSquaresX, getCanvasSquaresY, getCanvasWidth, zoomCanvasFillCircleRelPos } from "../../canvas.js";
import { COLOR_BLUE, COLOR_VERY_FUCKING_RED } from "../../colors.js";
import { invlerp, randRange } from "../../common.js";
import { MAIN_CONTEXT } from "../../index.js";
import { loadGD, saveGD, UI_CAMERA_OFFSET_VEC, UI_MAIN_NEWWORLD_LATITUDE, UI_STARMAP_ROTATION_VEC, UI_STARMAP_ROTATION_VEC_DT } from "../../ui/UIData.js";
import { getActiveClimate } from "../climateManager.js";
import { getFrameRelCloud } from "../simulation/temperatureHumidity.js";
import { getCurDay, getDaylightStrength, tempToRgbaForStar } from "../time.js";
import { addVectors, getVec3Length, multiplyMatrixAndPoint, multiplyVectorByScalar, normalizeVec3, subtractVectors } from "./matrix.js";

export class StarHandler {
    constructor() {
        this.initalizeData();
    }

    initalizeData() {
        this.data = new Array();
        this.constellations = new Array();
        this.constellationStars = new Set();
        this.starsById = new Map();

        fetch("./static/climate/stars/lib/stellarium/constellations.fab").then((resp) => resp.text())
            .then((text) => this.loadConstellations(text));

        fetch("./static/climate/stars/lib/stellarium/hip_main.dat").then((resp) => resp.text())
            .then((text) => this.loadData(text))

    }

    loadConstellations(text) {
        let rows = text.split("\n");
        for (let i = 0; i < rows.length; i++) {
            this.loadConstellationRow(rows.at(i));
        }
    }

    loadConstellationRow(row) {
        let rowValues = Array.from(row.split(" ").map((v) => Number.parseInt(v)));
        rowValues.slice(1).forEach((id) => this.constellationStars.add(Number.parseInt(id)));
        this.constellations.push(rowValues.slice(1));
    }

    loadData(text) {
        let rows = text.split("\n");
        for (let i = 0; i < rows.length; i++) {
            this.loadRow(rows.at(i));
        }
    }

    loadRow(row) {
        // for equinox J2000, epoch 2000.0

        // right ascension - goes from 0 to 24 hours 
        // declination - goes from -90 to 90 degrees

        let id = Number.parseInt(row.substr(8, 13));

        if (!this.constellationStars.has(id) && Math.random() < 0.9)
            return;
        let raHours = Number.parseFloat(row.substr(17, 2));
        let raMinutes = Number.parseFloat(row.substr(20, 2));
        let raSeconds = Number.parseFloat(row.substr(23, 5));

        let signDec = row.substr(29, 1);
        let degressDec = Number.parseFloat(row.substr(30, 2));
        let minutesDec = Number.parseFloat(row.substr(33, 2));
        let secondsDec = Number.parseFloat(row.substr(36, 5));

        let parallax = Number.parseFloat(row.substr(79, 85));
        let brightness = Number.parseFloat(row.substr(230, 6));
        let bv = Number.parseFloat(row.substr(245, 5));

        if (isNaN(bv) || brightness < 0)
            return;

        brightness *= .4;

        // in degrees
        let rowAsc = (raHours + raMinutes / 60 + raSeconds / 3600) * (360 / 24); // between 0 and 360
        let rowDec = (signDec == "+" ? 1 : -1) * degressDec + minutesDec / 60 + secondsDec / 3600; // between -90 and 90
        
        console.log(id, rowAsc, rowDec);
        // convert to radians 
        let rowAscRad = rowAsc / 57.4;
        let rowDecRad = rowDec / 57.4;
        
        let temperature = this.calculateStarTemperature(bv);
        let hex = tempToRgbaForStar(temperature);
        if (isNaN(rowAsc) || isNaN(rowDec) || isNaN(brightness) || isNaN(parallax)) {
            return;
        }
        let objArr = [rowAscRad, rowDecRad, brightness, hex, parallax];
        this.starsById.set(id, objArr);
        this.data.push(objArr);

    }

    calculateStarTemperature(bv) {
        // https://web.archive.org/web/20230315074349/https://spiff.rit.edu/classes/phys445/lectures/colors/colors.html
        // https://iopscience.iop.org/article/10.1086/301490/pdf
        // https://stackoverflow.com/questions/21977786/star-b-v-color-index-to-apparent-rgb-color
        return 4600 * ((1 / ((0.92 * bv) + 1.7)) + (1 / ((0.92 * bv) + 0.62)));
    }

    renderScreen(loc, size) {
        if (loc) {
            MAIN_CONTEXT.beginPath();
            MAIN_CONTEXT.arc(loc[0], loc[1], size, 0, 2 * Math.PI, false);
            MAIN_CONTEXT.fill();
        }

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
                transformed = this.cartesianToScreen(phi, theta);
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
                transformed = this.cartesianToScreen(phi, theta);
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
        this.renderCompassDir(0, 0, 0)
        this.renderCompassDir(0, 0, 1)
        this.renderCompassDir(0, 0, 0.5)
        this.renderCompassDir(0, 0, -0.5)
    }

    renderCompassDir(dirX, dirY, dirZ) {
        let unit = 1;
        let totalWidth = getCanvasSquaresX() * getBaseSize();
        let totalHeight = getCanvasSquaresY() * getBaseSize();

        let vec = loadGD(UI_STARMAP_ROTATION_VEC);
        let cameraX = vec[0];
        let cameraY = vec[1];
        let cameraZ = vec[2];

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

            let startVecNormalized = normalizeVec3(startVec);
            let endVecNormalized = normalizeVec3(endVec);

            let sp = cartesianToScreen(...startVec, true);
            let ep = cartesianToScreen(...endVec, true);

            let spn = cartesianToScreen(...startVecNormalized, true);
            let epn = cartesianToScreen(...endVecNormalized, true);

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

    renderConstellations() {
        let phi, theta, start, transformed;

        let cw = getCanvasWidth();
        let ch = getCanvasHeight();

        MAIN_CONTEXT.beginPath();
        MAIN_CONTEXT.lineWidth = 8;
        MAIN_CONTEXT.strokeStyle = COLOR_VERY_FUCKING_RED;
        for (let i = 0; i < this.constellations.length; i += 24) {
            let constellationStars = this.constellations.at(i);
            start = null;
            for (let j = 0; j < constellationStars.length; j++) {
                let curStar = this.starsById.get(constellationStars.at(j))
                if (curStar == null)
                    continue;
                phi = curStar[0];
                theta = curStar[1];
                transformed = this.cartesianToScreen(phi, theta);
                if (transformed != null) {
                    if (start == null) {
                        start = transformed;
                        MAIN_CONTEXT.moveTo(cw * invlerp(-1, 1, start[0]), ch * invlerp(-1, 1, start[1]))
                    } else {
                        MAIN_CONTEXT.lineTo(cw * invlerp(-1, 1, transformed[0]), ch * invlerp(-1, 1, transformed[1]))
                    }
                } else {
                    start = null;
                }
                MAIN_CONTEXT.stroke();
            }
        }
    }

    render() {
        // https://www.scratchapixel.com/lessons/3d-basic-rendering/perspective-and-orthographic-projection-matrix/building-basic-perspective-projection-matrix.html
        // this.renderWireframe();

        if (getDaylightStrength() > 0.35) {
            return;
        }
        let bMult = Math.min(1, Math.exp(-7 * getDaylightStrength()));
        let frameCloudColor = getFrameRelCloud();
        let frameCloudMult = 0;// Math.min(1, ((frameCloudColor.r + frameCloudColor.g + frameCloudColor.b) / (3 * 255) * 20));


        let ascOffset = (getCurDay() % 1) * 2 * Math.PI;
        let decOffset = 0;

        for (let i = 0; i < this.data.length; i++) {
            let row = this.data[i];
            let rowAsc = row[0] + ascOffset;
            let rowDec = row[1] + decOffset;
            let rowBrightness = row[2] * bMult * (1 - frameCloudMult);
            let rowColor = row[3];
            let rowParallax = row[4]
            MAIN_CONTEXT.fillStyle = rowColor;
            // we are in sphericasl coordinates 
            
            let phi = rowDec;
            let theta = rowAsc;
            let distance = 1 / rowParallax; // in parsecs

            let cartesian = this.sphericalToCartesian(phi, theta, distance);
            let screen = cartesianToScreen(...cartesian);

            let origDistance = getVec3Length(cartesian);
            let newDistance = getVec3Length(subtractVectors(cartesian, loadGD(UI_CAMERA_OFFSET_VEC)));
            
            let distFactor = newDistance / origDistance; 
            let brightnessFactor = 1 / distFactor;
            // if we're half the distance, then this will be 2. 4 times brighter
            

            this.renderScreen(screen, rowBrightness * brightnessFactor);
        }
    }

    sphericalToCartesian(pitch, yaw, distance) {
        let m = distance * 10 ** 4;
        let x = m * Math.cos(yaw) * Math.cos(pitch);
        let y = m * Math.sin(pitch);
        let z = m * Math.sin(yaw) * Math.cos(pitch);
        
        return [x, y, z];
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