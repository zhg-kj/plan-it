import React, { useState } from 'react'
import { View } from 'react-native'
import { Text, Input, Button } from '@ui-kitten/components'
import { useNavigation } from '@react-navigation/native'
import { gql, useMutation } from '@apollo/client'
import AsyncStorage from '@react-native-async-storage/async-storage';

const SIGN_IN_MUTATION = gql`
mutation SignIn($email: String!, $password: String!) {
  signIn(input: {email: $email, password: $password}) {
    token
    user {
      id
      name
      email
    }
  }
}`;

const SignInScreen = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const navigation = useNavigation();

  const [signIn, { data, error, loading }] = useMutation(SIGN_IN_MUTATION);

  if (error) {
    console.log(error)
  }

  if (data) {
    console.log(data)
    AsyncStorage.setItem('token', data.signIn.token)
    .then(() => navigation.navigate('Home'))
  }

  const onSubmit = () => {
    signIn({variables: { email: email, password: password }})
  }

  return (
    <View style={{flex: 1, justifyContent: 'center'}}>
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
        Sign In
      </Button>
      <Button onPress={() => navigation.navigate('SignUpScreen')} appearance='ghost'>
        New User? Sign Up!
      </Button>
    </View>
  )
}

export default SignInScreen