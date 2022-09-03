import React, { useEffect, useState } from 'react'
import { Alert, StyleSheet } from 'react-native';

import { Button, Calendar, Toggle, Layout, Text, Icon } from '@ui-kitten/components';
import { useQuery, gql, useMutation } from '@apollo/client';
import { Plan } from '../types';
import { SafeAreaView } from 'react-native-safe-area-context';

/***QUERIES***/
const SCHEDULE = gql `query GetSchedule($getScheduleId: ID!) {
  getSchedule(id: $getScheduleId) {
    title
    isActive
    id
  }
}`

const GET_PLANS = gql `query GetPlans($getPlansId: ID!) {
  getPlans(id: $getPlansId) {
    start
    end
    title
    id
    description
  }
}`

/***MUTATIONS***/
const SET_ACTIVE = gql `mutation SetActive($setActiveId: ID!, $isActive: Int) {
  setActive(id: $setActiveId, isActive: $isActive) {
    id
    userId
    title
    isActive
    lastUpdated
  }
}`

export default function ScheduleScreen({ route, navigation }: { route: any, navigation: any }) {
  const [schedule, setSchedule] = useState({title: 'Error', id: 'Error', isActive: 0});
  const [plans, setPlans] = useState<Plan[]>([]);
  const [busyDates, setBusyDates] = useState(['']);
  const [date, setDate] = useState(new Date());
  const [selectedPlan, setselectedPlan] = useState({title: 'No plans today!', id: 'Error', description: ''})

  /***QUERIES***/
  // Schedule Query
  const scheduleQuery = useQuery(SCHEDULE, { variables: { getScheduleId: route.params.schedule.id }})

  useEffect(() => {
    if (scheduleQuery.error) {
      Alert.alert('Error fetching schedule.', scheduleQuery.error.message);
    }
  }, [scheduleQuery.error])

  useEffect(() => {
    if (scheduleQuery.data) {
      setSchedule(scheduleQuery.data.getSchedule);
    }
  }, [scheduleQuery.data])

  // Plans Query
  const plansQuery = useQuery(GET_PLANS, { variables: { getPlansId: route.params.schedule.id }})

  useEffect(() => {
    if (plansQuery.error) {
      Alert.alert('Error fetching plans.', plansQuery.error.message);
    }
  }, [plansQuery.error])

  useEffect(() => {
    if (plansQuery.data) {
      setPlans(plansQuery.data.getPlans);
      //make it so if the initial day has a plan it shows the plan instead of the default no plans today message.
      const days = plansQuery.data.getPlans.map(setPlansHelper)
      setBusyDates(days)
    }
  }, [plansQuery.data])

  // Refetch Queries
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // This check is to prevent error on component mount. The refetch function is defined only after the query is run once
      // It also ensures that refetch runs only when you go back and not on component mount
      plansQuery.refetch()
      scheduleQuery.refetch()
    });
    
    return unsubscribe;
  }, [navigation]);

  /***MUTATIONS***/
  // Set Active Mutations
  const [setActive, active] = useMutation(SET_ACTIVE)

  if (active.error) {
    Alert.alert('Error changing active status.', active.error.message);
  }

  if (active.data) {
    console.log(active.data)
  }

  // Calendar Helpers
  const filter = (date: Date) => busyDates.includes(date.toISOString())

  const setPlansHelper = (plan: { start: string | number | Date; }) => { 
    return plan.start
  }

  /***ICONS***/
  const BackIcon = (props: any) => (
    <Icon {...props} name='arrow-ios-back-outline' onPress={() => navigation.navigate('Home')} />
  );

  const PlusIcon = (props: any) => (
    <Icon {...props} name='plus-circle-outline' />
  );

  return (
    <SafeAreaView style={styles.rootContainer}>
      <Layout style={styles.titleContainer}>
        <Button 
          style={styles.button} 
          size='giant'
          appearance='ghost' 
          status='danger' 
          accessoryLeft={BackIcon} 
          onPress={() => navigation.goBack()}/>
        <Text category='h1' status='primary'>{schedule.title}</Text>
      </Layout>
      <Layout style={styles.actionsContainer}>
        <Button 
          style={{padding: 0}}
          accessoryLeft={PlusIcon} 
          appearance='ghost'  
          onPress={() => {navigation.navigate("CreatePlan", { schedule: schedule, busyDates: busyDates })}}>
          Add a Plan!
        </Button>
        <Toggle checked={schedule.isActive === 1} onChange={() => setActive({variables: {setActiveId: schedule.id, isActive: (schedule.isActive === 1 ? (0) : (1))}})} />
      </Layout>
      <Layout style={styles.calendarContainer}>
        <Calendar
          date={date}
          onSelect={(nextDate) => {
            for (let i = 0; i < plans.length; i++) {
              if (nextDate.toISOString() == plans[i].start) {
                setselectedPlan(plans[i])
              }
            }

            setDate(nextDate)
          }}
          filter={filter}
          style={{flex: 1, width: '100%', borderRadius: 20}}
        />
      </Layout>
      <Layout style={styles.planContainer}>
        <Text category='s1' status='basic'>
          {selectedPlan.title}
        </Text>
        <Text category='p1' status='basic'>
          {selectedPlan.description}
        </Text>
      </Layout>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: 'white'
  },
  titleContainer: {
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row'
  },
  actionsContainer: {
    paddingHorizontal: 20,
    flexDirection: 'row',
  },
  calendarContainer: {
    paddingHorizontal: 20,
    minHeight: 390,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 20,
    borderColor: 'rgb(228, 233, 242)',
    borderWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  button: {
    height: 50,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  value: {
    fontSize: 10,
    fontWeight: '400',
  },
  fb: {
    margin: 2,
  },
});