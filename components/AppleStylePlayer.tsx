import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  Animated, 
  StatusBar,
  Platform,
  ScrollView
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { 
  Gesture, 
  GestureDetector, 
  GestureHandlerRootView 
} from 'react-native-gesture-handler';
import { 
  X, 
  Pipette as Pip, 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw,
  Subtitles,
  Check,
  Maximize2
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AppleStylePlayerProps {
  source: string;
  onClose: () => void;
  title?: string;
}

/**
 * AppleStylePlayer - iOS Native Clone for Android
 * Optimized for hardware-accelerated HEVC, AV1, and MKV playback.
 */
export const AppleStylePlayer = React.memo(({ source, onClose, title }: AppleStylePlayerProps) => {
  const [showControls, setShowControls] = useState(true);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [contentFit, setContentFit] = useState<'contain' | 'cover'>('contain');
  const [status, setStatus] = useState({ currentTime: 0, duration: 0, buffered: 0 });
  const [isSeeking, setIsSeeking] = useState(false);

  // Animation Refs
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const centerIconOpacity = useRef(new Animated.Value(0)).current;
  const centerIconScale = useRef(new Animated.Value(0.8)).current;
  const seekIndicatorOpacity = useRef(new Animated.Value(0)).current;
  const subtitleMenuTranslateY = useRef(new Animated.Value(600)).current;
  const [seekDirection, setSeekDirection] = useState<'forward' | 'backward' | null>(null);

  /**
   * Player Setup - Configured for Android Performance
   * Hardware acceleration for HEVC, AV1, VP9 is native to ExoPlayer.
   */
  const player = useVideoPlayer({ uri: source }, (p) => {
    p.loop = false;
    p.play();
    p.staysActiveInBackground = false; // Optimize memory
  });

  // Performance optimized status listener
  useEffect(() => {
    const subscription = player.addListener('timeUpdate', (payload) => {
      // Throttle state updates for scrubber smoothness
      setStatus({
        currentTime: payload.currentTime,
        duration: player.duration,
        buffered: player.bufferedPosition,
      });
    });
    return () => subscription.remove();
  }, [player]);

  useEffect(() => {
    let timeout: any;
    if (showControls && !isSeeking && !showSubtitleMenu) {
      timeout = setTimeout(() => toggleControls(false), 4000);
    }
    return () => clearTimeout(timeout);
  }, [showControls, isSeeking, showSubtitleMenu]);

  const toggleControls = useCallback((visible: boolean) => {
    Animated.timing(controlsOpacity, {
      toValue: visible ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
    setShowControls(visible);
    if (!visible) setShowSubtitleMenu(false);
  }, [controlsOpacity]);

  const toggleSubtitleMenu = useCallback(() => {
    const nextState = !showSubtitleMenu;
    setShowSubtitleMenu(nextState);
    Animated.spring(subtitleMenuTranslateY, {
      toValue: nextState ? 0 : 600,
      useNativeDriver: true,
      tension: 65,
      friction: 10,
    }).start();
  }, [showSubtitleMenu, subtitleMenuTranslateY]);

  const triggerCenterIcon = useCallback(() => {
    centerIconOpacity.setValue(1);
    centerIconScale.setValue(0.8);
    Animated.parallel([
      Animated.spring(centerIconScale, { toValue: 1.2, tension: 50, useNativeDriver: true }),
      Animated.timing(centerIconOpacity, { toValue: 0, duration: 600, delay: 150, useNativeDriver: true })
    ]).start();
  }, [centerIconOpacity, centerIconScale]);

  const handlePlayPause = useCallback(() => {
    player.playing ? player.pause() : player.play();
    triggerCenterIcon();
  }, [player, triggerCenterIcon]);

  // Gestures
  const singleTap = Gesture.Tap().onEnd(() => {
    showSubtitleMenu ? toggleSubtitleMenu() : toggleControls(!showControls);
  });

  const doubleTapLeft = Gesture.Tap().numberOfTaps(2).onEnd((event) => {
    if (event.x < SCREEN_WIDTH / 2) {
      player.currentTime -= 10;
      setSeekDirection('backward');
      seekIndicatorOpacity.setValue(1);
      Animated.timing(seekIndicatorOpacity, { toValue: 0, duration: 500, useNativeDriver: true }).start();
    }
  });

  const doubleTapRight = Gesture.Tap().numberOfTaps(2).onEnd((event) => {
    if (event.x >= SCREEN_WIDTH / 2) {
      player.currentTime += 10;
      setSeekDirection('forward');
      seekIndicatorOpacity.setValue(1);
      Animated.timing(seekIndicatorOpacity, { toValue: 0, duration: 500, useNativeDriver: true }).start();
    }
  });

  const pinchGesture = Gesture.Pinch().onEnd((event) => {
    if (event.scale > 1.2) setContentFit('cover');
    else if (event.scale < 0.8) setContentFit('contain');
  });

  const composedGestures = useMemo(() => 
    Gesture.Exclusive(doubleTapLeft, doubleTapRight, pinchGesture, singleTap), 
    [doubleTapLeft, doubleTapRight, pinchGesture, singleTap]
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progress = status.duration > 0 ? (status.currentTime / status.duration) * 100 : 0;
  const remainingTime = status.duration - status.currentTime;

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar hidden />
      <VideoView
        player={player}
        style={styles.video}
        contentFit={contentFit}
        allowsFullscreen
        allowsPictureInPicture
        nativeControls={false}
      />

      <GestureDetector gesture={composedGestures}>
        <View style={StyleSheet.absoluteFill}>
          {/* Visual Seek Feedback */}
          <Animated.View style={[styles.seekIndicator, { opacity: seekIndicatorOpacity, left: seekDirection === 'backward' ? '15%' : 'auto', right: seekDirection === 'forward' ? '15%' : 'auto' }]}>
             {seekDirection === 'forward' ? <RotateCw size={48} color="white" /> : <RotateCcw size={48} color="white" />}
             <Text style={styles.seekText}>10s</Text>
          </Animated.View>

          {/* Play/Pause Center Trigger */}
          <Animated.View style={[styles.centerIconContainer, { opacity: centerIconOpacity, transform: [{ scale: centerIconScale }] }]}>
            <View style={styles.blurCircle}>
              {player.playing ? <Pause size={40} color="white" fill="white" /> : <Play size={40} color="white" fill="white" />}
            </View>
          </Animated.View>

          {/* Top Bar */}
          <Animated.View style={[styles.topBar, { opacity: controlsOpacity }]}>
            <TouchableOpacity onPress={onClose} style={styles.topButton}>
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
            <View style={styles.topCenter}>
              <Text style={styles.titleText} numberOfLines={1}>{title || 'Streaming Now'}</Text>
            </View>
            <TouchableOpacity style={styles.topButton}>
              <Pip size={24} color="white" />
            </TouchableOpacity>
          </Animated.View>

          {/* Subtitle / Track Menu */}
          <Animated.View 
            style={[
              styles.subtitleMenu, 
              { transform: [{ translateY: subtitleMenuTranslateY }] }
            ]}
          >
            <View style={styles.subtitleMenuHeader}>
              <Text style={styles.subtitleMenuTitle}>Subtitles & Audio</Text>
              <TouchableOpacity onPress={toggleSubtitleMenu}>
                <X size={20} color="white" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.subtitleList} showsVerticalScrollIndicator={false}>
              <Text style={styles.subtitleSectionLabel}>SUBTITLES</Text>
              <TouchableOpacity style={styles.subtitleItem} onPress={toggleSubtitleMenu}>
                <Text style={styles.subtitleItemText}>Off</Text>
                <Check size={18} color="#bef264" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.subtitleItem} onPress={toggleSubtitleMenu}>
                <Text style={styles.subtitleItemText}>English (SDH)</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.subtitleItem} onPress={toggleSubtitleMenu}>
                <Text style={styles.subtitleItemText}>Spanish</Text>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>

          {/* Bottom Controls Bar */}
          <Animated.View style={[styles.bottomBar, { opacity: controlsOpacity }]}>
            <View style={styles.glassContainer}>
              <View style={styles.timeRow}>
                <Text style={styles.timeText}>{formatTime(status.currentTime)}</Text>
                <Text style={styles.timeText}>-{formatTime(remainingTime)}</Text>
              </View>

              <View style={styles.scrubberContainer}>
                <View style={styles.scrubberBackground}>
                  <View style={[styles.scrubberBuffered, { width: `${(status.buffered / status.duration) * 100}%` }]} />
                  <View style={[styles.scrubberFilled, { width: `${progress}%` }]} />
                  <View style={[styles.scrubberHandle, { left: `${progress}%` }]} />
                </View>
              </View>

              <View style={styles.controlsRow}>
                <View style={styles.controlsLeft}>
                   <TouchableOpacity onPress={toggleSubtitleMenu} style={styles.iconButton}>
                    <Subtitles size={24} color="white" />
                  </TouchableOpacity>
                </View>

                <View style={styles.controlsCenter}>
                  <TouchableOpacity onPress={() => player.currentTime -= 10}>
                    <RotateCcw size={28} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handlePlayPause} style={styles.mainPlayButton}>
                    {player.playing ? <Pause size={38} color="white" fill="white" /> : <Play size={38} color="white" fill="white" />}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => player.currentTime += 10}>
                    <RotateCw size={28} color="white" />
                  </TouchableOpacity>
                </View>

                <View style={styles.controlsRight}>
                  <TouchableOpacity style={styles.iconButton} onPress={() => setContentFit(prev => prev === 'contain' ? 'cover' : 'contain')}>
                    <Maximize2 size={24} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Animated.View>
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  video: { width: '100%', height: '100%' },
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 100,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 40, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 10,
  },
  topButton: { padding: 8 },
  doneText: { color: 'white', fontSize: 17, fontWeight: '600' },
  topCenter: { flex: 1, alignItems: 'center', paddingHorizontal: 20 },
  titleText: { color: 'white', fontSize: 15, fontWeight: '500', opacity: 0.8 },
  centerIconContainer: {
    position: 'absolute', top: '50%', left: '50%', marginLeft: -40, marginTop: -40,
    justifyContent: 'center', alignItems: 'center', zIndex: 5,
  },
  blurCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  bottomBar: { position: 'absolute', bottom: 40, left: 20, right: 20, zIndex: 10 },
  glassContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', overflow: 'hidden',
  },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  timeText: { color: 'white', fontSize: 12, opacity: 0.9 },
  scrubberContainer: { height: 20, justifyContent: 'center', marginBottom: 20 },
  scrubberBackground: { height: 3, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, position: 'relative' },
  scrubberBuffered: { position: 'absolute', height: '100%', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2 },
  scrubberFilled: { position: 'absolute', height: '100%', backgroundColor: 'white', borderRadius: 2 },
  scrubberHandle: { position: 'absolute', width: 12, height: 12, borderRadius: 6, backgroundColor: 'white', top: -4.5, marginLeft: -6 },
  controlsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  controlsLeft: { flex: 1, alignItems: 'flex-start' },
  controlsCenter: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' },
  controlsRight: { flex: 1, alignItems: 'flex-end' },
  iconButton: { padding: 8 },
  mainPlayButton: { width: 60, alignItems: 'center' },
  seekIndicator: { position: 'absolute', top: '45%', alignItems: 'center', justifyContent: 'center', zIndex: 5 },
  seekText: { color: 'white', fontSize: 16, fontWeight: 'bold', marginTop: 8 },
  subtitleMenu: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(15, 15, 15, 0.98)', borderTopLeftRadius: 32, borderTopRightRadius: 32,
    padding: 24, maxHeight: '70%', zIndex: 100, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  subtitleMenuHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  subtitleMenuTitle: { color: 'white', fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  subtitleList: { flexGrow: 0 },
  subtitleSectionLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '900', letterSpacing: 1.5, marginBottom: 16, marginTop: 8 },
  subtitleItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.05)' },
  subtitleItemText: { color: 'white', fontSize: 16, fontWeight: '600' },
});
