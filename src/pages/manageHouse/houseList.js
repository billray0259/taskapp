import firestore from "@react-native-firebase/firestore";
import React, { useState } from "react";
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from "react-native";
import { ListItem } from "react-native-elements"
import { CheckBox } from "react-native-elements/dist/checkbox/CheckBox";


function HouseListItem(args) {
    const {memberDoc, houseDoc, onPress} = args;
    const house = houseDoc.data();
    const [isActive, setIsActive] = useState(house.occupants[memberDoc.id].isActive);
    
    async function toggleUserActiveStatus(houseID, memberID) {
        const houseDoc = await firestore().collection("houses").doc(houseID).get();
        const house = houseDoc.data();
        const isActive = house.occupants[memberID].isActive;
        const nowDays = Date.now() / (60 * 60 * 24 * 1000);

        if (isActive) {
            const lastActivated = house.occupants[memberID].lastActivated;
            const activeTime = house.occupants[memberID].activeTime;
            const ellapsedTime = nowDays - lastActivated;
            const newActiveTime = activeTime + ellapsedTime;
            await firestore().collection("houses").doc(houseID).update({
                ["occupants." + memberID + ".activeTime"]: newActiveTime,
                ["occupants." + memberID + ".isActive"]: false,
            });
        } else {
            await firestore().collection("houses").doc(houseID).update({
                ["occupants." + memberID + ".lastActivated"]: nowDays,
                ["occupants." + memberID + ".isActive"]: true,
            });
        }

        await firestore().collection("members").doc(memberID).update({
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
                    toggleUserActiveStatus(houseDoc.id, memberDoc.id).then(() => {
                        setIsActive(!isActive);
                    });
                }}
            />
            <ListItem.Chevron />
        </ListItem>
    );
}

export function HouseList(args) {
    const {memberDoc, navigation} = args;
    const [houseDocuments, setHouseDocuments] = useState(undefined);
    const member = memberDoc.data();
    

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
                    <HouseListItem memberDoc={memberDoc} houseDoc={item} onPress={() => {
                        navigation.navigate("House", {houseID: item.id});
                    }}/>
                )}
            />
        </View>
    );
}