import { ALL_ORGANISMS } from "./globals.js";
import { iterateOnOrganisms } from "./organisms/_orgOperations.js";


const organismMetadataViewerCanvas = document.getElementById("organismMetadataViewer");
var metadataCanvas = organismMetadataViewerCanvas.getContext('2d');

var canvasWidth = 200;
var canvasHeight = 800;

organismMetadataViewerCanvas.width = canvasWidth;
organismMetadataViewerCanvas.height = canvasHeight;

var padding = 2;
var resourceBarHeight = 5;

function organismMetadataViewerMain() {
    // for each organism save a struct that's like 
    var organismMetadatas = new Array();
    metadataCanvas.clearRect(0, 0, canvasWidth, canvasHeight);

    
    iterateOnOrganisms((org) => {
        if (org.type == "plant") {
            var organismMetadata = new Map();
            organismMetadata["waterNutrients"] = org.waterNutrients;
            organismMetadata["dirtNutrients"] = org.dirtNutrients;
            organismMetadata["airNutrients"] = org.airNutrients;
            organismMetadata["lifeCyclePercentage"] = org.getLifeCyclePercentage();
            organismMetadata["currentEnergyPercentage"] = org.getCurrentEnergyPercentage();
            organismMetadata["currentEnergy"] = org.currentEnergy;
            organismMetadata["reproductionEnergy"] = org.reproductionEnergy;
            organismMetadata["reproductionEnergyUnit"] = org.reproductionEnergyUnit;
            organismMetadata["currentHealth"] = org.getCurrentHealth();
            organismMetadata["hovered"] = org.hovered;
            organismMetadatas.push(organismMetadata);
        }
    });

    var curYStartPos = padding;

    organismMetadatas.forEach((organismMetadata) => {
        // nutrient section
        var curPadding = organismMetadata["hovered"] ? padding * 2 : padding;
        var curResourceBarHeight = organismMetadata["hovered"] ? resourceBarHeight * 2 : resourceBarHeight;

        var maxNutrient = Math.max(
            Math.max(
                organismMetadata["waterNutrients"],
                organismMetadata["dirtNutrients"]),
            organismMetadata["airNutrients"]);

        var waterNutrientFrac = organismMetadata["waterNutrients"] / maxNutrient;
        var dirtNutrientFrac = organismMetadata["dirtNutrients"] / maxNutrient;
        var airNutrientFrac = organismMetadata["airNutrients"] / maxNutrient;
        
        metadataCanvas.fillStyle = "#0093AF";
        metadataCanvas.fillRect(
            curPadding,
            curYStartPos,
            (waterNutrientFrac * (canvasWidth - (curPadding * 2))),
            curResourceBarHeight
        );

        curYStartPos += curResourceBarHeight + curPadding;

        metadataCanvas.fillStyle = "#855c48";
        metadataCanvas.fillRect(
            curPadding,
            curYStartPos,
            (dirtNutrientFrac * (canvasWidth - (curPadding * 2))),
            curResourceBarHeight
        );

        curYStartPos += curResourceBarHeight + curPadding;

        metadataCanvas.fillStyle = "#dddddd";
        metadataCanvas.fillRect(
            curPadding,
            curYStartPos,
            (airNutrientFrac * (canvasWidth - (curPadding * 2))),
            curResourceBarHeight
        );
        curYStartPos += curResourceBarHeight + curPadding;

        metadataCanvas.fillStyle = "#00FF00";
        metadataCanvas.fillRect(
            curPadding,
            curYStartPos,
            (organismMetadata["currentEnergyPercentage"] * (canvasWidth - (curPadding * 2))),
            curResourceBarHeight
        );
        curYStartPos += curResourceBarHeight + curPadding;

        metadataCanvas.fillStyle = "#222222";
        metadataCanvas.fillRect(
            curPadding,
            curYStartPos,
            (organismMetadata["lifeCyclePercentage"] * (canvasWidth - (curPadding * 2))),
            curResourceBarHeight
        );
        curYStartPos += curResourceBarHeight + curPadding;

        metadataCanvas.fillStyle = "#FF0000";
        metadataCanvas.fillRect(
            curPadding,
            curYStartPos,
            (organismMetadata["currentHealth"] * (canvasWidth - (curPadding * 2))),
            curResourceBarHeight
        );
        curYStartPos += curResourceBarHeight + curPadding;


    })

}


export { organismMetadataViewerMain };
