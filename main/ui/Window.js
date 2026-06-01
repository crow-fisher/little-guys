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
        this.renderWindowFrame();
        this.container.render(posX, posY);
        this.renderWindowBorder()
    }

    renderWindowBorder() {
        let size = this.component.uiManager.getBaseUISize() * 0.8;

        let py = this.posY + this.sizeY;
        let my = this.component.uiManager.getHeight() * 1.5;

        let yFactor = ((my - py) / my);
        let sizeYProcessed = size * yFactor;

        let px = this.posX + this.sizeX;
        let mx = this.component.uiManager.getWidth() * 1.5; 
        let xFactor = (((mx - px) / mx));
        let sizeXProcessed = size * xFactor;

        this.component.uiManager.getContext().fillStyle = this.component.uiManager.getColorInactive(.95);

        // bottom rectangle
        this.component.uiManager.getContext().fillRect(
            this.posX,
            this.posY + this.sizeY,
            this.sizeX,
            sizeYProcessed
        );
        // bottom triangle

        this.component.uiManager.getContext().beginPath();
        this.component.uiManager.getContext().moveTo(this.posX + this.sizeX, this.posY + this.sizeY);
        this.component.uiManager.getContext().lineTo(this.posX + this.sizeX + sizeXProcessed, this.posY + this.sizeY + sizeYProcessed);
        this.component.uiManager.getContext().lineTo(this.posX + this.sizeX, this.posY + this.sizeY + sizeYProcessed);
        this.component.uiManager.getContext().lineTo(this.posX + this.sizeX, this.posY + this.sizeY);
        this.component.uiManager.getContext().closePath();
        this.component.uiManager.getContext().fill();

        // right side

        this.component.uiManager.getContext().fillStyle = this.component.uiManager.getColorInactive((.83 - (xFactor * 0.1)));
        this.component.uiManager.getContext().fillRect(
            this.posX + this.sizeX,
            this.posY,
            sizeXProcessed,
            this.sizeY
        );

        this.component.uiManager.getContext().beginPath();
        this.component.uiManager.getContext().moveTo(this.posX + this.sizeX, this.posY + this.sizeY);
        this.component.uiManager.getContext().lineTo(this.posX + this.sizeX + sizeXProcessed, this.posY + this.sizeY + sizeYProcessed);
        this.component.uiManager.getContext().lineTo(this.posX + this.sizeX + sizeXProcessed, this.posY + this.sizeY);
        this.component.uiManager.getContext().lineTo(this.posX + this.sizeX, this.posY + this.sizeY);
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

        if (Math.min(this._relX, this._relY) < this.getBaseUISize() * 2) {
            this.userDragging = true;
        }
        if (Math.min(this._relXEnd, this._relYEnd) < this.getBaseUISize() * 2) {
            this.userResizing = true;
        }
        
        if (this.userDragging) {
            this.userDraggingRoutine();
        }
        if (this.userResizing) {
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
        this.component.uiManager.getContext().fillStyle = this.component.uiManager.getColorInactiveDark();
        this.component.uiManager.getContext().fillRect(
            this.posX - this.padding, this.posY - this.padding, 
            this.sizeX + this.padding * 2, 
            this.sizeY + this.padding * 2);
    }

    hoverWindowFrame(x, y) {
        if (this.locked || this.grounded) {
            return;
        }

        let hoverP = this.padding * 2;
        if (
            x < this.posX - hoverP ||
            x > this.posX + this.sizeX + hoverP || 
            y < this.posY - hoverP || 
            y > this.posY + this.sizeY + hoverP 
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

