import { Assigment } from './assignment';
import { FlatList } from 'react-native';
import React from 'react';

export function AssignmentList({houseDocs, occupantID, assignments, onComplete}) {
    // Renders a list of assignments from multiple houses for a single occupant and occupant.
    
    // assignments = {
    //     houseID: [taskID, taskID, ...],
    //     ...
    // }

    // houseDocs = {
    //     houseID: { houseDoc },
    //     ...
    // }

    const items = [];
    Object.keys(assignments).forEach(houseID => {
        assignments[houseID].forEach(taskID => {
            items.push({
                houseDoc: houseDocs[houseID],
                taskID
            });
        });
    });

    return (
        <FlatList
            data={items}
            renderItem={({item}) => {
                const {houseDoc, taskID} = item;
                return (
                    <Assigment
                        houseDoc={houseDoc}
                        taskID={taskID}
                        occupantID={occupantID}
                        onComplete={onComplete}
                    />
                );
            }}
        />
    ); 
}