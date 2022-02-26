import 'react-native-gesture-handler';
import React from 'react';
import { useState, useContext } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';

import { Collapse } from '../../lib/collapse';

export function Test({ navigation }) {

    return (
        <Collapse 
            title={<Text>Test</Text>}
            style={{backgroundColor: "red"}}
        >
            <Text style={{backgroundColor: "lightblue"}}>
                Hello
            </Text>
        </Collapse>
    );
}