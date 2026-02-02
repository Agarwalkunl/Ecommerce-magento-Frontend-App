import React from 'react';
import { LogBox } from 'react-native';
import { ApolloProvider } from '@apollo/client';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { apolloClient } from './src/services/graphql.service';
import { CategoriesScreen } from './src/screens/categories';
import { ProductDetailScreen } from './src/screens/ProductDetail';

LogBox.ignoreAllLogs();

const Stack = createNativeStackNavigator();

function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Categories"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#667eea',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: '700',
              },
            }}
          >
            <Stack.Screen 
              name="Categories" 
              component={CategoriesScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen 
              name="ProductDetail" 
              component={ProductDetailScreen}
              options={{
                title: 'Product Details',
                headerBackTitle: 'Back',
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </ApolloProvider>
  );
}

export default App;