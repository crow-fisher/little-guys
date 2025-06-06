import { getCanvasSquaresY } from "../canvas.js";
import { Player } from "./player.js";

let player = null;

export function startPlayerMain() {
    player = new Player();
}

export function stopPlayerMain() {
    player = null;
}

export function isPlayerRunning() {
    return player != null;
}

export function playerKeyDown(key) {
    player.handleKeyDown(key);
}

export function playerKeyUp(key) {
    player.handleKeyUp(key);
}

export function playerTick() {
    if (isPlayerRunning()) {
        player.tick();
        if (player.posY > getCanvasSquaresY()) {
            stopPlayerMain();
            startPlayerMain();
        }
    }
}
export function renderPlayer() {
    isPlayerRunning() ? player.render() : null;
}