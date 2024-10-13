import * as React from 'react';
import { View, Text, TextInput, Button, Image, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';

export default function CreateIssue() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [professionalNeeded, setProfessionalNeeded] = useState('');
    const [image, setImage] = useState(null);

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            alert('Permission to access images is required!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.uri);
        }
    };

    const postIssue = () => {
        console.log("Issue Posted:", { title, description, professionalNeeded, image });
        alert("Issue posted successfully!");
    };

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Create New Issue</Text>

            <TextInput
                placeholder="Title"
                value={title}
                onChangeText={setTitle}
                style={{
                    borderWidth: 1,
                    borderColor: '#ccc',
                    padding: 10,
                    borderRadius: 5,
                    marginBottom: 15
                }}
            />

            <TextInput
                placeholder="Professional Needed"
                value={professionalNeeded}
                onChangeText={setProfessionalNeeded}
                style={{
                    borderWidth: 1,
                    borderColor: '#ccc',
                    padding: 10,
                    borderRadius: 5,
                    marginBottom: 15
                }}
            />

            <TextInput
                placeholder="Describe the issue..."
                value={description}
                onChangeText={setDescription}
                multiline
                style={{
                    borderWidth: 1,
                    borderColor: '#ccc',
                    padding: 10,
                    height: 100,
                    textAlignVertical: 'top',
                    borderRadius: 5,
                    marginBottom: 15
                }}
            />

            <TouchableOpacity onPress={pickImage} style={{ marginBottom: 15 }}>
                <View
                    style={{
                        backgroundColor: '#eee',
                        padding: 10,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 5,
                    }}
                >
                    <Text>Upload Image</Text>
                </View>
            </TouchableOpacity>

            {image && <Image source={{ uri: image }} style={{ width: 200, height: 200, marginBottom: 15 }} />}

            <Button title="Post Issue" onPress={postIssue} />
        </View>
    );
}
