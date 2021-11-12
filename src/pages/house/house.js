import React from 'react';
import { Text, View, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import firestore from "@react-native-firebase/firestore";
import { ButtonGroup, ListItem } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from '../../styles';
import Clipboard from '@react-native-community/clipboard'


export function House({route, navigation }) {
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

    const leaveHouse = () => {
        // Update the house
        // Update the members
    }

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
                                {text: "Delete", onPress: () => {
                                    Alert.alert("TODO Implement house deletion");
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