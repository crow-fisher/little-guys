import { getFrameDt } from "./climate/time.js";

const jobLastTimeMap = new Map();
const activeJobArr = new Array();
let pendingJobArr = new Array();

export function addTask(funcName, func, inHowManyFrames) {
    if (!jobLastTimeMap.has(funcName))
        jobLastTimeMap.set(funcName, 0);
    pendingJobArr.push([funcName, func, inHowManyFrames]);
}

export function clearTimeouts() {
    jobLastTimeMap.clear();
    activeJobArr.length = 0;
    pendingJobArr.length = 0;
}

export function prepareTickJobs() {
    pendingJobArr.sort((a, b) => a[2] - b[2]);
    let pendingJobCurIdx;
    for (pendingJobCurIdx = 0; pendingJobCurIdx < pendingJobArr.length; pendingJobCurIdx++) {
        let jobArr = pendingJobArr[pendingJobCurIdx];
        let funcName = jobArr[0];
        let func = jobArr[1];
        let inHowManyFrames = jobArr[2];
        if (inHowManyFrames == 0) {
            activeJobArr.push([funcName, func])
        } else {
            break;
        }
    };
    pendingJobArr = pendingJobArr.slice(activeJobArr.length);
    pendingJobArr.forEach((jobArr) => jobArr[2] = Math.max(0, jobArr[2] - 1));
}
export function completeActiveJobs() {
    activeJobArr.forEach((job) => {
        let start = performance.now();
        job[1]();
        let end = performance.now();
        jobLastTimeMap.set(job[0], end - start);
    });
    activeJobArr.length = 0;
}
