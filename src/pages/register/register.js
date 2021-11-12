import "react-native-gesture-handler";
import React from "react";

import { useState } from "react";
import { StyleSheet, Text, View, Button, TextInput } from "react-native";

import { registerUser } from "./registerLogic";

export function Register({ navigation }) {
    const [displayName, setDisplayName] = useState(null);
    const [email, setEmail] = useState(null);
    const [password, setPassword] = useState(null);
    const [confirmPassword, setConfirmPassword] = useState(null);
    const [message, setMessage] = useState("Register");

    return (
        <View style={styles.container}>
            <Text>{message}</Text>
            <TextInput
                style={styles.input}
                onChangeText={setDisplayName}
                placeholder="Display Name"
                autoCorrect={false}
            />
            <TextInput
                style={styles.input}
                onChangeText={setEmail}
                placeholder="Email"
                textContentType="emailAddress"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoCompleteType="email"
            />
            <TextInput
                style={styles.input}
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry={true}
                autoCapitalize="none"
                autoCorrect={false}
            />
            <TextInput
                style={styles.input}
                onChangeText={setConfirmPassword}
                placeholder="Confirm Password"
                secureTextEntry={true}
                autoCapitalize="none"
                autoCorrect={false}
            />
            <Button
                title="Register"
                onPress={
                    () => {
                        registerUser(displayName, email, password, confirmPassword)
                            .then((errorMessage) => {
                                if (errorMessage) {
                                    setMessage(errorMessage);
                                } else {
                                    navigation.navigate("Home");
                                }
                            }); 
                    }
                }
            />
        </View>
    );
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },

    input: {
        height: 40,
        width: 200,
        margin: 12,
        borderWidth: 1,
    },
});
