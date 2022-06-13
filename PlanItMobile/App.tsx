import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';

import { ApplicationProvider } from '@ui-kitten/components';
import * as eva from '@eva-design/eva';

import { client } from './apollo';
import { ApolloProvider } from '@apollo/client';

export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <ApplicationProvider {...eva} theme={eva.light}>
        <SafeAreaProvider>
          <ApolloProvider client={client}>
            <Navigation colorScheme={colorScheme} />
            <StatusBar />
          </ApolloProvider>
        </SafeAreaProvider>
      </ApplicationProvider>
    );
  }
}
