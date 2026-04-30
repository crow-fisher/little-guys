export class IBODEvent {
    constructor(player, execDay, data, signPlayer = null, signSignature = null) {
        this.player = player;
        this.execDay = execDay;
        this.data = data; 
        this.signPlayer = signPlayer;
        this.sigNSignature = signSignature;
    }
}