import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';
import { RootStackParamList, MainTabParamList } from '../types';

// Auth Screens
import { LoginScreen, SignUpScreen, CreateProfileScreen } from '../screens/auth';
import { SplashScreen, OnboardingScreen, ONBOARDING_DONE_KEY } from '../screens/onboarding';

// Main Screens
import { HomeScreen, ContactsScreen, MyQRScreen, ProfileScreen, EditProfileScreen, NotificationsScreen, SettingsScreen, PrivacySecurityScreen, ChangePasswordScreen, LanguageScreen, AppearanceScreen, HelpSupportScreen, TermsOfServiceScreen, PrivacyPolicyScreen, AboutScreen } from '../screens/main';

// Contact Screens
import { ContactDetailScreen, AIFollowUpScreen } from '../screens/contacts';

// Scanner Screens
import { QRScannerScreen } from '../screens/scanner';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => {
    return (
        <Tab.Navigator
            detachInactiveScreens={false}
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.blue[500],
                tabBarInactiveTintColor: colors.text.tertiary,
                tabBarStyle: {
                    backgroundColor: colors.background.primary,
                    borderTopColor: colors.border.light,
                    paddingTop: 8,
                    paddingBottom: 8,
                    height: 64,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                },
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Feather name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Contacts"
                component={ContactsScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Feather name="users" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="MyQR"
                component={MyQRScreen}
                options={{
                    tabBarLabel: 'My QR',
                    tabBarIcon: ({ color, size }) => (
                        <Feather name="maximize" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Feather name="user" size={size} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

export const AppNavigator = () => {
    const { user, userProfile, loading, profileLoading } = useAuth();
    const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

    useEffect(() => {
        AsyncStorage.getItem(ONBOARDING_DONE_KEY).then((value: string | null) => {
            setOnboardingDone(value === 'true');
        });
    }, []);

    // Show splash while auth, profile, OR async-storage is loading
    if (loading || profileLoading || onboardingDone === null) {
        return <SplashScreen />;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!user ? (
                    // Auth Stack — show onboarding only on first launch
                    <>
                        {!onboardingDone && (
                            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                        )}
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="SignUp" component={SignUpScreen} />
                    </>
                ) : !userProfile ? (
                    // Onboarding Stack
                    <Stack.Screen name="CreateProfile" component={CreateProfileScreen} />
                ) : (
                    // Main App Stack
                    <>
                        <Stack.Screen name="Main" component={MainTabs} />
                        <Stack.Screen
                            name="ContactDetail"
                            component={ContactDetailScreen}
                            options={{ animation: 'slide_from_right' }}
                        />
                        <Stack.Screen
                            name="AIFollowUp"
                            component={AIFollowUpScreen}
                            options={{ animation: 'slide_from_right' }}
                        />
                        <Stack.Screen
                            name="QRScanner"
                            component={QRScannerScreen}
                            options={{
                                animation: 'slide_from_bottom',
                                presentation: 'fullScreenModal',
                            }}
                        />
                        <Stack.Screen
                            name="Notifications"
                            component={NotificationsScreen}
                            options={{ animation: 'slide_from_right' }}
                        />
                        <Stack.Screen
                            name="EditProfile"
                            component={EditProfileScreen}
                            options={{ animation: 'slide_from_right' }}
                        />
                        <Stack.Screen
                            name="Settings"
                            component={SettingsScreen}
                            options={{ animation: 'slide_from_right' }}
                        />
                        <Stack.Screen
                            name="PrivacySecurity"
                            component={PrivacySecurityScreen}
                            options={{ animation: 'slide_from_right' }}
                        />
                        <Stack.Screen
                            name="ChangePassword"
                            component={ChangePasswordScreen}
                            options={{ animation: 'slide_from_right' }}
                        />
                        <Stack.Screen
                            name="Language"
                            component={LanguageScreen}
                            options={{ animation: 'slide_from_right' }}
                        />
                        <Stack.Screen
                            name="Appearance"
                            component={AppearanceScreen}
                            options={{ animation: 'slide_from_right' }}
                        />
                        <Stack.Screen
                            name="HelpSupport"
                            component={HelpSupportScreen}
                            options={{ animation: 'slide_from_right' }}
                        />
                        <Stack.Screen
                            name="TermsOfService"
                            component={TermsOfServiceScreen}
                            options={{ animation: 'slide_from_right' }}
                        />
                        <Stack.Screen
                            name="PrivacyPolicy"
                            component={PrivacyPolicyScreen}
                            options={{ animation: 'slide_from_right' }}
                        />
                        <Stack.Screen
                            name="About"
                            component={AboutScreen}
                            options={{ animation: 'slide_from_right' }}
                        />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
