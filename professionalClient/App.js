import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import your pages (screens)
// import HomeScreen from './src/homeScreen';
// import DetailsScreen from './src/detailsScreen';
// import ProfilePage from "./src/profilePage";
import welcomePage from "./src/welcomePage";
import SignInPage from "./src/signinPage";
import SignUpPage from "./src/signupPage";

// Create a Stack Navigator
const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="welcomePage">
                {/*<Stack.Screen name="Home" component={HomeScreen} />*/}
                {/*<Stack.Screen name="Detail" component={DetailsScreen} />*/}
                {/*<Stack.Screen name="ProfilePage" component={ProfilePage} /> //DLU part*/}
                <Stack.Screen name="welcomePage" component={welcomePage} />
                <Stack.Screen name="SignInPage" component={SignInPage} />
                <Stack.Screen name="SignUpPage" component={SignUpPage} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}