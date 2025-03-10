import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons'; 
import OrangeButton from "../../../components/orangeButton";
import InputField from '../../../components/inputField';
import PasswordField from '../../../components/passwordField';
import Dropdown from '../../../components/dropdown';

import { IPAddress } from '../../../ipAddress';

// List of Canadian provinces
const CANADIAN_PROVINCES = [
    'Alberta',
    'British Columbia',
    'Manitoba',
    'New Brunswick',
    'Newfoundland and Labrador',
    'Nova Scotia',
    'Ontario',
    'Prince Edward Island',
    'Quebec',
    'Saskatchewan',
];

export default function SignUpPage({ navigation }) {
    //general fields for page
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [street, setStreet] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [provinceOrState, setProvinceOrState] = useState('');
    const [country, setCountry] = useState('Canada');

    //for verification of address
    const [coordinates, setCoordinates] = useState(null);
    const [isAddressValid, setIsAddressValid] = useState(false);

    //valid inputs or not
    const [isValid, setIsValid] = useState(false);
    const [isError, setIsError] = useState(false);

    //once email and password are valid, then the rest of the fields appear
    const [showNameAndAddressFields, setShowNameAndAddressFields] = useState(false); 

    // Password criteria states
    const [hasMinLength, setHasMinLength] = useState(false);
    const [hasNumber, setHasNumber] = useState(false);
    const [hasUppercase, setHasUppercase] = useState(false);
    const [hasLowercase, setHasLowercase] = useState(false);
    const [hasSpecialChar, setHasSpecialChar] = useState(false)
    const isPasswordValid = hasMinLength && hasNumber && hasUppercase && hasLowercase && hasSpecialChar;

    // Show/hide password state
    const [showPassword, setShowPassword] = useState(false); // For password field


    // functions for input validation:
    //email
    // Function ot validate email
    const validateEmail = (text) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (text === '') {
            setIsValid(false);
            setIsError(false);
        } else if (emailRegex.test(text)) {
            setIsValid(true);
            setIsError(false);
        } else {
            setIsValid(false);
            setIsError(true);
        }
        setEmail(text);
    };


    //password
    // Function to validate password strength
    const validatePassword = (password) => {
        setHasMinLength(password.length >= 8);
        setHasNumber(/\d/.test(password));
        setHasUppercase(/[A-Z]/.test(password));
        setHasLowercase(/[a-z]/.test(password));
        setHasSpecialChar(/[\W_]/.test(password)); // Special characters include anything that's not a letter or number
    };

    // Use useEffect to validate password whenever it changes
    useEffect(() => {
        validatePassword(password);
    }, [password])

    // Handle password input change
    const handlePasswordChange = (text) => {
        setPassword(text);
        validatePassword(text); // Validate password in real-time
    };

    // Handle confirm password input change
    const handleConfirmPasswordChange = (text) => {
        setConfirmPassword(text);
    };
   
    // Handle password and confirm password validation
    const validatePasswords = () => {
        return (
            hasMinLength &&
            hasNumber &&
            hasUppercase &&
            hasLowercase &&
            hasSpecialChar &&
            password === confirmPassword
        );
    };
    
    // first and last name fields validation
    const validateName = (name) => {
        if (!name) return false; // Name cannot be empty
        const nameRegex = /^[A-Za-z-' ]+$/; // Only letters, hyphens, apostrophes, and spaces
        return nameRegex.test(name) && name.charAt(0) === name.charAt(0).toUpperCase(); // First letter must be capitalized
    };   

    const filterNameInput = (text) => {
        // Use a regular expression to allow only letters, hyphens, and apostrophes
        return text.replace(/[^A-Za-z-' ]/g, '');
    };

    // Format postal code as A1B 2C3
    const formatPostalCode = (text) => {
        // Remove all non-alphanumeric characters
        let formattedText = text.replace(/[^a-zA-Z0-9]/g, '');

        // Insert a space after the first 3 characters
        if (formattedText.length > 3) {
            formattedText = `${formattedText.slice(0, 3)} ${formattedText.slice(3)}`;
        }

        // Convert to uppercase
        formattedText = formattedText.toUpperCase();

        setPostalCode(formattedText);
    };

    // Check if email and password are valid to show name and address fields
    const checkEmailAndPassword = () => {
        if (isValid && validatePasswords()) {
            setShowNameAndAddressFields(true); // Show name and address fields
        } else {
            Alert.alert('Error', 'Please enter a valid email and matching passwords');
        }
    }

    //backend
    async function handleSignUp() {
        if (!email || !password || !confirmPassword || !street || !postalCode || !provinceOrState || !country) {
            Alert.alert('Error', 'All fields are required');
            return;
        }
        if (!isValid) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }
        if (!validatePasswords()) {
            Alert.alert('Error', 'Password does not meet the required criteria');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        } 
        if (!validateName(firstName) || !validateName(lastName)) {
            Alert.alert('Error', 'First name and last name must start with a capital letter.');
            return;
        }
        if (!isAddressValid) {
            Alert.alert('Error', 'Please verify your address');
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

    //verify the address function
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
        <ScrollView >
            <View style={styles.container}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={28} color="#1E90FF" />
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
                
                <Text style={styles.title}>Sign Up</Text>

                <InputField 
                    placeholder="Email" 
                    value={email}
                    onChangeText={validateEmail}
                    isValid={isValid}
                    isError={isError}
                    autoCapitalize="none"
                />

                {!isValid && email.length > 0 && (
                    <Text style={styles.errorText}>Please enter a valid email address</Text>
                )}

                {/* Password Field */}
                <PasswordField
                    placeholder="Password"
                    value={password}
                    onChangeText={handlePasswordChange}
                    secureTextEntry={!showPassword}
                    isValid={isPasswordValid} // Green when all criteria are met
                    isError={!isPasswordValid && password.length > 0} // Red when criteria are not met
                />

                {/* Password Criteria */}
                {password.length > 0 && (
                    <View style={styles.passwordCriteriaContainer}>
                        <Text style={[styles.criteriaText, hasMinLength && styles.criteriaMet]}>
                            {hasMinLength ? '✓' : '•'} At least 8 characters
                        </Text>
                        <Text style={[styles.criteriaText, hasNumber && styles.criteriaMet]}>
                            {hasNumber ? '✓' : '•'} At least one number
                        </Text>
                        <Text style={[styles.criteriaText, hasUppercase && styles.criteriaMet]}>
                            {hasUppercase ? '✓' : '•'} At least one uppercase letter
                        </Text>
                        <Text style={[styles.criteriaText, hasLowercase && styles.criteriaMet]}>
                            {hasLowercase ? '✓' : '•'} At least one lowercase letter
                        </Text>
                        <Text style={[styles.criteriaText, hasSpecialChar && styles.criteriaMet]}>
                            {hasSpecialChar ? '✓' : '•'} At least one special character
                        </Text>
                    </View>
                )}

                {/* Confirm Password Field */}
                <PasswordField
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChangeText={handleConfirmPasswordChange}
                    secureTextEntry={!showPassword}
                    isValid={confirmPassword === password && confirmPassword.length > 0} // Green when passwords match
                    isError={confirmPassword !== password && confirmPassword.length > 0} // Red when passwords do not match
                    errorMessage={confirmPassword !== password && confirmPassword.length > 0 ? "Passwords do not match" : null}
                />

                {/* Button to Proceed to Name and Address Fields */}
                {!showNameAndAddressFields && (
                    <OrangeButton title="Next" onPress={checkEmailAndPassword} variant="normal" />
                )}

                {/* Name and Address Fields (Conditional Rendering) */}
                {showNameAndAddressFields && (
                    <>
                        <InputField
                            placeholder="First Name"
                            value={firstName}
                            onChangeText={(text) => setFirstName(filterNameInput(text))} // Filter invalid characters
                            autoCapitalize="words"
                        />

                        <InputField
                            placeholder="Last Name"
                            value={lastName}
                            onChangeText={(text) => setLastName(filterNameInput(text))} // Filter invalid characters
                        />

                        <InputField
                            placeholder="House Number and Street"
                            value={street}
                            onChangeText={setStreet}
                            autoCapitalize="words"
                        />

                        <InputField
                            placeholder="Postal Code"
                            value={postalCode}
                            onChangeText={formatPostalCode}
                            maxLength={7}
                        />              

                        <Dropdown
                            placeholder="Select Province"
                            items={CANADIAN_PROVINCES.map((province) => ({
                                label: province,
                                value: province,
                            }))}
                            onValueChange={(value) => setProvinceOrState(value)}
                            value={provinceOrState}
                        />

                        <InputField
                            placeholder="Country"
                            value={country}
                            disabled 
                        />

                        <OrangeButton title="Verify Address" onPress={handleVerifyAddress} variant="normal" />

                        {isAddressValid && (
                                <Text style={styles.text}>Valid Address entered</Text>
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
                        
                        {/* Sign Up Button (Enabled only if address is verified) */}
                        <OrangeButton title="Sign Up" onPress={handleSignUp} testID="sign-up-button" disabled={!isAddressValid} variant="normal" />
                    </>
                )}

                {/* Sign In Link */}
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
        paddingTop: 100,
        paddingBottom: 300,
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 1,
    },
    backText: {
        marginLeft: 8,
        fontSize: 18,
        color: '#1E90FF',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    passwordCriteriaContainer: {
        marginBottom: 15,
    },
    criteriaText: {
        color: 'gray',
        fontSize: 14,
    },
    criteriaMet: {
        color: 'green', // Green for met criteria
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



const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        height: 50,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 15,
        color: 'black',
    },
    inputAndroid: {
        height: 50,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 15,
        color: 'black',
    },
});