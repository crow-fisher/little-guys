export class CanvasManager {
    constructor(elementId) {
        this.canvas = document.getElementById(elementId);
        this.context = this.canvas.getContext('2d');
        this.width = 0;
        this.height = 0;
        
        this.indexCanvasSize();
    }

    indexCanvasSize() {
        width = window.innerWidth;
        height = window.innerHeight;
    }
}