import { loadGD, saveGD, UI_ORGANISM_LINEAGE_MAP } from "../ui/UIData.js";

export const ep = "ep";
export const children = "children";
export function registerLineage(org) {
    let m = loadGD(UI_ORGANISM_LINEAGE_MAP)
    m[org.id] = {
        id: org.id,
        ep: org.evolutionParameters,
        children: []
    }
    let p = m[org.parentId];
    m[org.parentId]?.children.push(org.id)
}

/*

{
    ep: [n, n],
    children:
            [
            }
            ]
}

*/