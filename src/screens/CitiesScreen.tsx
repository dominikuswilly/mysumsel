import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import CityCard from '../components/CityCard';

interface CitiesScreenProps {
  isDarkMode: boolean;
}

const CitiesScreen: React.FC<CitiesScreenProps> = ({ isDarkMode }) => {
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCities = async () => {
    try {
      const response = await fetch('https://apinofudev.bengkelfajarjaya.com/mysumsel/api/v1/cities?page=1&limit=20');
      const json = await response.json();
      if (json.status === 'success') {
        setCities(json.data.data);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCities();
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={[styles.title, isDarkMode && styles.textWhite]}>Cities & Regions</Text>
      <Text style={styles.subtitle}>Explore the diverse regencies and cities of South Sumatra</Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#C5A059" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cities}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <CityCard city={item} isDarkMode={isDarkMode} />
        )}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor="#C5A059" 
            colors={["#C5A059"]}
          />
        }
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
  row: {
    justifyContent: 'space-between',
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

export default CitiesScreen;
