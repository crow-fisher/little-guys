import { invlerp } from "../common.js";

export class Window {
    constructor(component, dir, grounded = false) {
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

        this.userDragging = false;
        this.userResizing = false;
    }

    shouldRegisterMouseInput() {
        return this.userDragging || this.userResizing || (
            this.component.uiManager.isButtonPressed(0) && this.isPointWithinBounds(this.component.uiManager.mousePosition())
        );
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

    isPointWithinBounds(p) {
        return p.x > (this.component.gcvOffsetX() - this._leftSize) && p.x < (this.component.gcvOffsetX() + this.component.gcvSizeX() - this._rightSize) &&
            p.y > (this.component.gcvOffsetY() + this._topSize) && p.y < (this.component.gcvOffsetY() + this.component.gcvSizeY() - this._bottomSize)
    }

    render(posX, posY) {
        this.renderWindowFrame();
        this.container.render(posX, posY);
        this.renderWindowBorder()
    }

    renderWindowBorderLeft(b) {
        this.component.uiManager.getContext().fillStyle = this.component.uiManager.getColorInactive(b);
        this.component.uiManager.getContext().fillRect(
            this.component.gcvOffsetX(),
            this.component.gcvOffsetY(),
            this._leftSize,
            this.component.gcvSizeY()
        );

        if (this._topBorder) {
            this.component.uiManager.getContext().beginPath();
            this.component.uiManager.getContext().moveTo(this.component.gcvOffsetX() + this._leftSize, this.component.gcvOffsetY());
            this.component.uiManager.getContext().lineTo(this.component.gcvOffsetX() + this._leftSize, this.component.gcvOffsetY() + this._topSize);
            this.component.uiManager.getContext().lineTo(this.component.gcvOffsetX(), this.component.gcvOffsetY());
            this.component.uiManager.getContext().fill();
        }

        if (this._bottomBorder) {
            this.component.uiManager.getContext().beginPath();
            this.component.uiManager.getContext().moveTo(this.component.gcvOffsetX() + this._leftSize, this.component.gcvOffsetY() + this.component.gcvSizeY());
            this.component.uiManager.getContext().lineTo(this.component.gcvOffsetX() + this._leftSize, this.component.gcvOffsetY() + this.component.gcvSizeY() - this._bottomSize);
            this.component.uiManager.getContext().lineTo(this.component.gcvOffsetX(), this.component.gcvOffsetY() + this.component.gcvSizeY());
            this.component.uiManager.getContext().fill();
        }
    }
    renderWindowBorderRight(b) {
        this.component.uiManager.getContext().fillStyle = this.component.uiManager.getColorInactive(b);
        this.component.uiManager.getContext().fillRect(
            this.component.gcvOffsetX() + this.component.gcvSizeX() - this._rightSize,
            this.component.gcvOffsetY(),
            this._rightSize,
            this.component.gcvSizeY()
        );

        if (this._topBorder) {
            this.component.uiManager.getContext().beginPath();
            this.component.uiManager.getContext().moveTo(this.component.gcvOffsetX() + this.component.gcvSizeX() - this._rightSize, this.component.gcvOffsetY());
            this.component.uiManager.getContext().lineTo(this.component.gcvOffsetX() + this.component.gcvSizeX() - this._rightSize, this.component.gcvOffsetY() + this._topSize);
            this.component.uiManager.getContext().lineTo(this.component.gcvOffsetX() + this.component.gcvSizeX(), this.component.gcvOffsetY());
            this.component.uiManager.getContext().fill();
        }


        if (this._bottomBorder) {
            this.component.uiManager.getContext().beginPath();
            this.component.uiManager.getContext().moveTo(this.component.gcvOffsetX() + this.component.gcvSizeX() - this._rightSize, this.component.gcvOffsetY() + this.component.gcvSizeY());
            this.component.uiManager.getContext().lineTo(this.component.gcvOffsetX() + this.component.gcvSizeX() - this._rightSize, this.component.gcvOffsetY() + this.component.gcvSizeY() - this._bottomSize);
            this.component.uiManager.getContext().lineTo(this.component.gcvOffsetX() + this.component.gcvSizeX(), this.component.gcvOffsetY() + this.component.gcvSizeY());
            this.component.uiManager.getContext().fill();
        }
    }
    renderWindowBorderTop(b) {
        this.component.uiManager.getContext().fillStyle = this.component.uiManager.getColorInactive(b);
        this.component.uiManager.getContext().fillRect(
            this.component.gcvOffsetX(),
            this.component.gcvOffsetY(),
            this.component.gcvSizeX(),
            this._topSize
        );

        if (this._leftBorder) {
            this.component.uiManager.getContext().beginPath();
            this.component.uiManager.getContext().moveTo(this.component.gcvOffsetX() + this._leftSize, this.component.gcvOffsetY() + this._topSize);
            this.component.uiManager.getContext().lineTo(this.component.gcvOffsetX(), this.component.gcvOffsetY() + this._topSize);
            this.component.uiManager.getContext().lineTo(this.component.gcvOffsetX(), this.component.gcvOffsetY());
            this.component.uiManager.getContext().fill();
        }

        if (this._rightBorder) {
            this.component.uiManager.getContext().beginPath();
            this.component.uiManager.getContext().moveTo(this.component.gcvOffsetX() + this.component.gcvSizeX() - this._rightSize, this.component.gcvOffsetY() + this._topSize);
            this.component.uiManager.getContext().lineTo(this.component.gcvOffsetX() + this.component.gcvSizeX(), this.component.gcvOffsetY() + this._topSize);
            this.component.uiManager.getContext().lineTo(this.component.gcvOffsetX() + this.component.gcvSizeX(), this.component.gcvOffsetY());
            this.component.uiManager.getContext().fill();
        }

    }
    renderWindowBorderBottom(b) {
        this.component.uiManager.getContext().fillStyle = this.component.uiManager.getColorInactive(b);
        this.component.uiManager.getContext().fillRect(
            this.component.gcvOffsetX(),
            this.component.gcvOffsetY() + this.component.gcvSizeY() - this._bottomSize,
            this.component.gcvSizeX(),
            this._bottomSize
        );

        if (this._leftBorder) {
            this.component.uiManager.getContext().beginPath();
            this.component.uiManager.getContext().moveTo(this.component.gcvOffsetX() + this._leftSize, this.component.gcvOffsetY() + this.component.gcvSizeY() - this._bottomSize);
            this.component.uiManager.getContext().lineTo(this.component.gcvOffsetX(), this.component.gcvOffsetY() + this.component.gcvSizeY() - this._bottomSize);
            this.component.uiManager.getContext().lineTo(this.component.gcvOffsetX(), this.component.gcvOffsetY() + this.component.gcvSizeY());
            this.component.uiManager.getContext().fill();
        }

        if (this._rightBorder) {
            this.component.uiManager.getContext().beginPath();
            this.component.uiManager.getContext().moveTo(this.component.gcvOffsetX() + this.component.gcvSizeX() - this._rightSize, this.component.gcvOffsetY() + this.component.gcvSizeY() - this._bottomSize);
            this.component.uiManager.getContext().lineTo(this.component.gcvOffsetX() + this.component.gcvSizeX(), this.component.gcvOffsetY() + this.component.gcvSizeY() - this._bottomSize);
            this.component.uiManager.getContext().lineTo(this.component.gcvOffsetX() + this.component.gcvSizeX(), this.component.gcvOffsetY() + this.component.gcvSizeY());
            this.component.uiManager.getContext().fill();
        }
    }

    renderWindowBorder() {
        this._widthCenter = (this.component.uiManager.getWidth() / 2);
        this._heightCenter = (this.component.uiManager.getHeight() * (1.8 / 3));

        this._borderSize = 2 * this.getBaseUISize();
        this._borderBrightness = .8;

        this._leftBorder = this.component.gcvOffsetX() > this._widthCenter
        this._rightBorder = (this.component.gcvOffsetX() + this.component.gcvSizeX()) < this._widthCenter;
        this._topBorder = this.component.gcvOffsetY() > this._heightCenter;
        this._bottomBorder = (this.component.gcvOffsetY() + this.component.gcvSizeY()) < this._heightCenter;

        this._leftSize = !this._leftBorder ? 0 : this._borderSize * (1 - invlerp(0, this._widthCenter, this.component.gcvOffsetX()));
        this._rightSize = !this._rightBorder ? 0 : this._borderSize * (invlerp(this._widthCenter, this.component.uiManager.getWidth(), this.component.gcvOffsetX() + this.component.gcvSizeX()));
        this._topSize = !this._topBorder ? 0 : this._borderSize * (1 - invlerp(0, this._heightCenter, this.component.gcvOffsetY()));
        this._bottomSize = !this._bottomBorder ? 0 : this._borderSize * (invlerp(this._heightCenter, this.component.uiManager.getHeight(), this.component.gcvOffsetY() + this.component.gcvSizeY()));

        if (this._leftBorder) {
            this.renderWindowBorderLeft(.8);
        }
        else if (this._rightBorder) {
            this.renderWindowBorderRight(.9);
        }
        if (this._topBorder) {
            this.renderWindowBorderTop(.7);
        }
        else if (this._bottomBorder) {
            this.renderWindowBorderBottom(1.2);
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

    userInteractingRoutine() {
        this.container.interact(this.relX, this.relY);
    }

    update(posX, posY) {
        if (!this.component.uiManager.isAnyMouseButtonPressed()) {
            this.userDragging = false;
            this.userResizing = false;
            return;
        }

        this._cmp = this.component.uiManager.mousePosition();
        this.relX = this._cmp.x - posX;
        this.relY = this._cmp.y - posY;
        this._relXEnd = this.component.gcvSizeX() - this.relX;
        this._relYEnd = this.component.gcvSizeY() - this.relY;

        if (this.component.uiManager.isFrameButtonPressed(0)) {
            if (this.relY < this.getBaseUISize() * 4) {
                this.userDragging = true;
            }
            else if (this.relX < this.getBaseUISize() * 4) {
                this.userDragging = true;
            }
            else if (Math.min(this._relXEnd, this._relYEnd) < this.getBaseUISize() * 2) {
                this.userResizing = true;
            }
        }

        if (this.userDragging) {
            this.userDraggingRoutine();
        } else if (this.userResizing) {
            this.userResizingRoutine();
        } else {
            this.userInteractingRoutine();
        }
    }

    renderWindowFrame() {
        this.component.uiManager.getContext().fillStyle = this.component.uiManager.getColorInactive(0.5);
        this.component.uiManager.getContext().fillRect(
            this.component.gcvOffsetX(), this.component.gcvOffsetY(),
            this.component.gcvSizeX(), this.component.gcvSizeY());
    }

}

