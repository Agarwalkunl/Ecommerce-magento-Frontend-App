import React from 'react';
import { LogBox } from 'react-native';
import { ApolloProvider } from '@apollo/client';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { apolloClient } from './src/services/graphql.service';
import { CategoriesScreen } from './src/screens/categories';

LogBox.ignoreAllLogs();

function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <SafeAreaProvider>
        <CategoriesScreen />
      </SafeAreaProvider>
    </ApolloProvider>
  );
}

export default App;