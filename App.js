import React, { Component } from 'react'
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { GoogleSignin, GoogleSigninButton, statusCodes } from 'react-native-google-signin'; 
import { LoginManager, AccessToken } from 'react-native-fbsdk';
import {firebase} from '@react-native-firebase/iid';
import RNFirebase from '@react-native-firebase/app';
import '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';



async function getInstanceId() {
  const id = await firebase.iid().getToken();
  console.log('FCM ID========> ', id);
  return id;
  }
  
  const checkPermission = async () => {
  const enabled = await RNFirebase.messaging()
  .isRegisteredForRemoteNotifications;
  if (enabled) {
  await firebase.messaging().registerForRemoteNotifications();
          getFcmToken();
      } else {
      requestPermission();
      }
      };
  
  const getFcmToken = async () => {
      const fcmToken = await firebase.iid().getToken();
      if (fcmToken) {
      console.log('TOKEN=====>', fcmToken);
      firebase
      .messaging()
      .subscribeToTopic('djx')
      .then(response => console.log('Successfully subscribed to topic:'))
      .catch(error => console.log('unsuccessfully ', error));
  } 
  else {
  }
  };
  
  const requestPermission = async () => {
      try {
      await RNFirebase.messaging().requestPermission();
      // User has authorised
      } catch (error) {
      // User has rejected permissions
      }
  };
  
  let messageListener = async () => {
 
  
  messageListener = RNFirebase.messaging().onMessage(message => {
  console.log('Notifcation message', message);
  });
  };

export default class App extends Component {




  async componentDidMount() {


 
    let _this = this;
    PushNotification.configure({
    onRegister: function(tok) {
    //process token
    console.log('TOKEN', JSON.stringify(tok));
    },
    
    // onNotification: function(notification) {
    // // process the notification
    // // required on iOS only
    // notification.finish(PushNotificationIOS.FetchResult.NoData);
    // },
    senderId: '261651806594',
    
    permissions: {
    alert: true,
    badge: true,
    sound: true,
    },
    
    popInitialNotification: true,
    requestPermissions: true,
    });
    //configure();
    await checkPermission();
    await messageListener();
    if (Platform.OS === 'ios') {
    getInstanceId().then(id => {
    console.log('ID => ', id);
    this.props.dispatch(action.fcmidaction(id));
    this.setState(
    {
    ...this.state,
    auth: {...this.state.auth, fcm_id: id},
    },
    () => {
    this.props.dispatch(
    action.registerApiAction(this.state.auth, res => {
    if (res.status === 1) {
    this.setState((state, props) => {
    return {
    ...state,
    isRegistered: true,
    };
    });
    }
    }),
    );
    },
    );
    });
    } else {
    getInstanceId().then(id => {
    console.log('ID => ', id);
    this.props.dispatch(action.fcmidaction(id));
    console.log('STORE => ', id);
    this.setState(
    {
    ...this.state,
    auth: {...this.state.auth, fcm_id: id},
    },
    () => {
    this.props.dispatch(
    action.registerApiAction(this.state.auth, res => {
    if (res.status === 1) {
    console.log('REGISTER');
    this.setState((state, props) => {
    return {
    ...state,
    isRegistered: true,
        };
          });
            }
          }),
        );
        },
      );
  });
    }
    
   
    }


  async handleGoogleLogin() {
    console.log("Clicked")
              GoogleSignin.configure();
              try {
                console.log("In Try Block")
              await GoogleSignin.hasPlayServices();
              console.log("After Play Services")

              const userInfo = await GoogleSignin.signIn();
              let request = {
              name: userInfo.user.name,
              email: userInfo.user.email,
              type: 'google',
              };
              //this.handleSocialLogin(request);
              console.log("UserInfo",userInfo)

              } catch (error) {
              if (error.code === statusCodes.SIGN_IN_CANCELLED) {
              Alert.alert('Login was cancelled');
              } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
              Alert.alert('Login failed with error: ', 'PLAY SERVICES NOT AVAILABLE');
              } else {
              Alert.alert(error + '');
              }
              }
    }

    handleFacebookLogin() {
      if (Platform.OS === 'android') {
      LoginManager.setLoginBehavior('web_only');
      }
      LoginManager.logInWithPermissions(['public_profile', 'email'])
      .then(result => {
      if (result.isCancelled) {
      Alert.alert('Login was cancelled');
      } else {
      console.log(result);
      AccessToken.getCurrentAccessToken().then(data => {
      const {accessToken} = data;
      fetch(
      'https://graph.facebook.com/v6.0/me?fields=id,name,email&access_token=' +
      accessToken,
      )
      .then(response => response.json())
      .then(json => {
        console.log("Json values------->",json)
      // Some user object has been set up somewhere, build that user here
      let request = {
      name: json.name,
      email: json.email,
      type: 'facebook',
      };
      // this.setState({fbEmail:json.email})
      // this.setState({fbName:json.name})
      // this.loginWithSocialAcc(json.email,json.name,json);
      })
      .catch(error => {
      Alert.alert(error);
      });
      });
      }
      })
      .catch(error => {
      Alert.alert('Login failed with error: ', error);
      });
  }
    

  render() {
   return(
     <View>
        <GoogleSigninButton
      style={{ width: 192, height: 48 }}
      size={GoogleSigninButton.Size.Wide}
      color={GoogleSigninButton.Color.Dark}
      onPress={this.handleGoogleLogin}
      //disabled={this.state.isSigninInProgress} 
      />

      <TouchableOpacity onPress={()=>{this.handleFacebookLogin()}}><Text>Facebook login</Text></TouchableOpacity>
      <Text style={{                        fontFamily: 'Poppins-Regular',
}}>sgdjshghjfgsjfgjsdgfjgsfgs</Text>
     </View>
   );
  }
}

const styles = StyleSheet.create({})
