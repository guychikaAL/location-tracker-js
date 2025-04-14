import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

const LOCATION_TASK_NAME = 'background-location-task';

TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
  console.log('📡 Task Triggered!', { data, error });

  if (error) {
    console.error('❌ Task Error:', error);
    return;
  }

  if (data) {
    const { locations } = data;
    const coords = locations[0]?.coords;
    if (coords) {
      console.log('📍 מיקום חדש:', coords);
    }
  }
});

export default function App() {
  const [status, setStatus] = useState('🔄 מנסה להריץ משימת מיקום...');

  useEffect(() => {
    const startLocationTracking = async () => {
      const { status: fg } = await Location.requestForegroundPermissionsAsync();
      const { status: bg } = await Location.requestBackgroundPermissionsAsync();

      if (fg !== 'granted' || bg !== 'granted') {
        setStatus('❌ הרשאות לא אושרו');
        return;
      }

      const started = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
      if (!started) {
        try {
          await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
            accuracy: Location.Accuracy.Highest,
            timeInterval: 10000,
            distanceInterval: 0,
            showsBackgroundLocationIndicator: true,
            foregroundService: {
              notificationTitle: '📡 Location Tracker',
              notificationBody: 'מתעדכן ברקע...',
            },
          });
          setStatus('✅ משימת מיקום הופעלה בהצלחה!');
        } catch (e) {
          console.error('❌ שגיאה בהפעלת משימה:', e);
          setStatus('❌ שגיאה בהפעלת משימה');
        }
      } else {
        setStatus('✅ משימת מיקום כבר פעילה');
      }
    };

    startLocationTracking();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📍 Location Tracker</Text>
      <Text>{status}</Text>
      <Text>בדוק את הלוגים ב־adb logcat</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
