import 'react-native-gesture-handler';
import React from 'react';
import { useState, useContext } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';

import auth from '@react-native-firebase/auth';

import { AuthContext } from '../../contexts/authContext';

export function Home({ navigation }) {

    const [user, setUser] = useContext(AuthContext);

    if (!user) {
        message = "Initializing...";
    } else if (user) {
        message = "Welcome " + user.email;
    }

    return (
        <View style={styles.container}>
            <Text>{message}</Text>
            <Button
                onPress={() => {
                    auth().signOut().then(() => {
                        console.log("Logged out");
                    }).catch(error => {
                        console.log("Error logging out: " + error);
                    });

                    navigation.navigate("Login");

                    // clear the navigation stack
                    navigation.reset({
                        index: 0,
                        routes: [{ name: "Login" }]
                    });
                }}
                title="Logout"
            />
            <Button
                onPress={() => {
                    navigation.navigate("Manage House");
                }}
                title="Manage Houses"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },

    input: {
        height: 40,
        width: 200,
        margin: 12,
        borderWidth: 1,
    }
});