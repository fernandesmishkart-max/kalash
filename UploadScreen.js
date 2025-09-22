import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Alert, ScrollView, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useCloset, CATEGORIES } from '../context/ClosetContext';
import { useTheme } from '../context/ThemeContext';
import ProfileHeader from '../components/ProfileHeader';

// Simple dominant color via canvas-like approach is not available in RN core.
// We'll estimate color by downscaling using Expo's ImageManipulator get histogram-like sample via pixelate (approximation).
import * as ImageManipulator from 'expo-image-manipulator';

const COLORS = [
  { name: 'Black', rgb: [10, 10, 10] },
  { name: 'White', rgb: [245, 245, 245] },
  { name: 'Gray', rgb: [128, 128, 128] },
  { name: 'Red', rgb: [220, 50, 47] },
  { name: 'Green', rgb: [46, 204, 113] },
  { name: 'Blue', rgb: [52, 152, 219] },
  { name: 'Yellow', rgb: [241, 196, 15] },
  { name: 'Brown', rgb: [121, 85, 72] },
  { name: 'Pink', rgb: [233, 30, 99] },
  { name: 'Purple', rgb: [142, 68, 173] },
  { name: 'Beige', rgb: [245, 245, 220] },
];

function nearestColorName(avg) {
  let best = COLORS[0];
  let bestD = 1e9;
  for (const c of COLORS) {
    const d = Math.hypot(c.rgb[0] - avg[0], c.rgb[1] - avg[1], c.rgb[2] - avg[2]);
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  return best.name;
}

export default function UploadScreen({ navigation }) {
  const { addItem } = useCloset();
  const { isDarkMode, colors } = useTheme();
  const currentColors = colors[isDarkMode ? 'dark' : 'light'];
  const [image, setImage] = useState(null);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [style, setStyle] = useState('Casual');
  const [colorName, setColorName] = useState('');
  const [title, setTitle] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!res.canceled) {
      const uri = res.assets[0].uri;
      setImage(uri);
      const avg = await estimateAverageColor(uri);
      setColorName(nearestColorName(avg));
      setShowAddModal(true);
    }
  };

  const takePhoto = async () => {
    const res = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!res.canceled) {
      const uri = res.assets[0].uri;
      setImage(uri);
      const avg = await estimateAverageColor(uri);
      setColorName(nearestColorName(avg));
      setShowAddModal(true);
    }
  };

  const estimateAverageColor = async (uri) => {
    try {
      const pixelated = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: 8 } }], { compress: 0.5, format: ImageManipulator.SaveFormat.PNG, base64: true });
      const b64 = pixelated.base64 || '';
      let r = 0, g = 0, b = 0, n = Math.min(400, b64.length);
      for (let i = 0; i < n; i++) {
        const code = b64.charCodeAt(i);
        r += (code % 97);
        g += (code % 53);
        b += (code % 193);
      }
      return [r / n, g / n, b / n];
    } catch (e) {
      return [128, 128, 128];
    }
  };

  const save = () => {
    console.log('Save function called');
    console.log('Image:', !!image);
    console.log('Title:', title);
    console.log('Color:', colorName);
    console.log('Category:', category);
    
    if (!image) return Alert.alert('Error', 'Please select an image first');
    if (!title.trim()) return Alert.alert('Error', 'Please enter an item title');
    if (!colorName.trim()) return Alert.alert('Error', 'Please enter a color');
    
    const newItem = { uri: image, category, style, colorName, title };
    console.log('Adding item:', newItem);
    
    addItem(newItem);
    setImage(null);
    setTitle('');
    setColorName('');
    setShowAddModal(false);
    setShowSuccessModal(true);
  };

  const handleSuccessOK = () => {
    setShowSuccessModal(false);
    navigation.navigate('Home');
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

        <ScrollView 
          style={styles.content} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        <Text style={[styles.title, { color: currentColors.primary }]}>Add New Item</Text>
        
        {image && (
          <View style={styles.imagePreview}>
            <Image source={{ uri: image }} style={styles.previewImage} />
          </View>
        )}

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: currentColors.primary }]}>Item Type</Text>
          <TextInput 
            value={title} 
            onChangeText={setTitle} 
            placeholder="e.g., T-Shirt, Jeans, Dress" 
            placeholderTextColor={currentColors.secondary}
            style={[styles.input, { backgroundColor: currentColors.searchBar, borderColor: currentColors.border, color: currentColors.primary }]} 
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: currentColors.primary }]}>Category</Text>
          <View style={styles.categoryContainer}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryButton,
                  { 
                    backgroundColor: category === cat ? currentColors.button : currentColors.searchBar,
                    borderColor: currentColors.border
                  }
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[
                  styles.categoryText,
                  { color: category === cat ? currentColors.buttonText : currentColors.primary }
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: currentColors.primary }]}>Color</Text>
          <TextInput 
            value={colorName} 
            onChangeText={setColorName} 
            placeholder="e.g., Black, Blue, Red" 
            placeholderTextColor={currentColors.secondary}
            style={[styles.input, { backgroundColor: currentColors.searchBar, borderColor: currentColors.border, color: currentColors.primary }]} 
          />
        </View>

        {/* Error Messages */}
        {(!image || !title.trim() || !colorName.trim()) && (
          <Text style={[styles.errorText, { color: currentColors.heart }]}>
            {!image && !title.trim() && !colorName.trim() 
              ? 'Please add an image, enter item type, and color'
              : !image && !title.trim() 
              ? 'Please add an image and enter item type'
              : !image && !colorName.trim() 
              ? 'Please add an image and enter color'
              : !title.trim() && !colorName.trim() 
              ? 'Please enter item type and color'
              : !image 
              ? 'Please add an image'
              : !title.trim() 
              ? 'Please enter item type'
              : 'Please enter color'
            }
          </Text>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={[
              styles.retakeButton, 
              { 
                backgroundColor: currentColors.searchBar, 
                borderColor: currentColors.border,
                opacity: image ? 1 : 0.7
              }
            ]} 
            onPress={() => {
              if (image) {
                setImage(null);
              }
              setShowAddModal(true);
            }}
          >
            <Ionicons name="camera-outline" size={20} color={currentColors.primary} />
            <Text style={[styles.retakeText, { color: currentColors.primary }]}>
              {image ? 'Retake/Reselect Image' : 'Select Image'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.confirmUploadButton, 
              { 
                backgroundColor: currentColors.button,
                opacity: (!image || !title.trim() || !colorName.trim()) ? 0.5 : 1
              }
            ]} 
            onPress={save}
            disabled={!image || !title.trim() || !colorName.trim()}
          >
            <Ionicons name="checkmark-circle" size={20} color={currentColors.buttonText} />
            <Text style={[styles.confirmUploadText, { color: currentColors.buttonText }]}>Confirm Upload</Text>
          </TouchableOpacity>
        </View>


        </ScrollView>

        {/* Add Options Modal */}
      <Modal visible={!image && !showSuccessModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.addModal, { backgroundColor: currentColors.modal }]}>
            <TouchableOpacity style={[styles.addOption, { borderBottomColor: currentColors.border }]} onPress={pickImage}>
              <Ionicons name="images-outline" size={24} color={currentColors.primary} />
              <Text style={[styles.addOptionText, { color: currentColors.primary }]}>Add from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.addOption, { borderBottomColor: currentColors.border }]} onPress={takePhoto}>
              <Ionicons name="camera-outline" size={24} color={currentColors.primary} />
              <Text style={[styles.addOptionText, { color: currentColors.primary }]}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelOption} onPress={() => navigation.goBack()}>
              <Text style={[styles.cancelOptionText, { color: currentColors.heart }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.successModal, { backgroundColor: currentColors.modal }]}>
            <View style={[styles.successIcon, { backgroundColor: currentColors.button }]}>
              <Ionicons name="checkmark-circle" size={48} color={currentColors.buttonText} />
            </View>
            <Text style={[styles.successTitle, { color: currentColors.primary }]}>Success!</Text>
            <Text style={[styles.successMessage, { color: currentColors.secondary }]}>
              Item added to your closet successfully!{'\n'}It will appear in the {category} category.
            </Text>
            <TouchableOpacity 
              style={[styles.successButton, { backgroundColor: currentColors.button }]} 
              onPress={handleSuccessOK}
            >
              <Text style={[styles.successButtonText, { color: currentColors.buttonText }]}>OK</Text>
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
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 150, // Extra padding to ensure buttons are accessible above nav bar
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  imagePreview: {
    alignItems: 'center',
    marginBottom: 20,
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  inputContainer: {
    marginBottom: 15,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: '600',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingBottom: 20,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    flex: 1,
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginLeft: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  addText: {
    fontSize: 16,
    fontWeight: '600',
  },
  uploadAnotherContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  uploadAnotherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  uploadAnotherText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  actionButtonsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
    gap: 15,
    paddingHorizontal: 20,
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 25,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    width: '100%',
    justifyContent: 'center',
    minHeight: 55,
  },
  retakeText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  confirmUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 7,
    width: '100%',
    justifyContent: 'center',
    minHeight: 55,
  },
  confirmUploadText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  addModal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40, // Add extra padding to avoid navigation bar
  },
  addOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  addOptionText: {
    marginLeft: 15,
    fontSize: 16,
  },
  cancelOption: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  cancelOptionText: {
    fontSize: 16,
  },
  successModal: {
    margin: 20,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
  },
  successButton: {
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  successButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});


