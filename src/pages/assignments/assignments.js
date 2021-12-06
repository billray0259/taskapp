
import 'react-native-gesture-handler';
import React from 'react';
import firestore from "@react-native-firebase/firestore";
import { useState, useContext } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, SectionList } from 'react-native';

import { Assigment } from './assignment';
import { getAssignments, getPoints } from './assignmentLogic';

import { cloneObject } from '../../lib/util';
import { styles } from '../../styles';
import { AuthContext } from '../../contexts/authContext';

export function Assignments({ navigation }) {
    const [user, setUser] = useContext(AuthContext);
    const [memberDoc, setMemberDoc] = useState();
    const [houseDocs, setHouseDocs] = useState();


    if (memberDoc === undefined) {
        firestore().collection("members").doc(user.uid).get().then(function (doc) {
            setMemberDoc(doc);
        });
        return <ActivityIndicator size="large" style={{flex:1}} />
    }


    if (houseDocs === undefined) {
        const memberHouses = memberDoc.data().houses;
        const houseIDs = Object.keys(memberHouses);
        const promises = [];

        houseIDs.forEach(houseID => {
            if (memberHouses[houseID].isActive) {
                promises.push(firestore().collection("houses").doc(houseID).get());
            }
        });
        
        Promise.all(promises).then(docs => {
            const houseDocs = {};
            docs.forEach(doc => {
                houseDocs[doc.id] = doc;
            });
            setHouseDocs(houseDocs);
        });

        return <ActivityIndicator size="large" style={{flex:1}} />
    }

    if (Object.keys(houseDocs).length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>You are not a member of any houses.</Text>
            </View>
        );
    }

    // assignments:
    //     houseID 0:
    //         OccupantID 0: taskID array
    //         OccupantID 1: taskID array
    //     houseID 1:
    //         OccupantID 0: taskID array
    //         OccupantID 1: taskID array

    const assignments = {}

    Object.keys(houseDocs).forEach(houseID => {
        const house = houseDocs[houseID].data();
        assignments[houseID] = getAssignments(house);
    });

    const myAssignments = [];
    const otherAssignments = [];
    

    Object.keys(assignments).forEach(houseID => {
        const houseAssignments = assignments[houseID];
        myAssignments[houseID] = []; 
        otherAssignments[houseID] = [];
        Object.keys(houseAssignments).forEach(occupantID => {
            if (occupantID === user.uid) {
                houseAssignments[occupantID].forEach(taskID => {
                    myAssignments.push({houseID, taskID});
                });
            } else {
                houseAssignments[occupantID].forEach(taskID => {
                    otherAssignments.push({houseID, taskID});
                });
            }
        });
    });

    // Show two lists
    // My Assignments
    // Other Assignments

    function onComplete(houseDoc, taskID, occupantID) {
        const house = houseDoc.data();
        // update task lastCompleted
        const houseClone = cloneObject(house);
        houseClone.tasks[taskID].lastCompleted = Date.now() / 1000 / 60 / 60 / 24;
        const taskPoints = getPoints(house, occupantID, taskID);

        // add points to user
        houseClone.occupants[occupantID].points += taskPoints;
        // update user effort score
        const currentEffortScore = houseClone.occupants[occupantID].effortScores[taskID];
        const newEffortScore = currentEffortScore * 0.9;
        houseClone.occupants[occupantID].effortScores[taskID] = newEffortScore;

        // update house
        firestore().collection("houses").doc(houseDoc.id).set(houseClone).then(async () => {
            const newHouseDocs = {};
            Object.keys(houseDocs).forEach(houseID => {
                newHouseDocs[houseID] = houseDocs[houseID];
            });
            newHouseDocs[houseDoc.id] = await firestore().collection("houses").doc(houseDoc.id).get();
            setHouseDocs(newHouseDocs);
        });
    }

    return (
        <SectionList
            sections={[
                {title: "My Assignments", data: myAssignments},
                {title: "Other Assignments", data: otherAssignments}
            ]}
            renderSectionHeader={({section}) => {
                return (
                    <Text style={styles.title}>
                        {section.title}
                    </Text>
                );
            }}
            renderItem={({item}) => {
                return (
                    <Assigment
                        houseDoc={houseDocs[item.houseID]}
                        taskID={item.taskID}
                        occupantID={user.uid}
                        onComplete={onComplete}
                    />
                );
            }}
        />
    );
}
