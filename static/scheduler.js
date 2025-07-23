import { getFrameDt } from "./climate/time.js";

const jobLastTimeMap = new Map();
const activeJobArr = new Array();
const pendingJobArr = new Array();

let frameStartTime = Date.now();

export function addTask(funcName, func, priority) {
    if (!jobLastTimeMap.has(funcName))
        jobLastTimeMap.set(funcName, 0);
    pendingJobArr.push([funcName, func, priority]);
}

export function schedulerTickStart() {
    frameStartTime = performance.now();
}

export function prepareTickJobs() {
    let timeAllocated = 1;

    pendingJobArr.forEach((jobArr) => {
        let funcName = jobArr[0];
        let func = jobArr[1];
        let priority = jobArr[2];
        let funcTime = jobLastTimeMap.get(funcName);

        if (priority == 0) {
            activeJobArr.push([funcName, func])
        }
        jobArr[2] -= 1;
        
        if (timeAllocated < 0) {
            return;
        }

        if ((performance.now() - (frameStartTime + funcTime)) < timeAllocated) {
            activeJobArr.push([funcName, func])
            timeAllocated -= funcTime;
        }
    });
}
export function completeActiveJobs() {
    activeJobArr.forEach((job) => {
        let start = performance.now();
        job[1]();
        let end = performance.now();
        jobLastTimeMap.set(job[0], end - start);
    });
}
