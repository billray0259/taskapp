import React from 'react';
import 'react-native-gesture-handler';
import { useContext, useEffect, useState } from 'react';

import firestore from "@react-native-firebase/firestore";
import { useIsFocused } from '@react-navigation/native'
import { ActivityIndicator } from 'react-native';

import { AuthContext } from '../../contexts/authContext';
import { ButtonPage } from '../../lib/buttonPage';
import { HouseList } from './houseList';

export function ManageHouse({ navigation }) {
    const [user, setUser] = useContext(AuthContext);
    const [memberDoc, setMemberDoc] = useState(undefined);

    const isFocused = useIsFocused()
    useEffect(() => {
        if (isFocused) {
            setMemberDoc(undefined);
        }
    } , [isFocused]);


    if (memberDoc === undefined) {
        firestore().collection('members').doc(user.uid).get().then(doc => {
            setMemberDoc(doc);
        });
        return <ActivityIndicator size="large" style={{flex:1}} />
    }

    const pressCreateHouse = () => {
        navigation.navigate('Create House');
    }

    const pressJoinHouse = () => {
        navigation.navigate('Join House');
    }    

    const buttonLabels = ["Create House", "Join House"];
    const buttonFunctions = [pressCreateHouse, pressJoinHouse];

    return (
        <ButtonPage
            buttonLabels={buttonLabels}
            buttonFunctions={buttonFunctions}

        >
            <HouseList
                memberDoc={memberDoc}
                navigation={navigation}
            />
        </ButtonPage>
    );
    

    // return (
    //     <SafeAreaView
    //         style={styles.container}
    //         edges={['bottom', 'left', 'right']}
    //     >
    //         <View style={{flexGrow: 1}}>
    //             {views[selectedIndex]}
    //         </View>
    //         <View>
    //             <ButtonGroup
    //             buttons={buttonOptions}
    //             onPress={(index) => {
    //                 if (index+1 === selectedIndex) {
    //                     showHouseList();
    //                 } else {
    //                     setSelectedIndex(index+1);
    //                     setButtonOptions(
    //                         index == 0 ? ["Cancel", "Join House"] : ["Create House", "Cancel"]    
    //                     );
    //                 }
    //             }}
    //         />
    //         </View>            
    //     </SafeAreaView>
    // );
}