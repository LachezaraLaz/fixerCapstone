import React, { useState } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import { View, StyleSheet } from 'react-native';
import colors from '../style/colors'; // Assuming you have a shared color palette

const DropdownField = ({
    items,
    value,
    setValue,
    placeholder,
    open,
    setOpen,
    setItems,
    disabled = false,
    zIndex = 1000,
}) => {
    return (
        <View style={[styles.dropdownContainer, disabled && styles.disabledDropdown]}>
            <DropDownPicker
                open={open}
                value={value}
                items={items}
                setOpen={setOpen}
                setValue={setValue}
                setItems={setItems}
                placeholder={placeholder}
                disabled={disabled}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownList}
                textStyle={styles.dropdownText}
                listMode="SCROLLVIEW"
                zIndex={zIndex}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    dropdownContainer: {
        marginVertical: 8,
        marginHorizontal: 8,
        zIndex: 1000,
    },
    dropdown: {
        backgroundColor: '#fff',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 14,
        height: 50,
    },
    dropdownText: {
        fontSize: 14,
        color: '#000',
        fontWeight: 'bold',
    },
    dropdownList: {
        borderColor: '#ccc',
        borderRadius: 8,
        backgroundColor: '#fff',
        zIndex: 2000,
    },
    disabledDropdown: {
        opacity: 0.6,
    },
});

export default DropdownField;
