import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { Camera } from 'react-native-camera-kit';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface KTPScannerScreenProps {
  isDarkMode: boolean;
}

const KTPScannerScreen: React.FC<KTPScannerScreenProps> = ({ isDarkMode }) => {
  const cameraRef = useRef<any>(null);
  
  // Track detection state for each marker
  const [detected, setDetected] = useState({
    province: false,
    city: false,
    nik: false,
    face: false,
  });

  const isReady = detected.province && detected.city && detected.nik && detected.face;

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const image = await cameraRef.current.capture();
        console.log('Image captured:', image.uri);
      } catch (error) {
        console.error('Capture error:', error);
      }
    }
  };

  const getMarkerColor = (markerKey: keyof typeof detected) => {
    if (isReady) return '#4CAF50'; // Solid Green when all detected
    if (detected[markerKey]) return '#00E5FF'; // Solid Cyan when individual detected
    return '#FFFFFF'; // White for searching
  };

  const getBorderStyle = (markerKey: keyof typeof detected) => {
    return detected[markerKey] || isReady ? 'solid' : 'dashed';
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Fullscreen Camera Feed (Background) */}
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        cameraOptions={{
          flashMode: 'auto',
          focusMode: 'on',
          zoomMode: 'on',
        }}
      />
      
      {/* Rotated Landscape Fullscreen UI Overlay */}
      <View style={styles.landscapeWrapper}>
        {/* Marker/Guide Area (Left side in landscape) */}
        <View style={styles.cameraArea}>
          {/* Overlay Guide */}
          <View style={styles.overlay} pointerEvents="none">
            <View style={styles.unfocusedArea} />
            
            <View style={[styles.cardFrame, { borderColor: isReady ? '#4CAF50' : '#FFFFFF' }]}>
              {/* Main Corners */}
              <View style={[styles.corner, styles.topLeft, { borderColor: isReady ? '#4CAF50' : '#FFFFFF' }]} />
              <View style={[styles.corner, styles.topRight, { borderColor: isReady ? '#4CAF50' : '#FFFFFF' }]} />
              <View style={[styles.corner, styles.bottomLeft, { borderColor: isReady ? '#4CAF50' : '#FFFFFF' }]} />
              <View style={[styles.corner, styles.bottomRight, { borderColor: isReady ? '#4CAF50' : '#FFFFFF' }]} />

              {/* 1. Header Stack (Province & City) */}
              <View style={styles.headerStack}>
                <View style={[
                  styles.headerMarker, 
                  { borderColor: getMarkerColor('province'), borderStyle: getBorderStyle('province') }
                ]} />
                <View style={[
                  styles.headerMarker, 
                  { borderColor: getMarkerColor('city'), borderStyle: getBorderStyle('city') }
                ]} />
              </View>

              {/* 2. NIK Data Anchor (Primary Focus) */}
              <View style={[
                styles.nikMarker, 
                { borderColor: getMarkerColor('nik'), borderStyle: getBorderStyle('nik') }
              ]} />

              {/* 3. Face Icon Guide */}
              <View style={[
                styles.faceMarker, 
                { borderColor: getMarkerColor('face'), borderStyle: getBorderStyle('face') }
              ]}>
                <Text style={[styles.faceIcon, { color: getMarkerColor('face') }]}>👤</Text>
              </View>
            </View>
            <View style={styles.unfocusedSide} />
          </View>

          <View style={styles.unfocusedArea}>
            <Text style={styles.instructionText}>
              {isReady 
                ? 'Perfect! Capturing...' 
                : 'Align ID within the markers'}
            </Text>
            <TouchableOpacity 
              style={{ marginTop: 10, padding: 5, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 5 }}
              onPress={() => {
                if (!detected.province) setDetected({...detected, province: true});
                else if (!detected.city) setDetected({...detected, city: true});
                else if (!detected.nik) setDetected({...detected, nik: true});
                else if (!detected.face) setDetected({...detected, face: true});
                else setDetected({province: false, city: false, nik: false, face: false});
              }}
            >
              <Text style={{color: '#FFF', fontSize: 10}}>Simulate Detection</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sidebar Controls (Right side in landscape) */}
        <View style={styles.sidebar}>
          <TouchableOpacity style={styles.flashButton}>
            <Text style={styles.controlIcon}>⚡</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.shutterButton}
            onPress={takePicture}
          >
            <View style={styles.shutterInner} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.galleryButton}>
            <Text style={styles.controlIcon}>🖼️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  landscapeWrapper: {
    width: SCREEN_HEIGHT,
    height: SCREEN_WIDTH,
    position: 'absolute',
    top: (SCREEN_HEIGHT - SCREEN_WIDTH) / 2,
    left: (SCREEN_WIDTH - SCREEN_HEIGHT) / 2,
    transform: [{ rotate: '90deg' }],
    flexDirection: 'row', // Horizontal layout in the rotated view
  },
  cameraArea: {
    flex: 0.82, 
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'transparent', // No background to show full camera feed
  },
  sidebar: {
    flex: 0.18, 
    backgroundColor: '#000000',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 40,
    borderLeftWidth: 2,
    borderLeftColor: '#C5A059', // Accent color for separation
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unfocusedArea: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 360,
  },
  unfocusedSide: {
    flex: 1,
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  cardFrame: {
    width: 600, 
    height: 380,
    position: 'relative',
    borderWidth: 1,
    borderRadius: 25,
  },
  headerStack: {
    position: 'absolute',
    top: 30,
    left: '20%',
    right: '20%',
    height: 60,
    justifyContent: 'space-between',
  },
  headerMarker: {
    height: 15,
    borderWidth: 1,
    borderRadius: 4,
  },
  nikMarker: {
    position: 'absolute',
    top: 70,
    left: 60,
    width: 360,
    height: 30,
    borderWidth: 2.5,
    borderRadius: 6,
  },
  faceMarker: {
    position: 'absolute',
    top: 90,
    right: 40,
    width: 120,
    height: 150,
    borderWidth: 2,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  faceIcon: {
    fontSize: 40,
    opacity: 0.3,
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 6,
    borderLeftWidth: 6,
    borderTopLeftRadius: 25,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 6,
    borderRightWidth: 6,
    borderTopRightRadius: 25,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 6,
    borderLeftWidth: 6,
    borderBottomLeftRadius: 25,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 6,
    borderRightWidth: 6,
    borderBottomRightRadius: 25,
  },
  guideContainer: {
    padding: 20,
    paddingTop: 30,
  },
  guideLine: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guideLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  guideDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#C5A059',
    marginLeft: 8,
    opacity: 0.8,
  },
  instructionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginTop: 15,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  shutterButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
  },
  flashButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlIcon: {
    fontSize: 20,
  },
});

export default KTPScannerScreen;
