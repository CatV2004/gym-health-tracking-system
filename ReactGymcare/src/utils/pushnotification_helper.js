import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';

export async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
  }
}

async function getFCMToken() {
    let fcmtoken = await AsyncStorage.getItem("fcmtoken");
    if (!fcmtoken) {
        try {
            let fcmtoken = messaging().getToken();
            if (fcmtoken){
                AsyncStorage.setItem("fcmtoken", fcmtoken);
            }
        } catch (error) {
            console.log(error,"error in fcm token")
        }

    }
}

export const NotificationListener = () => {
    messaging().onNotificationOpenedApp(remoteMessage => {
        console.log(
            'Notification caused app to open from background state: ',
        remoteMessage.notification,);
    });

    messaging()
    .getInitialNotification()
    .then(remoteMessage => {
        if(remoteMessage) {
            console.log('Notification caused app to open from quit state:',
                remoteMessage.notification,
            );
        }
    });

    messaging().onMessage(async remoteMessage => {
        console.log("Notification on froground state...", remoteMessage);
    });
}