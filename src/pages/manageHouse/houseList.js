import firestore from "@react-native-firebase/firestore";
import React, { useState } from "react";
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from "react-native";
import { ListItem } from "react-native-elements"
import { CheckBox } from "react-native-elements/dist/checkbox/CheckBox";


function HouseListItem(args) {
    const {user, houseDoc, onPress} = args;
    const house = houseDoc.data();
    const [isActive, setIsActive] = useState(house.occupants[user.uid].isActive);
    
    async function toggleUserActiveStatus(houseID, userID) {
        const houseDoc = await firestore().collection("houses").doc(houseID).get();
        const house = houseDoc.data();
        const isActive = house.occupants[userID].isActive;
    
        if (isActive) {
            const lastActivated = house.occupants[userID].lastActivated;
            const activeSeconds = house.occupants[userID].activeSeconds;
            const now = new Date();
            const ellapsedSeconds = (now.getTime() - lastActivated.getTime()) / 1000;
            const newActiveSeconds = activeSeconds + ellapsedSeconds;
            await firestore().collection("houses").doc(houseID).update({
                ["occupants." + userID + ".activeSeconds"]: newActiveSeconds,
                ["occupants." + userID + ".isActive"]: false,
            });
        } else {
            await firestore().collection("houses").doc(houseID).update({
                ["occupants." + userID + ".lastActivated"]: now,
                ["occupants." + userID + ".isActive"]: true,
            });
        }

        await firestore().collection("members").doc(userID).update({
            ["houses." + houseID + ".isActive"]: !isActive,
        });
    }

    return (
        <ListItem onPress={onPress}>
            <ListItem.Content>
                <ListItem.Title>{house.houseName}</ListItem.Title>
            </ListItem.Content>
            <CheckBox
                checked={isActive}
                onPress={() => {
                    firestore().collection("houses").doc(house.id).update({
                        ["occupants." + user.uid + ".isActive"]: !isActive
                    }).then(() => {
                        setIsActive(!isActive);
                    });
                }}
            />
            <ListItem.Chevron />
        </ListItem>
    );
}

export function HouseList(args) {
    const {user, navigation} = args;
    const [member, setMember] = useState(undefined);
    const [houseDocuments, setHouseDocuments] = useState(undefined);

    if (member === undefined) {
        firestore().collection("members").doc(user.uid).get().then((memberDoc) => {
            setMember(memberDoc.data());
        });
        return <ActivityIndicator size="large" style={{flex:1}} />
    }
    

    if (houseDocuments === undefined) {
        const housePromises = [];
        const houseIds = Object.keys(member.houses);
        houseIds.forEach(houseId => {
            housePromises.push(firestore().collection("houses").doc(houseId).get());
        });

        Promise.all(housePromises).then(houseDocuments => {
            setHouseDocuments(houseDocuments);
        });
        return <ActivityIndicator size="large" style={{flex:1}} />
    }

    if (houseDocuments.length === 0) {
        return <Text>No houses found</Text>
    }

    return (
        <View style={args.style}>
            <FlatList
                data={houseDocuments}
                renderItem={({item}) => (
                    <HouseListItem user={user} houseDoc={item} onPress={() => {
                        navigation.navigate("House", {houseID: item.id});
                    }}/>
                )}
            />
        </View>
    );
}