import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import RNPickerSelect from 'react-native-picker-select';
import axios, {request} from 'axios';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons'; 
import OrangeButton from "../../../components/orangeButton";

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
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [street, setStreet] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [provinceOrState, setProvinceOrState] = useState('');
    const [country, setCountry] = useState('Canada');

    const [coordinates, setCoordinates] = useState(null);
    const [isAddressValid, setIsAddressValid] = useState(false);
    const [isEmailValid, setIsEmailValid] = useState(false); // New state for email validation
    const [isEmailFocused, setIsEmailFocused] = useState(false); // New state to track focus

    const [isPasswordFocused, setIsPasswordFocused] = useState(false); // New state for password focus

    const [showNameAndAddressFields, setShowNameAndAddressFields] = useState(false); // New state to control visibility

    // Password criteria states
    const [hasMinLength, setHasMinLength] = useState(false);
    const [hasNumber, setHasNumber] = useState(false);
    const [hasUppercase, setHasUppercase] = useState(false);
    const [hasLowercase, setHasLowercase] = useState(false);
    const [hasSpecialChar, setHasSpecialChar] = useState(false)

    // Show/hide password state
    const [showPassword, setShowPassword] = useState(false); // For password field
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // For confirm password field

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
        // validatePassword(text); // Validate password in real-time
    };

    // Handle password input focus
    const handlePasswordFocus = () => {
        setIsPasswordFocused(true);
    };

    // Handle password input blur
    const handlePasswordBlur = () => {
        setIsPasswordFocused(false);
    }

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

    const capitalizeFirstLetter = (text) => {
        if (!text) return text; // Return empty string if text is null or undefined
        return text.charAt(0).toUpperCase() + text.slice(1);
    };
    
    const filterNameInput = (text) => {
        // Use a regular expression to allow only letters and dashes
        return text.replace(/[^A-Za-z-]/g, '');
    };
    
    const validateName = (name) => {
        if (!name) return false; // Name cannot be empty
        return name.charAt(0) === name.charAt(0).toUpperCase(); // First letter must be capitalized
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
        if (isEmailValid && validatePasswords()) {
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
        if (!isEmailValid) {
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
                const response = await axios.post(`http://${IPAddress}:3000/client/register`, {
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
            const response = await axios.post(`http://${IPAddress}:3000/client/verifyAddress`, {
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

    // Derived state for password validity
    const isPasswordValid = hasMinLength && hasNumber && hasUppercase && hasLowercase && hasSpecialChar;

    return (
        <ScrollView >
            <View style={styles.container}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={28} color="#1E90FF" />
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
                
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

                {/* Password Field */}
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={[
                            styles.input,
                            isPasswordFocused && password.length > 0 && !isPasswordValid && styles.invalidInput, // Red if invalid and focused
                            isPasswordFocused && password.length > 0 && isPasswordValid && styles.validInput, // Green if valid and focused
                            { flex: 1, paddingRight: 50 }, // Add padding to prevent text overlap with icons
                        ]}
                        placeholder="Password"
                        value={password}
                        onChangeText={handlePasswordChange}
                        onFocus={handlePasswordFocus}
                        onBlur={handlePasswordBlur}
                        secureTextEntry={!showPassword} // Toggle secureTextEntry based on showPassword state
                        textContentType="none" // Disable password autofill and suggestions
                    />
                    <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setShowPassword(!showPassword)} // Toggle password visibility
                    >
                        <Ionicons
                            name={showPassword ? 'eye-off' : 'eye'} // Change icon based on showPassword state
                            size={24}
                            color="#888"
                        />
                    </TouchableOpacity>
                </View>
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
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={[
                            styles.input,
                            { flex: 1, paddingRight: 50 }, // Add padding to prevent text overlap with icons
                        ]}
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChangeText={handleConfirmPasswordChange}
                        secureTextEntry={!showConfirmPassword} // Toggle secureTextEntry based on showConfirmPassword state
                        textContentType="none" // Disable password autofill and suggestions
                    />
                    <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)} // Toggle confirm password visibility
                    >
                        <Ionicons
                            name={showConfirmPassword ? 'eye-off' : 'eye'} // Change icon based on showConfirmPassword state
                            size={24}
                            color="#888"
                        />
                    </TouchableOpacity>
                </View>

                {/* Button to Proceed to Name and Address Fields */}
                {!showNameAndAddressFields && (
                    <OrangeButton title="Next" onPress={checkEmailAndPassword} variant="normal" />
                )}

                {/* Name and Address Fields (Conditional Rendering) */}
                {showNameAndAddressFields && (
                    <>

                        <TextInput
                            style={styles.input}
                            placeholder="First Name"
                            value={firstName}
                            onChangeText={(text) => {
                                const filteredText = filterNameInput(text); // Filter out invalid characters
                                setFirstName(capitalizeFirstLetter(filteredText)); // Capitalize the first letter
                            }}
                            autoCapitalize="words"
                            keyboardType="default"
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Last Name"
                            value={lastName}
                            onChangeText={(text) => {
                                const filteredText = filterNameInput(text); // Filter out invalid characters
                                setLastName(capitalizeFirstLetter(filteredText)); // Capitalize the first letter
                            }}
                            autoCapitalize="words"
                            keyboardType="default"
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="House number and Street"
                            value={street}
                            onChangeText={setStreet}
                            autoCapitalize="words"
                        />
                         <TextInput
                            style={styles.input}
                            placeholder="Postal Code"
                            value={postalCode}
                            onChangeText={formatPostalCode}
                            maxLength={7}
                        />
                    <RNPickerSelect
                        onValueChange={(value) => setProvinceOrState(value)}
                        items={CANADIAN_PROVINCES.map((province) => ({
                            label: province,
                            value: province,
                        }))}
                        placeholder={{ label: 'Select Province', value: null }}
                        style={pickerSelectStyles}
                    />
                        <TextInput
                            style={[styles.input, { backgroundColor: '#f0f0f0' }]} // Disabled style
                            placeholder="Canada"
                            value={country}
                            editable={false} // Disable editing
                        />
                        <OrangeButton title="Verify Address" onPress={handleVerifyAddress} variant="normal" />

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
                        
                        {/* Sign Up Button (Enabled only if address is verified) */}
                        <OrangeButton title="Sign Up" onPress={handleSignUp} disabled={!isAddressValid} variant="normal" />
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
        paddingTop:100,
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
    picker: {
        height: 50, // Fixed height for the Picker
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 15,
    },
    invalidInput: {
        borderColor: 'red', // Highlight the input field with a red border if invalid
    },
    validInput: {
        borderColor: 'green', // Highlight the input field with a green border if valid
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative', // Ensure the container is relative for absolute positioning of icons
    },
    eyeIcon: {
        position: 'absolute',
        right: 15,
        top: 12,
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
    button: {
        backgroundColor: '#1E90FF',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#ccc', // Disabled button color
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