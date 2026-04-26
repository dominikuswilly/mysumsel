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
} from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [activeTab, setActiveTab] = React.useState('Home');
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // Carousel Logic
  const [heroIndex, setHeroIndex] = React.useState(0);
  const fadeAnim = React.useRef(new Animated.Value(1)).current;
  
  const heroImages = [
    require('./src/assets/hero5.png'), // Ampera Night
    require('./src/assets/hero1.png'), // Birds
    require('./src/assets/hero2.png'), // Quran
    require('./src/assets/hero3.png'), // Cave
    require('./src/assets/hero4.png'), // Mount Dempo
  ];

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
            showsVerticalScrollIndicator={false}>
            
            {/* Hero Section Carousel */}
            <View style={styles.heroContainer}>
              <Animated.Image
                source={heroImages[heroIndex]}
                style={[styles.heroImage, { opacity: fadeAnim }]}
              />
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
                    <Text style={styles.seeAll}>See All</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                  {[
                    { name: 'Palembang', img: require('./src/assets/city1.png') },
                    { name: 'Pagar Alam', img: require('./src/assets/city2.png') },
                    { name: 'Lubuklinggau', img: require('./src/assets/city3.png') },
                    { name: 'Lahat', img: require('./src/assets/city4.png') },
                  ].map((city, i) => (
                    <TouchableOpacity key={i} style={styles.cityCard}>
                      <Image source={city.img} style={styles.cityAvatar} />
                      <Text style={[styles.cityName, isDarkMode && styles.textWhite]}>{city.name}</Text>
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
                  <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                {[
                  { title: 'Ampera Bridge', location: 'Palembang', img: require('./src/assets/feat1.png') },
                  { title: 'Mount Dempo', location: 'Pagar Alam', img: require('./src/assets/feat2.png') },
                ].map((item, i) => (
                  <TouchableOpacity key={i} style={styles.featuredCard}>
                    <Image source={item.img} style={styles.featuredImage} />
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardTitle}>{item.title}</Text>
                      <Text style={styles.cardLocation}>{item.location}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View style={{ height: 100 }} />
          </ScrollView>
        );
      case 'Cities':
        return (
          <View style={[styles.centerScreen, backgroundStyle]}>
            <Text style={[styles.screenTitle, isDarkMode && styles.textWhite]}>Cities & Regions</Text>
            <Text style={styles.placeholderText}>Explore South Sumatra by destination</Text>
          </View>
        );
      case 'Map':
        return (
          <View style={[styles.centerScreen, backgroundStyle]}>
            <Text style={[styles.screenTitle, isDarkMode && styles.textWhite]}>Interactive Map</Text>
            <View style={styles.mapPlaceholder}>
              <Text style={styles.placeholderText}>Map View Integration Coming Soon</Text>
            </View>
          </View>
        );
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
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <SafeAreaView style={backgroundStyle}>
        {/* Premium Header */}
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

        {renderContent()}

        {/* Bottom Navigation */}
        <View style={[styles.bottomNav, isDarkMode && styles.bottomNavDark]}>
          {[
            { name: 'Home', icon: '🏠' },
            { name: 'Cities', icon: '🏙️' },
            { name: 'Map', icon: '📍' },
            { name: 'Events', icon: '📅' },
          ].map((tab, i) => (
            <TouchableOpacity
              key={i}
              style={styles.navItem}
              onPress={() => setActiveTab(tab.name)}>
              <Text style={[
                styles.navIcon,
                activeTab === tab.name && styles.navIconActive
              ]}>
                {tab.icon}
              </Text>
              <Text style={[
                styles.navLabel,
                isDarkMode && styles.textWhite,
                activeTab === tab.name && styles.navLabelActive
              ]}>
                {tab.name}
              </Text>
              {activeTab === tab.name && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
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
    height: 300,
    position: 'relative',
    margin: 16,
    borderRadius: 20,
    overflow: 'hidden',
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
  cardLocation: {
    fontSize: 12,
    color: '#888888',
    marginTop: 2,
  },
  bottomNav: {
    flexDirection: 'row',
    height: 75,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingBottom: 15,
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
});

export default App;

