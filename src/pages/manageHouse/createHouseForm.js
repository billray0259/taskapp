import React from 'react';
import firestore from "@react-native-firebase/firestore";
import { useState } from "react";
import { View, Text, TextInput } from "react-native";
import { Button } from 'react-native-elements';

import { styles } from '../../styles';
import { generateNewOccupant } from '../../lib/util';

export function CreateHouseForm(args) {
    const {user, onSubmit} = args;
    const [houseName, setHouseName] = useState('');

    return (
        <View>
            <Text style={styles.title}>Create House</Text>
            <View styles={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    onChangeText={setHouseName}
                    placeholder="House Name"
                />
                <Button
                    onPress={() => {
                        console.log("Clicked Create House");
                        createHouse(user, houseName).then(onSubmit);
                    }}
                    title="Create House"
                />
            </View>
        </View>
    );
}

async function createHouse(user, houseName) {
    const houseCode = generateRandomCode(6);
    const memberDoc = await firestore().collection("members").doc(user.uid).get();
    const member = memberDoc.data();

    firestore().collection("houses").add({
        houseName: houseName,
        houseCode: houseCode,
        occupants: {
            [user.uid]: generateNewOccupant(member.displayName)
        },
        tasks: {},
        records: {},
    }).then(async (house) => {
        addActiveHouseToMember(house, member);
    });
}

async function addActiveHouseToMember(house, member) {
    // const member = await firestore().collection("members").doc(userId).get();
    const houses = member.data().houses;
    houses[house.id] = {
        isActive: true,
    };
    firestore().collection("members").doc(member.id).update({
        houses: houses,
    });
}

function generateRandomCode(length, characters) {
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
