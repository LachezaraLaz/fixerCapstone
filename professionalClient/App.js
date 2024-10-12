import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import your pages (screens)
import HomeScreen from './src/homeScreen';
import DetailsScreen from './src/detailsScreen';
import ProfilePage from "./src/profilePage";

// Create a Stack Navigator
const Stack = createNativeStackNavigator();

export default function App() {
  return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Detail" component={DetailsScreen} />
          <Stack.Screen name="ProfilePage" component={ProfilePage} /> //DLU part

        </Stack.Navigator>
      </NavigationContainer>
  );
}
