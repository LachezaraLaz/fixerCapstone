import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import axios, {request} from 'axios';
import MapView, { Marker } from 'react-native-maps';

import { IPAddress } from '../../../ipAddress';

export default function SignUpPage({ navigation }) {
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [street, setStreet] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [provinceOrState, setProvinceOrState] = useState('');
    const [country, setCountry] = useState('');

    const [coordinates, setCoordinates] = useState(null);
    const [isAddressValid, setIsAddressValid] = useState(false);
    const [isEmailValid, setIsEmailValid] = useState(false); // New state for email validation
    const [isEmailFocused, setIsEmailFocused] = useState(false); // New state to track focus


    // functions for input validation:

    //email
    // Function to validate email format
    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    // Handle email input change
    const handleEmailChange = (text) => {
        setEmail(text);
        setIsEmailValid(validateEmail(text)); // Validate email in real-time
    };

    // Handle email input focus
    const handleEmailFocus = () => {
        setIsEmailFocused(true);
    };

    // Handle email input blur
    const handleEmailBlur = () => {
        setIsEmailFocused(false);
    };

    //backend
    async function handleSignUp() {
        if (!email || !password || !confirmPassword || !street || !postalCode || !provinceOrState || !country) {
            Alert.alert('Error', 'All fields are required');
            return;
        }
        if (!isEmailValid) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        } else {
            try {
                const response = await axios.post(`https://fixercapstone-production.up.railway.app/client/register`, {
                    email: email,
                    firstName: firstName,
                    lastName: lastName,
                    password: password,
                    street: street,
                    postalCode: postalCode,
                    provinceOrState: provinceOrState,
                    country: country
                })
                if (response.status !== 400) {
                    Alert.alert("Account created successfully. An email was sent to verify your email.")
                }
            } catch (error) {
                if (error.response) {
                    // Check if the response indicates the user already exists
                    if (error.response.status === 400) {
                        Alert.alert("Error", "User already exists");
                    } else {
                        Alert.alert("Error", error.response.data.message || 'An unexpected error occurred');
                    }
                } else if (error.request) {
                    Alert.alert("Error", "Network error");
                } else {
                    Alert.alert("Error", "An unexpected error occurred");
                }
            }
        }
    }

    const handleVerifyAddress = async () => {
        try {
            const response = await axios.post(`https://fixercapstone-production.up.railway.app/client/verifyAddress`, {
                street: street,
                postalCode: postalCode,
            })
            if (response.status === 'success') {
                Alert.alert("Address verified successfully from client")
            }

            const { isAddressValid, coordinates } = response.data;

            setIsAddressValid(isAddressValid);
            setCoordinates(coordinates);

        } catch (error) {
            if (error.response) {
                Alert.alert("Error", error.response.data.message || 'An unexpected error occurred Ad.Ver.');
            } else if (error.request) {
                Alert.alert("Error", "Network error Ad.Ver.");
            } else {
                Alert.alert("Error", "An unexpected error occurred Ad.Ver.");
            }
        }
    };

    return (
        <ScrollView style={{ flex: 1, padding: 20, marginBottom: 30 }}>
            <View style={styles.container}>
                <Text style={styles.title}>Sign Up</Text>
                <TextInput
                    style={[
                        styles.input,
                        isEmailFocused && email.length > 0 && !isEmailValid && styles.invalidInput, // Red if invalid and focused
                        isEmailFocused && email.length > 0 && isEmailValid && styles.validInput, // Green if valid and focused
                    ]}
                    placeholder="Email"
                    value={email}
                    onChangeText={handleEmailChange}
                    onFocus={handleEmailFocus} // Track focus
                    onBlur={handleEmailBlur} // Track blur
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                {!isEmailValid && email.length > 0 && (
                    <Text style={styles.errorText}>Please enter a valid email address</Text>
                )}
                <TextInput
                    style={styles.input}
                    placeholder="First Name"
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Last Name"
                    value={lastName}
                    onChangeText={setLastName}
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    placeholder="House number and Street"
                    value={street}
                    onChangeText={setStreet}
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Postal Code"
                    value={postalCode}
                    onChangeText={setPostalCode}
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Province or State"
                    value={provinceOrState}
                    onChangeText={setProvinceOrState}
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Country"
                    value={country}
                    onChangeText={setCountry}
                    autoCapitalize="none"
                />
                <TouchableOpacity style={styles.button} onPress={handleVerifyAddress}>
                    <Text style={styles.buttonText}>Verify Address</Text>
                </TouchableOpacity>

                {isAddressValid && (
                    <View>
                        <TextInput style={styles.text}>Valid Address entered</TextInput>
                        <TextInput style={styles.text}>Does it match to the marker on the map?</TextInput>
                    </View>
                )}

                {coordinates && (
                    <MapView
                        style={styles.map}
                        initialRegion={{
                            latitude: coordinates.latitude,
                            longitude: coordinates.longitude,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        }}
                    >
                        <Marker coordinate={coordinates} />
                    </MapView>
                )}

                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
                <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                />
                <TouchableOpacity style={styles.button} onPress={() => handleSignUp()} testID={'sign-up-button'} disabled={!isAddressValid}>
                    <Text style={styles.buttonText}>Sign Up</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('SignInPage')}>
                    <Text style={styles.signInText}>Already have an account? Sign in</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff',
        marginBottom: 300, // temporary large marginBottom until scrolling of page is improved
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    text: {
        margin: 5,
    },
    input: {
        height: 50,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 15,
    },
    invalidInput: {
        borderColor: 'red', // Highlight the input field with a red border if email is invalid
    },
    validInput: {
        borderColor: 'green', // Highlight the input field with a green border if email is valid
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#1E90FF',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 15,

    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
    },
    signInText: {
        color: '#1E90FF',
        textAlign: 'center',
        marginTop: 15,
        fontSize: 16,
    },
    map: {
        width: '100%',
        height: 200,
        marginTop: 20,
        marginBottom: 20,
    },
});