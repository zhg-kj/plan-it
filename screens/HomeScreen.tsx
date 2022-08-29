import React, { useEffect, useState } from 'react';

import { Alert, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Card, List, Text, Layout } from '@ui-kitten/components';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Schedule } from '../types';

import { gql, useQuery } from '@apollo/client';

const MY_SCHEDULES = gql `query MySchedules {
  mySchedules {
    id,
    title,
    isActive
  }
}`

const plans = [
  {
    title: "1"
  },
  {
    title: "2"
  },
  {
    title: "3"
  },
  {
    title: "4"
  },
  {
    title: "5"
  },
  {
    title: "6"
  },
  {
    title: "7"
  },
  {
    title: "8"
  },
  {
    title: "9"
  },
  {
    title: "10"
  },
]

export default function HomeScreen() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const date = new Date().toLocaleString()

  // Schedules Query
  const mySchedules = useQuery(MY_SCHEDULES)
  
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

  const renderScheduleCard = ({item, index} : {item: Schedule, index: number}) => {
    return (
      <Card>
        <Text category='h1' status='primary'>{item.title}</Text>
      </Card>
    ); 
  }

  const renderPlanCard = ({item, index} : {item: any, index: number}) => {
    return (
      <Card>
        <Text category='h1' status='primary'>{item.title}</Text>
      </Card>
    ); 
  }

  return (
    <SafeAreaView style={styles.rootContainer}>
      <ScrollView style={styles.screenContainer}>
        <Layout style={styles.userContainer} level='1'>
          <Text category='h1' status='primary'>Hello Name</Text>
          <Text category='s1'>{date}</Text>
        </Layout>
        <Text category='h1' status='primary'>Your Schedules</Text>
        <List
          style={styles.schedulesContainer}
          data={schedules}
          renderItem={renderScheduleCard}
          horizontal={true}
        />
        <Text category='h1' status='primary'>Upcoming Plans</Text>
        <List
          data={plans}
          renderItem={renderPlanCard}
          scrollEnabled={false}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
  userContainer: {
    flexDirection: 'column'
  },
  schedulesContainer: {
    height: 300
  },
  plansContainer: {
    flex: 3,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  contentContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  item: {
    marginVertical: 4,
  },
});
