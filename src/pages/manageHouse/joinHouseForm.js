import React from 'react';
import firestore from "@react-native-firebase/firestore";
import { useState } from "react";
import { View, Text, TextInput } from "react-native";
import { Button } from 'react-native-elements';

import { styles } from '../../styles';
import { getAverageEffortScoreGivenTask } from '../lib/util';

export function JoinHouseForm(args) {
    const {user, onSubmit} = args;
    const [houseCode, setHouseCode] = useState('');

    return (
        <View>
            <Text style={styles.title}>Join House</Text>
            <View styles={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    onChangeText={setHouseCode}
                    placeholder="House Code"
                    ref={input => { houseNameInput = input }}
                />
                <Button
                    onPress={() => {
                        console.log("Clicked Join House");
                        joinHouse(user, houseCode).then((message) => {
                            onSubmit();
                        });
                    }}
                    title="Join House"
                />
            </View>
        </View>
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

    house.occupants[memberDoc.id] = {
        displayName: member.displayName,
        isActive: true,
        activeSeconds: 0,
        lastActivated: new Date(),
        nSummedPoints: 0,
        lastSummedTime: new Date(),
        effortScores: effortScores,
    };

    if (member.houses[houseDoc.id] !== undefined) {
        return "Member already in house";
    }

    member.houses[houseDoc.id] = {
        isActive: true,
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