import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DetailsScreen from "./src/detailsScreen";
import ProfilePage from "./src/profilePage";
import CreateIssue from './src/screens/createIssue/createIssue';
import HomeScreen from "./src/homeScreen";
import MyIssuesPosted from "./src/screens/myIssuesPosted/myIssuesPosted";
import EditIssue from './src/screens/editIssue/editIssue';
import WelcomePage from "./src/screens/welcome/welcomePage";
import SignInPage from "./src/screens/signin/signinPage";
import SignUpPage from "./src/screens/signup/signupPage";
import {useEffect, useState} from "react";

const Stack = createNativeStackNavigator();

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkToken = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                if (token) {
                    setIsLoggedIn(true);
                }
            } catch (e) {
                console.log("Failed to fetch the token");
            } finally {
                setLoading(false);
            }
        };

        checkToken();
    }, []);

    if (loading) {
        return null; // Add a loading component here
    }

    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName={isLoggedIn ? "HomeScreen" : "welcomePage"}>
                {isLoggedIn ? (
                    <>
                        <Stack.Screen name="HomeScreen">
                            {props => <HomeScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
                        </Stack.Screen>
                        <Stack.Screen name="DetailsScreen" component={DetailsScreen} />
                        <Stack.Screen name="ProfilePage" component={ProfilePage} />
                        <Stack.Screen name="CreateIssue" component={CreateIssue} />
                        <Stack.Screen name="MyIssuesPosted" component={MyIssuesPosted} />
                        <Stack.Screen name="EditIssue" component={EditIssue} />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="welcomePage" component={WelcomePage} />
                        <Stack.Screen name="SignInPage">
                            {props => <SignInPage {...props} setIsLoggedIn={setIsLoggedIn} />}
                        </Stack.Screen>
                        <Stack.Screen name="SignUpPage" component={SignUpPage} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}