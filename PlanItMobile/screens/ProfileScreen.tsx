import { Alert, FlatList, Keyboard, Pressable, StyleSheet } from 'react-native';

import { Text, View } from '../components/Themed';
import { Key, SetStateAction, useEffect, useState } from 'react';
import { useQuery, gql, useMutation } from '@apollo/client';
import { Divider, List, ListItem, Autocomplete, AutocompleteItem, Toggle } from '@ui-kitten/components';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Friend, Schedule } from '../types';

const MY_USERS = gql `query GetUsers {
  getUsers {
    id
    name 
    avatar
  }
}`

const MY_FRIENDS = gql `query MyFriends {
  myFriends {
    name
    id
  }
}`
//ADD AVATAR

const MY_SCHEDULES = gql `query MySchedules {
  mySchedules {
    id,
    title,
    isActive
  }
}`

const ADD_FRIEND_MUTATION = gql `mutation AddFriend($friendId: ID!) {
  addFriend(friendId: $friendId) {
    id
    name
  }
}`

const DELETE_FRIEND_MUTATION = gql `mutation DeleteFriend($friendId: ID!) {
  deleteFriend(friendId: $friendId) {
    id
    name
  }
}`

const SET_ACTIVE_MUTATION = gql `mutation SetActive($setActiveId: ID!, $isActive: Int) {
  setActive(id: $setActiveId, isActive: $isActive) {
    id
    userId
    title
    isActive
    lastUpdated
  }
}`

const CREATE_SCHEDULE_MUTATION = gql `mutation CreateSchedule($title: String!) {
  createSchedule(title: $title) {
    id
    userId
    title
    isActive
    lastUpdated
  }
}`

const filter = (item: { name: string; }, query: string) => item.name.toLowerCase().includes(query.toLowerCase());

export default function ProfileScreen() {
  const [value, setValue] = useState('');
  const [users, setUsers] = useState<Friend[]>([])
  const [friends, setFriends] = useState<Friend[]>([])
  const [schedules, setSchedules] = useState([])

  const navigation = useNavigation();

  // Queries
  const myUsers = useQuery(MY_USERS)
  const myFriends = useQuery(MY_FRIENDS)
  const mySchedules = useQuery(MY_SCHEDULES)

  // Mutations
  const [addFriend, afriend] = useMutation(ADD_FRIEND_MUTATION, {
    refetchQueries: [
      {query: MY_FRIENDS},
      'MyFriends'
    ],
  });

  if (afriend.error) {
    Alert.alert('Error adding friend.', afriend.error.message);
  }

  if (afriend.data) {
    console.log(afriend.data)
  }

  const [deleteFriend, dfriend] = useMutation(DELETE_FRIEND_MUTATION, {
    refetchQueries: [
      {query: MY_FRIENDS}, 
      'MyFriends'
    ],
  });

  if (dfriend.error) {
    Alert.alert('Error deleting friend.', dfriend.error.message);
  }

  if (dfriend.data) {
    console.log(dfriend.data)
  }

  const [setActive, active] = useMutation(SET_ACTIVE_MUTATION)

  if (active.error) {
    Alert.alert('Error changing active status.', active.error.message);
  }

  if (active.data) {
    console.log(active.data)
  }

  const [setSchedule, schedule] = useMutation(CREATE_SCHEDULE_MUTATION)

  if (schedule.error) {
    Alert.alert('Error creating schedule.', schedule.error.message);
  }

  if (schedule.data) {
    console.log(schedule.data)
  }
  
  // Unsuscribe
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // This check is to prevent error on component mount. The refetch function is defined only after the query is run once
      // It also ensures that refetch runs only when you go back and not on component mount
      setValue('')
      myUsers.refetch()
      myFriends.refetch()
      mySchedules.refetch()
    });
    
    return unsubscribe;
  }, [navigation]);

  // Users Query
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

  // Friends Query
  useEffect(() => {
    if (myFriends.error) {
      Alert.alert('Error fetching friends.', myFriends.error.message);
    }
  }, [myFriends.error])

  useEffect(() => {
    if (myFriends.data) {
      console.log(myFriends.data)
      setFriends(myFriends.data.myFriends);
    }
  }, [myFriends.data])

  // Schedules Query
  useEffect(() => {
    if (mySchedules.error) {
      Alert.alert('Error fetching schedules.', mySchedules.error.message);
    }
  }, [mySchedules.error])

  useEffect(() => {
    if (mySchedules.data) {
      setSchedules(mySchedules.data.mySchedules);
    }
  }, [mySchedules.data])

  //add loading indicator if (loading)

  // Lists
  const renderSchedules = ({ item }: {item: Schedule}) => (
    <ListItem
      title={item.title}
      accessoryRight={() => (<Toggle checked={item.isActive === 1} onChange={() => setActive({variables: {setActiveId: item.id, isActive: (item.isActive === 1 ? (0) : (1))}})}>
        Active
      </Toggle>)}
      onPress={() => navigation.navigate('ScheduleScreen', { schedule: item, friends: friends })}
    />
  );

  const delFriend = (friend: Friend) => (
    <Pressable
      onPress={() => deleteFriend({variables: {friendId: friend.id}})}
      style={({ pressed }) => ({
        opacity: pressed ? 0.5 : 1,
      })}>
      <FontAwesome
        name="close"
        size={25}
      />
    </Pressable>
  )

  const renderFriends = ({ item }: {item: Friend}) => (
    <ListItem
      title={item.name}
      accessoryRight = {delFriend(item)}
    />
  );

  // Autocomplete
  const onSelect = (index: number) => {
    addFriend({variables: {friendId: users[index].id}});
    Keyboard.dismiss()
  };

  const onChangeText = (query: string) => {
    setValue(query);
    setUsers(myUsers.data.getUsers.filter((item: any) => filter(item, query)));
  };

  const renderOption = (item: Friend, index: Key | null | undefined) => (
    <AutocompleteItem
      key={index}
      title={item.name}
      disabled={friends.map(a => a.id).includes(item.id)}
      //style={} GIVE STYLE FOR DISABLED VS ACTIVE
    />
  );

  return (
    <View style={styles.container}>
      <Autocomplete
        style={{width: '100%'}}
        placeholder='Add a friend!'
        value={value}
        onSelect={onSelect}
        onChangeText={onChangeText}>
        {users.map(renderOption)}
      </Autocomplete>
      <List
        style={{width: '100%'}}
        data={friends}
        ItemSeparatorComponent={Divider}
        renderItem={renderFriends}
      />
      <List
        style={{width: '100%'}}
        data={schedules}
        ItemSeparatorComponent={Divider}
        renderItem={renderSchedules}
      />
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
