import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useCloset } from '../context/ClosetContext';
import { useTheme } from '../context/ThemeContext';
import ProfileHeader from '../components/ProfileHeader';

async function fetchWeather() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;
    const loc = await Location.getCurrentPositionAsync({});
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.coords.latitude}&longitude=${loc.coords.longitude}&current=temperature_2m,precipitation,apparent_temperature&hourly=temperature_2m`;
    const res = await fetch(url);
    return await res.json();
  } catch (e) {
    return null;
  }
}

function generateOutfit(items, weather) {
  if (!items || items.length === 0) return 'No items uploaded yet.';
  const t = weather?.current?.temperature_2m ?? 22;
  const isCold = t < 16;
  const isHot = t > 28;
  const prefer = isCold ? 'Chic' : isHot ? 'Basic' : 'Cottage Core';
  const pick = items.find((i) => i.category === prefer) || items[0];
  return `Since it is ${Math.round(t)}°C, try your ${pick.colorName} ${pick.title || pick.style} from ${pick.category}.`;
}

export default function ChatbotScreen({ navigation }) {
  const { items } = useCloset();
  const { isDarkMode, colors } = useTheme();
  const currentColors = colors[isDarkMode ? 'dark' : 'light'];
  const [weather, setWeather] = useState(null);
  const [messages, setMessages] = useState([{ from: 'bot', text: 'Hi! Ask me for outfit suggestions or search by color.' }]);
  const [input, setInput] = useState('');

  useEffect(() => {
    (async () => setWeather(await fetchWeather()))();
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;
    const text = input.trim();
    setMessages((m) => [...m, { from: 'user', text }]);

    // Enhanced intent detection
    let reply = '';
    const lowerText = text.toLowerCase();
    
    if (/weather|outfit|wear|suggest|recommend/i.test(lowerText)) {
      reply = generateOutfit(items, weather);
    } else if (/color|colour|search/i.test(lowerText)) {
      const color = text.split(/color|colour|search/i).pop().trim().split(/[ .!?]/)[0];
      const found = items.filter((i) => i.colorName.toLowerCase().includes(color.toLowerCase()));
      reply = found.length ? `I found ${found.length} item(s) in ${color}. Check your Closet tab to see them!` : `No items found in ${color}. Try adding some items to your closet first.`;
    } else if (/hello|hi|hey|greetings/i.test(lowerText)) {
      reply = "Hello! I'm your AI style assistant. I can help you with outfit suggestions, weather-based recommendations, and finding items by color. What would you like to know?";
    } else if (/help|what can you do/i.test(lowerText)) {
      reply = "I can help you with:\n• Weather-based outfit suggestions\n• Finding items by color\n• Style recommendations\n• General fashion advice\n\nTry asking me about the weather or searching for specific colors!";
    } else if (/how are you|how do you feel/i.test(lowerText)) {
      reply = "I'm doing great! I love helping you with your style choices. What outfit are you thinking about today?";
    } else if (/thank|thanks/i.test(lowerText)) {
      reply = "You're welcome! I'm always here to help with your fashion needs. Feel free to ask me anything!";
    } else if (/goodbye|bye|see you/i.test(lowerText)) {
      reply = "Goodbye! Have a stylish day! 👋";
    } else if (/fashion|style|clothing|clothes/i.test(lowerText)) {
      reply = "I love talking about fashion! I can help you find the perfect outfit based on your mood, the weather, or specific colors. What style are you going for today?";
    } else {
      reply = "I'm here to help with your style needs! Try asking me about:\n• Weather-based outfit suggestions\n• Finding items by color (e.g., 'search blue')\n• General fashion advice\n\nWhat would you like to know?";
    }

    setMessages((m) => [...m, { from: 'bot', text: reply }]);
    setInput('');
  };

  const suggestion = useMemo(() => generateOutfit(items, weather), [items, weather]);

  return (
    <View style={styles.container}>
      <LinearGradient colors={currentColors.background} style={styles.gradient}>
        {/* Profile Header */}
        <ProfileHeader navigation={navigation} showUserInfo={false} showFavorites={false} />
        
        <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: currentColors.primary }]}>KALASH</Text>
        <View style={styles.headerIcons}>
          <View style={[styles.profileIcon, { backgroundColor: currentColors.button }]}>
            <Text style={[styles.profileText, { color: currentColors.buttonText }]}>AI</Text>
          </View>
        </View>
      </View>
      
        <Text style={[styles.title, { color: currentColors.primary }]}>AI Assistant</Text>
        <Text style={[styles.subtitle, { color: currentColors.secondary }]}>Weather-aware outfit helper</Text>
        <View style={[styles.tip, { backgroundColor: currentColors.card }]}><Text style={{ color: currentColors.primary }}>{suggestion}</Text></View>
        <FlatList
        data={messages}
        keyExtractor={(_, idx) => String(idx)}
        contentContainerStyle={{ paddingVertical: 12 }}
        renderItem={({ item }) => (
          <View style={[styles.msg, item.from === 'user' ? [styles.msgUser, { backgroundColor: currentColors.button }] : [styles.msgBot, { backgroundColor: currentColors.card }]]}>
            <Text style={{ color: item.from === 'user' ? currentColors.buttonText : currentColors.primary }}>{item.text}</Text>
          </View>
        )}
        />
        <View style={styles.inputRow}>
          <TextInput 
            value={input} 
            onChangeText={setInput} 
            placeholder="Ask me..." 
            placeholderTextColor={currentColors.secondary}
            style={[styles.input, { backgroundColor: currentColors.searchBar, borderColor: currentColors.border, color: currentColors.primary }]} 
          />
          <TouchableOpacity style={[styles.send, { backgroundColor: currentColors.button }]} onPress={handleSend}>
            <Text style={{ color: currentColors.buttonText }}>Send</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
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
  },
  profileText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  title: { fontWeight: 'bold', fontSize: 22, marginTop: 16, marginHorizontal: 20 },
  subtitle: { marginBottom: 8, marginHorizontal: 20 },
  tip: { padding: 12, borderRadius: 10, marginBottom: 8, marginHorizontal: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  msg: { padding: 10, borderRadius: 10, marginVertical: 4, maxWidth: '85%' },
  msgUser: { alignSelf: 'flex-end' },
  msgBot: { alignSelf: 'flex-start' },
  inputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 100 }, // Reduced padding to make app ratio smaller
  input: { flex: 1, borderWidth: 1, borderRadius: 10, padding: 12, marginRight: 8 },
  send: { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12 },
});


