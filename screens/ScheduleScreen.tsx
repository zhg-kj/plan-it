import React, { useEffect, useState } from 'react'
import { Alert, Platform, StyleSheet } from 'react-native';

import { Button, Calendar, Toggle, Layout, Text } from '@ui-kitten/components';
import { useQuery, gql } from '@apollo/client';
import { Plan } from '../types';

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

export default function ScheduleScreen({ route, navigation }: { route: any, navigation: any }) {
  const [schedule, setSchedule] = useState({title: 'Error', id: 'Error', isActive: 0});
  const [plans, setPlans] = useState<Plan[]>([]);
  const [planDates, setplanDates] = useState(['']);
  const [date, setDate] = useState(new Date());
  const [selectedPlan, setselectedPlan] = useState({title: 'No plans today!', id: 'Error', description: 'Nothing!'})

  const scheduleQuery = useQuery(SCHEDULE, { variables: { getScheduleId: route.params.schedule.id }})

  const filter = (date: Date) => planDates.includes(date.toISOString())

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // This check is to prevent error on component mount. The refetch function is defined only after the query is run once
      // It also ensures that refetch runs only when you go back and not on component mount
      plansQuery.refetch()
      scheduleQuery.refetch()
    });
    
    return unsubscribe;
  }, [navigation]);

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
      setplanDates(days)
    }
  }, [plansQuery.data])

  const setPlansHelper = (plan: { start: string | number | Date; }) => { 
    return plan.start
  }

  return (
    <Layout style={styles.container}>
      <Text style={styles.title}>{schedule.title}</Text>
      <Toggle checked={schedule.isActive === 1} onChange={() => {}}>
        Active
      </Toggle>
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
      />
      <Button onPress={() => {navigation.navigate("CreatePlan", { schedule: schedule, planDates: planDates, friends: route.params.friends })}}>
        Add a Plan!
      </Button>
      <Layout style={styles.container}>
        <Text style={styles.title}>
          {selectedPlan.title}
        </Text>
        <Text style={styles.title}>
          {selectedPlan.description}
        </Text>
      </Layout>
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
  dayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    aspectRatio: 1,
  },
  value: {
    fontSize: 10,
    fontWeight: '400',
  },
  fb: {
    margin: 2,
  },
});