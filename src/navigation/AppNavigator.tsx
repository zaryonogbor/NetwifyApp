import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';
import { RootStackParamList, MainTabParamList } from '../types';

// Auth Screens
import { LoginScreen, SignUpScreen, CreateProfileScreen } from '../screens/auth';

// Main Screens
import { HomeScreen, ContactsScreen, MyQRScreen, ProfileScreen, EditProfileScreen } from '../screens/main';

// Contact Screens
import { ContactDetailScreen, AIFollowUpScreen } from '../screens/contacts';

// Scanner Screens
import { QRScannerScreen } from '../screens/scanner';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.primary[600],
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
    const { user, userProfile, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background.primary }}>
                <ActivityIndicator size="large" color={colors.primary[600]} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!user ? (
                    // Auth Stack
                    <>
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
                            name="EditProfile"
                            component={EditProfileScreen}
                            options={{ animation: 'slide_from_right' }}
                        />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
