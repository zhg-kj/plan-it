import React, { useEffect, useState } from 'react';
import { Alert, Keyboard, SafeAreaView, StyleSheet } from 'react-native';

import { Card, List, Text, Layout, Autocomplete, AutocompleteItem, Avatar, Icon, Button } from '@ui-kitten/components';

import { useQuery, gql, useMutation } from '@apollo/client';

import { Friend } from '../types';
import { useNavigation } from '@react-navigation/native';

/***QUERIES***/
const MY_FRIENDS = gql `query MyFriends {
  myFriends {
    name
    id
    avatar
  }
}`

const MY_USERS = gql `query GetUsers {
  getUsers {
    id
    name 
    avatar
  }
}`

/***MUTATIONS***/
const ADD_FRIEND = gql `mutation AddFriend($friendId: ID!) {
  addFriend(friendId: $friendId) {
    id
    name
  }
}`

const DELETE_FRIEND = gql `mutation DeleteFriend($friendId: ID!) {
  deleteFriend(friendId: $friendId) {
    id
    name
  }
}`

export default function AddFriendsScreen() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [users, setUsers] = useState<Friend[]>([])
  const [acValue, setAcValue] = useState('');

  const navigation = useNavigation();

  /***QUERIES***/
  // Friends Query
  const myFriends = useQuery(MY_FRIENDS)

  useEffect(() => {
    if (myFriends.error) {
      Alert.alert('Error fetching friends.', myFriends.error.message);
    }
  }, [myFriends.error])

  useEffect(() => {
    if (myFriends.data) {
      setFriends(myFriends.data.myFriends);
    }
  }, [myFriends.data])

  // Users Query
  const myUsers = useQuery(MY_USERS)

  useEffect(() => {
    if (myUsers.error) {
      Alert.alert('Error fetching users.', myUsers.error.message);
    }
  }, [myUsers.error])

  useEffect(() => {
    if (myUsers.data) {
      setUsers(myUsers.data.getUsers);
    }
  }, [myUsers.data])

  // Refetch Queries 
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      myFriends.refetch()
    });
    
    return unsubscribe;
  }, [navigation]);

  /***MUTATIONS***/
  // Add Friend Mutation
  const [addFriend, afriend] = useMutation(ADD_FRIEND, {
    refetchQueries: [
      {query: MY_FRIENDS},
      'MyFriends'
    ],
  });

  if (afriend.error) {
    Alert.alert('Error adding friend.', afriend.error.message);
  }

  // Delete Friend Mutation
  const [deleteFriend, dfriend] = useMutation(DELETE_FRIEND, {
    refetchQueries: [
      {query: MY_FRIENDS}, 
      'MyFriends'
    ],
  });

  if (dfriend.error) {
    Alert.alert('Error deleting friend.', dfriend.error.message);
  }

  // Autocomplete
  const filter = (item: { name: string; }, query: string) => item.name.toLowerCase().includes(query.toLowerCase());

  const onChangeText = (query: string) => {
    setAcValue(query);
    setUsers(myUsers.data.getUsers.filter((item: any) => filter(item, query)));
  };

  const renderOption = (item: Friend, index: number) => (
    <AutocompleteItem
      key={index}
      title={item.name}
      accessoryRight={
        <Layout>
          {friends.map(a => a.id).includes(item.id) ? (
            <Icon style={{ width: 24, height: 24, tintColor: 'red' }} onPress={() => deleteFriend({variables: {friendId: users[index].id}})} name='person-delete-outline' />
          ) : (
            <Icon style={{ width: 24, height: 24, tintColor: 'green' }} onPress={() => addFriend({variables: {friendId: users[index].id}})} name='person-add-outline' />
          )}
        </Layout>
      }
      style={{alignItems: 'center', justifyContent: 'center'}}
      disabled={true}
    />
  );
  
  return (
    <SafeAreaView style={styles.rootContainer}>
      <Layout style={{padding: 20}}>
        <Autocomplete
          style={{width: '100%'}}
          placeholder='Add a friend!'
          value={acValue}
          onChangeText={onChangeText}>
          {users.map(renderOption)}
        </Autocomplete>
      </Layout>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: 'white'
  },
})