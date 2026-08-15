export class ToolBarElement {
    constructor(uiManager, label, getter, setter) {
        this.uiManager = uiManager;
        this.label = label;
        this.bounds = [[0, 0], [0, 0], [0, 0], [0, 0]];
        this.relMouse = [0, 0];

        this.getter = getter;
        this.setter = setter;

        // bounds in order: 
        //  ** Tl
        //  ** Tr
        //  ** Bl
        //  ** Br
    }

    interact() {
        this.setter();
    }

    prepareStyle(dY) {
        this.uiManager.getContext().font = (dY / this.label.length ** 0.8) + "px courier"
        this.uiManager.getContext().textAlign = 'center';
        this.uiManager.getContext().textBaseline = 'alphabetic';
    }

    render(pX, pY, dX, dY) {
        this.prepareStyle(dY);
        this.bounds[0][0] = pX;
        this.bounds[0][1] = pY;

        this.bounds[1][0] = pX + dX;
        this.bounds[1][1] = pY;

        this.bounds[2][0] = pX + dX;
        this.bounds[2][1] = pY + dY;

        this.bounds[3][0] = pX;
        this.bounds[3][1] = pY + dY;

        this.uiManager.getContext().fillStyle = this.getter() ? "#2bc251" : "#55645f";
        this.uiManager.getContext().fillRect(pX, pY, dX, dY);
        this.uiManager.getContext().fillStyle = "#0000ff";
        this.uiManager.getContext().fillText(this.label, pX + dX / 2, pY + dY / 1.3);
    }
}