import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import ProfileHeader from '../components/ProfileHeader';

const MOODS = ['Happy', 'Sad', 'Angry', 'Confident', 'Relaxed'];
const OCCASIONS = ['Casual', 'Formal', 'Party', 'Work', 'Workout'];
const AGE_RANGES = ['20s', '30s', '40s', '50+'];

export default function MoodScreen({ navigation }) {
  const { isDarkMode, colors } = useTheme();
  const currentColors = colors[isDarkMode ? 'dark' : 'light'];
  const [selectedMood, setSelectedMood] = useState('Happy');
  const [selectedOccasion, setSelectedOccasion] = useState(null);
  const [selectedAge, setSelectedAge] = useState(null);

  const handleStyleMe = () => {
    // Navigate to outfits with mood-based filtering
    navigation.navigate('Outfits', { 
      mood: selectedMood, 
      occasion: selectedOccasion, 
      age: selectedAge 
    });
  };

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
        <Text style={[styles.headerTitle, { color: currentColors.primary }]}>KALASH</Text>
        <View style={styles.headerIcons}>
          <Ionicons name="heart-outline" size={24} color="#FFD700" />
          <View style={[styles.profileIcon, { backgroundColor: currentColors.button }]}>
            <Ionicons name="person" size={20} color={currentColors.buttonText} />
          </View>
        </View>
      </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: currentColors.primary }]}>Style by Mood</Text>

        {/* Select your mood */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentColors.primary }]}>Select your mood</Text>
          <View style={styles.optionsContainer}>
            {MOODS.map((mood) => (
              <TouchableOpacity
                key={mood}
                style={[
                  styles.optionButton,
                  { backgroundColor: currentColors.card },
                  selectedMood === mood && { backgroundColor: currentColors.button }
                ]}
                onPress={() => setSelectedMood(mood)}
              >
                <Text style={[
                  styles.optionText,
                  { color: currentColors.primary },
                  selectedMood === mood && { color: currentColors.buttonText }
                ]}>
                  {mood}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Select an occasion */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentColors.primary }]}>Select an occasion</Text>
          <View style={styles.optionsContainer}>
            {OCCASIONS.map((occasion) => (
              <TouchableOpacity
                key={occasion}
                style={[
                  styles.optionButton,
                  { backgroundColor: currentColors.card },
                  selectedOccasion === occasion && { backgroundColor: currentColors.button }
                ]}
                onPress={() => setSelectedOccasion(occasion)}
              >
                <Text style={[
                  styles.optionText,
                  { color: currentColors.primary },
                  selectedOccasion === occasion && { color: currentColors.buttonText }
                ]}>
                  {occasion}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Select an age range */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentColors.primary }]}>Select an age range</Text>
          <View style={styles.optionsContainer}>
            {AGE_RANGES.map((age) => (
              <TouchableOpacity
                key={age}
                style={[
                  styles.optionButton,
                  { backgroundColor: currentColors.card },
                  selectedAge === age && { backgroundColor: currentColors.button }
                ]}
                onPress={() => setSelectedAge(age)}
              >
                <Text style={[
                  styles.optionText,
                  { color: currentColors.primary },
                  selectedAge === age && { color: currentColors.buttonText }
                ]}>
                  {age}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={[styles.styleMeButton, { backgroundColor: currentColors.card }]} onPress={handleStyleMe}>
          <Text style={[styles.styleMeText, { color: currentColors.primary }]}>STYLE ME</Text>
        </TouchableOpacity>
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
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 15,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Reduced padding to make app ratio smaller
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 40,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionButton: {
    width: '48%',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  styleMeButton: {
    borderRadius: 25,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  styleMeText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
