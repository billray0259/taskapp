import { cloneObject } from '../../lib/util';
import firestore from "@react-native-firebase/firestore";

export function getCyclePercentage(task) {
    const nowDays = Date.now() / 1000 / 60 / 60 / 24;
    const timeSinceLastCompleted = nowDays - task.lastCompleted;
    const percentage = timeSinceLastCompleted / task.period;
    return percentage;
}

export function splitTasks(house) {
    // splits the tasks into two groups
    // `isolatedTasks` are the tasks that are > 75% through their cycle
    // `otherTasks` are the task that are < 75% through their cycle
    
    const tasksIDs = Object.keys(house.tasks);
    const isolatedTasks = {};
    const otherTasks = {};
    tasksIDs.forEach(taskID => {
        const task = house.tasks[taskID];
        const percentage = getCyclePercentage(task)
        if (percentage > 0.75) {
            isolatedTasks[taskID] = task;
        } else {
            otherTasks[taskID] = task;
        }
    });
    return {isolatedTasks, otherTasks};
}


export function findMinOccupantIDPointsPerDay(house) {
    const occupantIDs = Object.keys(house.occupants);
    const nowDays = Date.now() / 1000 / 60 / 60 / 24;

    let minPointPerDay = Infinity;
    let minPointPerDayID = null;
    occupantIDs.forEach(occupantID => {
        const occupant = house.occupants[occupantID];

        if (!occupant.isActive) {
            return;
        }

        const points = occupant.points;
        const activeDays = occupant.activeTime + (nowDays - occupant.lastActivated);
        const pointPerDay = points / activeDays;

        if (pointPerDay < minPointPerDay) {
            minPointPerDay = pointPerDay;
            minPointPerDayID = occupantID;
        }
    });
    return minPointPerDayID;
}


export function normalizeOccupantEffortScores(occupant) {
    const normOccupant = cloneObject(occupant);
    const taskIDs = Object.keys(normOccupant.effortScores);
    let totalEffort = 0;
    taskIDs.forEach(taskID => {
        const effortScore = normOccupant.effortScores[taskID];
        totalEffort += effortScore;
    });
    const averageEffort = totalEffort / taskIDs.length;
    taskIDs.forEach(taskID => {
        const effortScore = normOccupant.effortScores[taskID];
        normOccupant.effortScores[taskID] = effortScore / averageEffort;
    });
    return normOccupant;
}


export function normalizeHouseEffortScores(house) {
    const normHouse = cloneObject(house);
    const occupantIDs = Object.keys(normHouse.occupants);
    occupantIDs.forEach(occupantID => {
        normHouse.occupants[occupantID] = normalizeOccupantEffortScores(normHouse.occupants[occupantID]);
    });
    return normHouse;
}


export function getPoints(house, occupantID, taskID) {
    const normHouse = normalizeHouseEffortScores(house);
    const occupantIDs = Object.keys(normHouse.occupants);

    let totalEffort = 0;
    let otherOccupantCount = 0;
    occupantIDs.forEach(otherOccupantID => {
        if (otherOccupantID === occupantID) {
            return;
        }
        const otherOccupant = normHouse.occupants[otherOccupantID];
        const otherOccupantEffort = otherOccupant.effortScores[taskID];
        totalEffort += otherOccupantEffort;
        otherOccupantCount++;
    });
    const averageEffortScore = totalEffort / otherOccupantCount;
    return averageEffortScore;
}


export function valueAdded(house, occupantID, taskID) {
    const normOccupant = normalizeOccupantEffortScores(house.occupants[occupantID]);

    const normOccupantEffort = normOccupant.effortScores[taskID];
    const averageNormalizedEffort = getPoints(house, occupantID, taskID);

    return averageNormalizedEffort - normOccupantEffort;
}


export function getAssignments(house) {
    // Returns map of occupantID -> taskID array
    // Maps null -> taskID array of tasks that are not assigned

    const houseClone = cloneObject(house);
    const { isolatedTasks, otherTasks } = splitTasks(houseClone);
    const assignments = {};

    assignments[null] = []; // Assign other tasks to null (no one is assigned them)
    Object.keys(otherTasks).forEach(taskID => {
        assignments[null].push(taskID);
    });

    while (Object.keys(isolatedTasks).length > 0) {
        const taskIDs = Object.keys(isolatedTasks);
        const minOccupantID = findMinOccupantIDPointsPerDay(houseClone);

        let maxValueAdded = -Infinity;
        let maxValueAddedTaskID = null;

        taskIDs.forEach(taskID => {
            const value = valueAdded(houseClone, minOccupantID, taskID);
            if (value > maxValueAdded) {
                maxValueAdded = value;
                maxValueAddedTaskID = taskID;
            }
        });

        if (assignments[minOccupantID] === undefined) {
            assignments[minOccupantID] = [];
        }
        assignments[minOccupantID].push(maxValueAddedTaskID);

        houseClone.occupants[minOccupantID].points += getPoints(houseClone, minOccupantID, maxValueAddedTaskID);

        delete isolatedTasks[maxValueAddedTaskID];
    }
    return assignments;
}

export async function completeTask(houseDoc, occupandID, taskID) {
    const occupantID = user.uid;
    const house = houseDoc.data();
    // update task lastCompleted
    const houseClone = cloneObject(house);
    houseClone.tasks[taskID].lastCompleted = Date.now() / 1000 / 60 / 60 / 24;
    const taskPoints = getPoints(house, occupantID, taskID);

    // add points to user
    houseClone.occupants[occupantID].points += taskPoints;

    // update user effort score by reducing score by 10%
    const currentEffortScore = houseClone.occupants[occupantID].effortScores[taskID];
    const newEffortScore = currentEffortScore * 0.9;
    houseClone.occupants[occupantID].effortScores[taskID] = newEffortScore;

    return await firestore().collection("houses").doc(houseDoc.id).set(houseClone).then(async () => {
        return firestore().collection("houses").doc(houseDoc.id).get();
    });
}

export async function declineTask(houseDoc, occupantID, taskID) {
    // Increase the effort score of the task until it is no longer assigned to the occupant
    // Returns a Promise<DocumentSnapshot<>> of the updated house
    
    const house = houseDoc.data();
    const houseClone = cloneObject(house);
    let assignments = getAssignments(houseClone);
    // check if taskID is in assignments[occupantID]
    while (assignments[occupantID] !== undefined && assignments[occupantID].indexOf(taskID) !== -1) {
        houseClone.occupants[occupantID].effortScores[taskID] *= 1.1;
        assignments = getAssignments(houseClone);
    }

    return await firestore().collection("houses").doc(houseDoc.id).set(houseClone).then(async () => {
        return firestore().collection("houses").doc(houseDoc.id).get();
    });
}