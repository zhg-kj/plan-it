import React, { useEffect, useState } from 'react';

import { Alert, StyleSheet, ScrollView } from 'react-native';
import { Card, List, Text, Layout, Icon, Button, Modal, Input, Radio, RadioGroup, Avatar } from '@ui-kitten/components';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Friend, Plan, Schedule } from '../types';

import { gql, useQuery, useMutation } from '@apollo/client';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { client } from '../apollo';

/***QUERIES***/
const MY_SCHEDULES = gql `query MySchedules {
  mySchedules {
    id,
    title,
    isActive,
    color
  }
}`

const MY_PLANS = gql `query MyPlans {
  myPlans {
    title
    description
    id
    start
    end
    schedule {
      title
    }
  }
}`

const MY_FRIENDS = gql `query MyFriends {
  myFriends {
    name
    id
    avatar
  }
}`

/***MUTATIONS***/
const CREATE_SCHEDULE = gql `mutation CreateSchedule($title: String!, $color: String!) {
  createSchedule(title: $title, color: $color) {
    id
    userId
    title
    isActive
    lastUpdated
    color
  }
}`

/***ICONS***/
const PlusIcon = (props: any) => (
  <Icon {...props} name='plus-circle-outline' />
);

const SignOutIcon = (props: any) => (
  <Icon {...props} name='log-out-outline' />
);

/***COLORS***/
const colors = ["#3366FF", "#7CDD37", "#3CBFFC", "#FCDC3C", "#FC5A2D"]

export default function HomeScreen() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [upcomingPlans, setUpcomingPlans] = useState<Plan[]>([]);
  const [creatingSchedule, setCreatingSchedule] = useState<boolean>(false);
  const [scheduleTitle, setScheduleTitle] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<number>(0);
  const [friends, setFriends] = useState<Friend[]>([])

  const navigation = useNavigation();

  /***QUERIES***/
  // Schedules Query
  const mySchedules = useQuery(MY_SCHEDULES)
  
  useEffect(() => {
    if (mySchedules.error) {
      Alert.alert('Error fetching schedules.', mySchedules.error.message);
    }
  }, [mySchedules.error])

  useEffect(() => {
    if (mySchedules.data) {
      if (mySchedules.data.mySchedules.length > 0) {
        setSchedules(mySchedules.data.mySchedules);
      } else {
        setSchedules([{title: "You don't have any schedules yet!", color: '#D6E4FF', id: 'NONE', isActive: 0}])
      }
    }
  }, [mySchedules.data])

  // Plans Query
  const myPlans = useQuery(MY_PLANS)
  
  useEffect(() => {
    if (myPlans.error) {
      Alert.alert('Error fetching schedules.', myPlans.error.message);
    }
  }, [myPlans.error])

  useEffect(() => {
    if (myPlans.data) {
      setUpcomingPlans(myPlans.data.myPlans);
    }
  }, [myPlans.data])

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

  // Refetch Queries 
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      mySchedules.refetch()
      myPlans.refetch()
      myFriends.refetch()
    });
    
    return unsubscribe;
  }, [navigation]);

  /***MUTATIONS***/
  // Create Schedule Mutation
  const [createSchedule, schedule] = useMutation(CREATE_SCHEDULE, {
    refetchQueries: [
      {query: MY_SCHEDULES}, 
      'MySchedules'
    ],
  })

  if (schedule.error) {
    Alert.alert('Error creating schedule.', schedule.error.message);
  }

  if (schedule.data) {
    console.log(schedule.data)
  }

  /***RENDER FUNCTIONS***/
  const renderScheduleCard = ({item, index} : {item: Schedule, index: number}) => {
    return (
      <Card 
        key={index}
        disabled={item.id === 'NONE'}
        style={[styles.scheduleCard, {backgroundColor: item.color}]}
        onPress={() => navigation.navigate('ScheduleScreen', { schedule: item, friends: [] })}
      >
        <Text category='h2' status='control'>{item.title}</Text>
      </Card>
    ); 
  }

  const renderPlanCard = (item: any, key: number) => {
    return (
      <Card key={key} style={styles.planCard}>
        <Text category='h1' status='primary'>{item.title}</Text>
        <Text category='s1' status='basic'>{item.start}</Text>
      </Card>
    ); 
  }

  const renderFriend = ({item, index} : {item: Friend, index: number}) => {
    return (
      <Layout key={index} style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginLeft: 20}}>
        <Avatar source={{uri: item.avatar}}/>
        <Text category='s1' status='basic'>{item.name}</Text>
      </Layout>
    );
  }

  /***SCHEDULE COLOR SELECTION***/
  const useRadioState = (initialCheck = false) => {
    const [checked, setChecked] = useState(initialCheck);
    return { checked, onChange: setChecked };
  };

  const primaryRadioState = useRadioState();
  const successRadioState = useRadioState();
  const infoRadioState = useRadioState();
  const warningRadioState = useRadioState();
  const dangerRadioState = useRadioState();

  return (
    <SafeAreaView style={styles.rootContainer}>
      <ScrollView style={styles.screenContainer} showsVerticalScrollIndicator={false}>
        <Layout style={styles.userContainer} level='1'>
          <Text category='h1' status='primary'>Hello Name</Text>
          <Button 
            style={styles.button} 
            appearance='ghost' 
            status='danger' 
            accessoryLeft={SignOutIcon} 
            onPress={async () => {
              await AsyncStorage.clear().then(() => client.clearStore()).then(() => navigation.navigate('SignInScreen'))}}/>
        </Layout>
        <Layout style={styles.friendsHeaderContainer} level='1'>
          <Text category='h5' status='basic'>Your Friends</Text>
          <Button style={styles.button} appearance='ghost' status='danger' accessoryLeft={PlusIcon} onPress={() => navigation.navigate('AddFriendsScreen')}/>
        </Layout>
        <List
          showsHorizontalScrollIndicator={false}
          style={styles.friendsContainer}
          data={friends}
          renderItem={renderFriend}
          horizontal={true}
        />
        <Layout style={styles.schedulesHeaderContainer} level='1'>
          <Text category='h5' status='basic'>Your Schedules</Text>
          <Button style={styles.button} appearance='ghost' status='danger' accessoryLeft={PlusIcon} onPress={() => {setCreatingSchedule(true); setScheduleTitle(''); setSelectedColor(0);}}/>
        </Layout>
        <List
          showsHorizontalScrollIndicator={false}
          style={styles.schedulesContainer}
          data={schedules}
          renderItem={renderScheduleCard}
          horizontal={true}
        />
        <Layout style={styles.plansContainer}>
          <Text category='h5' status='basic'>Upcoming Plans</Text>
          {upcomingPlans.map((item, key) => renderPlanCard(item, key))}
        </Layout>
      </ScrollView>
      <Modal
        visible={creatingSchedule}
        backdropStyle={styles.backdrop}
        onBackdropPress={() => setCreatingSchedule(false)}>
        <Card style={styles.modal} disabled={true}>
          <Text category='h1'>Create a new schedule!</Text>
          <Input
              style={{marginTop: 20}}
              placeholder='Give your schedule a name!'
              value={scheduleTitle}
              onChangeText={title => setScheduleTitle(title)}
          />
          <Layout style={styles.colorsContainer}>
            <RadioGroup
              style={styles.colorsContainer}
              selectedIndex={selectedColor}
              onChange={index => setSelectedColor(index)}>
              <Radio
                style={styles.radio}
                status='primary'
                {...primaryRadioState} />
              <Radio
                style={styles.radio}
                status='success'
                {...successRadioState} />
              <Radio
                style={styles.radio}
                status='info'
                {...infoRadioState} />
              <Radio
                style={styles.radio}
                status='warning'
                {...warningRadioState} />
              <Radio
                style={styles.radio}
                status='danger'
                {...dangerRadioState} />
            </RadioGroup>
          </Layout>
          <Button 
           style={{marginTop: 20}}
            onPress={() => {createSchedule({variables: {title: scheduleTitle, color: colors[selectedColor]}}); setCreatingSchedule(false);}}
          >
            Create!
          </Button>
        </Card>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: 'white'
  },
  screenContainer: {
    flex: 1,
  },
  userContainer: {
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
  },
  friendsHeaderContainer: {
    marginHorizontal: 20,
    alignItems: 'center',
    flexDirection: 'row'
  },
  friendsContainer: {
    backgroundColor: 'white'
  },
  schedulesHeaderContainer: {
    marginHorizontal: 20,
    alignItems: 'center',
    flexDirection: 'row'
  },
  schedulesContainer: {
    height: 300,
    backgroundColor: 'white'
  },
  scheduleCard: {
    maxWidth: 300,
    minWidth: 200,
    height: 300,
    borderRadius: 20,
    marginLeft: 20,
    justifyContent: 'space-between'
  },
  plansContainer: {
    margin: 20,
  },
  planCard: {
    borderRadius: 20,
    marginTop: 10
  },
  item: {
    marginVertical: 4,
  },
  button: {
    height: 50,
  },
  modal: {
    flex: 1,
    borderRadius: 20
  },
  colorsContainer: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-evenly'
  },
  radio: {
    marginHorizontal: 5,
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
