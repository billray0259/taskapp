import 'react-native-gesture-handler';
import React from 'react';
import { useState } from 'react';
import { StyleSheet, Text, View, Button, TextInput, Alert } from 'react-native';

import auth from '@react-native-firebase/auth';

export function Login({ navigation }) {
    const [email, setEmail] = useState(null);
    const [password, setPassword] = useState(null);
    const [message, setMessage] = useState("Login");

    return (
        <View style={styles.container}>
            <Text>{message}</Text>
            <TextInput
                style={styles.input}
                onChangeText={setEmail}
                placeholder="Email"
                textContentType='emailAddress'
                keyboardType='email-address'
                autoCapitalize='none'
                autoCorrect={false}
                autoCompleteType='email'
            />
            <TextInput
                style={styles.input}
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry={true}
                autoCapitalize='none'
                autoCorrect={false}
            />
            <Button
                title="Login"
                onPress={() => {
                    auth()
                        .signInWithEmailAndPassword(email, password)
                        .then(() => {
                            navigation.navigate("Home");
                        })
                        .catch(error => {
                            if (error.code === "auth/invalid-email") {
                                Alert.alert("Invalid Email");
                            } else if (error.code === "auth/user-not-found") {
                                Alert.alert("Unknown Email");
                            } else if (error.code === "auth/wrong-password") {
                                Alert.alert("Wrong Password");
                            } else {
                                Alert.alert("Unknown Error");
                            }
                        });
                }}
            />
            <Button
                onPress={() => {
                    navigation.navigate("Register");
                }}
                title="Register"
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