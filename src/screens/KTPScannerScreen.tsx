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
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { Camera } from 'react-native-camera-kit';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import ImageEditor from '@react-native-community/image-editor';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// KTP Layout Constants
const KTP_FRAME_WIDTH = 600;
const KTP_FRAME_HEIGHT = 380;
const KTP_MARKER_INSET = {
  top: 15,
  left: 80,
  right: 15,
  bottom: 30,
};

interface KTPScannerScreenProps {
  isDarkMode: boolean;
}

export default function KTPScannerScreen({ isDarkMode }: KTPScannerScreenProps) {
  const cameraRef = useRef<any>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  
  const [detected, setDetected] = useState({
    card: false,
    face: false,
  });

  const isReady = detected.card && detected.face;

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const permissions = [PermissionsAndroid.PERMISSIONS.CAMERA];
        if (Platform.Version >= 33) {
          permissions.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
        } else {
          permissions.push(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
        }
        const granted = await PermissionsAndroid.requestMultiple(permissions);
        return Object.values(granted).every(status => status === PermissionsAndroid.RESULTS.GRANTED);
      } catch (err) {
        return false;
      }
    }
    return true;
  };

  const takePicture = async () => {
    if (isCapturing) return;
    
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      Alert.alert('Permission Error', 'Camera and Gallery access is required.');
      return;
    }

    setIsCapturing(true);

    if (cameraRef.current) {
      try {
        const image = await cameraRef.current.capture();
        


        // --- Precision Crop Logic (Screen-to-Sensor Mapping) ---
        const imgWidth = image.width || SCREEN_WIDTH;
        const imgHeight = image.height || SCREEN_HEIGHT;

        // UI Dimensions for calculations
        const markerWidthUI = KTP_FRAME_WIDTH - KTP_MARKER_INSET.left - KTP_MARKER_INSET.right;
        const markerHeightUI = KTP_FRAME_HEIGHT - KTP_MARKER_INSET.top - KTP_MARKER_INSET.bottom;

        // The camera is absoluteFill (covers the whole SCREEN_HEIGHT x SCREEN_WIDTH space)
        // Even though cameraArea is only 82% wide, the camera background is 100% wide.
        const frameOffsetX = (0.82 * SCREEN_HEIGHT - KTP_FRAME_WIDTH) / 2;
        const frameOffsetY = (SCREEN_WIDTH - KTP_FRAME_HEIGHT) / 2;

        const totalOffsetXUI = frameOffsetX + KTP_MARKER_INSET.left;
        const totalOffsetYUI = frameOffsetY + KTP_MARKER_INSET.top;

        // Normalize relative to full screen (not just cameraArea)
        const nx = totalOffsetXUI / SCREEN_HEIGHT;
        const ny = totalOffsetYUI / SCREEN_WIDTH;
        const nw = markerWidthUI / SCREEN_HEIGHT;
        const nh = markerHeightUI / SCREEN_WIDTH;

        const isPortraitSensor = imgHeight > imgWidth;
        
        let cropData;
        if (!isPortraitSensor) {
          // Landscape Sensor
          cropData = {
            offset: { x: nx * imgWidth, y: ny * imgHeight },
            size: { width: nw * imgWidth, height: nh * imgHeight },
            displaySize: { width: markerWidthUI, height: markerHeightUI },
            resizeMode: 'contain' as const,
          };
        } else {
          // Portrait Sensor (Most Androids)
          // 90deg CW: UI X -> Image Y, UI Y -> Image (imgWidth - X)
          cropData = {
            offset: { 
              x: (1 - (ny + nh)) * imgWidth, 
              y: nx * imgHeight 
            },
            size: { 
              width: nh * imgWidth, 
              height: nw * imgHeight 
            },
            displaySize: { width: markerHeightUI, height: markerWidthUI },
            resizeMode: 'contain' as const,
          };
        }

        // Apply integer rounding to prevent ImageEditor failures
        const finalCropData = {
          offset: { 
            x: Math.max(0, Math.round(cropData.offset.x)), 
            y: Math.max(0, Math.round(cropData.offset.y)) 
          },
          size: { 
            width: Math.min(imgWidth, Math.round(cropData.size.width)), 
            height: Math.min(imgHeight, Math.round(cropData.size.height)) 
          },
          displaySize: cropData.displaySize,
          resizeMode: cropData.resizeMode,
        };

        console.log('Final Precision Crop Data:', finalCropData);

        let finalUri = image.uri;
        try {
          const result = await ImageEditor.cropImage(image.uri, finalCropData);
          finalUri = typeof result === 'object' ? result.uri : result;
        } catch (e: any) {
          console.warn('Crop failed:', e.message);
        }

        setPreviewUri(finalUri);
        
      } catch (error: any) {
        Alert.alert('Capture Error', error.message || 'Failed to capture image');
      } finally {
        setIsCapturing(false);
      }
    }
  };

  const saveToGallery = async () => {
    if (previewUri) {
      try {
        await CameraRoll.saveAsset(previewUri, { type: 'photo' });
        Alert.alert('Success', 'KTP Image saved to gallery');
        setPreviewUri(null);
      } catch (error) {
        Alert.alert('Error', 'Failed to save to gallery');
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
              {/* Main Card Marker */}
              <View style={[
                styles.cardMarker, 
                { borderColor: getMarkerColor('card'), borderStyle: getBorderStyle('card') }
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
                if (!detected.card) setDetected({...detected, card: true});
                else if (!detected.face) setDetected({...detected, face: true});
                else setDetected({card: false, face: false});
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

      {/* Review Overlay */}
      {previewUri && (
        <View style={styles.reviewOverlay}>
          <View style={styles.reviewContent}>
            <Text style={styles.reviewTitle}>REVIEW KTP</Text>
            <View style={styles.previewContainer}>
              <Image 
                source={{ uri: previewUri }} 
                style={styles.previewImage} 
                resizeMode="contain" 
              />
            </View>
            <View style={styles.reviewFooter}>
              <TouchableOpacity 
                style={[styles.reviewButton, styles.retakeButton]}
                onPress={() => setPreviewUri(null)}
              >
                <Text style={styles.reviewButtonText}>RETAKE</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.reviewButton, styles.saveButton]}
                onPress={saveToGallery}
              >
                <Text style={styles.reviewButtonText}>SAVE TO GALLERY</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

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
    width: KTP_FRAME_WIDTH, 
    height: KTP_FRAME_HEIGHT,
    position: 'relative',
    borderWidth: 1,
    borderRadius: 25,
  },
  cardMarker: {
    position: 'absolute',
    top: KTP_MARKER_INSET.top,
    left: KTP_MARKER_INSET.left,
    right: KTP_MARKER_INSET.right,
    bottom: KTP_MARKER_INSET.bottom,
    borderWidth: 5,
    borderRadius: 20
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
  reviewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.95)',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewContent: {
    width: '90%',
    height: '85%',
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  reviewTitle: {
    color: '#C5A059',
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
    paddingVertical: 15,
    letterSpacing: 2,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  reviewFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
    backgroundColor: '#111',
  },
  reviewButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retakeButton: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  saveButton: {
    backgroundColor: '#C5A059',
  },
  reviewButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
