import { compressSquares } from "../saveAndLoad.js";

// we also will need - 
// clip rendered as an image
// image width and height 
// clip width and height
    
export function saveClip(squares) {
    let compressed = compressSquares(squares);
    let sqArr = compressed[0]
    let orgArr = compressed[1]
    let lsqArr = compressed[2]
    let growthPlanArr = compressed[3]
    let growthPlanComponentArr = compressed[4]
    let growthPlanStepArr = compressed[5]


    let clip = {
            sqArr: sqArr,
            orgArr: orgArr,
            lsqArr: lsqArr,
            growthPlanArr: growthPlanArr,
            growthPlanComponentArr: growthPlanComponentArr,
            growthPlanStepArr: growthPlanStepArr,
        }

}


export function previewClip() {

}

export function loadClip() {

}
