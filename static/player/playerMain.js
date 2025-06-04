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
    isPlayerRunning() ? player.tick() : null;
}
export function renderPlayer() {
    isPlayerRunning() ? player.render() : null;
}