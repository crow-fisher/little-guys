import { COLOR_VERY_FUCKING_RED } from "../../colors.js";
import { CoordinateSet } from "../../rendering/model/CoordinateSet.js";
import { LineRenderJob } from "../../rendering/model/LineRenderJob.js";
import { PointLabelRenderJob } from "../../rendering/model/PointLabelRenderJob.js";

export class IBODEvent {
    constructor(player, execDay, pos, data, signPlayer = null, signSignature = null) {
        this.player = player;
        this.execDay = execDay;
        this.pos = pos;
        this.data = data; 
        this.signPlayer = signPlayer;
        this.sigNSignature = signSignature;
        this.csr = new CoordinateSet();
        this.csv = new CoordinateSet();
        this.rj = new LineRenderJob([0, 0, 0], [0, 0, 0], 0, 4, COLOR_VERY_FUCKING_RED);
    }
}