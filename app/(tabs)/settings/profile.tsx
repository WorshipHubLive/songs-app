import * as ImagePicker from 'expo-image-picker';
import { Stack } from 'expo-router';
import { Camera, User } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { AmbientGlow } from '@/components/ambient-glow';
import { useAppSettings } from '@/hooks/use-app-settings';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { initialsFor } from '@/lib/profile';

// Mirrors Settings.tsx's Profile subTab: big avatar (tap to change),
// name field, saved to the local settings blob — shown to WorshipHub
// when pairing, once that's wired up (see settings/worshiphub.tsx).
export default function ProfileScreen() {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const { settings, updateProfile } = useAppSettings();
  const [name, setName] = useState(settings.profile.name);

  const pickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t('profileScreen.permissionNeededTitle'), t('profileScreen.permissionNeededMessage'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      updateProfile({ avatarUri: result.assets[0].uri });
    }
  };

  const handleSave = () => {
    updateProfile({ name: name.trim() });
    Alert.alert(t('profileScreen.savedTitle'), t('profileScreen.savedMessage'));
  };

  return (
    <View className="flex-1 bg-background">
      <AmbientGlow />
      <Stack.Title asChild>
        <Text className="font-sora-bold text-xl text-foreground">{t('profileScreen.title')}</Text>
      </Stack.Title>

      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerClassName="items-center gap-6 p-6">
        <Pressable onPress={pickAvatar} className="items-center gap-3">
          <View className="h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-primary/20 bg-muted">
            {settings.profile.avatarUri ? (
              <Image source={{ uri: settings.profile.avatarUri }} className="h-full w-full" resizeMode="cover" />
            ) : name.trim() ? (
              <Text className="font-sora-bold text-3xl text-muted-foreground">{initialsFor(name)}</Text>
            ) : (
              <User size={40} color={colors.mutedForeground} />
            )}
          </View>
          <View className="flex-row items-center gap-1.5">
            <Camera size={13} color={colors.primary} />
            <Text className="font-sora-semibold text-xs text-primary">{t('profileScreen.changePhoto')}</Text>
          </View>
        </Pressable>

        <View className="w-full gap-1.5">
          <Text className="font-sora-semibold text-xs uppercase tracking-wider text-muted-foreground">
            {t('profileScreen.nameLabel')}
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t('profileScreen.namePlaceholder')}
            placeholderTextColorClassName="accent-muted-foreground"
            className="rounded-md border border-border bg-card px-3.5 py-3 font-sora text-sm text-foreground"
          />
        </View>

        <Pressable onPress={handleSave} className="w-full items-center rounded-md bg-primary py-3">
          <Text className="font-sora-bold text-sm text-primary-foreground">{t('common.save')}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
