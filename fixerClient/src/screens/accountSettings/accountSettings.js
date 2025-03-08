import React, {useState} from "react";
import {View, Text, StyleSheet, TouchableOpacity, ViewStyle, SafeAreaView, ScrollView, TextInput, Alert} from 'react-native';
import {useNavigation}  from "@react-navigation/native";
import {Ionicons, MaterialIcons} from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";

const AccountSettingsPage = () => {
    const navigation = useNavigation();

    const [formData, setFormData] = useState({
        firstName: 'John',
        lastName: 'Doe',
        oldPassword:'old one',
        newPassword:'new one',
        confirmNewPassword:'confirm new password'
    });

    const [isEditing, setIsEditing] = useState(false);

    const handleInputChange = (field,value) => {

        setFormData({...formData, [field]: value});
    };

    const handleSaveChanges = (field, value) => {
        if (formData.newPassword && formData.newPassword!==formData.confirmNewPassword){
            Alert.alert('Error', 'New passwords do not match');
            return;
        }

        Alert.alert('Success', 'Passwords match');
        setIsEditing(false);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/*Custom header*/}
            <View style={styles.header}>
                <TouchableOpacity onPress={()=>navigation.goBack()}>
                    <Ionicons name="arrow-back" size={28} color={'#333'}/>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Account Settings</Text>

                {/*Edit button*/}
                <TouchableOpacity onPress={()=>setIsEditing(!isEditing)}>
                    <MaterialIcons name={'edit'} size={24} color={isEditing ? 'gray':'black'}/>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                {/*Input fields*/}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>First Name</Text>
                    <TextInput
                        style={[styles.input, !isEditing && styles.disabledInput]}
                        value={formData.firstName}
                        onChangeText={(text)=>handleInputChange('firstName', text)}
                        editable={isEditing}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Last Name</Text>
                    <TextInput
                        style = {[styles.input, !isEditing && styles.disabledInput]}
                        value={formData.lastName}
                        onChangeText={(text)=>handleInputChange('lastName', text)}
                        editable={isEditing}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Address</Text>
                    <TextInput
                        style={[styles.input, !isEditing && styles.disabledInput]}
                        value={formData.address}
                        onChangeText={(text)=>handleInputChange('address', text)}
                        editable={isEditing}
                    />
                </View>

                {/*Password section*/}
                <Text style={styles.sectionHeader}>Change Password</Text>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Old password</Text>
                    <TextInput style={styles.input}
                               secureTextEntry
                               value={formData.oldPassword}
                               onChangeText={(text)=>handleInputChange('oldPassword', text)}
                               editable={isEditing}
                    />
                </View>

                <View style = {styles.formGroup}>
                    <Text style={styles.label}>New Password</Text>
                    <TextInput style={styles.input}
                               secureTextEntry
                               value={formData.newPassword}
                               onChangeText={(text)=>handleInputChange('newPassword', text)}
                               editable={isEditing}

                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Confirm Password</Text>
                    <TextInput style={styles.input}
                               secureTextEntry
                               value={formData.confirmNewPassword}
                               onChangeText={(text)=>handleInputChange('confirmNewPassword',text)}
                               editable={isEditing}
                    />
                </View>

                {/*Save button*/}
                {isEditing && (
                    <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
                        <Text style={styles.saveButtonText}>Save changes</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    container: {
        padding: 16,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
    formGroup: {
        marginBottom: 12,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    disabledInput: {
        backgroundColor: '#f0f0f0',
        color: '#777',
    },
    saveButton: {
        backgroundColor: 'orange',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default AccountSettingsPage;