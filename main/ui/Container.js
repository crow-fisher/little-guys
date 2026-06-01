export class Container {
    constructor(window, dir) {
        this.window = window;
        this.dir = dir;

        this.elements = new Array();
        this.sizeX = 1;
        this.sizeY = 1;
        this.endX = 0;
        this.endY = 0;
    }

    addElement(newElement) {
        this.elements.push(newElement);
    }

    size() {
        return [this.sizeX, this.sizeY];
    }

    render(startX, startY) {
        let curX = startX;
        let curY = startY;

        this.endX = 0;
        this.endY = 0;

        this.elements.forEach((el) => {
            let elSize = el.size()
            if (isNaN(elSize[0] || isNaN(elSize[1]))) {
                return;
            }
            el.render(curX, curY);
            this.endX = Math.max(curX + elSize[0], this.endX);
            this.endY = Math.max(curY + elSize[1], this.endY);

            if (!el.absolute) {
                if (this.dir == 0) {
                    curX += elSize[0];
                } else {
                    curY += elSize[1];
                }
            }
        });
        this.sizeX = this.endX - startX;
        this.sizeY = this.endY - startY;
    }

    hover(posX, posY) {
        this.window.hovered = true;
        let curX1 = 0;
        let curY1 = 0;
        let curX2, curY2;

        if (!(this.elements.some((el) => {
            let elSize = el.size();
            curX2 = curX1 + elSize[0];
            curY2 = curY1 + elSize[1];

            if (posX > curX1 && posX < curX2 && posY > curY1 && posY < curY2) {
                el.hover(posX - curX1, posY - curY1);
                return true;
            } 

            if (!el.absolute) {
                if (this.dir == 0)
                    curX1 = curX2;
                else
                    curY1 = curY2;
            }

        })));
    }

    updateSizeXByMult(mult) {
        this.elements.forEach((el) => el.updateSizeXByMult(mult));
    }
}