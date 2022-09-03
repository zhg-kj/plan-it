import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, SafeAreaView } from 'react-native';

import { Input, Button, Autocomplete, AutocompleteItem, List, Avatar, Layout, Text, Icon, Datepicker, Card, Modal } from '@ui-kitten/components';
import { gql, useMutation, useQuery } from '@apollo/client';
import { Friend, Plan } from '../types';

/***QUERIES***/
const MY_FRIENDS = gql `query MyFriends {
  myFriends {
    name
    id
    avatar
  }
}`

const GET_PLANS_BY_USER_IDS = gql `query GetPlansByUserIds($users: [String]!) {
  getPlansByUserIds(users: $users) {
    title
    description
    id
    start
    userIds
    end
  }
}`

/***MUTATIONS***/
const CREATE_PLAN = gql `mutation CreatePlan($start: String!, $end: String!, $scheduleId: ID!, $title: String!, $description: String, $users: [String]) {
  createPlan(start: $start, end: $end, scheduleId: $scheduleId, title: $title, description: $description, users: $users) {
    title
    description
    id
    start
    end
    userIds
  }
}`;

export default function CreatePlanScreen({ route, navigation }:{ route: any, navigation: any }) {
  const [value, setValue] = useState('');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [planFriends, setPlanFriends] = useState<Friend[]>([{id: '', name: 'You', avatar: "https://isobarscience.com/wp-content/uploads/2020/09/default-profile-picture1.jpg"}]);
  const [editingInvited, setEditingInvited] = useState<boolean>(false);
  const [date, setDate] = useState(new Date());
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [busyDates, setBusyDates] = useState(['']);

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

  // Plans Query
  const plansQuery = useQuery(GET_PLANS_BY_USER_IDS, { variables: { users: planFriends.slice(1).map(f => f.id) }})

  useEffect(() => {
    if (plansQuery.error) {
      Alert.alert('Error fetching plans.', plansQuery.error.message);
    }
  }, [plansQuery.error])

  useEffect(() => {
    if (plansQuery.data) {
      setBusyDates(plansQuery.data.getPlansByUserIds.map((p: Plan) => p.start))
    }
  }, [plansQuery.data])

  // Refetch Queries 
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // This check is to prevent error on component mount. The refetch function is defined only after the query is run once
      // It also ensures that refetch runs only when you go back and not on component mount
      setBusyDates(route.params.busyDates)
      myFriends.refetch()
    });

    return unsubscribe;
  }, [navigation]);

  /***MUTATIONS***/
  // Create Plan Mutation
  const [createPlan, plan] = useMutation(CREATE_PLAN);

  if (plan.error) {
    Alert.alert('Error creating plan.', plan.error.message);
  }

  if (plan.data) {
    console.log(plan.data)
    navigation.goBack()
  }

  // Datepicker
  const filterDates = (date: Date) => !busyDates.includes(date.toISOString())

  // Autocomplete
  const filterFriends = (item: Friend, query: string) => item.name.toLowerCase().includes(query.toLowerCase());

  const onChangeText = (query: string) => {
    setValue(query);
    setFriends(myFriends.data.myFriends.filter((item: Friend) => filterFriends(item, query)));
  };

  const renderOption = (item: Friend, index: number) => (
    <AutocompleteItem
      key={index}
      title={item.name}
      disabled={true}
      accessoryRight={
        <Layout>
          {planFriends.map(a => a.id).includes(item.id) ? (
            <Icon style={{ width: 24, height: 24, tintColor: 'red' }} onPress={() => setPlanFriends(planFriends.filter(friend => friend.id !== item.id))} name='minus-outline' />
          ) : (
            <Icon style={{ width: 24, height: 24, tintColor: 'green' }} onPress={() => setPlanFriends(planFriends => [...planFriends, friends[index]])} name='plus-outline' />
          )}
        </Layout>
      }
    />
  );

  // Rendering Functions
  const renderFriend = ({item, index} : {item: Friend, index: number}) => {
    return (
      <Layout key={index} style={{flexDirection: 'column', alignItems: 'center', marginLeft: 20}}>
        <Avatar size='giant' source={{uri: item.avatar}}/>
        <Text category='s1' status='basic' onPress={() => {if (item.id !== '') {setPlanFriends(planFriends.filter(friend => friend.id !== item.id))}}}>{item.name}</Text>
      </Layout>
    );
  }

  return (
    <SafeAreaView style={styles.rootContainer}>
      <Layout>
        <Layout style={styles.titleContainer}>
          <Icon style={{ width: 30, height: 50, tintColor: 'black' }} onPress={() => navigation.goBack()} name='arrow-ios-back-outline'/>
          <Text category='h1' status='primary'>Plan something!</Text>
        </Layout>
        <Layout style={styles.inputsHeaderContainer} level='1'>
          <Text category='h5' status='basic'>Details</Text>
        </Layout>
        <Layout style={styles.inputsContainer}>
          <Input
            placeholder='Give your plan a name!'
            value={title}
            onChangeText={nextTitle => setTitle(nextTitle)}
            style={[styles.input, {marginBottom: 10}]}
          />
          <Input
            blurOnSubmit={true}
            multiline={true}
            textStyle={{ minHeight: 100 }}
            placeholder="What's the plan?"
            value={description}
            onChangeText={nextDescription => setDescription(nextDescription)}
            style={[styles.input, {marginBottom: 10}]}
          />
        </Layout>
        <Layout style={styles.friendsHeaderContainer} level='1'>
          <Text category='h5' status='basic'>Invited</Text>
          <Icon style={{ width: 30, height: 50, tintColor: 'black' }} onPress={() => setEditingInvited(true)} name='edit-2-outline' />
        </Layout>
        <List
          showsHorizontalScrollIndicator={false}
          style={styles.friendsContainer}
          data={planFriends}
          renderItem={renderFriend}
          horizontal={true}
        />
        <Layout style={styles.dateHeaderContainer} level='1'>
          <Text category='h5' status='basic'>What day?</Text>
        </Layout>
        <Layout style={styles.calendarContainer}>
          <Datepicker
            date={date}
            onSelect={nextDate => setDate(nextDate)}
            filter={filterDates}
            placement='top'
            status='basic'
            controlStyle={styles.input}
          />
        </Layout>
        <Button 
          style={{margin: 20}}
          onPress={() => {
            createPlan({variables: { start: date, end: date, scheduleId: route.params.schedule.id, title: title, description: description, users: planFriends.slice(1).map(f => f.id) }})}}>
          Create Plan
        </Button>
      </Layout>
      <Modal
        visible={editingInvited}
        backdropStyle={styles.backdrop}
        onBackdropPress={() => setEditingInvited(false)}>
        <Card style={styles.modal} disabled={true}>
          <Text category='h1'>Who's invited?</Text>
          <Autocomplete
            placeholder='Search for friends!'
            value={value}
            onChangeText={onChangeText}>
            {friends.slice(0,4).map(renderOption)}
          </Autocomplete>
        </Card>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: 'white',
    borderRadius: 20
  },
  rootContainer: {
    backgroundColor: 'white',
    flex: 1
  },
  screenContainer: {
  },
  titleContainer: {
    height: 50,
    flexDirection: 'row',
    marginTop: 40,
    marginBottom: 10,
    marginHorizontal: 20
  },
  inputsHeaderContainer: {
    marginHorizontal: 20,
    marginTop: 10,
    alignItems: 'center',
    flexDirection: 'row'
  },
  inputsContainer: {
    marginHorizontal: 20,
    marginTop: 10
  },
  friendsHeaderContainer: {
    marginHorizontal: 20,
    alignItems: 'center',
    flexDirection: 'row'
  },
  friendsContainer: {
    backgroundColor: 'white',
    marginVertical: 10
  },
  dateHeaderContainer: {
    marginHorizontal: 20,
    marginBottom: 10,
    alignItems: 'center',
    flexDirection: 'row'
  },
  calendarContainer: {
    marginHorizontal: 20
  },
  modal: {
    flex: 1,
    borderRadius: 20,
    height: 450
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
