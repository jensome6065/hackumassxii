// App.js or index.js
import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import FoodIdentifier from './foodIdentifier';  // adjust the path if needed

const App = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <FoodIdentifier />
    </SafeAreaView>
  );
};

export default App;