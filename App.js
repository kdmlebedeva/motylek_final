import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Импорт твоих экранов (пока заглушки, потом заменишь)
const ScheduleScreen = () => <View style={styles.screen}><Text>Расписание</Text></View>;
const HomeworkScreen = () => <View style={styles.screen}><Text>ДЗ</Text></View>;
const DiaryScreen = () => <View style={styles.screen}><Text>Дневник</Text></View>;
const ChatScreen = () => <View style={styles.screen}><Text>Чат</Text></View>;
const NewsScreen = () => <View style={styles.screen}><Text>Новости</Text></View>;

const Tab = createBottomTabNavigator();

function RoleSelector({ onSelectRole }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🦋 Мотылёк</Text>
      <Text style={styles.subtitle}>Кто ты сегодня?</Text>
      <Button title="Ученик" onPress={() => onSelectRole('student')} />
      <Button title="Родитель" onPress={() => onSelectRole('parent')} />
      <Button title="Педагог" onPress={() => onSelectRole('teacher')} />
    </View>
  );
}

export default function App() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('userRole').then(savedRole => {
      if (savedRole) setRole(savedRole);
    });
  }, []);

  const selectRole = (selected) => {
    setRole(selected);
    AsyncStorage.setItem('userRole', selected);
  };

  if (!role) {
    return <RoleSelector onSelectRole={selectRole} />;
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            const icons = {
              'Расписание': 'calendar',
              'ДЗ': 'book',
              'Дневник': 'journal',
              'Чат': 'chatbubbles',
              'Новости': 'megaphone',
            };
            return <Ionicons name={icons[route.name]} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#ffb347',
          tabBarInactiveTintColor: '#888',
          headerStyle: { backgroundColor: '#1a1a1a' },
          headerTitleStyle: { color: '#ffb347' },
          tabBarStyle: { backgroundColor: '#1a1a1a' },
        })}
      >
        <Tab.Screen name="Расписание" component={ScheduleScreen} />
        <Tab.Screen name="ДЗ" component={HomeworkScreen} />
        <Tab.Screen name="Дневник" component={DiaryScreen} />
        <Tab.Screen name="Чат" component={ChatScreen} />
        <Tab.Screen name="Новости" component={NewsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a1a' },
  title: { fontSize: 32, color: '#ffb347', marginBottom: 20 },
  subtitle: { fontSize: 18, color: '#fff', marginBottom: 30 },
  screen: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a1a' },
});