import firestore from "@react-native-firebase/firestore";
import React, { useState } from "react";
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from "react-native";
import { ListItem } from "react-native-elements"
import { CheckBox } from "react-native-elements/dist/checkbox/CheckBox";


function HouseListItem(args) {
    const {user, houseDoc, onPress} = args;
    const house = houseDoc.data();
    const [isActive, setIsActive] = useState(house.occupants[user.uid].isActive);
    
    async function toggleUserActiveStatus(houseID, memberID) {
        const houseDoc = await firestore().collection("houses").doc(houseID).get();
        const house = houseDoc.data();
        const isActive = house.occupants[memberID].isActive;
        const nowSeconds = Date.now()/1000;

        if (isActive) {
            const lastActivatedSeconds = house.occupants[memberID].lastActivated;
            const activeSeconds = house.occupants[memberID].activeSeconds;
            const ellapsedSeconds =(nowSeconds - lastActivatedSeconds);
            const newActiveSeconds = Math.round(activeSeconds + ellapsedSeconds);
            await firestore().collection("houses").doc(houseID).update({
                ["occupants." + memberID + ".activeSeconds"]: newActiveSeconds,
                ["occupants." + memberID + ".isActive"]: false,
            });
        } else {
            await firestore().collection("houses").doc(houseID).update({
                ["occupants." + memberID + ".lastActivated"]: nowSeconds,
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
                    toggleUserActiveStatus(houseDoc.id, user.uid).then(() => {
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