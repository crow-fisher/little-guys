import { getBaseSize, getCanvasSquaresX, getCanvasSquaresY, zoomCanvasFillCircle, zoomCanvasFillRect } from "../canvas.js";
import { COLOR_BLACK, COLOR_GREEN, COLOR_VERY_FUCKING_RED } from "../colors.js";
import { MAIN_CONTEXT } from "../index.js";
import { getSquares } from "../squares/_sqOperations.js";


const EN = 0b1000;
const ES = 0b0100;
const EW = 0b0010;
const EE = 0b0001;

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

        this.kmJump = ' ';

        this.gravity = .1;

        this.walkAcc = 0.25;
        this.walkMax = 1;
        this.jumpSpeed = 1;
        this.jumpTicksLeft = 0;

        this.prevTickTime = Date.now();

        this.collisionCacheMap = {
            EN: 0,
            ES: 0,
            EW: 0,
            EE: 0
        };

        this.initFrameCollisionMap();
    }

    initFrameCollisionMap() {
        for (let surfaceType of [true, false]) {
            this.frameCollisionMap.set(surfaceType, new Map());
            for (let i = 0; i < this.sizeX; i++) {
                this.frameCollisionMap.get(surfaceType).set(i, new Map());
                for (let j = 0; j < this.sizeY; j++) {
                    this.frameCollisionMap.get(surfaceType).get(i).set(j, 0);
                }
            }
        }
    }

    render() {
        for (let proto of [true, false]) {
            for (let i = 0; i < this.sizeX; i++) {
                for (let j = 0; j < this.sizeY; j++) {
                    MAIN_CONTEXT.fillStyle = COLOR_BLACK;
                    zoomCanvasFillRect((this.posX + i) * getBaseSize(), (this.posY + j) * getBaseSize(), getBaseSize(), getBaseSize());
                    let colMask = this.frameCollisionMap.get(proto).get(i).get(j);

                    if (proto)
                        MAIN_CONTEXT.fillStyle = "rgba(255, 0, 0, 0.5);"
                    else
                        MAIN_CONTEXT.fillStyle = "rgba(0, 255, 0, 0.5)";

                    if ((EN & colMask) == EN)
                        zoomCanvasFillRect((this.posX + i) * getBaseSize(), (this.posY + j) * getBaseSize(), getBaseSize(), getBaseSize() * 0.125);
                    if ((ES & colMask) == ES)
                        zoomCanvasFillRect((this.posX + i) * getBaseSize(), (this.posY + j + 1) * getBaseSize(), getBaseSize(), getBaseSize() * -0.125);
                    if ((EW & colMask) == EW)
                        zoomCanvasFillRect((this.posX + i) * getBaseSize(), (this.posY + j) * getBaseSize(), getBaseSize() * 0.125, getBaseSize());
                    if ((EE & colMask) == EE)
                        zoomCanvasFillRect((this.posX + i + 1) * getBaseSize(), (this.posY + j) * getBaseSize(), getBaseSize() * -0.125, getBaseSize());
                }
            }
        }
    }

    tick() {
        this.frameDt = (Date.now() - this.prevTickTime) / 16;
        this.prevTickTime = Date.now();
        this.updateCollision();
        this.processCollision();
    }

    updateCollision() {
        for (let surface of [true, false]) {
            for (let i = 0; i < this.sizeX; i++) {
                for (let j = 0; j <= this.sizeY; j++) {
                    let pxn = Math.round(this.posX + i + 0.5);
                    let pxs = pxn;
                    let pxe = Math.round(this.posX + i);
                    let pxw = Math.round(this.posX + i + 1);

                    let pyn = Math.round(this.posY + j);
                    let pys = Math.round(this.posY + j + 1);
                    let pye = Math.round(this.posY + j + 0.5);
                    let pyw = pye;

                    let xdt = this.frameDt * this.speedX;
                    let ydt = this.frameDt * this.speedY;

                    let cn = EN * getSquares(pxn + xdt, pyn + ydt).some((sq) => sq.surface == surface);
                    let cs = ES * getSquares(pxs + xdt, pys + ydt).some((sq) => sq.surface == surface);
                    let ce = EE * getSquares(pxe + xdt, pye + ydt).some((sq) => sq.surface == surface);
                    let cw = EW * getSquares(pxw + xdt, pyw + ydt).some((sq) => sq.surface == surface);

                    let colMask = 0;
                    colMask |= cn
                    colMask |= cs
                    colMask |= ce
                    colMask |= cw

                    this.frameCollisionMap.get(surface).get(i).set(j, colMask);
                }
            }
        }

    }

    processCollision() {
        // surface collision rules: 
        // do not apply gravity 
        // allow the player to move up or down at will, like left or right, at a set speed

        // surface collision rules 
        // the player 

        let tickGravity = this.gravity;
        let tickAcc = this.walkAcc;
        let tickMax = this.walkMax;

        let bottomSurfaceCollision = false;
        let bottomNonSurfaceCollision = false;
        let bottomMidNonSurfaceCollison = false;

        for (let i = 0; i < this.sizeX; i++) {
            for (let j = 0; j < this.sizeY; j++) {
                bottomSurfaceCollision |= (this.frameCollisionMap.get(true).get(i).get(j) & ES) == ES;
                bottomNonSurfaceCollision |= (this.frameCollisionMap.get(false).get(i).get(j) & ES) == ES;
                if (j == this.sizeY - 2) {
                    bottomMidNonSurfaceCollison |= (this.frameCollisionMap.get(false).get(i).get(j) & ES) == ES;
                }
            }
        }

        this.jumpTicksLeft = Math.max(0, this.jumpTicksLeft - 1);

        if (this.jumpTicksLeft > 0 && this.posY <= this.jumpStartY) {
            // do nothing 
        } else {
            if (bottomSurfaceCollision) {
                tickGravity = 0;
                this.speedY = 0;
                if (this.kpyu)
                    this.speedY = -tickAcc;
                
                if (!bottomNonSurfaceCollision && this.kpyd)
                    this.speedY = tickAcc;

            } else if (bottomNonSurfaceCollision) {
                this.speedY = 0;
                if (bottomMidNonSurfaceCollison) {
                    tickGravity = -this.gravity * 6;
                    if (this.speedX > 0) {
                        this.speedX -= tickAcc * 2;
                    } else {
                        this.speedX += tickAcc * 2;
                    }
                } else {
                    tickGravity = 0;
                }
            } else {
                tickAcc = 0;
            }
        }
        if (bottomNonSurfaceCollision || bottomSurfaceCollision) {
            this.jumpTicks = 3;
        }
        this.speedY += tickGravity;
        this.posX += this.speedX;
        this.posY += this.speedY;

        if (this.kpxl)
            this.speedX = Math.max(this.speedX - tickAcc, -tickMax);
        else if (this.kpxr)
            this.speedX = Math.min(this.speedX + tickAcc, tickMax);
        else {
            let sideX = (this.speedX > 0) ? 1 : -1;
            if (sideX > 0) {
                this.speedX = Math.max(0, this.speedX - tickAcc);
            } else {
                this.speedX = Math.min(0, this.speedX + tickAcc);
            }
        }

        if (this.kpJump) {
            this.jump();
        }
    }

    jump() {
        if (this.jumpTicks > 0 && this.jumpTicksLeft == 0) {
            this.jumpTicks = 0;
            this.jumpStartY = this.posY;
            this.jumpTicksLeft = 10;
            this.speedY -= this.jumpSpeed;
        }
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
        if (key == this.kmJump)
            this.kpJump = true;
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
        if (key == this.kmJump)
            this.kpJump = false;
    }
}