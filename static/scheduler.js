import { getFrameDt } from "./climate/time.js";

const jobLastTimeMap = new Map();
const activeJobArr = new Array();
let pendingJobArr = new Array();

export function addTask(funcName, func, priority) {
    if (!jobLastTimeMap.has(funcName))
        jobLastTimeMap.set(funcName, 0);
    pendingJobArr.push([funcName, func, priority]);
}

export function clearTimeouts() {
    jobLastTimeMap.clear();
    activeJobArr.length = 0;
    pendingJobArr.length = 0;
}

export function prepareTickJobs() {
    let timeAllocated = 1;
    pendingJobArr.sort((a, b) => a[2] - b[2]);

    console.log("prepareTickJobs: ", activeJobArr.length, ", pending jobs: " + pendingJobArr.length);

    let pendingJobCurIdx;
    for (pendingJobCurIdx = 0; pendingJobCurIdx < pendingJobArr.length; pendingJobCurIdx++) {
        let jobArr = pendingJobArr[pendingJobCurIdx];

        let funcName = jobArr[0];
        let func = jobArr[1];
        let priority = jobArr[2];
        let funcTime = jobLastTimeMap.get(funcName);

        if (priority == 0) {
            activeJobArr.push([funcName, func])
        }
        activeJobArr.push([funcName, func])
        timeAllocated -= funcTime;

        if (timeAllocated < 0) {
            break;
        }
    };
    pendingJobArr = pendingJobArr.slice(pendingJobCurIdx + 1);
    pendingJobArr.forEach((jobArr) => jobArr[2] = Math.max(0, jobArr[2] - 1));

}
export function completeActiveJobs() {
    console.log("completeActiveJobs: ", activeJobArr.length, ", pending jobs: " + pendingJobArr.length);
    
    activeJobArr.forEach((job) => {
        let start = performance.now();
        job[1]();
        let end = performance.now();
        jobLastTimeMap.set(job[0], end - start);
    });
    activeJobArr.length = 0;
}
