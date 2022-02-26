import React from 'react';
import { ListItem, Button } from 'react-native-elements';
import { getPoints, getCyclePercentage } from './assignmentLogic';
import { ButtonGroup } from 'react-native-elements';

export function Assigment({houseDoc, taskID, occupantID, myTask, onComplete, onDecline, onDelay}) {
    const house = houseDoc.data();
    const task = house.tasks[taskID];

    const cyclePercentage = getCyclePercentage(task) * 100;
    const taskPoints = getPoints(house, occupantID, taskID);

    let buttonLabels, buttonFunctions;
    
    if (myTask) {
        buttonLabels = ['Complete', 'Decline', 'Delay'];
        buttonFunctions = [onComplete, onDecline, onDelay];    
    } else {
        buttonLabels = ['Complete', 'Delay'];
        buttonFunctions = [onComplete, onDelay];
    }
    

    return (
        <ListItem
            key={taskID}
        >
            <ListItem.Content>
                <ListItem.Title>
                    {task.name + ": " + Math.round(taskPoints * 100) + " points - " + Math.round(cyclePercentage) + "%"}
                </ListItem.Title>
                <ListItem.Subtitle>{task.description}</ListItem.Subtitle>
                
                <ButtonGroup
                    onPress={(index) => buttonFunctions[index](houseDoc, taskID, occupantID)}
                    buttons={buttonLabels}
                />
            </ListItem.Content>
        </ListItem>
    );
}