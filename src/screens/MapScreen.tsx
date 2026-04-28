import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import UtilityCard from '../components/UtilityCard';

interface MapScreenProps {
  isDarkMode: boolean;
}

const MapScreen: React.FC<MapScreenProps> = ({ isDarkMode }) => {
  const [utilities, setUtilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationPermission, setLocationPermission] = useState(false);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') return true;
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Location Permission",
          message: "MySumsel needs access to your location to find nearby services.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const fetchUtilities = async () => {
    try {
      // Coordinates provided by USER
      const latitude = '10.976';
      const longitude = '104.756';

      const response = await fetch('https://apinofudev.bengkelfajarjaya.com/mysumsel/api/v1/utilities', {
        headers: {
          'X-Latitude': latitude,
          'X-Longitude': longitude,
        }
      });
      const json = await response.json();
      if (json.status === 'success') {
        setUtilities(json.data.items);
      }
    } catch (error) {
      console.error('Error fetching utilities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const hasPermission = await requestLocationPermission();
      setLocationPermission(hasPermission);
      fetchUtilities();
    };
    init();
  }, []);

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={[styles.title, isDarkMode && styles.textWhite]}>Nearby Services</Text>
      <Text style={styles.subtitle}>Find essential utilities and emergency services around you</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#C5A059" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={utilities}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <UtilityCard item={item} isDarkMode={isDarkMode} />
        )}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#333333',
  },
  subtitle: {
    fontSize: 14,
    color: '#888888',
    marginTop: 6,
    lineHeight: 20,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWhite: {
    color: '#FFFFFF',
  },
});

export default MapScreen;
