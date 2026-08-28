import { loadGD, saveGD, UI_ORGANISM_LINEAGE_MAP } from "../ui/UIData.js";

export const ep = "ep";
export const children = "children";

export function registerLineage(org) {
    let m = loadGD(UI_ORGANISM_LINEAGE_MAP)
    m[org.id] = {
        id: org.id,
        pid: org.parentId,
        ep: org.evolutionParameters,
        time: org.spawnTime,
        children: []
    }
    m[org.parentId]?.children.push(org.id)
}
