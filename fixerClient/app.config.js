export default {
  expo: {
    plugins: ["expo-localization"],
    name: "MyNewProject",
    slug: "MyNewProject",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_KEY
      },
      bundleIdentifier: "com.mynewproject.app"
    },
    android: {
      newArchEnabled: false,
      package: "com.mynewproject.app",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      config: {
        googleMaps: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_KEY
        }
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      eas: {
        projectId: "2946827b-9037-4f1b-866f-9dd9ea93edab"
      }
    }
  }
};
