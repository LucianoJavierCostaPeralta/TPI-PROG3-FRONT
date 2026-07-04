import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_IMAGE_KEY = '@profile_image_uri';

export async function saveProfileImageUri(uri: string | null) {
  if (!uri) {
    await AsyncStorage.removeItem(PROFILE_IMAGE_KEY);
    return null;
  }

  await AsyncStorage.setItem(PROFILE_IMAGE_KEY, uri);
  return uri;
}

export async function getStoredProfileImageUri() {
  return (await AsyncStorage.getItem(PROFILE_IMAGE_KEY)) ?? null;
}
