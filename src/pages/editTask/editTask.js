import React from 'react';
import firestore from "@react-native-firebase/firestore";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from "react";
import { View, Text, TextInput, ActivityIndicator, Alert } from "react-native";

import { styles } from '../../styles';

import { ButtonPage } from '../../lib/buttonPage';

import { generateRandomCode, getMedianEffortScoreGivenOccupant } from '../../lib/util';


export function EditTask({route, navigation}) {
    const { houseID, taskID } = route.params;
    const [houseDoc, setHouseDoc] = useState();

    if (houseDoc === undefined) {
        firestore().collection("houses").doc(houseID).get().then(function (doc) {
            setHouseDoc(doc);
        });

        return <ActivityIndicator size="large" style={{flex:1}} />
    }

    return (
        <EditTaskForm
            houseDoc={houseDoc}
            taskID={taskID}
            navigation={navigation}
        />
    );
}

/**
 * 
 * @param {houseDoc} DocumentSnapshot of the house that the task belongs to
 * @param {taskID} ID of the task to be edited
 * @returns Form to edit the task with the given ID. Creates a new task if the taskID is undefined.
 */
function EditTaskForm(args) {
    const {houseDoc, taskID, navigation} = args;

    const house = houseDoc.data();
    const isNewTask = taskID === undefined;

    const task = !isNewTask ? house.tasks[taskID] : {
        name: "",
        description: "",
        period: 1,
        lastCompleted: Date.now(),
    };

    const [taskName, setTaskName] = useState(task.name);
    const [taskDescription, setTaskDescription] = useState(task.description);
    const [period, setPeriod] = useState(task.period); // in days
    const [completedDaysAgo, setCompletedDaysAgo] = useState(Math.round((Date.now() - task.lastCompleted) / (1000 * 60 * 60 * 24)));
    const lastCompleted = Date.now() - completedDaysAgo * 1000 * 60 * 60 * 24;

    const onExit = () => {
        navigation.navigate("Tasks", {
            houseID: houseDoc.id,
            refreshParam: true
        });
    }

    const onSubmit = () => {
        if (submitEdit(houseDoc, taskID, taskName, taskDescription, period, lastCompleted)) {
            onExit();
        }
    }

    const onDelete = () => {
        Alert.alert("Delete House", "Are you sure you want to delete this task?", [
            {text: "Cancel", style: "cancel"},
            {text: "Delete", onPress: () => {
                if (deleteTask(houseDoc, taskID)) {
                    onExit();
                }
            }
        }]);
    }

    
    let buttonLabels;
    let buttonFunctions;
    if (isNewTask) {
        buttonLabels = ["Cancel", "Submit"];
        buttonFunctions = [onExit, onSubmit];
    } else {
        buttonLabels = ["Cancel", "Delete", "Submit"];
        buttonFunctions = [onExit, onDelete, onSubmit];
    }

    return (
        <ButtonPage
            buttonLabels={buttonLabels}
            buttonFunctions={buttonFunctions}
        >
            <Text style={styles.label}>Task Name</Text>
            <TextInput
                style={styles.input}
                value={taskName}
                onChangeText={(text) => setTaskName(text)}
                placeholder="Task Name"
            />
            <Text style={styles.label}>Task Description</Text>
            <TextInput
                style={styles.input}
                value={taskDescription}
                onChangeText={(text) => setTaskDescription(text)}
                placeholder="Task Description"
            />
            <Text style={styles.label}>Period (days)</Text>
            <TextInput
                style={styles.input}
                value={period.toString()}
                onChangeText={(text) => setPeriod(text)}
                placeholder="Period (days)"
            />
            <Text style={styles.label}>Last Completed (days ago)</Text>
            <TextInput
                style={styles.input}
                value={completedDaysAgo.toString()}
                onChangeText={(text) => setCompletedDaysAgo(text)}
                placeholder="Last Completed"
            />
        </ButtonPage>
    );
}

function submitEdit(houseDoc, taskID, taskName, taskDescription, period, lastCompleted) {
    if (!validateTask(taskName, taskDescription, period, lastCompleted)) {
        return false;
    }

    const house = houseDoc.data();
    const uuid = generateRandomCode(20, "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789");
    house.tasks[taskID !== undefined ? taskID : uuid] = {
        name: taskName,
        description: taskDescription,
        period: period,
        lastCompleted: lastCompleted
    };
    
    // Set the effort score to the average house effort score if the task is new
    if (taskID === undefined) {
        for (let occupantID in house.occupants) {
            let medianEffortScore = getMedianEffortScoreGivenOccupant(houseDoc, occupantID);
            if (medianEffortScore === null) {
                medianEffortScore = 1;
            }
            // upate the effort score of every occupant
            const occupant = house.occupants[occupantID];
            occupant.effortScores[uuid] = medianEffortScore;
        }
        firestore().collection('houses').doc(houseDoc.id).update({
            tasks: house.tasks,
            occupants: house.occupants
        });
    } else {
        firestore().collection('houses').doc(houseDoc.id).update({
            tasks: house.tasks
        });
    }

    return true;
}

function deleteTask(houseDoc, taskID) {
    // Deletes the task from the house and removes the task's effort scores from the occupants
    // updates the house
    const house = houseDoc.data();
    delete house.tasks[taskID];
    for (let occupantID in house.occupants) {
        delete house.occupants[occupantID].effortScores[taskID];
    }
    firestore().collection('houses').doc(houseDoc.id).update({
        tasks: house.tasks,
        occupants: house.occupants
    });

    return true;
}

function validateTask(name, taskDescription, period, lastCompleted) {
    period = parseFloat(period);
    lastCompleted = parseInt(lastCompleted);

    if (name === "") {
        alert("Task name cannot be empty");
        return false;
    }
    if (taskDescription === "") {
        alert("Task description cannot be empty");
        return false;
    }
    if (period <= 0) {
        alert("Period must be greater than 0");
        return false;
    }
    if (lastCompleted < 0) {
        alert("Last completed cannot be negative");
        return false;
    }
    if (isNaN(period) || isNaN(lastCompleted)) {
        alert("Period and last completed must be numbers");
        return false;
    }
    return true;
}
