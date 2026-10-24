// 'renderMode'
export const DO_K_RENDERMODE = "renderMode"
export const DO_K_RENDERMODE_BWPRINT = "bwprint"

export const DO_K_RENDERMODE_OPTIONS = [DO_K_RENDERMODE_BWPRINT]

export class DebugOptions {
    constructor() {
        let params = new URLSearchParams(document.location.search);
        if (params.has(DO_K_RENDERMODE)) {
            if (DO_K_RENDERMODE_OPTIONS.indexOf(params.get(DO_K_RENDERMODE) >= 0)) {
                this.renderMode = params.get(DO_K_RENDERMODE);
            }
        }
    }
}