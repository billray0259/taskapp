import React from 'react';
import { View, ActivityIndicator, FlatList } from 'react-native';
import { useState, useEffect } from 'react';
import firestore from "@react-native-firebase/firestore";
import { ListItem } from 'react-native-elements';
import { useIsFocused } from '@react-navigation/native'


import { ButtonPage } from '../../lib/buttonPage';
import { styles } from '../../styles';


export function Tasks({route, navigation}) {
    const { houseID } = route.params;
    const [houseDoc, setHouseDoc] = useState();

    const isFocused = useIsFocused()

    useEffect(() => {
        if (isFocused) {
            setHouseDoc(undefined);
        }
    } , [isFocused]);

    if (houseDoc === undefined) {
        firestore().collection("houses").doc(houseID).get().then(function (doc) {
            setHouseDoc(doc);
        });
        return <ActivityIndicator size="large" style={{flex:1}} />
    }
    
    const house = houseDoc.data();
    const taskIDs = Object.keys(house.tasks);

    const onCreateTask = () => {
        navigation.navigate("Edit Task", {houseID: houseID})
    }
    
    return (
        <ButtonPage
            buttonLabels={["Create Task"]}
            buttonFunctions={[onCreateTask]}
        >
            <FlatList
                style={{
                    height: '1%',
                }}
                data={taskIDs}
                renderItem={({item}) => {
                    const task = house.tasks[item];
                    return (
                        <ListItem
                            key={item}
                            onPress={() => {
                                navigation.navigate("Edit Task", {houseID: houseID, taskID: item})
                            }}
                        >
                            <ListItem.Content>
                                <ListItem.Title>{task.name}</ListItem.Title>
                                <ListItem.Subtitle>{task.description}</ListItem.Subtitle>
                            </ListItem.Content>
                            <ListItem.Chevron />
                        </ListItem>
                    );
                }}
            />
        </ButtonPage>
    );
}

            // <View>
            //     {taskIDs.map((taskID) => {
            //         const task = house.tasks[taskID];

            //         return (
            //             <ListItem
            //                 key={taskID}
            //                 onPress={() => navigation.navigate("Edit Task", {houseID: houseID, taskID: taskID})}
            //             >
            //                 <ListItem.Content>
            //                     <ListItem.Title>{task.name}</ListItem.Title>
            //                     <ListItem.Subtitle>{task.description}</ListItem.Subtitle>
            //                 </ListItem.Content>
            //                 <ListItem.Chevron />
            //             </ListItem>
            //         );
            //     })}
            // </View>