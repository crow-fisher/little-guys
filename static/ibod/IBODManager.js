import { loadGD, saveUI, UI_IBOD_PLAYERUUID } from "../ui/UIData.js";

let IBODPlayerUuid, IBODPubKey, IBODPrivKey;

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
export function createIBODEvent() {
}