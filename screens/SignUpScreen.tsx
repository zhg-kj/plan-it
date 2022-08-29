import React, { useState } from 'react'
import { View } from 'react-native'
import { Text, Input, Button, Layout } from '@ui-kitten/components'
import { useNavigation } from '@react-navigation/native'
import { gql, useMutation } from '@apollo/client'
import AsyncStorage from '@react-native-async-storage/async-storage';

const SIGN_UP_MUTATION = gql`
mutation SignUp($name: String!, $email: String!, $password: String!) {
  signUp(input: {name: $name, email: $email, password: $password}) {
    token
    user {
      id
      name
      email
    }
  }
}`;

const SignUpScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigation = useNavigation();

  const [signUp, { data, error, loading }] = useMutation(SIGN_UP_MUTATION);
  //mutation[0] is a function to trigger the mutation
  //mutation[1] is the resulting object has data specifying token, user {id,...}, error, and loading (while waiting for a response) etc.

  if (error) {
    console.log(error)
  }

  if (data) {
    AsyncStorage.setItem('token', data.signUp.token)
    //AsyncStorage.removeItem('token') to logout!!!!!!!!!!
    .then(() => navigation.navigate('Home'))
  }

  const onSubmit = () => {
    signUp({variables: { name: name, email: email, password: password }})
  }

  return (
    <Layout style={{flex: 1, justifyContent: 'center'}}>
      <Input
          placeholder='Name'
          value={name}
          onChangeText={nextName => setName(nextName)}
      />
      <Input
          placeholder='Email'
          value={email}
          onChangeText={nextEmail => setEmail(nextEmail)}
      />
      <Input
          placeholder='Password'
          value={password}
          onChangeText={nextPassword => setPassword(nextPassword)}
          secureTextEntry
      />
      <Button onPress={onSubmit} disabled={loading}>
        Sign Up
      </Button>
      <Button onPress={() => navigation.navigate('SignInScreen')} appearance='ghost'>
        Existing User? Sign In!
      </Button>
    </Layout>
  )
}

export default SignUpScreen