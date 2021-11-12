

export function generateNewOccupant(memberDisplayName, effortScores) {
    if (effortScores === undefined) {
        effortScores = {};
    }

    const now = Date.now()/1000;

    return {
        displayName: memberDisplayName,
        nSummedPoints: 0,
        lastSummedTime: now,
        activeSeconds: 0,
        lastActivated: now,
        isActive: true,
        effortScores: effortScores,
    }
}

export function generateRandomCode(length, characters) {
    if (characters === undefined) {
        characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    }
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charactersLength);
        result += characters.charAt(randomIndex);
    }
    return result;
}

// include this in the code
export async function toggleUserActiveStatus(houseID, userID) {
    const houseDoc = await firestore.collection("houses").doc(houseID).get();
    const house = houseDoc.data();
    const isActive = house.occupants[userID].isActive;

    if (isActive) {
        const lastActivated = house.occupants[userID].lastActivated;
        const activeSeconds = house.occupants[userID].activeSeconds;
        const now = new Date();
        const ellapsedSeconds = (now.getTime() - lastActivated.getTime()) / 1000;
        const newActiveSeconds = activeSeconds + ellapsedSeconds;
        await firestore.collection("houses").doc(houseID).update({
            ["occupants." + userID + ".activeSeconds"]: newActiveSeconds,
            ["occupants." + userID + ".isActive"]: false,
        });
    } else {
        await firestore.collection("houses").doc(houseID).update({
            ["occupants." + userID + ".lastActivated"]: now,
            ["occupants." + userID + ".isActive"]: true,
        });
    }
}


export function getAverageEffortScoreGivenTask(houseDoc, taskID) {
    const occupants = houseDoc.get("occupants");
    let totalEffortScore = 0;
    // for every occupant in occupants get their effort score for the task and add it to totalEffortScore
    for (let occupantID in Object.keys(occupants)) {
        const occupant = occupants[occupantID];
        const effortScore = occupant.effortScores[taskID];
        totalEffortScore += effortScore;
    }

    const denominator = occupants.length;
    if (denominator === 0) {
        return null;
    }
    return totalEffortScore / denominator;
}


export function getAverageEffortScoreGivenOccupant(houseDoc, occupantID) {
    const occupant = houseDoc.get("occupants")[occupantID];
    const effortScores = occupant.effortScores; // maps taskID to effortScore
    let totalEffortScore = 0;

    // for every task in the effortScores map, add the effortScore to totalEffortScore
    for (let taskID in effortScores) {
        const effortScore = effortScores[taskID];
        totalEffortScore += effortScore;
    }

    const denominator = Object.keys(effortScores).length;
    if (denominator === 0) {
        return null;
    }
    return totalEffortScore/denominator;
}

export function getMedianEffortScoreGivenOccupant(houseDoc, occupantID) {
    const occupant = houseDoc.get("occupants")[occupantID];
    const effortScores = occupant.effortScores; // maps taskID to effortScore
    const taskIDs = Object.keys(effortScores)

    if (taskIDs.length === 0) {
        return null;
    }

    const sortedTaskIDs = taskIDs.sort((a, b) => effortScores[a] - effortScores[b]);
    const medianIndex = Math.floor(sortedTaskIDs.length/2);
    return effortScores[sortedTaskIDs[medianIndex]];
}


export function getAverageEffortScoreOverHouse(houseDoc) {
    const occupants = houseDoc.get("occupants"); // maps occupantID to occupant
    let totalEffortScore = 0;
    // for every occupant in occupants get their effort score for the task and add it to totalEffortScore
    for (let occupantID in Object.keys(occupants)) {
        const occupant = occupants[occupantID];
        const effortScores = occupant.effortScores; // maps taskID to effortScore
        for (let taskID in effortScores) {
            const effortScore = effortScores[taskID];
            totalEffortScore += effortScore;
        }
    }

    // divide totalEffortScore by the number of occupants * the number of tasks
    const denominator = occupants.length * Object.keys(effortScores).length;
    if (denominator === 0) {
        return null;
    }
    const averageEffortScore = totalEffortScore / denominator;
    return averageEffortScore;
}