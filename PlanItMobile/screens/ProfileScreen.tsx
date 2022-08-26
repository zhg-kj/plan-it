import { Alert, FlatList, Pressable, StyleSheet } from 'react-native';

import { Text, View } from '../components/Themed';
import { useEffect, useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import { Divider, List, ListItem, Button } from '@ui-kitten/components';
import { useNavigation } from '@react-navigation/native';
import { Friend, Schedule } from '../types';

const MY_FRIENDS = gql `query MyFriends {
  myFriends {
    name
  }
}`

const MY_SCHEDULES = gql `query MySchedules {
  mySchedules {
    id,
    title,
    isPrimary
  }
}`

export default function ProfileScreen() {
  const [friends, setFriends] = useState([])
  const [schedules, setSchedules] = useState([])

  const navigation = useNavigation();

  const myFriends = useQuery(MY_FRIENDS)
  const mySchedules = useQuery(MY_SCHEDULES)

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // This check is to prevent error on component mount. The refetch function is defined only after the query is run once
      // It also ensures that refetch runs only when you go back and not on component mount
      myFriends.refetch()
      mySchedules.refetch()
    });
    
    return unsubscribe;
  }, [navigation]);

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

  useEffect(() => {
    if (mySchedules.error) {
      Alert.alert('Error fetching friends.', mySchedules.error.message);
    }
  }, [mySchedules.error])

  useEffect(() => {
    if (mySchedules.data) {
      setSchedules(mySchedules.data.mySchedules);
    }
  }, [mySchedules.data])

  //add loading indicator if (loading)

  const renderSchedules = ({ item }: {item: Schedule}) => (
    <ListItem
      title={item.title}
      description={item.isPrimary}
      onPress={() => navigation.navigate('ScheduleScreen', { schedule: item })}
    />
  );

  const renderFriends = ({ item }: {item: Friend}) => (
    <ListItem
      title={item.name}
    />
  );

  return (
    <View style={styles.container}>
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
