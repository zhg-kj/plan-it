import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';

import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import * as eva from '@eva-design/eva';
import { default as theme } from './constants/theme.json';

import { client } from './apollo';
import { ApolloProvider } from '@apollo/client';

export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <>
        <IconRegistry icons={EvaIconsPack} />
        <ApplicationProvider {...eva} theme={{ ...eva.light, ...theme }} >
          <SafeAreaProvider>
            <ApolloProvider client={client}>
              <Navigation colorScheme={colorScheme} />
              <StatusBar backgroundColor={'white'}/>
            </ApolloProvider>
          </SafeAreaProvider>
        </ApplicationProvider>
      </>
    );
  }
}
