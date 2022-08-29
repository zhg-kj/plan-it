import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert, Platform, Pressable, StyleSheet, Keyboard } from 'react-native';

import { Calendar, Input, Button, Autocomplete, AutocompleteItem, List, Divider, ListItem, Avatar, Layout, Text } from '@ui-kitten/components';
import { gql, useMutation } from '@apollo/client';
import { Friend } from '../types';
import { FontAwesome } from '@expo/vector-icons';

const CREATE_PLAN_MUTATION = gql`
mutation CreatePlan($start: String!, $end: String!, $scheduleId: ID!, $title: String!, $description: String) {
  createPlan(start: $start, end: $end, scheduleId: $scheduleId, title: $title, description: $description) {
    title
    description
    id
    start
    end
  }
}`;

const filterFriends = (item: Friend, query: string) => item.name.toLowerCase().includes(query.toLowerCase());

export default function CreatePlanScreen({ route, navigation }: { route: any, navigation: any }) {
  const [value, setValue] = useState('');
  const [friends, setFriends] = useState(route.params.friends);
  const [pFriends, setpFriends] = useState<Friend[]>([]);
  const [date, setDate] = useState(new Date());
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [planDates, setplanDates] = useState(['']);

  const [createPlan, plan] = useMutation(CREATE_PLAN_MUTATION);

  if (plan.error) {
    Alert.alert('Error creating plan.', plan.error.message);
  }

  if (plan.data) {
    console.log(plan.data)
    navigation.goBack()
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // This check is to prevent error on component mount. The refetch function is defined only after the query is run once
      // It also ensures that refetch runs only when you go back and not on component mount
      setplanDates(route.params.planDates)
    });

    return unsubscribe;
  }, [navigation]);

  const filterDates = (date: Date) => !planDates.includes(date.toISOString())

  const onSelect = (index: string | number) => {
    setpFriends(pFriends => [...pFriends, friends[index]]);
    Keyboard.dismiss()
  };

  const onChangeText = (query: string) => {
    setValue(query);
    setFriends(route.params.friends.filter((item: Friend) => filterFriends(item, query)));
  };

  const renderOption = (item: Friend, index: React.Key | null | undefined) => (
    <AutocompleteItem
      key={index}
      title={item.name}
      disabled={pFriends.map(a => a.id).includes(item.id)}
    />
  );

  const renderpFriends = ({ item }: {item: Friend}) => (
    <ListItem
      title={item.name}
      accessoryLeft = {() => (
        <Avatar source={{uri: "https://isobarscience.com/wp-content/uploads/2020/09/default-profile-picture1.jpg"}}/>
      )}
      accessoryRight = {delFriend(item)}
    />
  );

  const delFriend = (friend: Friend) => (
    <Pressable
      onPress={() => setpFriends(pFriends.filter(item => item.id !== friend.id))}
      style={({ pressed }) => ({
        opacity: pressed ? 0.5 : 1,
      })}>
      <FontAwesome
        name="close"
        size={25}
      />
    </Pressable>
  )

  return (
    <Layout style={styles.container}>
      <Text style={styles.title}>Create a new plan!</Text>
      <Autocomplete
        style={{width: '100%'}}
        placeholder='Add a friend!'
        value={value}
        onSelect={onSelect}
        onChangeText={onChangeText}>
        {friends.map(renderOption)}
      </Autocomplete>
      <List
        style={{width: '100%'}}
        data={pFriends}
        ItemSeparatorComponent={Divider}
        renderItem={renderpFriends}
      />
      <Input
          placeholder='Give your plan a name!'
          value={title}
          onChangeText={nextTitle => setTitle(nextTitle)}
      />
      <Input
        blurOnSubmit={true}
        multiline={true}
        placeholder="What's the plan?"
        value={description}
        onChangeText={nextDescription => setDescription(nextDescription)}
      />
      <Calendar
        date={date}
        onSelect={nextDate => setDate(nextDate)}
        filter={filterDates}
      />
      <Button onPress={() => {createPlan({variables: { start: date, end: date, scheduleId: route.params.schedule.id, title: title, description: description }})}}>
        Create Plan
      </Button>
    </Layout>
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
