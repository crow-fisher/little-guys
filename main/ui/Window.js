export class Window {
    constructor(uiManager, dir, grounded=false) {
        this.uiManager = uiManager;
        this.container = null;
        this.grounded = grounded;

        this.sizeX = 0;
        this.sizeY = 0;
        this.endX = 0;
        this.endY = 0;
        this.dir = dir;

        this.hovered = false;
        this.clicked = false;
        this.locked = false;

        this.clickStartX = -1;
        this.clickStartY = -1;
    }

    isFrameButtonPressed(b) {
        return this.uiManager.isFrameButtonPressed(b);
    }

    getContext() {
        return this.uiManager.getContext();
    }

    getBaseUISize() {
        return this.uiManager.getBaseUISize();
    }

    render(posX, posY) {
        let containerSize = this.container.size();
        this.sizeX = containerSize[0];
        this.sizeY = containerSize[1];

        this.renderWindowFrame();
        this.container.render(posX, posY);
        this.renderWindowBorder()
    }

    renderWindowBorder() {
        let size = this.uiManager.getBaseUISize() * 0.8;

        let py = this.posY + this.sizeY;
        let my = this.uiManager.getHeight() * 1.5;

        let yFactor = ((my - py) / my);
        let sizeYProcessed = size * yFactor;

        let px = this.posX + this.sizeX;
        let mx = this.uiManager.getWidth() * 1.5; 
        let xFactor = (((mx - px) / mx));
        let sizeXProcessed = size * xFactor;

        this.uiManager.getContext().fillStyle = this.uiManager.getColorInactive(.95);

        // bottom rectangle
        this.uiManager.getContext().fillRect(
            this.posX,
            this.posY + this.sizeY,
            this.sizeX,
            sizeYProcessed
        );
        // bottom triangle

        this.uiManager.getContext().beginPath();
        this.uiManager.getContext().moveTo(this.posX + this.sizeX, this.posY + this.sizeY);
        this.uiManager.getContext().lineTo(this.posX + this.sizeX + sizeXProcessed, this.posY + this.sizeY + sizeYProcessed);
        this.uiManager.getContext().lineTo(this.posX + this.sizeX, this.posY + this.sizeY + sizeYProcessed);
        this.uiManager.getContext().lineTo(this.posX + this.sizeX, this.posY + this.sizeY);
        this.uiManager.getContext().closePath();
        this.uiManager.getContext().fill();

        // right side

        this.uiManager.getContext().fillStyle = this.uiManager.getColorInactive((.83 - (xFactor * 0.1)));
        this.uiManager.getContext().fillRect(
            this.posX + this.sizeX,
            this.posY,
            sizeXProcessed,
            this.sizeY
        );

        this.uiManager.getContext().beginPath();
        this.uiManager.getContext().moveTo(this.posX + this.sizeX, this.posY + this.sizeY);
        this.uiManager.getContext().lineTo(this.posX + this.sizeX + sizeXProcessed, this.posY + this.sizeY + sizeYProcessed);
        this.uiManager.getContext().lineTo(this.posX + this.sizeX + sizeXProcessed, this.posY + this.sizeY);
        this.uiManager.getContext().lineTo(this.posX + this.sizeX, this.posY + this.sizeY);
        this.uiManager.getContext().closePath();
        this.uiManager.getContext().fill();
    }

    update() {
        let curMouseLocation = this.uiManager.mousePosition();
        if (curMouseLocation == null) {
            return;
        }
        let x = curMouseLocation.x;
        let y = curMouseLocation.y;
        
        let relX = x - this.posX;
        let relY = y - this.posY;

        if (relX > 0 && relX < this.sizeX && relY > 0 && relY < this.sizeY) {
            this.container.hover(relX, relY);
        }
        this.hoverWindowFrame(x, y);
    }

    renderWindowFrame() {
        this.uiManager.getContext().fillStyle = this.uiManager.getColorInactiveDark();
        this.uiManager.getContext().fillRect(
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

        if (this.uiManager.isFrameButtonPressed(b)) {
            if (this.clicked) {
                this.posX = Math.max(0, Math.min(this.uiManager.getWidth() - this.sizeX, x - this.clickStartX));
                this.posY = Math.max(this.uiManager.getBaseUISize() * 3, Math.min(this.uiManager.getHeight() - this.sizeY, y - this.clickStartY));
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

export class WindowElement { 
    constructor(window, sizeX, sizeY) {
        this.window = window;
        this.sizeX = Math.floor(sizeX);
        this.sizeY = Math.floor(sizeY);
    }
    updateSizeXByMult(muit) {
        this.sizeX *= muit;
    }
    updateSizeX(sizeX) {
        this.sizeX = sizeX;
    }
    updateSizeY(sizeY) {
        this.sizeY = sizeY;
    }
    render(startX, startY) {}

    hover(posX, posY) {
        this.hovered = true;
    }
    size() {
        return [this.sizeX, this.sizeY];
    }
}