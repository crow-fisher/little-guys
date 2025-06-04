import { getBaseSize, getCanvasSquaresX, getCanvasSquaresY, zoomCanvasFillCircle, zoomCanvasFillRect } from "../canvas.js";
import { COLOR_BLACK, COLOR_GREEN, COLOR_VERY_FUCKING_RED } from "../colors.js";
import { MAIN_CONTEXT } from "../index.js";
import { getSquares } from "../squares/_sqOperations.js";


export class Player {
    constructor() {
        this.posX = getCanvasSquaresX() / 2;
        this.posY = getCanvasSquaresY() / 2;

        this.speedX = 0;
        this.speedY = 0;

        this.kpxl = false;
        this.kpxr = false;
        this.kpyu = false;
        this.kpyd = false;


        // configured members 

        this.sizeX = 2;
        this.sizeY = 4;
        this.frameCollisionMap = new Map();

        this.kmxl = 'a';
        this.kmxr = 'd';
        this.kmyu = 'w';
        this.kmyd = 's';

        this.acc = .01;
        
        this.initFrameCollisionMap();
    }

    initFrameCollisionMap() {
        for (let i = 0; i < this.sizeX; i++) {
            this.frameCollisionMap.set(i, new Map());
            for (let j = 0; j < this.sizeY; j++) {
                this.frameCollisionMap.get(i).set(j, false);
            }
        }
    }

    render() { 
        for (let i = 0; i < this.sizeX; i++) {
            for (let j = 0; j < this.sizeY; j++) {
                if (this.frameCollisionMap.get(i).get(j)) {
                    MAIN_CONTEXT.fillStyle = COLOR_VERY_FUCKING_RED;
                } else {
                    MAIN_CONTEXT.fillStyle = COLOR_BLACK;
                }
                zoomCanvasFillRect((this.posX + i) * getBaseSize(), (this.posY + j) * getBaseSize(), getBaseSize(), getBaseSize());
            }
        }
    }

    tick() {
        let sideX = (this.speedX > 0) ? 1 : -1;
        let sideY = (this.speedY > 0) ? 1 : -1;
        this.speedX -= sideX * Math.max(this.acc / 10, Math.abs(this.speedX) / 10);
        this.speedY -= sideY * Math.max(this.acc / 10, Math.abs(this.speedY) / 10);

        if (this.kpxl)
            this.speedX -= this.acc;
        if (this.kpxr)
            this.speedX += this.acc;
        if (this.kpyu)
            this.speedY -= this.acc;
        if (this.kpyd)
            this.speedY += this.acc;

        this.posX += this.speedX;
        this.posY += this.speedY;

        let startPx = this.posX;
        let startPy = this.posY;

        this.posX = Math.min(this.posX, getCanvasSquaresX() - this.sizeX);
        this.posX = Math.max(0, this.posX);

        this.posY = Math.min(this.posY, getCanvasSquaresY() - this.sizeY);
        this.posY = Math.max(0, this.posY);

        if (startPx != this.posX) { 
            this.speedX = 0;
        }
        if (startPy != this.posY) {
            this.speedY = 0;
        }

        for (let i = 0; i < this.sizeX; i++) {
            for (let j = 0; j <= this.sizeY; j++) {
                let pxc = Math.ceil(this.posX + i);
                let pyc = Math.ceil(this.posY + j);
                let pxf = Math.floor(this.posX + i);
                let pyf = Math.floor(this.posY + j);

                let ccc = getSquares(pxc, pyc).some((sq) => sq.collision && sq.solid);
                let cff = getSquares(pxf, pyf).some((sq) => sq.collision && sq.solid);

                let ccf = getSquares(pxc, pyf).some((sq) => sq.collision && sq.solid);
                let cfc = getSquares(pxf, pyc).some((sq) => sq.collision && sq.solid);

                this.frameCollisionMap.get(i).set(j, ccc || cff || ccf || cfc);
            }
        };

    }

    handleKeyDown(key) {
        if (key == this.kmxl)
            this.kpxl = true;
        if (key == this.kmxr)
            this.kpxr = true;
        if (key == this.kmyu)
            this.kpyu = true;
        if (key == this.kmyd)
            this.kpyd = true;
    }

    handleKeyUp(key) { 
        if (key == this.kmxl)
            this.kpxl = false;
        if (key == this.kmxr)
            this.kpxr = false;
        if (key == this.kmyu)
            this.kpyu = false;
        if (key == this.kmyd)
            this.kpyd = false;
    }
}