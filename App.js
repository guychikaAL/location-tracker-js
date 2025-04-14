import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
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
  const [status, setStatus] = useState('🔄 בדיקת סטטוס...');
  const [isTracking, setIsTracking] = useState(false);

  const checkIfTracking = async () => {
    const started = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    setIsTracking(started);
    setStatus(started ? '✅ משימת מיקום פעילה' : '⏹️ משימה לא פעילה');
  };

  useEffect(() => {
    checkIfTracking();
  }, []);

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
        setIsTracking(true);
      } catch (e) {
        console.error('❌ שגיאה בהפעלת משימה:', e);
        setStatus('❌ שגיאה בהפעלת משימה');
      }
    } else {
      setStatus('✅ משימת מיקום כבר פעילה');
    }
  };

  const stopLocationTracking = async () => {
    try {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      setStatus('🛑 משימת מיקום הופסקה');
      setIsTracking(false);
    } catch (e) {
      console.error('❌ שגיאה בהפסקת משימה:', e);
      setStatus('❌ שגיאה בהפסקת משימה');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📍 Location Tracker</Text>
      <Text style={styles.status}>{status}</Text>

      <View style={styles.buttonContainer}>
        <Button title="Start" onPress={startLocationTracking} disabled={isTracking} />
        <Button title="Stop" onPress={stopLocationTracking} disabled={!isTracking} />
      </View>

      <Text style={{ marginTop: 20, fontSize: 12 }}>🔍 בדוק את הלוגים עם adb logcat</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  status: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
});
