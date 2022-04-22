import { StatusBar } from 'expo-status-bar';
import React, {useEffect, useRef,useState} from 'react';
import { Image } from "react-native";
import { StyleSheet, Text, View, Alert, Platform } from 'react-native';
import { AppLoading } from "expo";
import { useFonts } from '@use-expo/font';
import { Asset } from "expo-asset";
import { NavigationContainer } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Before rendering any navigation stack
import { enableScreens } from "react-native-screens";
enableScreens();

import { Block, GalioProvider } from "galio-framework";

import config from './config';

// import * as Notifications from 'expo-notifications';
// import * as Permissions from 'expo-permissions';
//App Screens
import Screens from './navigation/Screens';


import { Images, articles, argonTheme } from './constants';
import { SharedStateProvider } from './store/store';
import 'expo-asset';
import OneSignal from 'react-native-onesignal'; // Import package from node modules





const App=()=>{
  
 
  useEffect(()=>{
    OneSignalSetup()
   
    // return () => {
    //   cleanup
    // }
  },[])

  const OneSignalSetup=async()=>{
  console.log('hii')
  //OneSignal Init Code
OneSignal.setLogLevel(6, 0);

OneSignal.setAppId("1ccef643-1099-4c91-a010-e279cb062098");
// const pushToken = await OneSignal.getDeviceState().pushToken;
// alert(pushToken)
//END OneSignal Init Code
// OneSignal.idsAvailable((idsAvailable) => { 
//   alert(idsAvailable.playerId);
//   alert(idsAvailable.pushToken);
// });

if (Platform.OS == 'ios') {
  OneSignal.promptForPushNotificationsWithUserResponse((response) => {
    console.log('Prompt response:', response);
  });
}


//Method for handling notifications received while app in foreground




  }

  const getDeviceState=async()=>{
    const deviceState = await OneSignal.getDeviceState();
    console.log(deviceState.userId)
  }
  
  getDeviceState()
  return (
    <NavigationContainer>
      <GalioProvider theme={argonTheme}>
        <SharedStateProvider>
          <Block flex>
            <Screens />
          </Block>
        </SharedStateProvider>
      </GalioProvider>
    </NavigationContainer>
    
  );
}

export default App;