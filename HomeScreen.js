import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ScrollView, TextInput, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { useCloset, CATEGORIES } from '../context/ClosetContext';
import { useTheme } from '../context/ThemeContext';
import ProfileHeader from '../components/ProfileHeader';
import DateUploadModal from '../components/DateUploadModal';

export default function HomeScreen({ navigation }) {
  const { items, toggleFavorite, isFavorite, dateItems, reminders, getDateItems, getReminder } = useCloset();
  const { isDarkMode, colors } = useTheme();
  const currentColors = colors[isDarkMode ? 'dark' : 'light'];
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [showOutfitOfDay, setShowOutfitOfDay] = useState(false);
  const [outfitOfDay, setOutfitOfDay] = useState(null);
  const [calendarKey, setCalendarKey] = useState(0);
  const [currentLocation, setCurrentLocation] = useState('Bangalore, India');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [newLocation, setNewLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showDateUploadModal, setShowDateUploadModal] = useState(false);
  const [selectedDateForUpload, setSelectedDateForUpload] = useState('');

  const randomItem = useMemo(() => {
    if (items.length === 0) return null;
    const i = Math.floor(Math.random() * items.length);
    return items[i];
  }, [items]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return items.filter(item => 
      item.category?.toLowerCase().includes(query) ||
      item.title?.toLowerCase().includes(query) ||
      item.colorName?.toLowerCase().includes(query) ||
      item.style?.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  const categoryFilteredItems = useMemo(() => {
    if (selectedCategory === 'All') return items;
    return items.filter(item => item.category === selectedCategory);
  }, [items, selectedCategory]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setShowSearchResults(true);
    }
  };


  const handleDateSelect = (day) => {
    setSelectedDate(day.dateString);
    setSelectedDateForUpload(day.dateString);
    setShowDateUploadModal(true);
  };

  const getMarkedDates = () => {
    const marked = {
      [selectedDate]: {
        selected: true,
        selectedColor: currentColors.button,
        selectedTextColor: currentColors.buttonText,
      }
    };

    // Add indicators for dates with items
    Object.keys(dateItems).forEach(date => {
      if (date !== selectedDate) {
        marked[date] = {
          marked: true,
          dotColor: currentColors.button,
        };
      }
    });

    // Add indicators for dates with reminders
    Object.keys(reminders).forEach(date => {
      if (date !== selectedDate) {
        if (marked[date]) {
          // If date already has items, add reminder indicator
          marked[date].marked = true;
          marked[date].dotColor = currentColors.heart;
        } else {
          marked[date] = {
            marked: true,
            dotColor: currentColors.heart,
          };
        }
      }
    });

    return marked;
  };

  const generateOutfitOfDay = (dateString) => {
    if (items.length === 0) {
      setOutfitOfDay(null);
      return;
    }

    // Generate a consistent outfit based on the date
    const date = new Date(dateString);
    const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    
    // Use date as seed for consistent outfit generation
    const seed = dayOfYear + date.getFullYear();
    const random = (seed * 9301 + 49297) % 233280;
    const randomIndex = Math.floor((random / 233280) * items.length);
    
    const selectedItem = items[randomIndex];
    setOutfitOfDay({
      date: dateString,
      item: selectedItem,
      description: `Perfect outfit for ${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`
    });
  };

  const closeOutfitOfDay = () => {
    setShowOutfitOfDay(false);
    setOutfitOfDay(null);
  };

  const handleLocationPress = () => {
    setNewLocation(currentLocation);
    setShowLocationModal(true);
  };

  const handleLocationSave = () => {
    if (newLocation.trim()) {
      setCurrentLocation(newLocation.trim());
      setShowLocationModal(false);
      setNewLocation('');
    }
  };

  const handleLocationCancel = () => {
    setShowLocationModal(false);
    setNewLocation('');
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={currentColors.background} style={styles.gradient}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <ProfileHeader navigation={navigation} showUserInfo={true} />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.locationRow} onPress={handleLocationPress}>
            <Ionicons name="location-outline" size={16} color={currentColors.primary} />
            <Text style={[styles.locationText, { color: currentColors.primary }]}>{currentLocation}</Text>
            <Ionicons name="chevron-down" size={16} color={currentColors.primary} />
          </TouchableOpacity>
          
          <View style={styles.searchRow}>
            <View style={[styles.searchBar, { backgroundColor: currentColors.searchBar }]}>
              <Ionicons name="search" size={20} color={currentColors.secondary} />
              <TextInput
                style={[styles.searchInput, { color: currentColors.primary }]}
                placeholder="Search for style or clothing type..."
                placeholderTextColor={currentColors.secondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
            </View>
            <TouchableOpacity 
              style={[styles.menuButton, { backgroundColor: currentColors.searchBar }]}
              onPress={() => setShowHamburgerMenu(true)}
            >
              <Ionicons name="menu" size={24} color={currentColors.primary} />
            </TouchableOpacity>
          </View>
        </View>


        {/* Calendar Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentColors.primary }]}>OUTFIT CALENDAR</Text>
          <View style={[styles.calendarContainer, { backgroundColor: currentColors.card }]}>
            <Calendar
              key={`${calendarKey}-${isDarkMode ? 'dark' : 'light'}`}
              onDayPress={handleDateSelect}
              markedDates={getMarkedDates()}
              theme={isDarkMode ? {
                backgroundColor: currentColors.card,
                calendarBackground: currentColors.card,
                textSectionTitleColor: currentColors.primary,
                selectedDayBackgroundColor: currentColors.button,
                selectedDayTextColor: currentColors.buttonText,
                todayTextColor: currentColors.button,
                dayTextColor: currentColors.primary,
                textDisabledColor: currentColors.secondary,
                dotColor: currentColors.button,
                selectedDotColor: currentColors.buttonText,
                arrowColor: currentColors.button,
                monthTextColor: currentColors.primary,
                indicatorColor: currentColors.button,
                textDayFontWeight: '600',
                textMonthFontWeight: '700',
                textDayHeaderFontWeight: '600',
                textDayFontSize: 16,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 14,
                'stylesheet.calendar.header': {
                  week: {
                    marginTop: 7,
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    backgroundColor: currentColors.card,
                  }
                },
                'stylesheet.day.basic': {
                  base: {
                    width: 32,
                    height: 32,
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                  text: {
                    marginTop: 4,
                    fontSize: 16,
                    fontWeight: '600',
                    color: currentColors.primary,
                  },
                  today: {
                    backgroundColor: currentColors.button,
                    borderRadius: 16,
                  },
                  todayText: {
                    color: currentColors.buttonText,
                    fontWeight: '700',
                  },
                  selected: {
                    backgroundColor: currentColors.button,
                    borderRadius: 16,
                  },
                  selectedText: {
                    color: currentColors.buttonText,
                    fontWeight: '700',
                  }
                }
              } : {
                // Light theme - comprehensive styling
                backgroundColor: currentColors.card,
                calendarBackground: currentColors.card,
                textSectionTitleColor: '#000000',
                selectedDayBackgroundColor: currentColors.button,
                selectedDayTextColor: currentColors.buttonText,
                todayTextColor: currentColors.button,
                dayTextColor: '#000000',
                textDisabledColor: currentColors.secondary,
                dotColor: currentColors.button,
                selectedDotColor: currentColors.buttonText,
                arrowColor: currentColors.button,
                monthTextColor: '#000000',
                indicatorColor: currentColors.button,
                textDayFontWeight: '600',
                textMonthFontWeight: '700',
                textDayHeaderFontWeight: '600',
                textDayFontSize: 16,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 14,
                'stylesheet.calendar.header': {
                  week: {
                    marginTop: 7,
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    backgroundColor: currentColors.card,
                  }
                },
                'stylesheet.day.basic': {
                  base: {
                    width: 32,
                    height: 32,
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                  text: {
                    marginTop: 4,
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#000000',
                  },
                  today: {
                    backgroundColor: currentColors.button,
                    borderRadius: 16,
                  },
                  todayText: {
                    color: currentColors.buttonText,
                    fontWeight: '700',
                  },
                  selected: {
                    backgroundColor: currentColors.button,
                    borderRadius: 16,
                  },
                  selectedText: {
                    color: currentColors.buttonText,
                    fontWeight: '700',
                  }
                }
              }}
              style={styles.calendar}
            />
                </View>
        </View>

        {/* Category Filter */}
        {items.length > 0 && (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: currentColors.primary }]}>FILTER BY CATEGORY</Text>
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
        )}

        {/* Product Grid */}
        {categoryFilteredItems.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: currentColors.primary }]}>
              {selectedCategory === 'All' ? 'YOUR CLOSET' : `${selectedCategory.toUpperCase()} ITEMS`}
            </Text>
            <View style={styles.productGrid}>
              {categoryFilteredItems.slice(0, 4).map((item) => (
                <TouchableOpacity key={item.id} style={[styles.productCard, { backgroundColor: currentColors.card }]}>
                  <View style={styles.productImageContainer}>
                    <Image source={{ uri: item.uri }} style={styles.productImage} />
                    <TouchableOpacity 
                      style={styles.productHeartButton}
                      onPress={() => toggleFavorite(item.id)}
                    >
                      <Ionicons 
                        name={isFavorite(item.id) ? "heart" : "heart-outline"} 
                        size={16} 
                        color={isFavorite(item.id) ? currentColors.heart : currentColors.heartOutline} 
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={[styles.productTitle, { color: currentColors.primary }]}>{item.title || item.category || 'Item'}</Text>
                    <Text style={[styles.productPrice, { color: currentColors.secondary }]}>{item.colorName || 'Color'}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Search Results Modal */}
        <Modal visible={showSearchResults} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.searchResultsModal, { backgroundColor: currentColors.modal }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: currentColors.primary }]}>Search Results for "{searchQuery}"</Text>
                <TouchableOpacity onPress={() => setShowSearchResults(false)}>
                  <Ionicons name="close" size={24} color={currentColors.primary} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.resultsCount, { color: currentColors.secondary }]}>
                Found {filteredItems.length} item(s)
              </Text>
              <ScrollView style={styles.resultsList}>
                {filteredItems.map((item) => (
                  <TouchableOpacity key={item.id} style={[styles.resultItem, { borderBottomColor: currentColors.border }]}>
                    <Image source={{ uri: item.uri }} style={styles.resultImage} />
                    <View style={styles.resultInfo}>
                      <Text style={[styles.resultTitle, { color: currentColors.primary }]}>{item.title || item.category}</Text>
                      <Text style={[styles.resultColor, { color: currentColors.secondary }]}>{item.colorName}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.resultHeartButton}
                      onPress={() => toggleFavorite(item.id)}
                    >
                      <Ionicons 
                        name={isFavorite(item.id) ? "heart" : "heart-outline"} 
                        size={20} 
                        color={isFavorite(item.id) ? currentColors.heart : currentColors.heartOutline} 
                      />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Hamburger Menu Modal */}
        <Modal visible={showHamburgerMenu} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.hamburgerModal, { backgroundColor: currentColors.modal }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: currentColors.primary }]}>Menu</Text>
                <TouchableOpacity onPress={() => setShowHamburgerMenu(false)}>
                  <Ionicons name="close" size={24} color={currentColors.primary} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity 
                style={[styles.menuOption, { borderBottomColor: currentColors.border }]}
                onPress={() => {
                  setShowHamburgerMenu(false);
                  navigation.navigate('Mood');
                }}
              >
                <Ionicons name="sparkles" size={24} color="#FFD700" />
                <Text style={[styles.menuOptionText, { color: currentColors.primary }]}>Mood</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.menuOption, { borderBottomColor: currentColors.border }]}
                onPress={() => {
                  setShowHamburgerMenu(false);
                  navigation.navigate('Weather');
                }}
              >
                <Ionicons name="partly-sunny" size={24} color="#FFA500" />
                <Text style={[styles.menuOptionText, { color: currentColors.primary }]}>Weather</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Outfit of the Day Modal */}
        <Modal visible={showOutfitOfDay} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.outfitModal, { backgroundColor: currentColors.modal }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: currentColors.primary }]}>
                  {outfitOfDay ? `Outfit for ${new Date(outfitOfDay.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}` : 'Outfit of the Day'}
                </Text>
                <TouchableOpacity onPress={closeOutfitOfDay}>
                  <Ionicons name="close" size={24} color={currentColors.primary} />
                </TouchableOpacity>
              </View>
              
              {outfitOfDay ? (
                <View style={styles.outfitContent}>
                  <Text style={[styles.outfitDescription, { color: currentColors.secondary, textAlign: 'center', marginBottom: 20 }]}>
                    {outfitOfDay.description}
                  </Text>
                  
                  {outfitOfDay.items ? (
                    <View style={styles.outfitItemsContainer}>
                      {outfitOfDay.items.map((item, index) => (
                        <View key={item.id || index} style={[styles.outfitItemCard, { backgroundColor: currentColors.card }]}>
                          <Image source={{ uri: item.uri }} style={styles.outfitItemImage} />
                          <View style={styles.outfitItemInfo}>
                            <Text style={[styles.outfitItemTitle, { color: currentColors.primary }]}>
                              {item.title || item.category || 'Item'}
                            </Text>
                            <Text style={[styles.outfitItemColor, { color: currentColors.secondary }]}>
                              {item.colorName || 'N/A'}
                            </Text>
                          </View>
                          <TouchableOpacity 
                            style={styles.outfitItemHeartButton}
                            onPress={() => toggleFavorite(item.id)}
                          >
                            <Ionicons 
                              name={isFavorite(item.id) ? "heart" : "heart-outline"} 
                              size={20} 
                              color={isFavorite(item.id) ? currentColors.heart : currentColors.heartOutline} 
                            />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View style={[styles.outfitCard, { backgroundColor: currentColors.card }]}>
                      <Image source={{ uri: outfitOfDay.item.uri }} style={styles.outfitImage} />
                      <View style={styles.outfitInfo}>
                        <Text style={[styles.outfitTitle, { color: currentColors.primary }]}>
                          {outfitOfDay.item.title || outfitOfDay.item.category || 'Outfit Item'}
                        </Text>
                        <Text style={[styles.outfitColor, { color: currentColors.secondary }]}>
                          Color: {outfitOfDay.item.colorName || 'N/A'}
                        </Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.outfitHeartButton}
                        onPress={() => toggleFavorite(outfitOfDay.item.id)}
                      >
                        <Ionicons 
                          name={isFavorite(outfitOfDay.item.id) ? "heart" : "heart-outline"} 
                          size={24} 
                          color={isFavorite(outfitOfDay.item.id) ? currentColors.heart : currentColors.heartOutline} 
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.emptyOutfitContent}>
                  <Ionicons name="shirt-outline" size={64} color={currentColors.secondary} />
                  <Text style={[styles.emptyOutfitText, { color: currentColors.secondary }]}>
                    No items in your closet yet!
                  </Text>
                  <Text style={[styles.emptyOutfitSubtext, { color: currentColors.secondary }]}>
                    Add some items to get outfit suggestions.
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Modal>

        {/* Location Change Modal */}
        <Modal visible={showLocationModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.locationModal, { backgroundColor: currentColors.modal }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: currentColors.primary }]}>Change Location</Text>
                <TouchableOpacity onPress={handleLocationCancel}>
                  <Ionicons name="close" size={24} color={currentColors.primary} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.locationInputContainer}>
                <Ionicons name="location-outline" size={20} color={currentColors.primary} />
                <TextInput
                  style={[styles.locationInput, { color: currentColors.primary, borderBottomColor: currentColors.border }]}
                  placeholder="Enter your location..."
                  placeholderTextColor={currentColors.secondary}
                  value={newLocation}
                  onChangeText={setNewLocation}
                  autoFocus
                />
              </View>
              
              <View style={styles.locationButtonContainer}>
                <TouchableOpacity 
                  style={[styles.locationCancelButton, { backgroundColor: currentColors.searchBar }]}
                  onPress={handleLocationCancel}
                >
                  <Text style={[styles.locationButtonText, { color: currentColors.primary }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.locationSaveButton, { backgroundColor: currentColors.button }]}
                  onPress={handleLocationSave}
                >
                  <Text style={[styles.locationButtonText, { color: currentColors.buttonText }]}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Date Upload Modal */}
        <DateUploadModal
          visible={showDateUploadModal}
          onClose={() => setShowDateUploadModal(false)}
          selectedDate={selectedDateForUpload}
          onSuccess={() => {
            // Refresh calendar to show new indicators
            setCalendarKey(prev => prev + 1);
          }}
        />
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 40,
    paddingBottom: 80, // Reduced padding to make app ratio smaller
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  locationText: {
    marginLeft: 5,
    marginRight: 5,
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'System',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
  },
  menuButton: {
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
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: 'System',
    letterSpacing: 0.5,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
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
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    borderRadius: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  productImageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  productHeartButton: {
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
  productInfo: {
    padding: 15,
  },
  productTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 5,
    fontFamily: 'System',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
  styleMeButton: {
    borderRadius: 30,
    paddingVertical: 20,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  styleMeText: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'System',
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  searchResultsModal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  hamburgerModal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'System',
    letterSpacing: 0.5,
  },
  resultsCount: {
    fontSize: 16,
    marginBottom: 15,
  },
  resultsList: {
    maxHeight: 400,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  resultImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 15,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: 'System',
  },
  resultColor: {
    fontSize: 14,
  },
  resultHeartButton: {
    padding: 5,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  menuOptionText: {
    marginLeft: 15,
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'System',
  },
  calendarContainer: {
    borderRadius: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  calendar: {
    borderRadius: 10,
  },
  outfitModal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  outfitContent: {
    flex: 1,
  },
  outfitItemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 10,
  },
  outfitItemCard: {
    width: '45%',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 10,
  },
  outfitItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
  },
  outfitItemInfo: {
    alignItems: 'center',
    flex: 1,
  },
  outfitItemTitle: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  outfitItemColor: {
    fontSize: 10,
    textAlign: 'center',
  },
  outfitItemHeartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
  },
  outfitCard: {
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  outfitImage: {
    width: 200,
    height: 200,
    borderRadius: 15,
    marginBottom: 15,
  },
  outfitInfo: {
    alignItems: 'center',
    marginBottom: 15,
  },
  outfitTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'System',
    letterSpacing: 0.5,
  },
  outfitDescription: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'System',
    fontWeight: '500',
  },
  outfitColor: {
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'System',
    fontWeight: '500',
  },
  outfitHeartButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyOutfitContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyOutfitText: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 15,
    marginBottom: 8,
    fontFamily: 'System',
  },
  emptyOutfitSubtext: {
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'System',
    fontWeight: '500',
  },
  locationModal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '50%',
  },
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  locationInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  locationButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  locationCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  locationSaveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 10,
  },
  locationButtonText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'System',
  },
});


