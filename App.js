import React from 'react';
import 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';

import auth from '@react-native-firebase/auth';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { Home } from "./src/pages/home/home";
import { Login } from "./src/pages/login/login";
import { Register } from "./src/pages/register/register";
import { ManageHouse } from "./src/pages/manageHouse/manageHouse";
import { House } from './src/pages/house/house';
import { EditTask } from './src/pages/editTask/editTask';


import { AuthContext } from './src/contexts/authContext';
import { Tasks } from './src/pages/tasks/tasks';
import { CreateHouse } from './src/pages/createHouse/createHouse';
import { JoinHouse } from './src/pages/joinHouse/joinHouse';
import { Assignments } from './src/pages/assignments/assignments';
import { Test } from './src/pages/test/test';

const Stack = createStackNavigator();

export default function App() {
    const authUserState = useState();
    const [authUser, setAuthUser] = authUserState;
    
    function onAuthStateChanged(user) {
        setAuthUser(user);
    }

    useEffect(() => {
        const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
        return subscriber;
    }, []);

    let initialPage = authUser ? "Home" : "Login";

    return (
        <SafeAreaProvider>
                <AuthContext.Provider value={authUserState}>
                    <NavigationContainer>
                        <Stack.Navigator initialRouteName={initialPage}>

                            <Stack.Screen
                                name="Home"
                                component={Home}
                            />

                            <Stack.Screen
                                name="Login"
                                component={Login}
                            />

                            <Stack.Screen
                                name="Register"
                                component={Register}
                            />

                            <Stack.Screen
                                name="Manage House"
                                component={ManageHouse}
                            />

                            <Stack.Screen
                                name="Create House"
                                component={CreateHouse}
                            />

                            <Stack.Screen
                                name="Join House"
                                component={JoinHouse}
                            />

                            <Stack.Screen
                                name="House"
                                component={House}
                            />

                            <Stack.Screen
                                name="Tasks"
                                component={Tasks}
                            />

                            <Stack.Screen
                                name="Edit Task"
                                component={EditTask}
                            />

                            <Stack.Screen
                                name="Assignments"
                                component={Assignments}
                            />


                            <Stack.Screen
                                name="Test"
                                component={Test}
                            />
                        </Stack.Navigator>
                    </NavigationContainer>
                </AuthContext.Provider>
            
        </SafeAreaProvider>
    );


}