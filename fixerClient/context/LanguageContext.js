import React, { createContext, useState, useEffect } from "react";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [locale, setLocale] = useState(Localization.getLocales()[0].languageCode);
    useEffect(() => {
        // Load saved language
        const loadLanguage = async () => {
            const savedLanguage = await AsyncStorage.getItem("appLanguage");
            if (savedLanguage) setLocale(savedLanguage);
        };
        loadLanguage();
    }, []);

    const changeLanguage = async (newLocale) => {
        setLocale(newLocale);
        await AsyncStorage.setItem("appLanguage", newLocale); // Persist language
    };

    return (
        <LanguageContext.Provider value={{ locale, changeLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}
