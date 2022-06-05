import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { Text, View } from '../components/Themed';

import { Calendar, Input, Button } from '@ui-kitten/components';

export default function CreateEventScreen() {
  const [date, setDate] = useState(new Date());
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a new plan!</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
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
      />
      <Button onPress={() => {}}>
        Create Plan
      </Button>
      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
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
