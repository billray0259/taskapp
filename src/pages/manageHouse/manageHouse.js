import React from 'react';
import 'react-native-gesture-handler';

import { useContext } from 'react';


import { AuthContext } from '../../contexts/authContext';

import { ButtonPage } from '../../lib/buttonPage';

import { HouseList } from './houseList';

export function ManageHouse({ navigation }) {
    const [user, setUser] = useContext(AuthContext);

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
                user={user}
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