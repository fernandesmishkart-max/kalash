import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import ProfileHeader from '../components/ProfileHeader';

export default function ProfileScreen({ navigation }) {
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const currentColors = colors[isDarkMode ? 'dark' : 'light'];

  return (
    <View style={styles.container}>
      <LinearGradient colors={currentColors.background} style={styles.gradient}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Header with Icons */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={currentColors.primary} />
            </TouchableOpacity>
            <View style={styles.headerSpacer} />
            <TouchableOpacity 
              style={[styles.favoritesButton, { backgroundColor: currentColors.card }]} 
              onPress={() => navigation.navigate('Closet', { showFavorites: true })}
            >
              <Ionicons name="heart-outline" size={20} color="#FFD700" />
            </TouchableOpacity>
          </View>
          
          {/* Profile Header */}
          <ProfileHeader navigation={navigation} showUserInfo={true} />
          {/* Profile Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: currentColors.primary }]}>PROFILE INFO</Text>
            <View style={[styles.profileCard, { backgroundColor: currentColors.card }]}>
              <View style={styles.profileImageContainer}>
                <View style={[styles.profileImage, { backgroundColor: '#007AFF', borderColor: '#FFD700' }]}>
                  <Text style={styles.profileImageText}>imgbb.com</Text>
                  <Text style={styles.profileImageSubtext}>Image not found</Text>
                </View>
                <TouchableOpacity style={[styles.editIcon, { backgroundColor: currentColors.button }]}>
                  <Ionicons name="pencil" size={12} color={currentColors.buttonText} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.username, { color: currentColors.primary }]}>gaya3</Text>
              <Text style={[styles.memberSince, { color: currentColors.secondary }]}>Member since 2024</Text>
              <TouchableOpacity style={[styles.editButton, { backgroundColor: currentColors.button }]}>
                <Text style={[styles.editButtonText, { color: currentColors.buttonText }]}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Theme Selection Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: currentColors.primary }]}>THEME SELECTION</Text>
            <View style={[styles.themeCard, { backgroundColor: currentColors.card }]}>
              <View style={styles.themeOptions}>
                <TouchableOpacity 
                  style={[
                    styles.themeOption, 
                    { backgroundColor: !isDarkMode ? currentColors.button : currentColors.searchBar }
                  ]}
                  onPress={() => !isDarkMode ? null : toggleTheme()}
                >
                  <Ionicons name="sunny" size={24} color={!isDarkMode ? currentColors.buttonText : currentColors.primary} />
                  <Text style={[
                    styles.themeOptionText, 
                    { color: !isDarkMode ? currentColors.buttonText : currentColors.primary }
                  ]}>Light Mode</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.themeOption, 
                    { backgroundColor: isDarkMode ? currentColors.button : currentColors.searchBar }
                  ]}
                  onPress={() => isDarkMode ? null : toggleTheme()}
                >
                  <Ionicons name="moon" size={24} color={isDarkMode ? currentColors.buttonText : currentColors.primary} />
                  <Text style={[
                    styles.themeOptionText, 
                    { color: isDarkMode ? currentColors.buttonText : currentColors.primary }
                  ]}>Dark Mode</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* My Info Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: currentColors.primary }]}>ACCOUNT INFO</Text>
            <View style={[styles.infoCard, { backgroundColor: currentColors.card }]}>
              <View style={styles.infoItem}>
                <Ionicons name="mail-outline" size={20} color={currentColors.primary} />
                <Text style={[styles.infoText, { color: currentColors.primary }]}>Email: example@mail.com</Text>
              </View>
              <View style={[styles.divider, { backgroundColor: currentColors.border }]} />
              <TouchableOpacity style={styles.infoItem}>
                <Ionicons name="lock-closed-outline" size={20} color={currentColors.primary} />
                <Text style={[styles.infoText, { color: currentColors.primary }]}>Change Password</Text>
                <Ionicons name="chevron-forward" size={16} color={currentColors.secondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* App Settings Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: currentColors.primary }]}>APP SETTINGS</Text>
            <View style={[styles.infoCard, { backgroundColor: currentColors.card }]}>
              <TouchableOpacity style={styles.infoItem}>
                <Ionicons name="settings-outline" size={20} color={currentColors.primary} />
                <Text style={[styles.infoText, { color: currentColors.primary }]}>Notifications</Text>
                <Ionicons name="chevron-forward" size={16} color={currentColors.secondary} />
              </TouchableOpacity>
              <View style={[styles.divider, { backgroundColor: currentColors.border }]} />
              <TouchableOpacity style={styles.infoItem}>
                <Ionicons name="help-circle-outline" size={20} color={currentColors.primary} />
                <Text style={[styles.infoText, { color: currentColors.primary }]}>Help & Support</Text>
                <Ionicons name="chevron-forward" size={16} color={currentColors.secondary} />
              </TouchableOpacity>
            </View>
          </View>
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
    paddingTop: 0,
    paddingBottom: 100, // Reduced padding to make app ratio smaller
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerSpacer: {
    flex: 1,
  },
  favoritesButton: {
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  profileCard: {
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  profileImageText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  profileImageSubtext: {
    color: '#fff',
    fontSize: 10,
    marginTop: 2,
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  memberSince: {
    fontSize: 14,
    marginBottom: 20,
  },
  editButton: {
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 20,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  themeCard: {
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  themeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  themeOptionText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  infoText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
  },
  divider: {
    height: 1,
    marginVertical: 5,
  },
});
