import { getBaseSize, getCanvasSquaresX, getCanvasSquaresY, getCurZoom, recacheCanvasPositions, zoomCanvasFillCircle, zoomCanvasFillRect } from "../canvas.js";
import { addWindPressureDryAir } from "../climate/simulation/wind.js";
import { getFrameDt } from "../climate/time.js";
import { COLOR_BLACK, COLOR_GREEN, COLOR_VERY_FUCKING_RED } from "../colors.js";
import { GBY, GBX, GBA, getLeftStick, isButtonPressed, GBB, GBDL, GBDR, GBDU, GBDD } from "../gamepad.js";
import { getGlobalThetaBase, setGlobalThetaBase } from "../globals.js";
import { MAIN_CONTEXT } from "../index.js";
import { getSquares } from "../squares/_sqOperations.js";
import { loadGD, saveGD, UI_CAMERA_EXPOSURE, UI_CANVAS_SQUARES_ZOOM, UI_CANVAS_VIEWPORT_CENTER_X, UI_CANVAS_VIEWPORT_CENTER_Y, UI_LIGHTING_GLOBAL } from "../ui/UIData.js";


const EN = 0b10000;
const ES = 0b01000;
const EW = 0b00100;
const EE = 0b00010;
const ES2 = 0b00001;

export class Player {
    constructor() {
        this.posX = loadGD(UI_CANVAS_VIEWPORT_CENTER_X) / getBaseSize();
        this.posY = 0;

        this.speedX = 0;
        this.speedY = 0;

        this.kpxl = false;
        this.kpxr = false;
        this.kpyu = false;
        this.kpyd = false;
        this.kpRun = false;

        this.kpax = 0;
        this.kpay = 0;

        this.running = true;

        // configured members 

        this.sizeX = 2;
        this.sizeY = 4;
        this.frameCollisionMap = new Map();

        this.kmxl = 'a';
        this.kmxr = 'd';
        this.kmyu = 'w';
        this.kmyd = 's';
        this.kmRun = 'shift'
        this.kmJump = ' ';

        this.gravity = .07;

        this.walkMax = 0.45;
        this.walkAcc = this.walkMax / 5;

        this.runMax = this.walkMax * 1.6;
        this.runAcc = this.walkAcc;

        this.jumpSpeed = 0.3;
        this.jumpActiveTicksLeft = 0;
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
                    zoomCanvasFillRect(Math.round((this.posX + i) * getBaseSize()), Math.round((this.posY + j) * getBaseSize()), getBaseSize(), getBaseSize());
                    let colMask = this.frameCollisionMap.get(proto).get(i).get(j);

                    if (proto)
                        MAIN_CONTEXT.fillStyle = "rgba(255, 0, 0, 0.5);"
                    else
                        MAIN_CONTEXT.fillStyle = "rgba(0, 255, 0, 0.5)";

                    if ((EN & colMask) == EN)
                        zoomCanvasFillRect(Math.round((this.posX + i) * getBaseSize()), Math.round((this.posY + j) * getBaseSize()), getBaseSize(), getBaseSize() * 0.125);
                    if ((ES & colMask) == ES)
                        zoomCanvasFillRect(Math.round((this.posX + i) * getBaseSize()), Math.round((this.posY + j + 1) * getBaseSize()), getBaseSize(), getBaseSize() * -0.125);
                    if ((EW & colMask) == EW)
                        zoomCanvasFillRect(Math.round((this.posX + i) * getBaseSize()), Math.round((this.posY + j) * getBaseSize()), getBaseSize() * 0.125, getBaseSize());
                    if ((EE & colMask) == EE)
                        zoomCanvasFillRect(Math.round((this.posX + i + 1) * getBaseSize()), Math.round((this.posY + j) * getBaseSize()), getBaseSize() * -0.125, getBaseSize());
                }
            }
        }
    }

    processInput() {
        this.kpax = 0;
        this.kpay = 0;
        if (this.kpxl) {
            this.kpax -= 1;
        }
        if (this.kpxr) {
            this.kpax += 1;
        }
        if (this.kpyu) {
            this.kpay -= 1;
        }
        if (this.kpyd) {
            this.kpay += 1;
        }
        let kbSum = Math.abs(this.kpax) + Math.abs(this.kpay);
        if (kbSum > 0 && kbSum != 1) {
            this.kpax /= kbSum ** 0.5;
            this.kpay /= kbSum ** 0.5;
        }

        let leftStickInput = getLeftStick();
        if (kbSum == 0) {
            this.kpax += leftStickInput[0];
            this.kpay += leftStickInput[1];
        }

        if (isButtonPressed(GBB))
            this.applyZoom(-1);
        if (isButtonPressed(GBX))
            this.applyZoom(1);

        if (isButtonPressed(GBDL))
            setGlobalThetaBase(getGlobalThetaBase() + .1);
        if (isButtonPressed(GBDR))
            setGlobalThetaBase(getGlobalThetaBase() - .1);
        if (isButtonPressed(GBDU)) 
            saveGD(UI_LIGHTING_GLOBAL, loadGD(UI_LIGHTING_GLOBAL) + .003);
        if (isButtonPressed(GBDD)) {
            saveGD(UI_LIGHTING_GLOBAL, loadGD(UI_LIGHTING_GLOBAL) - .003);
        }
    }

    applyZoom(dir) {
        if (Date.now() - this.zoomBounce < 1000) {
            return;
        }
        this.zoomBounce = Date.now();
        saveGD(UI_CANVAS_SQUARES_ZOOM, Math.max(1, getCurZoom() + dir));
    }

    tick() {
        this.frameDt = (Date.now() - this.prevTickTime) / 16;
        this.prevTickTime = Date.now();
        this.processInput();
        this.updateCollision();
        this.processCollision();
        this.updateCamera();
        this.doPlayerAction();
    }

    doPlayerAction() {
        if (isButtonPressed(GBY)) {
            addWindPressureDryAir(this.posX, this.posY, 1.5);
        }
    }

    updateCamera() {
        saveGD(UI_CANVAS_VIEWPORT_CENTER_X, Math.round(this.posX * getBaseSize()));
        saveGD(UI_CANVAS_VIEWPORT_CENTER_Y, Math.round(this.posY * getBaseSize()));
        recacheCanvasPositions();
    }

    updateCollision() {
        for (let surface of [true, false]) {
            for (let i = 0; i < this.sizeX; i++) {
                for (let j = 0; j <= this.sizeY; j++) {
                    this.frameCollisionMap.get(surface).get(i).set(j, 0);
                    for (let dt of [0, 1]) {
                        let pxn = this.posX + i + 0.5;
                        let pxs = pxn;
                        let pxe = this.posX + i;
                        let pxw = this.posX + i + 1;

                        let pyn = this.posY + j;
                        let pys = this.posY + j + 1;
                        let pye = this.posY + j + 0.5;
                        let pyw = pye;

                        let xdt = this.frameDt * this.speedX * dt;
                        let ydt = this.frameDt * this.speedY * dt;

                        let cn = EN * getSquares(pxn + xdt, pyn + ydt).some((sq) => (sq.solid && !sq.organic && sq.collision) && sq.surface == surface);
                        let cs = ES * getSquares(pxs + xdt, pys + ydt).some((sq) => (sq.solid && !sq.organic && sq.collision) && sq.surface == surface);
                        let ce = EE * getSquares(pxe + xdt, pye + ydt).some((sq) => (sq.solid && !sq.organic && sq.collision) && sq.surface == surface);
                        let cw = EW * getSquares(pxw + xdt, pyw + ydt).some((sq) => (sq.solid && !sq.organic && sq.collision) && sq.surface == surface);
                        let cs2 = ES2 * getSquares(pxs + xdt, (pys * 0.8 + pyn * 0.2) + ydt).some((sq) => (sq.proto == "SoilSquare" || sq.proto == "RockSquare") && sq.surface == surface);

                        let colMask = this.frameCollisionMap.get(surface).get(i).get(j);
                        colMask |= cn;
                        colMask |= cs;
                        colMask |= ce;
                        colMask |= cw;
                        colMask |= cs2;
                        this.frameCollisionMap.get(surface).get(i).set(j, colMask);
                    }
                }
            }
        }
    }

    processCollision() {
        let tickGravity = this.gravity;
        let tickAcc = this.walkAcc;
        let tickMax = this.walkMax;

        if (this.running) {
            tickAcc = this.runAcc;
            tickMax = this.runMax;
        }

        tickAcc *= this.frameDt;
        let decayFactorX = (Math.abs(this.speedX) / tickMax)
        let decayFactorY = (Math.abs(this.speedY) / tickMax)

        let bottomEs2Collision = false;
        let bottomSurfaceCollision = false;
        let bottomNonSurfaceCollision = false;
        let bottomMidNonSurfaceCollison = 0;

        let amount = 0;
        for (let i = 0; i < this.sizeX; i++) {
            for (let j = 0; j < (this.sizeY - 1); j++) {
                if ((this.frameCollisionMap.get(false).get(i).get(j) & ES) == ES) {
                    amount += 0.5;
                    this.speedX /= 2;
                    this.posX -= this.speedX;
                    this.speedY = 0;
                    tickGravity = 0;
                    tickMax /= 2;
                }
            }
        }
        this.posY -= Math.min(.1, amount);

        for (let i = 0; i < this.sizeX; i++) {
            for (let j = 0; j < this.sizeY; j++) {
                bottomSurfaceCollision |= (this.frameCollisionMap.get(true).get(i).get(j) & ES) == ES;
                bottomEs2Collision |= (this.frameCollisionMap.get(true).get(i).get(j) & ES2) == ES2;
                bottomNonSurfaceCollision |= (this.frameCollisionMap.get(false).get(i).get(j) & ES) == ES;
                if (j <= this.sizeY - 2) {
                    bottomMidNonSurfaceCollison += (this.frameCollisionMap.get(false).get(i).get(j) & ES) == ES;
                }
            }
        }

        this.running = !bottomEs2Collision;
        this.jumpTicksLeft = Math.max(0, this.jumpTicksLeft - 1);
        if (this.jumpTicksLeft > 0) {
            // do nothing 
        } else {
            if (bottomSurfaceCollision) {
                tickGravity = 0;
                let sideY = (this.speedY > 0) ? 1 : -1;
                if (sideY > 0) {
                    this.speedY = Math.max(0, this.speedY - (decayFactorY * tickMax));
                } else {
                    this.speedY = Math.min(0, this.speedY + (decayFactorY * tickMax));
                }
                if (this.kpay < 0)
                    this.speedY += this.kpay * tickAcc;
                else if (!bottomNonSurfaceCollision && this.kpay > 0)
                    this.speedY += tickAcc * this.kpay;
            } else {
                tickAcc = 0;
            }

            if (bottomNonSurfaceCollision) {
                tickGravity = 0;
            }
        }

        let sideX = (this.speedX > 0) ? 1 : -1;
        if (sideX > 0) {
            this.speedX = Math.max(0, this.speedX - (decayFactorX * tickMax));
        } else {
            this.speedX = Math.min(0, this.speedX + (decayFactorX * tickMax));
        }
        let cmp = (this.kpax > 0) ? Math.max : Math.min;
        this.speedX = cmp(this.speedX + this.kpax * tickAcc, (tickMax * this.kpax));
        if (bottomNonSurfaceCollision || bottomSurfaceCollision) {
            if (this.kpJump || isButtonPressed(GBA)) {
                this.jumpTicks = 3;
                this.jump();
            }
        }

        this.speedY += tickGravity;
        this.posX += this.speedX * this.frameDt * 1;
        this.posY += this.speedY * this.frameDt * 1;

        this.postJump();
    }

    jump() {
        if (this.jumpTicks > 0 && this.jumpTicksLeft == 0) {
            this.jumpTicks = 0;
            this.jumpStartY = this.posY;
            this.jumpTicksLeft = 10;
            this.speedY -= this.jumpSpeed;
            this.totalJumpActiveTicks = 250 / (getFrameDt());
            this.jumpActiveTicksLeft = this.totalJumpActiveTicks;
        }
    }

    postJump() {
        if (this.jumpActiveTicksLeft > 0 && (this.kpJump || isButtonPressed(GBA)))
            this.speedY -= this.jumpSpeed * (this.jumpActiveTicksLeft / this.totalJumpActiveTicks) ** 4;
        this.jumpActiveTicksLeft = Math.max(0, this.jumpActiveTicksLeft - 1);

    }

    handleKeyDown(key) {
        key = key.toLowerCase();
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
        if (key == this.kmRun)
            this.kpRun = true;
    }

    handleKeyUp(key) {
        key = key.toLowerCase();
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
        if (key == this.kmRun) {
            this.kpRun = false;
        }
    }
}