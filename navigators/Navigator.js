/* eslint-disable react/display-name */
import React, {useContext} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {
  getFocusedRouteNameFromRoute,
  NavigationContainer,
} from '@react-navigation/native';
import Home from '../views/Home';
import {MainContext} from '../contexts/MainContext';
import Login from '../views/Login';
import Profile from '../views/Profile';
import UpdateProfile from '../views/UpdateProfile';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SingleJob from '../views/SingleJob';
import {StyleSheet} from 'react-native';
import GlobalStyles from '../styles/GlobalStyles';
import Upload from '../views/Upload';
import Favourite from '../views/Favourite';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabScreen = () => {
  const {user} = useContext(MainContext);
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        // eslint-disable-next-line react/prop-types
        tabBarIcon: ({focused, color, size}) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Upload') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Favourites') {
            iconName = focused ? 'star' : 'star-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
      tabBarOptions={{
        activeTintColor: '#75B09C',
        inactiveTintColor: 'gray',
      }}
      sceneContainerStyle={GlobalStyles.appBackground}
    >
      <Tab.Screen name="Home" component={Home} />
      {user.employer && <Tab.Screen name="Upload" component={Upload} />}
      <Tab.Screen name="Favourites" component={Favourite} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
};

const StackScreen = () => {
  const {isLoggedIn} = useContext(MainContext);
  return (
    <Stack.Navigator>
      {isLoggedIn ? (
        <>
          <Stack.Screen
            name="Home"
            component={TabScreen}
            options={({route}) => ({
              headerTitle: getFocusedRouteNameFromRoute(route),
              headerStyle: styles.header,
            })}
          />
          <Stack.Screen
            name="Update Profile"
            component={UpdateProfile}
            options={() => ({
              headerStyle: styles.header,
            })}
          />
          <Stack.Screen name="Job Offer" component={SingleJob} />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Login"
            component={Login}
            options={() => ({
              headerShown: false,
            })}
          ></Stack.Screen>
        </>
      )}
    </Stack.Navigator>
  );
};

const Navigator = () => {
  return (
    <NavigationContainer>
      <StackScreen />
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#E0BE36',
  },
});

export default Navigator;
