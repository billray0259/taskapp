import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import { ButtonGroup, ListItem } from 'react-native-elements';
import { View } from 'react-native';
import { styles } from '../styles';

export function ButtonPage(args) {
    const { children, buttonLabels, buttonFunctions } = args;

    return (
        <SafeAreaView
            style={styles.container}
            edges={['bottom', 'left', 'right']}
        >
            <View style={{flexGrow: 1}}>
                {children}
            </View>
            <ButtonGroup
                buttons={buttonLabels}
                onPress={(index) => buttonFunctions[index]()}
            />
        </SafeAreaView>
    );
}