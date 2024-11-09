// npm install axios expo-image-picker

import React, { useState } from 'react';
import { View, Button, Image, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const FoodIdentifier = () => {
  const [image, setImage] = useState(null);
  const [foodInfo, setFoodInfo] = useState(null);

  const clarifaiApiKey = 'cd2f560840b14c59a343dcfeb46f5229';
  const edamamApiId = 'd18108a9';
  const edamamApiKey = '14c41df3c4ed0af9ebeff481618f1aa5';

  // Select Image
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.uri);
      identifyFood(result.uri);
    }
  };

  // Identify food with Clarifai API
  const identifyFood = async (imageUri) => {
    try {
      const response = await axios.post(
        'https://api.clarifai.com/v2/models/food-item-recognition/outputs',
        {
          inputs: [
            {
              data: {
                image: {
                  url: imageUri,
                },
              },
            },
          ],
        },
        {
          headers: {
            Authorization: `Key ${clarifaiApiKey}`,
          },
        }
      );

      const foodName = response.data.outputs[0].data.concepts[0].name;
      fetchNutritionalInfo(foodName);
    } catch (error) {
      console.error('Error identifying food:', error);
    }
  };

  // Get nutritional info and alerts with Edamam API
  const fetchNutritionalInfo = async (foodName) => {
    try {
      const response = await axios.get(
        `https://api.edamam.com/api/food-database/v2/parser?ingr=${foodName}&app_id=${edamamApiId}&app_key=${edamamApiKey}`
      );

      const nutrients = response.data.hints[0].food.nutrients;
      const cautions = response.data.hints[0].food.cautions;

      setFoodInfo({
        name: foodName,
        calories: nutrients.ENERC_KCAL,
        protein: nutrients.PROCNT,
        carbs: nutrients.CHOCDF,
        fat: nutrients.FAT,
        allergens: cautions,
      });
    } catch (error) {
      console.error('Error fetching nutritional info:', error);
    }
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button title="Upload Image" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
      {foodInfo && (
        <View style={{ marginTop: 20 }}>
          <Text>Food: {foodInfo.name}</Text>
          <Text>Calories: {foodInfo.calories} kcal</Text>
          <Text>Protein: {foodInfo.protein} g</Text>
          <Text>Carbs: {foodInfo.carbs} g</Text>
          <Text>Fat: {foodInfo.fat} g</Text>
          <Text>Allergens: {foodInfo.allergens.join(', ') || 'None'}</Text>
        </View>
      )}
    </View>
  );
};

export default FoodIdentifier;