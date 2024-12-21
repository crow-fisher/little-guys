import { ALL_ORGANISMS } from "./globals.js";
import { iterateOnOrganisms } from "./organisms/_orgOperations.js";


const organismMetadataViewerCanvas = document.getElementById("organismMetadataViewer");
var metadataCanvas = organismMetadataViewerCanvas.getContext('2d');

var canvasWidth = 500;
var canvasHeight = 1600;

organismMetadataViewerCanvas.width = canvasWidth;
organismMetadataViewerCanvas.height = canvasHeight;

var padding = 10;
var resourceBarHeight = 25;

function organismMetadataViewerMain() {
    // for each organism save a struct that's like 
    var organismMetadatas = new Array();
    metadataCanvas.clearRect(0, 0, canvasWidth, canvasHeight);
    
    iterateOnOrganisms((org) => {
        var organismMetadata = new Map();
        organismMetadata["waterNutrients"] = org.waterNutrients;
        organismMetadata["dirtNutrients"] = org.dirtNutrients;
        organismMetadata["airNutrients"] = org.airNutrients;
        organismMetadata["lifeCyclePercentage"] = org.getLifeCyclePercentage();
        organismMetadata["currentEnergyPercentage"] = org.getCurrentEnergyPercentage();
        organismMetadata["currentEnergy"] = org.currentEnergy;
        organismMetadata["reproductionEnergy"] = org.reproductionEnergy;
        organismMetadata["reproductionEnergyUnit"] = org.reproductionEnergyUnit;
        organismMetadatas.push(organismMetadata);
    });

    var curYStartPos = padding;

    organismMetadatas.forEach((organismMetadata) => {
        // nutrient section
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
            padding,
            curYStartPos,
            (waterNutrientFrac * (canvasWidth - (padding * 2))),
            resourceBarHeight
        );

        curYStartPos += resourceBarHeight + padding;

        metadataCanvas.fillStyle = "#855c48";
        metadataCanvas.fillRect(
            padding,
            curYStartPos,
            (dirtNutrientFrac * (canvasWidth - (padding * 2))),
            resourceBarHeight
        );

        curYStartPos += resourceBarHeight + padding;

        metadataCanvas.fillStyle = "#dddddd";
        metadataCanvas.fillRect(
            padding,
            curYStartPos,
            (airNutrientFrac * (canvasWidth - (padding * 2))),
            resourceBarHeight
        );
        curYStartPos += resourceBarHeight + padding;

        metadataCanvas.fillStyle = "#00FF00";
        metadataCanvas.fillRect(
            padding,
            curYStartPos,
            (organismMetadata["currentEnergyPercentage"] * (canvasWidth - (padding * 2))),
            resourceBarHeight
        );
        curYStartPos += resourceBarHeight + padding;

        metadataCanvas.fillStyle = "#222222";
        metadataCanvas.fillRect(
            padding,
            curYStartPos,
            (organismMetadata["lifeCyclePercentage"] * (canvasWidth - (padding * 2))),
            resourceBarHeight
        );
        curYStartPos += resourceBarHeight + padding;


    })

}


export { organismMetadataViewerMain };
