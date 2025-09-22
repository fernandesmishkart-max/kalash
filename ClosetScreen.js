import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TextInput, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useCloset, CATEGORIES } from '../context/ClosetContext';
import { useTheme } from '../context/ThemeContext';
import ProfileHeader from '../components/ProfileHeader';

const FILTER_CATEGORIES = ['Top', 'Bottom', 'Outerwear', 'One-Piece', 'Footwear', 'Accessories'];
const FILTER_COLORS = ['Black', 'White', 'Blue', 'Red', 'Green', 'Yellow', 'Gray'];

export default function ClosetScreen({ route, navigation }) {
  const { items, removeItem, toggleFavorite, isFavorite } = useCloset();
  const { isDarkMode, colors } = useTheme();
  const currentColors = colors[isDarkMode ? 'dark' : 'light'];
  const [query, setQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      const inQuery = query.length === 0 || i.colorName.toLowerCase().includes(query.toLowerCase()) || (i.title || '').toLowerCase().includes(query.toLowerCase());
      const inCategory = selectedCategories.length === 0 || selectedCategories.includes(i.category);
      const inColor = selectedColors.length === 0 || selectedColors.includes(i.colorName);
      return inQuery && inCategory && inColor;
    });
  }, [items, query, selectedCategories, selectedColors]);

  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleColor = (color) => {
    setSelectedColors(prev => 
      prev.includes(color) 
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  };

  const applyFilters = () => {
    setShowFilterModal(false);
  };

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

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: currentColors.searchBar }]}>
          <Ionicons name="search" size={20} color={currentColors.secondary} />
          <TextInput 
            placeholder="Search your closet..." 
            placeholderTextColor={currentColors.secondary}
            style={[styles.searchInput, { color: currentColors.primary }]} 
            value={query} 
            onChangeText={setQuery} 
          />
        </View>
        <TouchableOpacity style={[styles.filterButton, { backgroundColor: currentColors.searchBar }]} onPress={() => setShowFilterModal(true)}>
          <Ionicons name="options" size={20} color={currentColors.primary} />
        </TouchableOpacity>
      </View>

      {/* My Closet Title */}
      <Text style={[styles.closetTitle, { color: currentColors.primary }]}>My Closet ({items.length} items)</Text>

      {/* Items Grid */}
      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
        renderItem={({ item }) => (
          <View style={[styles.itemCard, { backgroundColor: currentColors.card }]}>
            <Image source={{ uri: item.uri }} style={styles.itemImage} />
            <TouchableOpacity style={styles.deleteButton} onPress={() => removeItem(item.id)}>
              <Ionicons name="close" size={16} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.favoriteButton}
              onPress={() => toggleFavorite(item.id)}
            >
              <Ionicons 
                name={isFavorite(item.id) ? "heart" : "heart-outline"} 
                size={16} 
                color={isFavorite(item.id) ? currentColors.heart : currentColors.heartOutline} 
              />
            </TouchableOpacity>
            <View style={styles.itemInfo}>
              <Text style={[styles.itemName, { color: currentColors.primary }]}>{item.title || 'Item'}</Text>
              <Text style={[styles.itemColor, { color: currentColors.secondary }]}>{item.colorName}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: currentColors.secondary }]}>No items yet. Add some from the + button!</Text>
          </View>
        }
      />

      {/* Filter Modal */}
      <Modal visible={showFilterModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.filterModal, { backgroundColor: currentColors.modal }]}>
            <Text style={[styles.modalTitle, { color: currentColors.primary }]}>Filter Closet</Text>
            
            <ScrollView style={styles.filterContent}>
              <Text style={[styles.filterSectionTitle, { color: currentColors.primary }]}>By Category</Text>
              <View style={styles.filterPills}>
                {FILTER_CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.filterPill,
                      { backgroundColor: currentColors.searchBar },
                      selectedCategories.includes(category) && { backgroundColor: currentColors.button }
                    ]}
                    onPress={() => toggleCategory(category)}
                  >
                    <Text style={[
                      styles.filterPillText,
                      { color: currentColors.primary },
                      selectedCategories.includes(category) && { color: currentColors.buttonText }
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.filterSectionTitle, { color: currentColors.primary }]}>By Color</Text>
              <View style={styles.filterPills}>
                {FILTER_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.filterPill,
                      { backgroundColor: currentColors.searchBar },
                      selectedColors.includes(color) && { backgroundColor: currentColors.button }
                    ]}
                    onPress={() => toggleColor(color)}
                  >
                    <Text style={[
                      styles.filterPillText,
                      { color: currentColors.primary },
                      selectedColors.includes(color) && { color: currentColors.buttonText }
                    ]}>
                      {color}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity style={[styles.applyButton, { backgroundColor: currentColors.button }]} onPress={applyFilters}>
              <Text style={[styles.applyButtonText, { color: currentColors.buttonText }]}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    color: '#333',
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
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  closetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  gridContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Reduced padding to make app ratio smaller
  },
  itemCard: {
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
  itemImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  itemInfo: {
    padding: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemColor: {
    fontSize: 12,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  filterModal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  filterContent: {
    maxHeight: 400,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 15,
  },
  filterPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  filterPill: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  filterPillText: {
    fontSize: 14,
  },
  applyButton: {
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});


