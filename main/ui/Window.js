import { invlerp } from "../common.js";

export class Window {
    constructor(component, dir, grounded=false) {
        this.component = component;
        this.container = null;
        this.grounded = grounded;

        this.sizeX = 0;
        this.sizeY = 0;
        this.endX = 0;
        this.endY = 0;
        this.dir = dir;

        this.clickStartX = -1;
        this.clickStartY = -1;

        this.userInteracting = false;
        this.userDragging = false;
        this.userResizing = false;
    }

    shouldRegisterMouseInput() {
        return this.userDragging || this.userResizing;
    }

    isFrameButtonPressed(b) {
        return this.component.uiManager.isFrameButtonPressed(b);
    }

    getContext() {
        return this.component.uiManager.getContext();
    }

    getBaseUISize() {
        return this.component.uiManager.getBaseUISize();
    }

    render(posX, posY) {
        // this.renderWindowFrame();
        this.container.render(posX, posY);
        this.renderWindowBorder()
    }

    renderWindowBorderLeft() {
        this._leftSize = this.getBaseUISize() * (1 - invlerp(0, this._widthCenter, this.component.gcvOffsetX()));
        this.component.uiManager.getContext().fillStyle = this.component.uiManager.getColorInactive(0.8);
        this.component.uiManager.getContext().fillRect(
            this.component.gcvOffsetX(),
            this.component.gcvOffsetY(),
            this._leftSize,
            this.component.gcvSizeY()
        );
    }
    renderWindowBorderRight() {
        this._rightSize = this.getBaseUISize() * (invlerp(this._widthCenter, this.component.uiManager.getWidth(), this.component.gcvOffsetX() + this.component.gcvSizeX()));
        this.component.uiManager.getContext().fillStyle = this.component.uiManager.getColorInactive(0.8);
        this.component.uiManager.getContext().fillRect(
            this.component.gcvOffsetX() + this.component.gcvSizeX(),
            this.component.gcvOffsetY(),
            this._rightSize,
            this.component.gcvSizeY()
        );
    }
    
    renderWindowBorderTop() {

    }
    renderWindowBorderBottom() {

    }

    renderWindowBorder() {
        this._widthCenter = (this.component.uiManager.getWidth() / 2);
        this._heightCenter = (this.component.uiManager.getHeight() / 2);

        this._leftBorder = this.component.gcvOffsetX() > this._widthCenter
        this._rightBorder = (this.component.gcvOffsetX() + this.component.gcvSizeX()) < this._widthCenter;
        this._topBorder = this.component.gcvOffsetY() > this._heightCenter;
        this._bottomBorder = (this.component.gcvOffsetY() + this.component.gcvSizeY()) < this._heightCenter;

        if (this._leftBorder) {
            this.renderWindowBorderLeft();
        }
        else if (this._rightBorder) {
            this.renderWindowBorderRight();
        }
        if (this._topBorder) {
            this.renderWindowBorderTop();
        }
        else if (this._bottomBorder) {
            this.renderWindowBorderBottom();
        }

        return;


        let size = this.component.uiManager.getBaseUISize() * 4;
        let py = this.component.gcvOffsetY() + this.component.gcvSizeY();
        let my = this.component.uiManager.getHeight() * 1.5;

        let yFactor = ((my - py) / my);
        let sizeYProcessed = size * yFactor;

        let px = this.component.gcvOffsetX() + this.component.gcvSizeX();
        let mx = this.component.uiManager.getWidth() * 1.5; 
        let xFactor = (((mx - px) / mx));
        let sizeXProcessed = size * xFactor;


        this.component.uiManager.getContext().fillStyle = this.component.uiManager.getColorInactive(.95);

        // bottom rectangle
        this.component.uiManager.getContext().fillRect(
            this.component.gcvOffsetX(),
            this.component.gcvOffsetY() + this.component.gcvSizeY(),
            this.component.gcvSizeX(),
            sizeYProcessed
        );
        // bottom triangle
        this.component.uiManager.getContext().beginPath();
        this.component.uiManager.getContext().moveTo(this.component.gcvOffsetX() + this.component.gcvSizeX(), this.component.gcvOffsetY() + this.component.gcvSizeY());
        this.component.uiManager.getContext().lineTo(this.component.gcvOffsetX() + this.component.gcvSizeX() + sizeXProcessed, this.component.gcvOffsetY() + this.component.gcvSizeY() + sizeYProcessed);
        this.component.uiManager.getContext().lineTo(this.component.gcvOffsetX() + this.component.gcvSizeX(), this.component.gcvOffsetY() + this.component.gcvSizeY() + sizeYProcessed);
        this.component.uiManager.getContext().lineTo(this.component.gcvOffsetX() + this.component.gcvSizeX(), this.component.gcvOffsetY() + this.component.gcvSizeY());
        this.component.uiManager.getContext().closePath();
        this.component.uiManager.getContext().fill();

        // right side
        this.component.uiManager.getContext().fillStyle = this.component.uiManager.getColorInactive((.83 - (xFactor * 0.1)));
        this.component.uiManager.getContext().fillRect(
            this.component.gcvOffsetX() + this.component.gcvSizeX(),
            this.component.gcvOffsetY(),
            sizeXProcessed,
            this.component.gcvSizeY()
        );
        this.component.uiManager.getContext().beginPath();
        this.component.uiManager.getContext().moveTo(this.component.gcvOffsetX() + this.component.gcvSizeX(), this.component.gcvOffsetY() + this.component.gcvSizeY());
        this.component.uiManager.getContext().lineTo(this.component.gcvOffsetX() + this.component.gcvSizeX() + sizeXProcessed, this.component.gcvOffsetY() + this.component.gcvSizeY() + sizeYProcessed);
        this.component.uiManager.getContext().lineTo(this.component.gcvOffsetX() + this.component.gcvSizeX() + sizeXProcessed, this.component.gcvOffsetY() + this.component.gcvSizeY());
        this.component.uiManager.getContext().lineTo(this.component.gcvOffsetX() + this.component.gcvSizeX(), this.component.gcvOffsetY() + this.component.gcvSizeY());
        this.component.uiManager.getContext().closePath();
        this.component.uiManager.getContext().fill();
    }

    userDraggingRoutine() {
        this._dOffset = this.component.uiManager.mouseDOffset();
        this.component.mcvOffsetX(this._dOffset.x);
        this.component.mcvOffsetY(this._dOffset.y);
    }
    userResizingRoutine() {
        this._dOffset = this.component.uiManager.mouseDOffset();
        this.component.mcvSizeX(this._dOffset.x);
        this.component.mcvSizeY(this._dOffset.y);
    }

    update(posX, posY) {
        this._cmp = this.component.uiManager.mousePosition();

        this._relX = this._cmp.x - posX;    
        this._relY = this._cmp.y - posY;

        this._relXEnd = this.component.gcvSizeX() - this._relX;
        this._relYEnd = this.component.gcvSizeY() - this._relY;

        if (this._relY < this.getBaseUISize() * 4) {
            this.userDragging = true;
        }
        if (this._relX < this.getBaseUISize() * 4) {
            this.userDragging = true;
        }
        if (Math.min(this._relXEnd, this._relYEnd) < this.getBaseUISize() * 2) {
            this.userResizing = true;
        }
        
        if (this.userDragging) {
            this.userDraggingRoutine();
        }
        else if (this.userResizing) {
            this.userResizingRoutine();
        }

        if (!this.component.uiManager.isAnyMouseButtonPressed()) {
            this.userDragging = false;
            this.userInteracting = false;
            this.userResizing = false;
        }
        
        // this.hoverWindowFrame(x, y);
    }

    renderWindowFrame() {
        this.component.uiManager.getContext().fillStyle = this.component.uiManager.getColorInactiveDark(.1);
        this.component.uiManager.getContext().fillRect(
            this.component.gcvOffsetX(), this.component.gcvOffsetY(), 
            this.component.gcvSizeX(), this.component.gcvSizeY());
    }

    hoverWindowFrame(x, y) {
        if (this.locked || this.grounded) {
            return;
        }

        let hoverP = this.padding * 2;
        if (
            x < this.posX - hoverP ||
            x > this.component.gcvOffsetX() + this.component.gcvSizeX() + hoverP || 
            y < this.posY - hoverP || 
            y > this.component.gcvOffsetY() + this.component.gcvSizeY() + hoverP 
        ) {
            return;
        }
        this.hovered = true;

        if (this.component.uiManager.isFrameButtonPressed(0)) {
            if (this.clicked) {
                this.posX = Math.max(0, Math.min(this.component.uiManager.getWidth() - this.sizeX, x - this.clickStartX));
                this.posY = Math.max(this.component.uiManager.getBaseUISize() * 3, Math.min(this.component.uiManager.getHeight() - this.sizeY, y - this.clickStartY));
            } else {
                this.clicked = true;
                this.clickStartX = x - this.posX;
                this.clickStartY = y - this.posY;
            }
        } else {
            this.clicked = false;
        }

    }
}

