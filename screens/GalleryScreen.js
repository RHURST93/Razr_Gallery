import React, { useState, useEffect } from 'react';
import { View, FlatList, Image, TouchableOpacity, StyleSheet, Text, Alert } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { MaterialIcons } from '@expo/vector-icons'; // Import icon library
import { useNavigation } from '@react-navigation/native';

const albumName = 'PhotoGallery'; // The album name where photos will be saved

const GalleryScreen = () => {
  const [photos, setPhotos] = useState([]);
  const [filteredPhotos, setFilteredPhotos] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSavedOnce, setHasSavedOnce] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    if (!hasSavedOnce) {
      saveAllPhotosToAlbum();
    } else {
      loadPhotos(); // Ensure photos are loaded initially and updated after saving
    }
  }, [hasSavedOnce]);

  const saveAllPhotosToAlbum = async () => {
    setIsSaving(true);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access media library is required!');
        setIsSaving(false);
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 2000));

      const { assets, totalCount } = await MediaLibrary.getAssetsAsync({ mediaType: ['photo'] });

      if (totalCount === 0) {
        alert('No photos found to save.');
        setIsSaving(false);
        return;
      }

      if (assets.length !== totalCount) {
        console.warn(`Requested ${totalCount} assets, but only got ${assets.length}.`);
        alert(`Could not get all the requested assets. Only ${assets.length} out of ${totalCount} assets were fetched.`);
      }

      let album = await MediaLibrary.getAlbumAsync(albumName);
      if (!album) {
        album = await MediaLibrary.createAlbumAsync(albumName, assets[0], false);
      }

      await MediaLibrary.addAssetsToAlbumAsync(assets, album, false);
      alert('All photos have been saved to the album.');
      setHasSavedOnce(true);
    } catch (error) {
      console.error('Failed to save photos:', error);
      alert('Failed to save photos.');
    } finally {
      setIsSaving(false);
    }
  };

  const loadPhotos = async () => {
    try {
      const album = await MediaLibrary.getAlbumAsync(albumName);
      if (album) {
        const { assets } = await MediaLibrary.getAssetsAsync({
          album,
          sortBy: ['creationTime'],
          mediaType: ['photo'],
        });
        setPhotos(assets);
        setFilteredPhotos(assets);
      } else {
        console.warn(`Album ${albumName} not found.`);
        setPhotos([]);
        setFilteredPhotos([]);
      }
    } catch (error) {
      console.error('Failed to load photos:', error);
    }
  };

  const deletePhoto = async (id) => {
    try {
      await MediaLibrary.deleteAssetsAsync([id]);
      console.log('Photo deleted successfully.');
      alert('Photo deleted successfully.');
      loadPhotos(); // Refresh the gallery after deletion
    } catch (error) {
      console.error('Failed to delete photo:', error);
      alert('Failed to delete photo.');
    }
  };

  const handleLongPress = (id) => {
    Alert.alert(
      "Delete Photo",
      "Are you sure you want to delete this photo?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: () => deletePhoto(id) }
      ]
    );
  };


  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={saveAllPhotosToAlbum} style={styles.syncButton}>
          <MaterialIcons name="sync" size={24} color="white" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, saveAllPhotosToAlbum]);

  return (
    <View style={styles.container}>
      {isSaving ? (
        <Text>Saving photos...</Text>
      ) : (
        <FlatList
          data={filteredPhotos}
          keyExtractor={(item) => item.id}
          numColumns={3}
          renderItem={({ item }) => (
            <TouchableOpacity
              onLongPress={() => handleLongPress(item.id)}
              style={styles.photoContainer}
            >
              <Image source={{ uri: item.uri }} style={styles.photo} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text>No photos available.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 5, backgroundColor: '#36454F' },
  photoContainer: { margin: 5, alignItems: 'center', justifyContent: 'center' },
  photo: { width: 100, height: 100 },
  syncButton: { marginRight: 10},
});

export default GalleryScreen;
