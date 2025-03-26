import React, { useState } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import { View, StyleSheet } from 'react-native';
import colors from '../style/colors';
import styles from '../style/dropdownStyle';

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
                style={[
                    styles.dropdown,
                    { borderColor: open ? colors.orange.normal : '#ccc' },
                ]}
                dropDownContainerStyle={styles.dropdownList}
                textStyle={styles.dropdownText}
                listMode="SCROLLVIEW"
                zIndex={zIndex}
            />
        </View>
    );
};

export default DropdownField;
