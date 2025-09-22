import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useCloset } from '../context/ClosetContext';
import { useTheme } from '../context/ThemeContext';
import ProfileHeader from '../components/ProfileHeader';

export default function WeatherScreen({ navigation }) {
  const { items, toggleFavorite, isFavorite } = useCloset();
  const { isDarkMode, colors } = useTheme();
  const currentColors = colors[isDarkMode ? 'dark' : 'light'];
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLoading(false);
        return;
      }
      
      const location = await Location.getCurrentPositionAsync({});
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.coords.latitude}&longitude=${location.coords.longitude}&current=temperature_2m,precipitation,apparent_temperature,weather_code&hourly=temperature_2m`
      );
      const data = await response.json();
      setWeather(data);
    } catch (error) {
      console.error('Error fetching weather:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherRecommendations = () => {
    if (!weather || !items.length) return [];
    
    const temp = weather.current?.temperature_2m || 22;
    const isCold = temp < 16;
    const isHot = temp > 28;
    const isRaining = weather.current?.precipitation > 0;
    
    let recommendedCategory = 'Basic';
    if (isCold) recommendedCategory = 'Chic';
    else if (isHot) recommendedCategory = 'Basic';
    else if (isRaining) recommendedCategory = 'Grunge';
    
    return items.filter(item => item.category === recommendedCategory);
  };

  const getWeatherIcon = () => {
    if (!weather) return 'partly-sunny';
    const code = weather.current?.weather_code;
    if (code <= 3) return 'sunny';
    if (code <= 48) return 'partly-sunny';
    if (code <= 67) return 'rainy';
    if (code <= 77) return 'snow';
    return 'cloudy';
  };

  const getWeatherDescription = () => {
    if (!weather) return 'Loading weather...';
    const temp = Math.round(weather.current?.temperature_2m || 22);
    return `${temp}°C`;
  };

  const recommendations = getWeatherRecommendations();

  return (
    <View style={styles.container}>
      <LinearGradient colors={currentColors.background} style={styles.gradient}>
        {/* Profile Header */}
        <ProfileHeader navigation={navigation} showUserInfo={false} showFavorites={false} />
        
        {/* Header */}
        <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={currentColors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: currentColors.primary }]}>Weather</Text>
        <View style={[styles.profileIcon, { backgroundColor: currentColors.button }]}>
          <Ionicons name="person" size={20} color={currentColors.buttonText} />
        </View>
      </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Weather Info */}
        <View style={[styles.weatherCard, { backgroundColor: currentColors.card }]}>
          <View style={styles.weatherInfo}>
            <Ionicons name={getWeatherIcon()} size={60} color="#FFA500" />
            <View style={styles.weatherDetails}>
              <Text style={[styles.temperature, { color: currentColors.primary }]}>{getWeatherDescription()}</Text>
              <Text style={[styles.location, { color: currentColors.secondary }]}>Current Location</Text>
            </View>
          </View>
          <TouchableOpacity style={[styles.refreshButton, { backgroundColor: currentColors.searchBar }]} onPress={fetchWeather}>
            <Ionicons name="refresh" size={20} color={currentColors.primary} />
          </TouchableOpacity>
        </View>

        {/* Recommendations */}
        <Text style={[styles.sectionTitle, { color: currentColors.primary }]}>Recommended for Today's Weather</Text>
        
        {loading ? (
          <Text style={[styles.loadingText, { color: currentColors.secondary }]}>Loading weather recommendations...</Text>
        ) : recommendations.length > 0 ? (
          <FlatList
            data={recommendations}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={styles.recommendationsGrid}
            renderItem={({ item }) => (
              <View style={[styles.recommendationCard, { backgroundColor: currentColors.card }]}>
                <Image source={{ uri: item.uri }} style={styles.recommendationImage} />
                <TouchableOpacity 
                  style={styles.recommendationHeartButton}
                  onPress={() => toggleFavorite(item.id)}
                >
                  <Ionicons 
                    name={isFavorite(item.id) ? "heart" : "heart-outline"} 
                    size={16} 
                    color={isFavorite(item.id) ? currentColors.heart : currentColors.heartOutline} 
                  />
                </TouchableOpacity>
                <View style={styles.recommendationInfo}>
                  <Text style={[styles.recommendationTitle, { color: currentColors.primary }]}>{item.title || item.category}</Text>
                  <Text style={[styles.recommendationColor, { color: currentColors.secondary }]}>{item.colorName}</Text>
                </View>
              </View>
            )}
          />
        ) : (
          <Text style={[styles.noItemsText, { color: currentColors.secondary }]}>No items match today's weather. Add more items to your closet!</Text>
        )}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 100, // Reduced padding to make app ratio smaller
  },
  weatherCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherDetails: {
    marginLeft: 15,
  },
  temperature: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  location: {
    fontSize: 14,
    marginTop: 4,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  recommendationsGrid: {
    paddingBottom: 100,
  },
  recommendationCard: {
    width: '48%',
    borderRadius: 15,
    marginBottom: 15,
    marginRight: '2%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  recommendationImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  recommendationHeartButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendationInfo: {
    padding: 12,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  recommendationColor: {
    fontSize: 12,
  },
  loadingText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 50,
  },
  noItemsText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
    paddingHorizontal: 20,
  },
});
