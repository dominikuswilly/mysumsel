import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface City {
  id: number | string;
  name: string;
  image_url: string;
  type?: string;
}

interface CityCardProps {
  city: City;
  onPress?: (city: City) => void;
  isDarkMode: boolean;
}

const CityCard: React.FC<CityCardProps> = ({ city, onPress, isDarkMode }) => {
  const displayName = city.name.replace('Kota ', '').replace('Kabupaten ', '');

  return (
    <TouchableOpacity 
      style={[styles.card, isDarkMode && styles.cardDark]} 
      onPress={() => onPress?.(city)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: city.image_url }} style={styles.image} />
      <View style={styles.info}>
        <Text style={[styles.name, isDarkMode && styles.textWhite]} numberOfLines={1}>
          {displayName}
        </Text>
        {city.type && (
          <Text style={styles.type}>
            {city.type.charAt(0).toUpperCase() + city.type.slice(1)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardDark: {
    backgroundColor: '#1E1E1E',
    shadowOpacity: 0.3,
  },
  image: {
    width: '100%',
    height: 120,
    backgroundColor: '#F1F3F5',
  },
  info: {
    padding: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
  },
  type: {
    fontSize: 11,
    color: '#888888',
    marginTop: 2,
    fontWeight: '500',
  },
  textWhite: {
    color: '#FFFFFF',
  },
});

export default CityCard;
