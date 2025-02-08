class Cloud {
    constructor(centerX, centerY, sizeX, sizeY, startDay, duration, rainFallAmount) {
        this.centerX = centerX;
        this.centerY = centerY;
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.startDay = startDay; 
        this.duration = duration;
        this.rainFallAmount = rainFallAmount;

        this.startElipse = [];
        this.centerElipse = [];
        this.endElipse = [];
        this.initCloud();
    }

    initCloud() {
        

    }
}

