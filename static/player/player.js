import { getBaseSize, getCanvasSquaresX, getCanvasSquaresY, zoomCanvasFillCircle, zoomCanvasFillRect } from "../canvas.js";
import { COLOR_BLACK, COLOR_GREEN, COLOR_VERY_FUCKING_RED } from "../colors.js";
import { MAIN_CONTEXT } from "../index.js";
import { getSquares } from "../squares/_sqOperations.js";


const ET = 0b1000;
const EB = 0b0100;
const EL = 0b0010;
const ER = 0b0001;

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

        this.acc = .05;
        this.gravity = 0.05;
        this.jumpSpeed = 1;

        this.collisionCacheMap = {
            ET: 0,
            EB: 0,
            EL: 0,
            ER: 0
        };

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

                MAIN_CONTEXT.fillStyle = COLOR_BLACK;
                zoomCanvasFillRect((this.posX + i) * getBaseSize(), (this.posY + j) * getBaseSize(), getBaseSize(), getBaseSize());

                let colMask = this.frameCollisionMap.get(i).get(j);
                MAIN_CONTEXT.fillStyle = COLOR_VERY_FUCKING_RED;
                if ((ET & colMask) == ET)
                    zoomCanvasFillRect((this.posX + i) * getBaseSize(), (this.posY + j) * getBaseSize(), getBaseSize(), getBaseSize() * 0.125);
                if ((EB & colMask) == EB)
                    zoomCanvasFillRect((this.posX + i) * getBaseSize(), (this.posY + j + 1) * getBaseSize(), getBaseSize(), getBaseSize() * -0.125);
                if ((EL & colMask) == EL)
                    zoomCanvasFillRect((this.posX + i) * getBaseSize(), (this.posY + j) * getBaseSize(), getBaseSize() * 0.125, getBaseSize());
                if ((ER & colMask) == ER)
                    zoomCanvasFillRect((this.posX + i + 1) * getBaseSize(), (this.posY + j) * getBaseSize(), getBaseSize() * -0.125, getBaseSize());
            }
        }
    }

    tick() {
        let sideX = (this.speedX > 0) ? 1 : -1;
        let sideY = (this.speedY > 0) ? 1 : -1;
        this.speedX -= sideX * Math.max(this.acc / 10, Math.abs(this.speedX) / 10);

        let frameGravity = this.gravity;
        if (this.kpyd) {
            frameGravity *= 2;
        }
        if (this.kpyu) {
            frameGravity /= 2;
        }
        this.speedY += frameGravity;
        if (this.kpxl)
            this.speedX -= this.acc;
        if (this.kpxr)
            this.speedX += this.acc;

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

        this.updateCollision();
        this.processCollision();
    }

    updateCollision() {
        for (let i = 0; i < this.sizeX; i++) {
            for (let j = 0; j <= this.sizeY; j++) {
                let pxc = Math.ceil(this.posX + i);
                let pyc = Math.ceil(this.posY + j);
                let pxf = Math.floor(this.posX + i);
                let pyf = Math.floor(this.posY + j);
                // collison - [ceil/floor] [ceil/floor]
                let ccc = getSquares(pxc, pyc).some((sq) => sq.collision && sq.solid);
                let cff = getSquares(pxf, pyf).some((sq) => sq.collision && sq.solid);

                let ccf = getSquares(pxc, pyf).some((sq) => sq.collision && sq.solid);
                let cfc = getSquares(pxf, pyc).some((sq) => sq.collision && sq.solid);

                let colMask = 0;
                colMask |= (cff || ccf) ? ET : 0; // top edge 
                colMask |= (ccf || ccc) ? EB : 0; // bottom edge
                colMask |= (cff || cfc) ? EL : 0; // left edge 
                colMask |= (ccf || ccc) ? ER : 0; // right edge;
                this.frameCollisionMap.get(i).set(j, colMask);
            }
        };
    }

    processCollision() {
        let anyEB = false;
        for (let i = 0; i < this.sizeX; i++) {
            for (let j = 0; j < this.sizeY; j++) {
                anyEB |= (this.frameCollisionMap.get(i).get(j) & EB) == EB;
            }
        }
        if (anyEB) {
            this.posY -= .1;
            this.speedY = 0;
            this.collisionCacheMap[EB] = 4;
        }
        this.collisionCacheMap[ET] = Math.max(0, this.collisionCacheMap[ET] - 1);
        this.collisionCacheMap[EB] = Math.max(0, this.collisionCacheMap[EB] - 1);
        this.collisionCacheMap[EL] = Math.max(0, this.collisionCacheMap[EL] - 1);
        this.collisionCacheMap[ER] = Math.max(0, this.collisionCacheMap[ER] - 1);
    }

    jump() {
        if (this.collisionCacheMap[EB] > 0) {
            this.collisionCacheMap[EB] = 0;
            this.speedY -= this.jumpSpeed;
        }
    }

    handleKeyDown(key) {
        if (key == this.kmxl)
            this.kpxl = true;
        if (key == this.kmxr)
            this.kpxr = true;

        if (key == this.kmyu) {
            this.jump();
            this.kpyu = true;
        }
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