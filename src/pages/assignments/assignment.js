import React from 'react';
import { ListItem, Button } from 'react-native-elements';
import { getPoints } from './assignmentLogic';

export function Assigment(houseDoc, taskID, occupantID, onComplete) {
    const house = houseDoc.data();
    const task = house.tasks[taskID];
    const nowDays = Date.now() / 1000 / 60 / 60 / 24;
    const cyclePercentage = 100 * (nowDays - task.lastCompleted) / task.period;
    const taskPoints = getPoints(house, occupantID, taskID);

    return (
        <ListItem
            key={taskID}
        >
            <ListItem.Content>
                <ListItem.Title>{task.name + ": " + Math.round(taskPoints * 100) + " points - " + Math.round(cyclePercentage) + "%"}</ListItem.Title>
                <ListItem.Subtitle>{task.description}</ListItem.Subtitle>
                <Button
                    title="Complete"
                    onPress={onComplete}
                />
            </ListItem.Content>
        </ListItem>
    );
}