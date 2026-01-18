import React, { useState, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions, 
  SafeAreaView, 
  StatusBar, 
  Platform,
  FlatList,
  ImageBackground
} from 'react-native';
import { 
  Home as HomeIcon, 
  Download, 
  Play, 
  Info, 
  ChevronLeft, 
  Search as SearchIcon,
  PlayCircle,
  Scan,
  Cloud,
  X,
  Share2,
  HardDrive,
  Maximize2
} from 'lucide-react-native';

import { MediaItem, ViewType, CloudProvider } from './types';
import { MEDIA_LIBRARY } from './constants';
import { AppleStylePlayer } from './components/AppleStylePlayer';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// --- Reusable Native Components ---

const Toast = React.memo(({ message, type, onClose }: { message: string; type: 'error' | 'success' | 'info'; onClose: () => void }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgStyle = type === 'error' ? styles.toastError : type === 'success' ? styles.toastSuccess : styles.toastInfo;

  return (
    <View style={[styles.toastContainer, bgStyle]}>
      <Text style={styles.toastText}>{message.toUpperCase()}</Text>
      <TouchableOpacity onPress={onClose} style={styles.toastClose}>
        <X size={14} color="white" opacity={0.5} />
      </TouchableOpacity>
    </View>
  );
});

const MediaCard = React.memo(({ item, onClick }: { item: MediaItem; onClick: () => void }) => (
  <TouchableOpacity onPress={onClick} activeOpacity={0.8} style={styles.cardContainer}>
    <View style={styles.cardImageContainer}>
      <Image source={{ uri: item.poster }} style={styles.cardImage} resizeMode="cover" />
      <View style={styles.cardFormatBadge}>
        <Text style={styles.cardFormatText}>{item.format.split(' • ')[0]}</Text>
      </View>
    </View>
    {item.progress !== undefined && item.progress > 0 && (
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarFill, { width: `${item.progress}%` }]} />
      </View>
    )}
    <View style={styles.cardInfo}>
      <Text numberOfLines={1} style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardSubtitle}>{item.year} • {item.category}</Text>
    </View>
  </TouchableOpacity>
));

const HeroSection = React.memo(({ item, onInfo, onPlay }: { item: MediaItem; onInfo: () => void; onPlay: () => void }) => (
  <View style={styles.heroContainer}>
    <Image source={{ uri: item.backdrop }} style={styles.heroImage} resizeMode="cover" />
    <View style={styles.heroGradientOverlay} />
    <View style={styles.heroContent}>
      <View style={styles.heroBadgeRow}>
        <PlayCircle size={16} color="#bef264" />
        <Text style={styles.heroBadgeText}>CURATED MASTERPIECE</Text>
      </View>
      <Text style={styles.heroTitle}>{item.title}</Text>
      <Text numberOfLines={2} style={styles.heroDescription}>{item.description}</Text>
      <View style={styles.heroButtonRow}>
        <TouchableOpacity onPress={onPlay} activeOpacity={0.7} style={styles.heroPlayButton}>
          <Play size={20} color="black" fill="black" />
          <Text style={styles.heroPlayButtonText}>WATCH NOW</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onInfo} activeOpacity={0.7} style={styles.heroInfoButton}>
          <Info size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  </View>
));

// --- Main App Entry ---

export default function App() {
  const [view, setView] = useState<ViewType>('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'error' | 'success' | 'info'} | null>(null);

  const handleMediaClick = useCallback((item: MediaItem) => {
    setSelectedMedia(item);
    setView('details');
  }, []);

  const featuredItem = useMemo(() => MEDIA_LIBRARY[1] || MEDIA_LIBRARY[0], []);
  const movies = useMemo(() => MEDIA_LIBRARY.filter(m => !m.isTVShow), []);
  const tvShows = useMemo(() => MEDIA_LIBRARY.filter(m => m.isTVShow), []);

  if (!isAuthenticated) {
    return (
      <View style={styles.authContainer}>
        <StatusBar barStyle="light-content" />
        <ImageBackground 
          source={{ uri: 'https://picsum.photos/seed/bg/1200/800' }} 
          style={styles.authBg} 
          blurRadius={5}
        >
          <View style={styles.authOverlay}>
            <View style={styles.authLogoContainer}>
              <Text style={styles.authLogo}>LUMINA</Text>
              <Text style={styles.authLogoSub}>NEURAL MEDIA HUB</Text>
            </View>
            <View style={styles.authButtonContainer}>
              <TouchableOpacity onPress={() => setIsAuthenticated(true)} style={[styles.authButton, { backgroundColor: '#4285F4' }]}>
                <Text style={styles.authButtonText}>CONTINUE WITH GOOGLE</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsAuthenticated(true)} style={[styles.authButton, { backgroundColor: '#00A4EF' }]}>
                <Text style={styles.authButtonText}>MICROSOFT SIGN IN</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </View>
    );
  }

  const renderHome = () => (
    <ScrollView style={styles.scrollView} bounces={false} showsVerticalScrollIndicator={false}>
      <HeroSection 
        item={featuredItem} 
        onInfo={() => handleMediaClick(featuredItem)} 
        onPlay={() => { setSelectedMedia(featuredItem); setIsPlayerOpen(true); }} 
      />
      <View style={styles.sectionsContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Movies</Text>
          <FlatList 
            horizontal 
            data={movies} 
            renderItem={({ item }) => <MediaCard item={item} onClick={() => handleMediaClick(item)} />}
            keyExtractor={item => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TV Shows</Text>
          <FlatList 
            horizontal 
            data={tvShows} 
            renderItem={({ item }) => <MediaCard item={item} onClick={() => handleMediaClick(item)} />}
            keyExtractor={item => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
          />
        </View>
      </View>
    </ScrollView>
  );

  const renderDetails = () => {
    if (!selectedMedia) return null;
    return (
      <ScrollView style={styles.detailsContainer} bounces={false}>
        <Image source={{ uri: selectedMedia.backdrop }} style={styles.detailsBackdrop} resizeMode="cover" />
        <View style={styles.detailsGradientOverlay} />
        
        <TouchableOpacity 
          style={styles.detailsBackBtn} 
          onPress={() => setView('home')}
        >
          <ChevronLeft size={32} color="white" />
        </TouchableOpacity>

        <View style={styles.detailsContentContainer}>
          <View style={styles.detailsHeaderRow}>
            <View style={styles.detailsPosterContainer}>
              <Image source={{ uri: selectedMedia.poster }} style={styles.detailsPoster} />
            </View>
            <View style={styles.detailsMainInfo}>
              <View style={styles.detailsFormatRow}>
                <Text style={styles.detailsFormatBadge}>{selectedMedia.format.split(' • ')[0]}</Text>
                <Text style={styles.detailsCategoryBadge}>{selectedMedia.category.toUpperCase()}</Text>
              </View>
              <Text style={styles.detailsTitle}>{selectedMedia.title}</Text>
              <Text style={styles.detailsMetaText}>
                {selectedMedia.year}  •  {selectedMedia.rating}  •  {selectedMedia.duration}
              </Text>
            </View>
          </View>

          <View style={styles.detailsActionsRow}>
            <TouchableOpacity onPress={() => setIsPlayerOpen(true)} style={styles.detailsPlayBtn}>
              <Play size={20} color="black" fill="black" />
              <Text style={styles.detailsPlayBtnText}>WATCH NOW</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.detailsIconBtn}>
              <Download size={22} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.detailsIconBtn}>
              <Share2 size={22} color="white" />
            </TouchableOpacity>
          </View>

          {selectedMedia.progress !== undefined && (
            <View style={styles.detailsProgressWrapper}>
              <View style={styles.detailsProgressHeader}>
                <Text style={styles.detailsProgressLabel}>CONTINUE WATCHING</Text>
                <Text style={styles.detailsProgressPercent}>{selectedMedia.progress}%</Text>
              </View>
              <View style={styles.detailsProgressBar}>
                <View style={[styles.detailsProgressBarFill, { width: `${selectedMedia.progress}%` }]} />
              </View>
            </View>
          )}

          <View style={styles.detailsDivider} />

          <View style={styles.detailsSection}>
            <Text style={styles.detailsSectionTitle}>SYNOPSIS</Text>
            <Text style={styles.detailsDescription}>{selectedMedia.description}</Text>
          </View>

          <View style={styles.detailsSection}>
            <Text style={styles.detailsSectionTitle}>CAST & CREW</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.castScroll}>
              {(selectedMedia.cast || []).map((member, idx) => (
                <View key={idx} style={styles.castMember}>
                  <Image 
                    source={{ uri: member.image || `https://ui-avatars.com/api/?name=${member.name}&background=random&color=fff` }} 
                    style={styles.castImage} 
                  />
                  <Text style={styles.castName}>{member.name}</Text>
                  <Text style={styles.castRole}>{member.role}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={styles.detailsSection}>
            <Text style={styles.detailsSectionTitle}>FILE SPECIFICATIONS</Text>
            <View style={styles.fileInfoCard}>
              <View style={styles.fileInfoRow}>
                <Text style={styles.fileInfoKey}>CONTAINER</Text>
                <Text style={styles.fileInfoValue}>{selectedMedia.format.split(' • ')[0]}</Text>
              </View>
              <View style={styles.fileInfoRow}>
                <Text style={styles.fileInfoKey}>RESOLUTION</Text>
                <Text style={styles.fileInfoValue}>4K ULTRA HD</Text>
              </View>
              <View style={styles.fileInfoRow}>
                <Text style={styles.fileInfoKey}>ENCODING</Text>
                <Text style={styles.fileInfoValue}>HEVC / H.265</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {view === 'home' && renderHome()}
      {view === 'details' && renderDetails()}
      
      {/* Bottom Navigation */}
      <View style={styles.navContainer}>
        <TouchableOpacity onPress={() => setView('home')} style={styles.navItem}>
          <HomeIcon size={24} color={view === 'home' ? 'white' : '#555'} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <SearchIcon size={24} color="#555" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Download size={24} color="#555" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Cloud size={24} color="#555" />
        </TouchableOpacity>
      </View>

      {isPlayerOpen && (
        <View style={styles.playerWrapper}>
          <AppleStylePlayer 
            source="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" 
            title={selectedMedia?.title}
            onClose={() => setIsPlayerOpen(false)}
          />
        </View>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scrollView: { flex: 1 },
  // Auth Screen
  authContainer: { flex: 1, backgroundColor: 'black' },
  authBg: { flex: 1, width: '100%', height: '100%' },
  authOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 40 },
  authLogoContainer: { alignItems: 'center', marginBottom: 80 },
  authLogo: { color: 'white', fontSize: 64, fontWeight: '900', letterSpacing: -3, fontStyle: 'italic' },
  authLogoSub: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 'bold', letterSpacing: 8, marginTop: 10 },
  authButtonContainer: { width: '100%', gap: 15 },
  authButton: { height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  authButtonText: { color: 'white', fontSize: 13, fontWeight: '900', letterSpacing: 1 },
  // Hero
  heroContainer: { height: SCREEN_HEIGHT * 0.75, width: '100%', position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroGradientOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%',
    backgroundColor: 'rgba(0,0,0,1)', opacity: 0.8, // simplified gradient for RN
  },
  heroContent: { position: 'absolute', bottom: 120, left: 24, right: 24 },
  heroBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  heroBadgeText: { color: 'white', fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  heroTitle: { color: 'white', fontSize: 48, fontWeight: '900', letterSpacing: -2, marginBottom: 16 },
  heroDescription: { color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 20, marginBottom: 24, maxWidth: '85%' },
  heroButtonRow: { flexDirection: 'row', gap: 12 },
  heroPlayButton: { 
    flex: 1, height: 56, backgroundColor: 'white', borderRadius: 12, 
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 
  },
  heroPlayButtonText: { color: 'black', fontSize: 13, fontWeight: '900' },
  heroInfoButton: { 
    width: 56, height: 56, backgroundColor: 'rgba(255,255,255,0.15)', 
    borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
  },
  // Sections
  sectionsContainer: { marginTop: -60, paddingBottom: 100 },
  section: { marginBottom: 32 },
  sectionTitle: { color: 'white', fontSize: 20, fontWeight: '900', marginLeft: 24, marginBottom: 16, letterSpacing: -0.5 },
  flatListContent: { paddingLeft: 24, paddingRight: 8 },
  // Media Card
  cardContainer: { width: 140, marginRight: 16 },
  cardImageContainer: { height: 210, borderRadius: 12, overflow: 'hidden', backgroundColor: '#111', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  cardImage: { width: '100%', height: '100%' },
  cardFormatBadge: { position: 'absolute', top: 8, right: 8, paddingHorizontal: 6, paddingVertical: 4, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.6)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.2)' },
  cardFormatText: { color: 'white', fontSize: 8, fontWeight: '900' },
  progressBarContainer: { height: 3, backgroundColor: 'rgba(255,255,255,0.1)', marginTop: 8, borderRadius: 2, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#bef264' },
  cardInfo: { marginTop: 10 },
  cardTitle: { color: 'white', fontSize: 14, fontWeight: '700' },
  cardSubtitle: { color: '#666', fontSize: 11, fontWeight: '500', marginTop: 4 },
  // Details Screen
  detailsContainer: { flex: 1, backgroundColor: 'black' },
  detailsBackdrop: { width: '100%', height: SCREEN_HEIGHT * 0.55, opacity: 0.6 },
  detailsGradientOverlay: { position: 'absolute', top: 0, left: 0, right: 0, height: SCREEN_HEIGHT * 0.6, backgroundColor: 'rgba(0,0,0,0.4)' },
  detailsBackBtn: { position: 'absolute', top: 50, left: 24, width: 48, height: 48, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  detailsContentContainer: { marginTop: -150, paddingHorizontal: 24, paddingBottom: 120 },
  detailsHeaderRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 20 },
  detailsPosterContainer: { width: 130, height: 195, borderRadius: 12, overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' },
  detailsPoster: { width: '100%', height: '100%' },
  detailsMainInfo: { flex: 1, paddingBottom: 8 },
  detailsFormatRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  detailsFormatBadge: { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, color: 'white', fontSize: 9, fontWeight: '900' },
  detailsCategoryBadge: { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: 'rgba(190,242,100,0.1)', borderRadius: 4, color: '#bef264', fontSize: 9, fontWeight: '900' },
  detailsTitle: { color: 'white', fontSize: 32, fontWeight: '900', letterSpacing: -1, marginBottom: 8 },
  detailsMetaText: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  detailsActionsRow: { flexDirection: 'row', gap: 12, marginTop: 32 },
  detailsPlayBtn: { flex: 1, height: 56, backgroundColor: 'white', borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  detailsPlayBtnText: { color: 'black', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  detailsIconBtn: { width: 56, height: 56, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  detailsProgressWrapper: { marginTop: 32 },
  detailsProgressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  detailsProgressLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  detailsProgressPercent: { color: 'white', fontSize: 9, fontWeight: '900' },
  detailsProgressBar: { height: 4, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' },
  detailsProgressBarFill: { height: '100%', backgroundColor: '#bef264' },
  detailsDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginVertical: 40 },
  detailsSection: { marginBottom: 40 },
  detailsSectionTitle: { color: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: '900', letterSpacing: 3, marginBottom: 16 },
  detailsDescription: { color: 'rgba(255,255,255,0.7)', fontSize: 16, lineHeight: 24, fontWeight: '400' },
  castScroll: { marginTop: 8 },
  castMember: { width: 100, marginRight: 20, alignItems: 'center' },
  castImage: { width: 80, height: 80, borderRadius: 40, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  castName: { color: 'white', fontSize: 13, fontWeight: '700', textAlign: 'center' },
  castRole: { color: '#666', fontSize: 10, fontWeight: '500', textAlign: 'center', marginTop: 2 },
  fileInfoCard: { padding: 20, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  fileInfoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  fileInfoKey: { color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  fileInfoValue: { color: 'white', fontSize: 11, fontWeight: '800' },
  // Nav
  navContainer: { 
    position: 'absolute', bottom: 30, left: 24, right: 24, height: 64, 
    backgroundColor: 'rgba(20,20,20,0.85)', borderRadius: 32, 
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', overflow: 'hidden'
  },
  navItem: { padding: 12 },
  // Player
  playerWrapper: { position: 'absolute', inset: 0, zIndex: 1000, backgroundColor: 'black' },
  // Toast
  toastContainer: { 
    position: 'absolute', top: 60, left: 24, right: 24, height: 50, 
    borderRadius: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, zIndex: 2000 
  },
  toastError: { backgroundColor: 'rgba(239, 68, 68, 0.9)' },
  toastSuccess: { backgroundColor: 'rgba(163, 230, 53, 0.9)' },
  toastInfo: { backgroundColor: 'rgba(59, 130, 246, 0.9)' },
  toastText: { color: 'white', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  toastClose: { padding: 4 }
});
