import React from 'react';
import firestore from "@react-native-firebase/firestore";
import { useState, useContext } from "react";
import { Text, TextInput } from "react-native";

import { styles } from '../../styles';
import { ButtonPage } from '../../lib/buttonPage';

import { AuthContext } from '../../contexts/authContext';
import { generateNewOccupant } from '../../lib/util';


export function CreateHouse({ navigation }) {
    const [user, setUser] = useContext(AuthContext);
    const [houseName, setHouseName] = useState('');

    const onPressCancel = () => {
        navigation.goBack();
    }

    const onPressCreateHouse = () => {
        createHouse(user, houseName).then(() => {
            navigation.goBack();
        });
    }

    const buttonLabels = ["Cancel", "Create House"]
    const buttonFunctions = [onPressCancel, onPressCreateHouse]
    
    return (
        <ButtonPage
            buttonLabels={buttonLabels}
            buttonFunctions={buttonFunctions}        
        >
            <Text style={styles.label}>House Name</Text>
            <TextInput
                style={styles.input}
                onChangeText={setHouseName}
                placeholder="House Name"
            />
        </ButtonPage>
    );
}

async function createHouse(user, houseName) {
    const houseCode = generateRandomCode(6);
    const memberDoc = await firestore().collection("members").doc(user.uid).get();
    const member = memberDoc.data();

    await firestore().collection("houses").add({
        houseName: houseName,
        houseCode: houseCode,
        occupants: {
            [user.uid]: generateNewOccupant(member.displayName)
        },
        tasks: {},
        records: {},
    }).then(async (house) => {
        addActiveHouseToMember(house, memberDoc);
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
