import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WelcomePage from "./src/screens/welcome/welcomePage";
import SignInPage from "./src/screens/signin/signinPage";
import SignUpPage from "./src/screens/signup/signupPage";
import ProfilePage from "./src/screens/profilePage/profilePage";
import CredentialFormPage from "./src/screens/credentialFormPage/credentialFormPage";
import UploadID from "./src/screens/uploadID/uploadID";
import ThankYouPage from "./src/tyCredentialEnd";
import ForgotPasswordPage from "./src/screens/signin/ForgotPasswordPage";
import EnterPin from "./src/screens/signin/EnterPinPage";
import ResetPasswordPage from "./src/screens/signin/ResetPasswordPage";
import ProfessionalNavBar from './src/ProfessionalNavBarComponent';
import HomeScreen from "./src/screens/homeScreen/homeScreen";
import ContractOffer from "./src/screens/contractOffer/contractOffer";
import NotificationPage from './src/screens/notificationPage/notificationPage';
import NotificationDetail from './src/screens/notificationDetail/notificationDetail';
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChatProvider, useChatContext } from "./src/screens/chat/chatContext";
import { Chat } from 'stream-chat-expo';
import ChannelListScreen from "./src/screens/chat/chatListPage";
import ChatPage from "./src/screens/chat/chatPage";
import ReviewsPage from "./src/screens/reviewsPage/reviewsPage";
import { Text } from "react-native";


const Stack = createNativeStackNavigator();

const linking = {
    prefixes: ['yourapp://'], // Replace 'yourapp' with your actual app scheme
    config: {
        screens: {
            ResetPasswordPage: 'resetPassword?token=:token',
        },
    },
};

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

    // Show loading screen if chat client is not ready or token check is in progress
    if (loading) {
        return (
            <GestureHandlerRootView style={{ flex: 1 }}>
                <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text>Loading app...</Text>
                </SafeAreaView>
            </GestureHandlerRootView>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }}>
                <NavigationContainer>
                    {isLoggedIn ? (
                        <ChatProvider>
                            <OverlayProvider>
                                <Chat client={chatClient}>
                                    <Stack.Navigator initialRouteName={isLoggedIn ? 'MainTabs' : 'welcomePage'}>
                                        <>
                                            {/* MainTabs with ProfessionalNavBar */}
                                            <Stack.Screen
                                                name="MainTabs"
                                                options={{ headerShown: false }}
                                            >
                                                {props => <ProfessionalNavBar {...props} setIsLoggedIn={setIsLoggedIn} />}
                                            </Stack.Screen>

                                            <Stack.Screen
                                                name="HomeScreen"
                                                options={{ headerShown: false }} // Remove header for HomeScreen
                                            >
                                                {props => <HomeScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
                                            </Stack.Screen>
                                            {/* Additional screens accessible from MainTabs */}

                                            <Stack.Screen
                                                name="ProfilePage"
                                                component={ProfilePage}
                                                options={{ headerShown: false }}  // This hides the default navigation header
                                            />
                                            <Stack.Screen name="ContractOffer" component={ContractOffer} />
                                            <Stack.Screen name="CredentialFormPage" component={CredentialFormPage} />
                                            <Stack.Screen name="UploadID" component={UploadID} />
                                            <Stack.Screen name="ThankYouPage" component={ThankYouPage} options={{ headerShown: false }} />
                                            <Stack.Screen name="NotificationPage" component={NotificationPage} />
                                            <Stack.Screen name="NotificationDetail" component={NotificationDetail}/>
                                            <Stack.Screen name="ChatListPage" component={ChatListPage} />
                                            <Stack.Screen name="ChatPage" component={ChatPage} />
                                            <Stack.Screen name="ReviewsPage" component={ReviewsPage} />
                                        </>
                                    </Stack.Navigator>
                                </Chat>
                            </OverlayProvider>
                        </ChatProvider>
                    ) : (
                        <Stack.Navigator initialRouteName={isLoggedIn ? 'MainTabs' : 'welcomePage'}>
                            <>
                                <Stack.Screen name="welcomePage" component={WelcomePage} />
                                <Stack.Screen name="SignInPage">
                                    {props => <SignInPage {...props} setIsLoggedIn={setIsLoggedIn} />}
                                </Stack.Screen>
                                <Stack.Screen name="SignUpPage" component={SignUpPage} />
                                <Stack.Screen name="ForgotPasswordPage" component={ForgotPasswordPage} />
                                <Stack.Screen name="EnterPin" component={EnterPin} />
                                <Stack.Screen name="ResetPasswordPage" component={ResetPasswordPage} />
                            </>
                        </Stack.Navigator>
                    )}
                </NavigationContainer>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}

