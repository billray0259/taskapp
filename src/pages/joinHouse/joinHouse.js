import React from 'react';
import firestore from "@react-native-firebase/firestore";
import { useState } from "react";
import { View, Text, TextInput } from "react-native";
import { Button } from 'react-native-elements';

import { ButtonPage } from '../../lib/buttonPage';

import { styles } from '../../styles';
import { generateNewOccupant, getAverageEffortScoreGivenTask } from '../../lib/util';

export function JoinHouse({ navigation }) {
    const [houseCode, setHouseCode] = useState('');


    const pressCancel = () => {
        navigation.goBack();
    };

    const pressJoinHouse = () => {
        joinHouse(user, houseCode).then(() => {
            navigation.goBack();
        });
    };

    const buttonLabels = ["Cancel", "Join House"];
    const buttonFunctions = [pressCancel, pressJoinHouse];

    return (
        <ButtonPage
            buttonLabels={buttonLabels}
            buttonFunctions={buttonFunctions}
        >
            <TextInput
                style={styles.input}
                onChangeText={setHouseCode}
                placeholder="House Code"
                ref={input => { houseNameInput = input }}
            />
        </ButtonPage>
    );
}

async function joinHouse(user, houseCode) {

    const [memberDoc, houseDocuments] = await Promise.all([
        firestore().collection("members").doc(user.uid).get(),
        firestore().collection("houses").where("houseCode", "==", houseCode).get()
    ]);

    if (houseDocuments.size < 1) {
        return "Unknown house code";
    } else if (houseDocuments.size > 1) {
        return "Multiple houses with that house code. Please contact the developers. That should be impossible.";
    }

    const member = memberDoc.data();
    const houseDoc = houseDocuments.docs[0];
    const house = houseDoc.data();

    if (house.occupants[memberDoc.id]) {
        return "House already contains member";
    }

    const effortScores = {};
    for (const taskID in house.tasks) {
        effortScores[taskID] = getAverageEffortScoreGivenTask(houseDoc, taskID);
    }

    house.occupants[memberDoc.id] = generateNewOccupant(member.displayName, effortScores);
    // {
    //     displayName: member.displayName,
    //     isActive: true,
    //     activeSeconds: 0,
    //     lastActivated: now,
    //     nSummedPoints: 0,
    //     lastSummedTime: now,
    //     effortScores: effortScores,
    // };

    if (member.houses[houseDoc.id] !== undefined) {
        return "Member already in house";
    }

    member.houses[houseDoc.id] = {
        isActive: true
    };

    await Promise.all([
        firestore().collection("houses").doc(houseDoc.id).update({
            occupants: house.occupants
        }),
        firestore().collection("members").doc(memberDoc.id).update({
            houses: member.houses
        })
    ]).catch(err => {
        console.log(err);
        return "Error joining house";
    });

    return "Successfully joined house";
}