import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import your pages (screens)
import welcomePage from "./src/welcomePage";
import SignUpPage from "./src/signupPage";
import HomeScreen from './src/homeScreen';
import DetailsScreen from './src/detailsScreen';
import CreateIssue from './src/createIssue'
import ProfilePage from './src/profilePage';

// Create a Stack Navigator
const Stack = createNativeStackNavigator();

export default function App() {
  return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="welcomePage">
            <Stack.Screen name="welcomePage" component={welcomePage} />
            <Stack.Screen name="SignUpPage" component={SignUpPage} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Details" component={DetailsScreen} />
            <Stack.Screen name="CreateIssue" component={CreateIssue} />
            <Stack.Screen name="ProfilePage" component={ProfilePage} />
        </Stack.Navigator>
      </NavigationContainer>
  );
}
