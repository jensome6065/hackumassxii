import React, { useState } from 'react';
import { View, Button, Image, Text, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';

const FoodIdentifier = () => {
  const [image, setImage] = useState(null);
  const [foodInfo, setFoodInfo] = useState(null);

  const clarifaiApiKey = 'cd2f560840b14c59a343dcfeb46f5229';
  const clarifaiUserId = 'clarifai';
  const clarifaiAppId = 'main';
  const edamamDataApiId = '1c819022';
  const edamamDataApiKey = '77d222b49d871230c0f9ee40fb8791a5';
  const edamamApiId = 'd18108a9';
  const edamamApiKey = 'f3eef44c0f5597ce8e1145400875acf5';

  // Recommended daily values for an average adult (General reference)
  const dailyValues = {
    calories: 2000,    // General RDV for calories
    protein: 50,       // General RDV for protein in grams
    carbs: 300,        // General RDV for carbohydrates in grams
    sugar: 90,         // General RDV for sugar in grams
    fat: 70,           // General RDV for fat in grams
  };

  // Select Image from camera roll
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Permission to access media library is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (result.canceled) {
      Alert.alert('Image Selection Cancelled');
      return;
    }

    const selectedImageUri = result.assets[0].uri;
    setImage(selectedImageUri);

    console.log('Selected image URI:', selectedImageUri);
    identifyFood(selectedImageUri);
  };

  // Identify food with Clarifai API
  const identifyFood = async (imageUri) => {
    try {
      if (!imageUri) {
        throw new Error('Invalid image URI');
      }

      // Convert the image to base64
      const base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Send the base64 image to Clarifai API
      const response = await axios.post(
        'https://api.clarifai.com/v2/models/food-item-recognition/outputs',
        {
          user_app_id: {
            user_id: clarifaiUserId,
            app_id: clarifaiAppId,
          },
          inputs: [
            {
              data: {
                image: {
                  base64: base64Image,
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

      console.log('Clarifai Response:', response.data);

      // Get identified foods and their counts
      const items = response.data.outputs[0].data.concepts;

      // Step 1: Count occurrences of each food item
      const foodCounts = {};
      items.forEach(item => {
        if (foodCounts[item.name]) {
          foodCounts[item.name] += 1;
        } else {
          foodCounts[item.name] = 1;
        }
      });

      // Step 2: Get the most likely food item (could be the top concept or highest count)
      const mostLikelyFood = items[0]?.name;
      const itemCount = foodCounts[mostLikelyFood] || 1; // Get the count of this food item

      console.log(`Food identified: ${mostLikelyFood}, Count: ${itemCount}`);

      // Fetch nutritional info for the identified food with the count
      fetchNutritionalInfo(mostLikelyFood, itemCount);
    } catch (error) {
      console.error('Error identifying food:', error.response ? error.response.data : error);
      Alert.alert('Error identifying food, please try again.');
    }
  };

  // Get nutritional info and alerts with Edamam API
  const detectCustomAllergens = (ingredientText) => {
    const nutAllergens = ["nut", "almond", "cashew", "walnut", "pecan", "hazelnut", "macadamia", "pistachio", "brazil nut"];
    return nutAllergens.some(keyword => ingredientText.toLowerCase().includes(keyword));
  };

  const calculatePercentage = (nutrient, dailyValue) => {
    return nutrient && dailyValue ? ((nutrient / dailyValue) * 100).toFixed(2) : 'N/A';
  };

  // Get nutritional info and alerts with Edamam API
  const fetchNutritionalInfo = async (foodName, itemCount) => {
    try {
      // Step 1: Get specific details from the Food Database API
      const dbResponse = await axios.get(
        `https://api.edamam.com/api/food-database/v2/parser?app_id=${edamamDataApiId}&app_key=${edamamDataApiKey}&ingr=${encodeURIComponent(foodName)}&nutrition-type=logging`
      );

      const foodDetails = dbResponse.data.hints[0]?.food || {};
      const foodLabel = foodDetails.label;
      const measureURI = dbResponse.data.hints[0]?.measures[0]?.uri; // Use default measure URI from API

      console.log('Edamam Food Database API response:', dbResponse.data);

      if (!measureURI) {
        throw new Error('No measureURI available for this food item.');
      }

      // Step 2: Prepare the GET request to the Nutrition Analysis API
      const quantity = Math.min(itemCount, 20); // Limit to 20 for single API call
      const ingredient = `${quantity} ${measureURI} ${foodDetails.foodId}`;

      // Fetch nutritional info using GET request
      const analysisResponse = await axios.get(
        `https://api.edamam.com/api/nutrition-data?app_id=${edamamApiId}&app_key=${edamamApiKey}&ingr=${encodeURIComponent(ingredient)}`
      );

      console.log('Edamam Nutrition Analysis API response:', analysisResponse.data);

      const nutrients = analysisResponse.data.totalNutrients || {};
      const cautions = analysisResponse.data.cautions || [];

      // Custom allergen detection based on food label
      const customAllergens = detectCustomAllergens(foodLabel) ? ['NUTS'] : [];

      // Calculate the percentage of daily intake for each nutrient
      const calories = nutrients.ENERC_KCAL?.quantity || 0;
      const protein = nutrients.PROCNT?.quantity || 0;
      const carbs = nutrients.CHOCDF?.quantity || 0;
      const sugar = nutrients.SUGAR?.quantity || 0;
      const fat = nutrients.FAT?.quantity || 0;

      const percentageCalories = calculatePercentage(calories, dailyValues.calories);
      const percentageProtein = calculatePercentage(protein, dailyValues.protein);
      const percentageCarbs = calculatePercentage(carbs, dailyValues.carbs);
      const percentageSugar = calculatePercentage(sugar, dailyValues.sugar);
      const percentageFat = calculatePercentage(fat, dailyValues.fat);

      setFoodInfo({
        name: foodLabel,
        calories: `${calories} kcal (${percentageCalories}%)`,
        protein: `${protein} g (${percentageProtein}%)`,
        carbs: `${carbs} g (${percentageCarbs}%)`,
        sugar: `${sugar} g (${percentageSugar}%)`,
        fat: `${fat} g (${percentageFat}%)`,
        allergens: cautions.concat(customAllergens).length > 0 ? cautions.concat(customAllergens) : ['None'],
        category: foodDetails.category || 'N/A',
        brand: foodDetails.brand || 'Generic',
        quantity: quantity, // Add quantity to the state
      });
    } catch (error) {
      console.error('Error fetching food details or nutritional info:', error.response ? error.response.data : error);
      Alert.alert('Error', 'Failed to fetch food details and nutritional info. Please check your API credentials.');
    }
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button title="Upload Image from Camera Roll" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
      {foodInfo && (
        <View style={{ marginTop: 20 }}>
          <Text>Food: {foodInfo.name}</Text>
          <Text>Calories: {foodInfo.calories}</Text>
          <Text>Protein: {foodInfo.protein}</Text>
          <Text>Carbs: {foodInfo.carbs}</Text>
          <Text>Sugar: {foodInfo.sugar}</Text>
          <Text>Fat: {foodInfo.fat}</Text>
          <Text>Allergens: {foodInfo.allergens.join(', ')}</Text>
        </View>
      )}
    </View>
  );
};

export default FoodIdentifier;