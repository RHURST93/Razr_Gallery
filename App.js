import React from 'react';
import { TouchableOpacity, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import CameraScreen from './screens/CameraScreen';
import GalleryScreen from './screens/GalleryScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="gallery"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#052C4F',
            
          },
          headerTintColor: 'white',
          headerTitleAlign: 'center',
        }}
      >
        <Stack.Screen
          name="gallery"
          component={GalleryScreen}
          options={{
            headerLeft: () => (
              <TouchableOpacity onPress={() => {/* Define what happens when the icon is pressed */}}>
                <Image
                  source={require('./assets/img/moto.png')}
                  style={{ width: 80, height: 80, marginLeft: 15 }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen name="camera" component={CameraScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
