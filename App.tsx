import React from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Animated,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import CitiesScreen from './src/screens/CitiesScreen';
import MapScreen from './src/screens/MapScreen';
import KTPScannerScreen from './src/screens/KTPScannerScreen';

const { width } = Dimensions.get('window');

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = React.useState('Home');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [cities, setCities] = React.useState<any[]>([]);
  const [destinations, setDestinations] = React.useState<any[]>([]);
  const [heroImages, setHeroImages] = React.useState<any[]>([]);
  const [heroIndex, setHeroIndex] = React.useState(0);
  const fadeAnim = React.useRef(new Animated.Value(1)).current;
  const [isImageLoading, setIsImageLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const fetchCities = async () => {
    try {
      const response = await fetch('https://apinofudev.bengkelfajarjaya.com/mysumsel/api/v1/cities?page=1&limit=5');
      const json = await response.json();
      if (json.status === 'success') {
        setCities(json.data.data);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const fetchHeroes = async () => {
    try {
      const response = await fetch('https://apinofudev.bengkelfajarjaya.com/mysumsel/api/v1/heroes');
      const json = await response.json();
      if (json.status === 'success') {
        setHeroImages(json.data.map((item: any) => ({ uri: item.image_url })));
      }
    } catch (error) {
      console.error('Error fetching heroes:', error);
    }
  };

  const fetchDestinations = async () => {
    try {
      const response = await fetch('https://apinofudev.bengkelfajarjaya.com/mysumsel/api/v1/destinations/favorites');
      const json = await response.json();
      if (json.status === 'success') {
        setDestinations(json.data);
      }
    } catch (error) {
      console.error('Error fetching destinations:', error);
    }
  };

  React.useEffect(() => {
    fetchCities();
    fetchHeroes();
    fetchDestinations();
  }, []);

  React.useEffect(() => {
    const timer = setInterval(() => {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0.7,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setHeroIndex((prev) => (prev + 1) % heroImages.length);
        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start();
      });
    }, 6000);
    return () => clearInterval(timer);
  }, [fadeAnim, heroImages.length]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchCities(),
        fetchHeroes(),
        fetchDestinations(),
      ]);
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    if (heroImages.length > 0) {
      setIsImageLoading(true);
    }
  }, [heroIndex]);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#121212' : '#F8F9FA',
    flex: 1,
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Home':
        return (
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={backgroundStyle}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#C5A059"
                colors={["#C5A059"]}
              />
            }>
            
            {/* Hero Section Carousel */}
            <View style={styles.heroContainer}>
                {heroImages.length > 0 ? (
                  <>
                    <Animated.Image
                      source={heroImages[heroIndex]}
                      onLoadStart={() => setIsImageLoading(true)}
                      onLoadEnd={() => setIsImageLoading(false)}
                      style={[styles.heroImage, { opacity: fadeAnim }]}
                    />
                    {isImageLoading && (
                      <View style={styles.heroLoader}>
                        <ActivityIndicator size="large" color="#C5A059" />
                      </View>
                    )}
                  </>
                ) : (
                  <View style={styles.heroLoader}>
                    <ActivityIndicator size="large" color="#C5A059" />
                  </View>
                )}
              <View style={styles.heroOverlay}>
                <Text style={styles.heroTitle}>Discover the Magic of</Text>
                <Text style={styles.heroSubtitle}>SOUTH SUMATRA</Text>
                <TouchableOpacity 
                  style={styles.exploreButton}
                  onPress={() => setActiveTab('Cities')}>
                  <Text style={styles.exploreButtonText}>Start Exploring</Text>
                </TouchableOpacity>
                
                {/* Carousel Indicators */}
                <View style={styles.indicatorContainer}>
                  {heroImages.map((_, i) => (
                    <View 
                      key={i} 
                      style={[
                        styles.indicator, 
                        heroIndex === i && styles.indicatorActive
                      ]} 
                    />
                  ))}
                </View>
              </View>
            </View>

              {/* Browse by City Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, isDarkMode && styles.textWhite]}>Browse by City</Text>
                  <TouchableOpacity onPress={() => setActiveTab('Cities')}>
                    <Text style={[styles.seeAll, isDarkMode && { color: '#66B2FF' }]}>See All</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                  {cities.map((city) => (
                    <TouchableOpacity key={city.id} style={styles.cityCard}>
                      <Image source={{ uri: city.image_url }} style={styles.cityAvatar} />
                      <Text style={[styles.cityName, isDarkMode && styles.textWhite]} numberOfLines={1}>{city.name.replace('Kota ', '').replace('Kabupaten ', '')}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Categories */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, isDarkMode && styles.textWhite]}>Categories</Text>
                <View style={styles.categoriesGrid}>
                  {[
                    { name: 'Culture', icon: '🏛️', color: '#C5A059' },
                    { name: 'Nature', icon: '🌴', color: '#0066B2' },
                    { name: 'Culinary', icon: '🍲', color: '#E34234' },
                    { name: 'Events', icon: '🎭', color: '#2D2D2D' },
                  ].map((cat, i) => (
                    <TouchableOpacity key={i} style={styles.categoryCard}>
                      <View style={[styles.categoryIcon, { backgroundColor: cat.color + '15' }]}>
                        <Text style={{ fontSize: 24 }}>{cat.icon}</Text>
                      </View>
                      <Text style={[styles.categoryName, isDarkMode && styles.textWhite]}>{cat.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

            {/* Featured Destinations */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, isDarkMode && styles.textWhite]}>Featured Destinations</Text>
                <TouchableOpacity onPress={() => setActiveTab('Cities')}>
                  <Text style={[styles.seeAll, isDarkMode && { color: '#66B2FF' }]}>See All</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                {destinations.map((item) => (
                  <TouchableOpacity key={item.id} style={[styles.featuredCard, isDarkMode && styles.bgDarkCard]}>
                    <Image source={{ uri: item.image_url }} style={styles.featuredImage} />
                    <View style={styles.cardInfo}>
                      <Text style={[styles.cardTitle, isDarkMode && styles.textWhite]} numberOfLines={1}>{item.name}</Text>
                      <Text style={[styles.cardLocation, isDarkMode && styles.textMuted]}>{item.location}</Text>
                      <View style={styles.categoryContainer}>
                        {item.categories.slice(0, 2).map((cat: any) => (
                          <View key={cat.id} style={[styles.categoryBadge, isDarkMode && styles.bgDarkBadge]}>
                            <Text style={[styles.categoryText, isDarkMode && styles.textWhite]}>{cat.name}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View style={{ height: 100 }} />
          </ScrollView>
        );
      case 'Cities':
        return <CitiesScreen isDarkMode={isDarkMode} />;
      case 'Map':
        return <MapScreen isDarkMode={isDarkMode} />;
      case 'Scan':
        return <KTPScannerScreen isDarkMode={isDarkMode} />;
      case 'Events':
        return (
          <View style={[styles.centerScreen, backgroundStyle]}>
            <Text style={[styles.screenTitle, isDarkMode && styles.textWhite]}>Upcoming Events</Text>
            <Text style={styles.placeholderText}>Don't miss out on local festivals</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <SafeAreaView style={backgroundStyle} edges={['top', 'left', 'right']}>
        {/* Top Header */}
        {activeTab !== 'Scan' && (
          <View style={[styles.header, isDarkMode && styles.headerDark]}>
            <View style={styles.headerLeft}>
              <Image
                source={require('./src/assets/logo_icon.png')}
                style={styles.logoIcon}
                resizeMode="contain"
              />
            </View>
            <View style={[styles.searchBar, isDarkMode && styles.searchBarDark]}>
              <Text style={styles.searchIconEmoji}>🔍</Text>
              <TextInput
                style={[styles.searchInput, isDarkMode && styles.textWhite]}
                placeholder="Search destinations..."
                placeholderTextColor="#888888"
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
              />
            </View>
            <TouchableOpacity style={styles.headerRight}>
              <View style={styles.profileCircle}>
                <Text style={styles.profileEmoji}>👤</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {renderContent()}

        {/* Bottom Navigation */}
        {activeTab !== 'Scan' && (
          <View style={[
            styles.bottomNav, 
            isDarkMode && styles.bottomNavDark,
            { 
              height: 60 + (insets.bottom > 0 ? insets.bottom : 15), 
              paddingBottom: insets.bottom > 0 ? insets.bottom : 5 
            }
          ]}>
            {[
              { name: 'Home', icon: '🏠' },
              { name: 'Cities', icon: '🏙️' },
              { name: 'Scan', icon: '📷' },
              { name: 'Map', icon: '📍' },
              { name: 'Events', icon: '📅' },
            ].map((tab, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.navItem,
                  tab.name === 'Scan' && styles.navItemScan
                ]}
                onPress={() => setActiveTab(tab.name)}>
                <View style={[
                  tab.name === 'Scan' && styles.scanIconWrapper,
                  activeTab === tab.name && tab.name === 'Scan' && styles.scanIconWrapperActive
                ]}>
                  <Text style={[
                    styles.navIcon,
                    activeTab === tab.name && styles.navIconActive,
                    tab.name === 'Scan' && styles.scanIcon
                  ]}>
                    {tab.icon}
                  </Text>
                </View>
                {tab.name !== 'Scan' && (
                  <Text style={[
                    styles.navLabel,
                    isDarkMode && styles.textWhite,
                    activeTab === tab.name && styles.navLabelActive
                  ]}>
                    {tab.name}
                  </Text>
                )}
                {activeTab === tab.name && tab.name !== 'Scan' && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 65,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 10,
  },
  headerDark: {
    backgroundColor: '#1E1E1E',
    borderBottomColor: '#333333',
  },
  headerLeft: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoIcon: {
    width: 40,
    height: 40,
  },
  searchBar: {
    flex: 1,
    height: 45,
    backgroundColor: '#F1F3F5',
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginHorizontal: 12,
  },
  searchBarDark: {
    backgroundColor: '#2D2D2D',
  },
  searchIconEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  searchPlaceholder: {
    color: '#888888',
    fontSize: 14,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    padding: 0,
    color: '#333333',
    textAlignVertical: 'center', // Fix for Android vertical alignment
  },
  headerRight: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F3F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  profileEmoji: {
    fontSize: 20,
  },
  heroContainer: {
    height: 250,
    position: 'relative',
    margin: 16,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  heroLoader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 4,
  },
  heroSubtitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
  },
  indicatorContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 20,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginHorizontal: 4,
  },
  indicatorActive: {
    backgroundColor: '#FFFFFF',
    width: 20,
  },
  exploreButton: {
    backgroundColor: '#C5A059',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
  },
  seeAll: {
    color: '#0066B2',
    fontWeight: '600',
  },
  categoriesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  categoryCard: {
    alignItems: 'center',
    width: (width - 64) / 4,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '700', // Increased font weight for consistency
    color: '#666666',
  },
  cityCard: {
    alignItems: 'center',
    marginRight: 20,
    width: 85,
  },
  cityAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  cityName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
  },
  horizontalScroll: {
    marginHorizontal: -16,
    paddingLeft: 16,
  },
  featuredCard: {
    width: 280,
    height: 200,
    marginRight: 16,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  featuredImage: {
    width: '100%',
    height: 140,
  },
  cardInfo: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
  },
  categoryContainer: {
    flexDirection: 'row',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  categoryBadge: {
    backgroundColor: '#F1F3F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 10,
    color: '#666666',
    fontWeight: '600',
  },
  cardLocation: {
    fontSize: 12,
    color: '#888888',
    marginTop: 2,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  bottomNavDark: {
    backgroundColor: '#1E1E1E',
    borderTopColor: '#333333',
  },
  navItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
  },
  navIcon: {
    fontSize: 22,
    opacity: 0.5,
  },
  navIconActive: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#888888',
    marginTop: 4,
  },
  navLabelActive: {
    color: '#C5A059',
    fontWeight: '700',
  },
  activeIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C5A059',
    marginTop: 4,
  },
  navItemScan: {
    marginTop: -30,
  },
  scanIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#C5A059',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#C5A059',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  scanIconWrapperActive: {
    backgroundColor: '#0066B2',
    shadowColor: '#0066B2',
  },
  scanIcon: {
    fontSize: 28,
    opacity: 1,
  },
  centerScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#333333',
    marginBottom: 10,
  },
  placeholderText: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
  },
  mapPlaceholder: {
    width: '100%',
    height: 300,
    backgroundColor: '#E9ECEF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  textWhite: {
    color: '#FFFFFF',
  },
  textMuted: {
    color: '#A0A0A0',
  },
  bgDarkCard: {
    backgroundColor: '#1E1E1E',
    shadowColor: '#000',
    shadowOpacity: 0.4,
  },
  bgDarkBadge: {
    backgroundColor: '#333333',
  },
});

export default App;

