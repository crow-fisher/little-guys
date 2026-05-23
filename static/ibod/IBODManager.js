import { copyVecValue } from "../world/climate/stars/matrix.js";
import { getCurDay } from "../world/time/time.js";
import { renderPoint } from "../rendering/camera.js";
import { addRenderJob } from "../rendering/rasterizer.js";
import { loadGD, saveUI, UI_IBOD_PLAYERUUID } from "../ui/UIData.js";
import { IBODEvent } from "./model/IBODEvent.js";

let IBODPlayerUuid, IBODPubKey, IBODPrivKey;

let ibodEvents = new Array();

export function initializeIBODContext() {
    if (IBODPlayerUuid != null) {
        return;
    }
    IBODPlayerUuid = loadGD(UI_IBOD_PLAYERUUID);
    IBODPubKey = loadGD(UI_IBOD_PUBKEY);
    IBODPrivKey = loadGD(UI_IBOD_PRIVKEY);

    if (IBODPlayerUuid == null) {
        saveUI(UI_IBOD_PLAYERUUID, self.crypto.randomUUID())
        saveUI(UI_IBOD_PUBKEY)
        saveUI(UI_IBOD_PRIVKEY)
    }
}
export function IBODSeedEvent(org, seed) {
    let seedEvent = new IBODEvent(
        IBODPlayerUuid,
        getCurDay(),
        structuredClone(org.greenLifeSquares.at(-1).cartesian_tl),
        {
            "seedId": seed.id,
            "parentId": org.id,
            "parentSpawnTime": org.spawnTime,
            "parentAge": org.age,
            "parentGrowthProgress": org.growthProgress, 
            "parentWaterPressure": org.waterPressure,
            "parentLightLevel": org.lightlevel
    });
    ibodEvents.push(seedEvent);
}

export function renderIBODEvents() {
    return;
    if (ibodEvents.length == 0) {
        return;
    }
    let zKey = "parentLightLevel";

    let min = ibodEvents.at(0).data[zKey];
    let max = ibodEvents.at(0).data[zKey];
    for (let i = 0; i < ibodEvents.length; i++) {
        min = Math.min(min, ibodEvents.at(i).data[zKey]);
        max = Math.max(max, ibodEvents.at(i).data[zKey]);
    }


    let ie, cz = 0, cur = [0, 0, 0];
    for (let i = 0; i < ibodEvents.length; i++) {
        ie = ibodEvents.at(i);
        copyVecValue(ie.pos, cur);
        cur[2] -= cz;
        cz += .01;
        ie.csr.setWorld(cur);
        cur[1] += ((ie.data[zKey] - min) / (max - min)) * 10;
        ie.csv.setWorld(cur);
        copyVecValue(ie.csr.renderScreen, ie.rj.v1)
        copyVecValue(ie.csv.renderScreen, ie.rj.v2)
        addRenderJob(ie.rj, true);
    }
}

