export class TimeManager {
    constructor(mainManager) {
        this.mainManager = 0;
        this.curDay = 0;
        this.curTimeScale = 1;
        this.lastTimeTick = Date.now();
    }

    update() {}

    render() {}

    seekCurDay(curDay) {}
}