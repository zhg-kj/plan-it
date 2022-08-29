import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';

import { RootTabScreenProps } from '../types';
import { Card, List, Text, Layout } from '@ui-kitten/components';

const data = new Array(8).fill({
  title: 'Item',
});

export default function MainScreen({ navigation }: RootTabScreenProps<'Main'>) {

  const renderItemHeader = (headerProps, info) => (
    <View {...headerProps}>
      <Text category='h6'>
        {info.item.title} {info.index + 1}
      </Text>
    </View>
  );

  const renderItemFooter = (footerProps) => (
    <Text {...footerProps}>
      By Wikipedia
    </Text>
  );

  const renderItem = (info) => (
    <Card
      style={styles.item}
      status='basic'
      header={headerProps => renderItemHeader(headerProps, info)}
      footer={renderItemFooter}>
      <Text>
        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's
        standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make
        a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting,
        remaining essentially unchanged.
      </Text>
    </Card>
  );

  return (
    <Layout style={styles.container}>
      <Text style={styles.title}>Upcoming Plans</Text>
      <List
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        data={data}
        renderItem={renderItem}
      />
    </Layout>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  contentContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  item: {
    marginVertical: 4,
  },
});
