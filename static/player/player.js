import { getBaseSize, getCanvasSquaresX, getCanvasSquaresY, zoomCanvasFillCircle, zoomCanvasFillRect } from "../canvas.js";
import { COLOR_VERY_FUCKING_RED } from "../colors.js";
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


        this.kmxl = 'a';
        this.kmxr = 'd';
        this.kmyu = 'w';
        this.kmyd = 's';

        this.acc = .1;
    }

    render() { 
        MAIN_CONTEXT.fillStyle = COLOR_VERY_FUCKING_RED;
        zoomCanvasFillRect(this.posX * getBaseSize(), this.posY * getBaseSize(), this.sizeX * getBaseSize(), this.sizeY * getBaseSize());
    }

    tick() {
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

        let foundCollisionSquare, i, j;
        
        collision:
        for (i = 0; i < this.sizeX; i++) {
            for (j = 0; j < this.sizeY; j++) {
                let px = Math.floor(this.posX + i);
                let py = Math.floor(this.posY + j);
                foundCollisionSquare = getSquares(px, py).find((sq) => sq.collision && sq.solid);
                if (foundCollisionSquare != null)
                    break collision;
            }
        };

        if (foundCollisionSquare != null) {
            this.speedX = 0;
            this.speedY = 0;
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