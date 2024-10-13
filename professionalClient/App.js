import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import welcomePage from "./src/welcomePage";
import SignInPage from "./src/signinPage";
import SignUpPage from "./src/signupPage";

// Create a Stack Navigator
const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="welcomePage">
                <Stack.Screen name="welcomePage" component={welcomePage} />
                <Stack.Screen name="SignInPage" component={SignInPage} />
                <Stack.Screen name="SignUpPage" component={SignUpPage} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}