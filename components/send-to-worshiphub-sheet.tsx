import BottomSheet, { BottomSheetScrollView } from '@expo/ui/community/bottom-sheet';
import { Check, Laptop, QrCode, RefreshCw, ShieldCheck, Zap } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { QrScannerModal } from '@/components/qr-scanner-modal';
import { getSongsForExport } from '@/db/songs-repository';
import { useAppSettings } from '@/hooks/use-app-settings';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { shrinkAvatarForTransfer } from '@/lib/avatar';
import { type DiscoveredPeer, discoverWorshipHub } from '@/lib/discovery';
import { pairWithWorshipHub, sendSongsToWorshipHub } from '@/lib/worshiphub-client';

type Phase = 'searching' | 'found' | 'manual' | 'pairing' | 'sending' | 'done' | 'error';

interface Target {
  label: string;
  baseUrl: string;
}

// Native bottom sheet (@expo/ui/community/bottom-sheet) mirroring
// SendSongsModal's "connect → pair → send" flow: auto-discover
// WorshipHub over mDNS as soon as it opens (see lib/discovery.ts — same
// `_worshiphub._tcp.local.` announcement the desktop app's own discovery
// browses), falling back to a scanned/typed address, then a real
// pair-request + import-songs call (see lib/worshiphub-client.ts) — same
// protocol the web/desktop apps use. The backdrop, drag handle, rounded
// top corners and pan-down-to-close all come from the platform sheet
// (real SwiftUI on iOS, Material 3 on Android) instead of being drawn by
// hand with a Modal + Pressable overlay.
export function SendToWorshipHubSheet({
  visible,
  songIds,
  onClose,
  onSent,
}: {
  visible: boolean;
  songIds: number[];
  onClose: () => void;
  onSent?: () => void;
}) {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const { settings, updateWorshipHub } = useAppSettings();
  const [phase, setPhase] = useState<Phase>('searching');
  const [peers, setPeers] = useState<DiscoveredPeer[]>([]);
  const [target, setTarget] = useState<Target | null>(null);
  const [address, setAddress] = useState('');
  const [scannerVisible, setScannerVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [sentCount, setSentCount] = useState(0);

  const runDiscovery = () => {
    setPhase('searching');
    setPeers([]);
    discoverWorshipHub().then((found) => {
      setPeers(found);
      setPhase(found.length > 0 ? 'found' : 'manual');
    });
  };

  useEffect(() => {
    if (visible) runDiscovery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const pairAndSend = async (target: Target) => {
    setPhase('pairing');
    setErrorMessage('');
    try {
      const avatarDataUrl = await shrinkAvatarForTransfer(settings.profile.avatarUri);
      const existingToken = settings.worshiphub.baseUrl === target.baseUrl ? settings.worshiphub.token : null;
      const token = await pairWithWorshipHub(target.baseUrl, existingToken, settings.profile.name, avatarDataUrl);
      updateWorshipHub({ linked: true, name: target.label, baseUrl: target.baseUrl, token });

      setPhase('sending');
      const songs = await getSongsForExport(songIds);
      const received = await sendSongsToWorshipHub(target.baseUrl, token, songs, settings.profile.name, avatarDataUrl);
      setSentCount(received);
      setPhase('done');
      onSent?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setErrorMessage(worshipHubErrorMessage(message, t));
      setPhase('error');
    }
  };

  const selectTarget = (target: Target) => {
    setTarget(target);
    void pairAndSend(target);
  };

  const selectPeer = (peer: DiscoveredPeer) => selectTarget({ label: peer.name, baseUrl: `https://${peer.ip}:${peer.port}` });

  const submitAddress = () => {
    const raw = address.trim().replace(/\/+$/, '');
    if (!raw) return;
    const baseUrl = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    selectTarget({ label: baseUrl, baseUrl });
  };

  const handleScanResult = (value: string) => {
    setScannerVisible(false);
    const base = value.replace(/\/remote\/ws\/?$/i, '').replace(/\/+$/, '');
    const baseUrl = /^https?:\/\//i.test(base) ? base : `https://${base}`;
    selectTarget({ label: baseUrl, baseUrl });
  };

  const handleClose = () => {
    setAddress('');
    setTarget(null);
    onClose();
  };

  return (
    <>
      <BottomSheet index={visible ? 0 : -1} snapPoints={['80%']} enablePanDownToClose onClose={handleClose}>
        <View className="gap-0.5 px-5 pb-4">
          <Text className="font-sora-bold text-lg text-foreground">{t('sendToWorshipHubSheet.title')}</Text>
          <Text className="font-sora text-xs text-muted-foreground">
            {t('sendToWorshipHubSheet.subtitleCount', { count: songIds.length })}
          </Text>
        </View>

        <BottomSheetScrollView className="flex-1" contentContainerClassName="gap-4 px-5 pb-8">
          {phase === 'searching' && (
            <View className="items-center gap-3 py-10">
              <ActivityIndicator size="large" color={colors.primary} />
              <Text className="font-sora text-sm text-muted-foreground">{t('sendToWorshipHubSheet.searching')}</Text>
            </View>
          )}

          {phase === 'found' && (
            <View className="gap-3">
              <Text className="font-sora text-xs text-muted-foreground">{t('sendToWorshipHubSheet.foundLabel')}</Text>
              {peers.map((peer) => (
                <Pressable
                  key={`${peer.ip}:${peer.port}`}
                  onPress={() => selectPeer(peer)}
                  className="flex-row items-center gap-3 rounded-md border border-border px-3 py-2.5"
                >
                  <Laptop size={16} color={colors.mutedForeground} />
                  <Text className="min-w-0 flex-1 font-sora-semibold text-sm text-foreground" numberOfLines={1}>
                    {peer.name}
                  </Text>
                  <Text className="shrink-0 font-mono text-xs text-muted-foreground">{peer.ip}</Text>
                </Pressable>
              ))}
              <Pressable onPress={runDiscovery} className="flex-row items-center justify-center gap-1.5 self-center px-2 py-1.5">
                <RefreshCw size={12} color={colors.primary} />
                <Text className="font-sora-bold text-xs text-primary">{t('common.searchAgain')}</Text>
              </Pressable>
              <Pressable onPress={() => setPhase('manual')} className="self-center px-2 py-1">
                <Text className="font-sora text-xs text-muted-foreground underline">{t('common.cantFindTypeAddress')}</Text>
              </Pressable>
            </View>
          )}

          {phase === 'manual' && (
            <View className="gap-3">
              <Text className="font-sora text-xs text-muted-foreground">{t('sendToWorshipHubSheet.manualDescription')}</Text>

              <Pressable
                onPress={() => setScannerVisible(true)}
                className="flex-row items-center justify-center gap-1.5 rounded-md bg-secondary py-2.5"
              >
                <QrCode size={14} color={colors.secondaryForeground} />
                <Text className="font-sora-bold text-xs text-secondary-foreground">{t('common.scanQrCode')}</Text>
              </Pressable>

              <View className="flex-row items-center gap-2">
                <View className="h-px flex-1 bg-border" />
                <Text className="font-sora text-[10px] text-muted-foreground">{t('common.or')}</Text>
                <View className="h-px flex-1 bg-border" />
              </View>

              <View className="flex-row gap-2">
                <TextInput
                  value={address}
                  onChangeText={setAddress}
                  placeholder="192.168.1.50:8787"
                  placeholderTextColorClassName="accent-muted-foreground"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="flex-1 rounded-md border border-input bg-background px-3 py-2.5 font-sora text-sm text-foreground"
                />
                <Pressable
                  onPress={submitAddress}
                  disabled={!address.trim()}
                  className={`flex-row items-center gap-1.5 rounded-md px-4 py-2.5 ${address.trim() ? 'bg-primary' : 'bg-muted'}`}
                >
                  <Zap size={14} color={address.trim() ? colors.primaryForeground : colors.mutedForeground} />
                  <Text
                    className={`font-sora-bold text-xs ${address.trim() ? 'text-primary-foreground' : 'text-muted-foreground'}`}
                  >
                    {t('common.connect')}
                  </Text>
                </Pressable>
              </View>

              <Pressable onPress={runDiscovery} className="flex-row items-center justify-center gap-1.5 self-center px-2 py-1.5">
                <RefreshCw size={12} color={colors.primary} />
                <Text className="font-sora-bold text-xs text-primary">{t('common.searchAgain')}</Text>
              </Pressable>
            </View>
          )}

          {phase === 'pairing' && (
            <View className="items-center gap-3 py-10">
              <ActivityIndicator size="large" color={colors.primary} />
              <Text className="text-center font-sora text-sm text-muted-foreground">
                {target
                  ? t('sendToWorshipHubSheet.pairingWaitingTarget', { target: target.label })
                  : t('sendToWorshipHubSheet.pairingWaitingGeneric')}
              </Text>
            </View>
          )}

          {phase === 'sending' && (
            <View className="items-center gap-3 py-10">
              <ActivityIndicator size="large" color={colors.primary} />
              <Text className="font-sora text-sm text-muted-foreground">{t('common.sending')}</Text>
            </View>
          )}

          {phase === 'done' && (
            <View className="items-center gap-3 py-8">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-primary/15">
                <Check size={24} color={colors.primary} strokeWidth={2.5} />
              </View>
              <Text className="text-center font-sora-semibold text-sm text-foreground">
                {t('sendToWorshipHubSheet.doneCount', { count: sentCount })}
              </Text>
              <Pressable onPress={handleClose} className="mt-2 rounded-full bg-muted px-5 py-2">
                <Text className="font-sora-bold text-xs text-foreground">{t('common.close')}</Text>
              </Pressable>
            </View>
          )}

          {phase === 'error' && (
            <View className="items-center gap-3 py-8">
              <ShieldCheck size={28} color={colors.destructive} />
              <Text className="text-center font-sora text-sm text-destructive">{errorMessage}</Text>
              <Pressable
                onPress={() => (target ? void pairAndSend(target) : setPhase('manual'))}
                className="mt-2 rounded-full bg-primary px-5 py-2"
              >
                <Text className="font-sora-bold text-xs text-primary-foreground">{t('common.retry')}</Text>
              </Pressable>
            </View>
          )}
        </BottomSheetScrollView>
      </BottomSheet>

      <QrScannerModal
        visible={scannerVisible}
        onResult={handleScanResult}
        onClose={() => setScannerVisible(false)}
        hint={t('sendToWorshipHubSheet.scanHint')}
      />
    </>
  );
}

function worshipHubErrorMessage(message: string, t: (key: string, options?: Record<string, unknown>) => string): string {
  if (message === 'denied') return t('sendToWorshipHubSheet.errorDenied');
  if (message === 'busy') return t('sendToWorshipHubSheet.errorBusy');
  if (message === 'unauthorized') return t('sendToWorshipHubSheet.errorUnauthorized');
  if (message.startsWith('HTTP ')) return t('sendToWorshipHubSheet.errorHttp', { message });
  return t('sendToWorshipHubSheet.errorGeneric', { message: message || t('common.noDetail') });
}
