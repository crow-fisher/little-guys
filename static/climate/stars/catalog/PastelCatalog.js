import { calculateStatistics } from "../../../common.js";
import { getStarHandler } from "../../../main.js";
import { CatalogHandlerBase } from "./CatalogHandlerBase.js";

export class PastelCatalog extends CatalogHandlerBase {
    constructor() {
        super(null, null);
        this.name = "PastelCatalog";
    }

    loadData(callback) {
        fetch("./static/climate/stars/catalogSource/pastel/pastel.dat").then((resp) => resp.text())
            .then((text) => this.loadPASTEL(text))
            .then(callback);
    }

    loadPASTEL(text) {
        let rows = text.split("\n");
        this.sh = getStarHandler();
        for (let i = 0; i < rows.length; i++) {
            this.loadPASTELRow(rows.at(i));
        }
    }

    loadPASTELRow(row) {
        try {
            let designation = row.substr(0, 32);
            let feH = Number.parseFloat(row.substr(166, 6));

            if (designation.substr(0, 2) === "HD" && !isNaN(feH)) {
                let designationParts = designation.match(/\S+/g)
                let hdId = Number.parseInt(designationParts[1]);
                if (this.sh.hdMap.has(hdId)) {
                    this.sh.hdMap.get(hdId).setFeH(feH);
                }
            }
        } catch (error) {
        }
    }
}