import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Alert, View, Button, Text} from 'react-native';

import React, {useEffect, useState} from 'react';

// ServerKey
// AAAAMxMtxBo:APA91bHmGzo36GamL420vnbG7NLBR4syQwEMIqMn_iLbHpgK4UxmNtbUK-ldIErXlSZ3gKgZqux9BKen7oYp6P2BxUHv-ekTwZKkVQQg5gtBscA8zJfsEp0n2aJOSKmGVPcSO7F22YIu

// https://www.youtube.com/watch?v=Qcxa6dxfUFo

export async function RequestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
    console.log('Calling GetFCMToken');
    await GetFCMToken();
  }
}

async function GetFCMToken() {
  // Check to see if there is a token already saved in Local Storage
  let fcmtoken = await AsyncStorage.getItem('fcmtoken');
  console.log(fcmtoken, 'Got saved token from local storage');
  if (!fcmtoken) {
    try {
      console.log('Requesting new token from Firebase Messaging');
      fcmtoken = await messaging().getToken();
      console.log('FCM Token:', fcmtoken);
      if (fcmtoken) {
        console.log('Saving token to Async Storage');
        await AsyncStorage.setItem('fcmtoken', fcmtoken);
      } else {
        console.log('Failed to Get New Token from Firebase');
      }
    } catch (error) {
      console.log(error, 'Error in FCM token');
    }
  }
  console.log('Proceeding with Token: ', fcmtoken);
}

export const NotificationListener = async () => {
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log(
      'Notification Caused App to Open From Background State',
      remoteMessage.notification,
    );
  });

  // Check whether an initial notification is available
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        // loads of error without this if check!
        console.log(
          'Notification Caused App to Open From Quit State',
          remoteMessage.notification,
        );
      }
    });

  messaging().onMessage(async remoteMessage => {
    console.log('Notification on ForeGround State', remoteMessage);
    Alert.alert(
      remoteMessage.notification.title,
      remoteMessage.notification.body,
    );
    // NewMessage('none', remoteMessage);
  });
};

// export const NewMessage = (props, remoteMessage) => {
//   let msgdata = 'No new messages';
//   console.log('Handling New Message');
//   console.log('Props Name:', props.name);
//   if (remoteMessage.notification === undefined) {
//     //console.log('Ran New Message Init');
//     // eslint-disable-next-line react/react-in-jsx-scope
//     return <Text>{msgdata}</Text>;
//   } else {
//     console.log('Its not undefined');
//     console.log(remoteMessage.notification.body);
//     try {
//       //console.log('Received New Notification');
//       //console.log('MessageId:', remoteMessage.messageId);
//       //console.log('Message:', remoteMessage);
//       //console.log('Noification:', remoteMessage.notification);
//       console.log('Assign Value');
//       msgdata = remoteMessage.notification.body;
//       console.log('Assigned Value is: ', msgdata);
//       //console.log('Message Body:', msgdata);
//       // eslint-disable-next-line react/react-in-jsx-scope
//       console.log('Returning without error');
//       return (
//         <View>
//           <Text>I am {props.name}</Text>
//         </View>
//       );
//     } catch (e) {
//       console.log(e);
//       // eslint-disable-next-line react/react-in-jsx-scope
//       return <Text>Errored</Text>;
//     }
//   }
// };
