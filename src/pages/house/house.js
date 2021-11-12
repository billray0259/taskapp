import React from 'react';
import { Text, View, ActivityIndicator, Alert } from 'react-native';
import { useState, useContext } from 'react';
import firestore from "@react-native-firebase/firestore";
import { ButtonGroup, ListItem } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from '../../styles';
import Clipboard from '@react-native-community/clipboard'
import { AuthContext } from '../../contexts/authContext';

export function House({route, navigation }) {
    const [user, setUser] = useContext(AuthContext);
    const { houseID } = route.params;
    const [houseDoc, setHouseDoc] = useState();

    if (houseDoc === undefined) {
        firestore().collection("houses").doc(houseID).get().then(function (doc) {
                setHouseDoc(doc);
        });
        return <ActivityIndicator size="large" style={{flex:1}} />
    }

    const house = houseDoc.data();
    // house.occupants is a map of occupantID to occupant object
    // the occupant object has keys: displayName, isActive

    // Show a list of all the occupants in the house using a ListItem
    const occupantList = (
        <View>
            {Object.keys(house.occupants).map((occupantID) => {
                const occupant = house.occupants[occupantID];
                return (
                    <ListItem
                        key={occupantID}
                        onPress={() => Alert.alert("Show occupant page", "Name, Records, Points, Active, etc")}
                    >
                        <ListItem.Content>
                            <ListItem.Title>{occupant.displayName}</ListItem.Title>
                            <ListItem.Subtitle>{occupant.isActive ? "Active" : "Inactive"}</ListItem.Subtitle>
                        </ListItem.Content>
                        <ListItem.Chevron />
                    </ListItem>
                );
            })}
        </View>
    );

    return (
        <SafeAreaView
            style={styles.container}
            edges={['bottom', 'left', 'right']}
        >
            <View style={{flexGrow: 1}}>
                <Text style={styles.title}>{houseDoc.data().houseName}</Text>
                {occupantList}
            </View>
            <ButtonGroup
                buttons={["Leave", "Invite", "Tasks"]}
                onPress={(index) => {
                    switch (index) {
                        case 0:
                            Alert.alert("Leave House", "Are you sure you want to leave this house?", [
                                {text: "Cancel", style: "cancel"},
                                {text: "Leave", onPress: () => {
                                    leaveHouse(houseID, user.uid).then(() => {
                                        navigation.navigate("Manage House");
                                    });
                                    }
                                }
                            ]);
                            break;
                        case 1:
                            Alert.alert("Share your House Code", "House Code: " + house.houseCode, [
                                {text: "Copy House Code", onPress: () => {
                                    Clipboard.setString(house.houseCode);
                                }}
                            ]);
                            break;
                        case 2:
                            navigation.navigate("Tasks", {houseID: houseID});
                            break;
                    }
                }}
            />
        </SafeAreaView>
    );
}

async function leaveHouse(houseID, memberID) {
    const [houseDoc, memberDoc] = await Promise.all([
        firestore().collection("houses").doc(houseID).get(),
        firestore().collection("members").doc(memberID).get()
    ]);

    const house = houseDoc.data();
    const member = memberDoc.data();
    
    if (house.occupants[memberID] === undefined) {
        Alert.alert("Error", "You are not in this house.");
        return;
    }

    delete house.occupants[memberID];

    const promises = [];

    if (Object.keys(house.occupants).length === 0) {
        // delete house
        promises.push(firestore().collection("houses").doc(houseID).delete());
    }
    else {
        // update house
        promises.push(firestore().collection("houses").doc(houseID).update({
            occupants: house.occupants
        }));
    }

    delete member.houses[houseID];

    promises.push(firestore().collection("members").doc(memberID).update({
        houses: member.houses
    }));

    await Promise.all(promises);
}