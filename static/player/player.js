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

        this.protos = ["RockSquare", "SoilSquare"];
        this.bottomColMap = new Map();

        // configured members 

        this.sizeX = 2;
        this.sizeY = 4;
        this.frameCollisionMap = new Map();

        this.kmxl = 'a';
        this.kmxr = 'd';
        this.kmyu = 'w';
        this.kmyd = 's';

        this.gravity = .1;

        this.dirtAcc = 0.25;
        this.rockAcc = 0.01;
        this.airAcc = 0.05;

        this.dirtMax = 1;
        this.rockMax = 0.05;
        this.airMax = this.dirtMax;

        this.acc = .25;
        this.jumpSpeed = 1;

        this.prevTickTime = Date.now();

        this.collisionCacheMap = {
            ET: 0,
            EB: 0,
            EL: 0,
            ER: 0
        };

        this.initFrameCollisionMap();
    }

    initFrameCollisionMap() {
        for (let proto of this.protos) {
            this.bottomColMap.set(proto, false);
            this.frameCollisionMap.set(proto, new Map());
            for (let i = 0; i < this.sizeX; i++) {
                this.frameCollisionMap.get(proto).set(i, new Map());
                for (let j = 0; j < this.sizeY; j++) {
                    this.frameCollisionMap.get(proto).get(i).set(j, false);
                }
            }
        }
    }

    render() {
        for (let proto of this.protos) {
            for (let i = 0; i < this.sizeX; i++) {
                for (let j = 0; j < this.sizeY; j++) {
                    MAIN_CONTEXT.fillStyle = COLOR_BLACK;
                    zoomCanvasFillRect((this.posX + i) * getBaseSize(), (this.posY + j) * getBaseSize(), getBaseSize(), getBaseSize());
                    let colMask = this.frameCollisionMap.get(proto).get(i).get(j);

                    if (proto == "RockSquare")
                        MAIN_CONTEXT.fillStyle = "rgba(255, 0, 0, 0.5);"
                    if (proto == "SoilSquare")
                        MAIN_CONTEXT.fillStyle = "rgba(0, 255, 0, 0.5)";

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
    }

    tick() {
        this.frameDt = (Date.now() - this.prevTickTime) / 16;
        this.prevTickTime = Date.now();


        let frameGravity = this.gravity;
        if (this.kpyd) {
            frameGravity *= 2;
        }
        if (this.kpyu) {
            frameGravity /= 2;
        }
        this.speedY += frameGravity;

        this.posX += this.speedX;
        this.posY += this.speedY;

        let startPx = this.posX;
        let startPy = this.posY;

        this.posX = Math.min(this.posX, getCanvasSquaresX() - this.sizeX);
        this.posX = Math.max(0, this.posX);

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
        for (let proto of this.protos) {
            for (let i = 0; i < this.sizeX; i++) {
                for (let j = 0; j <= this.sizeY; j++) {
                    let pxc = Math.ceil(this.posX + i);
                    let pyc = Math.ceil(this.posY + j);
                    let pxf = Math.floor(this.posX + i);
                    let pyf = Math.floor(this.posY + j);

                    let ccc = getSquares(pxc, pyc).some((sq) => sq.proto == proto);
                    let cff = getSquares(pxf, pyf).some((sq) => sq.proto == proto);

                    let ccf = getSquares(pxc, pyf).some((sq) => sq.proto == proto);
                    let cfc = getSquares(pxf, pyc).some((sq) => sq.proto == proto);

                    let colMask = 0;
                    colMask |= (cff || ccf) ? ET : 0; // top edge 
                    colMask |= (ccf || ccc) ? EB : 0; // bottom edge
                    colMask |= (cff || cfc) ? EL : 0; // left edge 
                    colMask |= (ccf || ccc) ? ER : 0; // right edge;

                    this.frameCollisionMap.get(proto).get(i).set(j, colMask);
                }
            }
        }

    }

    processCollision() {
        for (let proto of this.protos) {
            let anyEB = false;
            for (let i = 0; i < this.sizeX; i++) {
                for (let j = 0; j < this.sizeY; j++) {
                    anyEB |= (this.frameCollisionMap.get(proto).get(i).get(j) & EB) == EB;
                }
            }
            this.bottomColMap.set(proto, anyEB);
        }

        let acc, max, coll;
        if (this.bottomColMap.get("SoilSquare")) {
            acc = this.dirtAcc;
            max = this.dirtMax;
            coll = true;
        } else if (this.bottomColMap.get("RockSquare")) {
            acc = this.rockAcc;
            max = this.rockMax;
            coll = true;
        } else {
            acc = this.airAcc;
            max = this.airMax;
        }
        
        if (this.kpxl)
            this.speedX = Math.max(this.speedX - acc, -max);
        else if (this.kpxr)
            this.speedX = Math.min(this.speedX + acc, max);
        else {
            let sideX = (this.speedX > 0) ? 1 : -1;
            if (sideX > 0) {
                this.speedX = Math.max(0, this.speedX - acc);
            } else {
                this.speedX = Math.min(0, this.speedX + acc);
            }
        }

        if (coll) {
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