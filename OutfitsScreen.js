import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useCloset, CATEGORIES } from '../context/ClosetContext';
import { useTheme } from '../context/ThemeContext';
import ProfileHeader from '../components/ProfileHeader';

export default function OutfitsScreen({ navigation, route }) {
  const { items, toggleFavorite, isFavorite } = useCloset();
  const { isDarkMode, colors } = useTheme();
  const currentColors = colors[isDarkMode ? 'dark' : 'light'];
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Get mood parameters from navigation
  const { mood, occasion, age } = route?.params || {};

  const generateOutfits = useMemo(() => {
    if (items.length < 2) return [];
    
    const outfits = [];
    let filteredItems = selectedCategory === 'All' ? items : items.filter(item => item.category === selectedCategory);
    
    // Apply mood-based filtering if coming from mood screen
    if (mood) {
      const moodCategories = {
        'Happy': ['Basic', 'Cottage Core'],
        'Sad': ['Grunge', 'Basic'],
        'Angry': ['Grunge', 'Chic'],
        'Confident': ['Chic', 'Cottage Core'],
        'Relaxed': ['Basic', 'Cottage Core']
      };
      
      const moodCategory = moodCategories[mood] || ['Basic'];
      filteredItems = filteredItems.filter(item => moodCategory.includes(item.category));
    }
    
    // Generate random outfit combinations
    for (let i = 0; i < 8; i++) {
      if (filteredItems.length < 2) break;
      
      // Randomly select 2-3 items for an outfit
      const numItems = Math.floor(Math.random() * 2) + 2; // 2 or 3 items
      const selectedItems = [];
      const usedIndices = new Set();
      
      for (let j = 0; j < numItems; j++) {
        let randomIndex;
        do {
          randomIndex = Math.floor(Math.random() * filteredItems.length);
        } while (usedIndices.has(randomIndex));
        
        usedIndices.add(randomIndex);
        selectedItems.push(filteredItems[randomIndex]);
      }
      
      const moodDescription = mood ? `Perfect for a ${mood.toLowerCase()} mood` : 'A stylish combination';
      const occasionDescription = occasion ? `, ideal for ${occasion.toLowerCase()}` : '';
      const ageDescription = age ? `, great for ${age}` : '';
      
      outfits.push({
        id: `outfit-${i}`,
        items: selectedItems,
        description: `${moodDescription}${occasionDescription}${ageDescription} featuring ${selectedItems.map(item => item.title || item.category).join(', ')}.`
      });
    }
    
    return outfits;
  }, [items, selectedCategory, mood, occasion, age]);

  return (
    <View style={styles.container}>
      <LinearGradient colors={currentColors.background} style={styles.gradient}>
        {/* Profile Header */}
        <ProfileHeader navigation={navigation} showUserInfo={false} showFavorites={false} />
        
        {/* Header */}
        <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: currentColors.primary }]}>KALASH</Text>
        <View style={styles.headerIcons}>
          <Ionicons name="heart-outline" size={24} color="#FFD700" />
          <View style={[styles.profileIcon, { backgroundColor: currentColors.button }]}>
            <Ionicons name="person" size={20} color={currentColors.buttonText} />
          </View>
        </View>
      </View>

      {/* Category Filter */}
      <View style={styles.categoryFilter}>
        <Text style={[styles.filterTitle, { color: currentColors.primary }]}>Filter by Category:</Text>
        <View style={styles.categoryContainer}>
          <TouchableOpacity
            style={[
              styles.categoryButton,
              { 
                backgroundColor: selectedCategory === 'All' ? currentColors.button : currentColors.searchBar,
                borderColor: currentColors.border
              }
            ]}
            onPress={() => setSelectedCategory('All')}
          >
            <Text style={[
              styles.categoryText,
              { color: selectedCategory === 'All' ? currentColors.buttonText : currentColors.primary }
            ]}>
              All
            </Text>
          </TouchableOpacity>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                { 
                  backgroundColor: selectedCategory === cat ? currentColors.button : currentColors.searchBar,
                  borderColor: currentColors.border
                }
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[
                styles.categoryText,
                { color: selectedCategory === cat ? currentColors.buttonText : currentColors.primary }
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text style={[styles.title, { color: currentColors.primary }]}>Suggested Outfits</Text>
      <Text style={[styles.subtitle, { color: currentColors.secondary }]}>
        {mood ? 
          `Outfits for ${mood.toLowerCase()} mood${occasion ? `, ${occasion.toLowerCase()}` : ''}${age ? `, ${age}` : ''}` :
          selectedCategory === 'All' ? 'Random combinations from your closet' : `Outfits featuring ${selectedCategory} items`
        }
      </Text>

      <FlatList
        data={generateOutfits}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.outfitsContainer}
        renderItem={({ item, index }) => (
          <View style={[styles.outfitCard, { backgroundColor: currentColors.card }]}>
            <View style={styles.outfitHeader}>
              <Text style={[styles.outfitTitle, { color: currentColors.primary }]}>Outfit #{index + 1}</Text>
              <View style={styles.outfitActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => toggleFavorite(item.id)}
                >
                  <Ionicons 
                    name={isFavorite(item.id) ? "heart" : "heart-outline"} 
                    size={20} 
                    color={isFavorite(item.id) ? currentColors.heart : currentColors.heartOutline} 
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="share-outline" size={20} color={currentColors.primary} />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.outfitItems}>
              {item.items.map((outfitItem, itemIndex) => (
                <View key={itemIndex} style={styles.outfitItem}>
                  <Image source={{ uri: outfitItem.uri }} style={styles.itemImage} />
                  <Text style={[styles.itemLabel, { color: currentColors.secondary }]}>
                    {outfitItem.title || outfitItem.category}
                  </Text>
                </View>
              ))}
            </View>
            
            <Text style={[styles.outfitDescription, { color: currentColors.secondary }]}>{item.description}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: currentColors.secondary }]}>Add more items to get outfit suggestions!</Text>
          </View>
        }
      />
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoryFilter: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  outfitsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Reduced padding to make app ratio smaller
  },
  outfitCard: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  outfitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  outfitTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  outfitActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 10,
    padding: 5,
  },
  outfitItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  outfitItem: {
    alignItems: 'center',
    flex: 1,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginBottom: 8,
  },
  placeholderItem: {
    width: 80,
    height: 80,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  itemLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  outfitDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
