import React, { useEffect } from 'react'
import { Spinner, Layout } from '@ui-kitten/components'
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SplashScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const checkUser = async () => {
      if (await isAuthenticated()) {
        navigation.navigate('Home')
      } else {
        navigation.navigate('SignInScreen')
      }
    }
    
    checkUser();
  }, []);

  const isAuthenticated = async () => {
    const token = await AsyncStorage.getItem('token');
    return !!token;
  }

  return (
    <Layout style={{flex: 1, justifyContent: 'center'}}>
      <Spinner size='giant'/>
    </Layout>
  )
}

export default SplashScreen