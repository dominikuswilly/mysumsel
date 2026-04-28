import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Linking,
} from 'react-native';

interface UtilityItem {
  id: string;
  category: string;
  name: string;
  city: string;
  is_open_24h: boolean;
  image_url: string;
  contact?: {
    phone?: string;
    emergency?: string;
  };
  location: {
    address: string;
    latitude: number;
    longitude: number;
    distance_km: number;
  };
  tags?: string[];
}

interface UtilityCardProps {
  item: UtilityItem;
  isDarkMode: boolean;
}

const UtilityCard: React.FC<UtilityCardProps> = ({ item, isDarkMode }) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'hospital': return '🏥';
      case 'police': return '👮';
      case 'money_changer': return '💱';
      default: return '📍';
    }
  };

  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  return (
    <TouchableOpacity style={[styles.card, isDarkMode && styles.cardDark]} activeOpacity={0.9}>
      <Image source={{ uri: item.image_url }} style={styles.image} />
      <View style={styles.info}>
        <View style={styles.header}>
          <Text style={styles.categoryIcon}>{getCategoryIcon(item.category)}</Text>
          <View style={styles.titleContainer}>
            <Text style={[styles.name, isDarkMode && styles.textWhite]} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.distance}>{item.location.distance_km} km away</Text>
          </View>
        </View>

        <Text style={[styles.address, isDarkMode && styles.textMuted]} numberOfLines={2}>
          {item.location.address}
        </Text>

        <View style={styles.footer}>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: item.is_open_24h ? '#4CAF50' : '#FF9800' }]} />
            <Text style={[styles.statusText, isDarkMode && styles.textMuted]}>
              {item.is_open_24h ? 'Open 24h' : 'Check Hours'}
            </Text>
          </View>

          <View style={styles.actionContainer}>
            {item.contact?.emergency && (
              <TouchableOpacity 
                style={styles.emergencyButton} 
                onPress={() => handleCall(item.contact!.emergency!)}
              >
                <Text style={styles.actionText}>🆘 Emergency</Text>
              </TouchableOpacity>
            )}
            {item.contact?.phone && !item.contact?.emergency && (
              <TouchableOpacity 
                style={styles.callButton} 
                onPress={() => handleCall(item.contact!.phone!)}
              >
                <Text style={styles.actionText}>📞 Call</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: 'row',
    height: 140,
  },
  cardDark: {
    backgroundColor: '#1E1E1E',
  },
  image: {
    width: 110,
    height: '100%',
    backgroundColor: '#F1F3F5',
  },
  info: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  titleContainer: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333333',
  },
  distance: {
    fontSize: 11,
    color: '#C5A059',
    fontWeight: '600',
  },
  address: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    color: '#888888',
  },
  actionContainer: {
    flexDirection: 'row',
  },
  emergencyButton: {
    backgroundColor: '#E34234',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  callButton: {
    backgroundColor: '#0066B2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  textWhite: {
    color: '#FFFFFF',
  },
  textMuted: {
    color: '#A0A0A0',
  },
});

export default UtilityCard;
