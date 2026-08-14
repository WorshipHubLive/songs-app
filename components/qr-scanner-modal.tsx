import { CameraView, useCameraPermissions } from 'expo-camera';
import { X } from 'lucide-react-native';
import { useRef } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '@/hooks/use-theme-colors';

// Native QR scanner overlay — CameraView's own barcode detector, not a
// canvas + jsQR pass like the web build needs (browsers have no
// reliable native BarcodeDetector). `expo-barcode-scanner` is the
// deprecated package people remember; scanning now lives directly in
// `expo-camera`, which is what this uses.
export function QrScannerModal({
  visible,
  onResult,
  onClose,
  hint,
}: {
  visible: boolean;
  onResult: (value: string) => void;
  onClose: () => void;
  hint: string;
}) {
  const _colors = useThemeColors();
  const { top, bottom } = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const scannedRef = useRef(false);

  if (visible) {
    scannedRef.current = false;
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black" style={{ paddingTop: top }}>
        <View className="h-14 flex-row items-center justify-between px-4">
          <Text className="font-sora-bold text-sm text-white">Escanear código QR</Text>
          <Pressable onPress={onClose} className="h-10 w-10 items-center justify-center rounded-full bg-white/10">
            <X size={18} color="white" />
          </Pressable>
        </View>

        {!permission ? null : !permission.granted ? (
          <View className="flex-1 items-center justify-center gap-4 px-8">
            <Text className="text-center font-sora text-sm text-white/80">
              WorshipHub Songs necesita acceso a la cámara para escanear el código QR.
            </Text>
            <Pressable onPress={requestPermission} className="rounded-full bg-primary px-5 py-2.5">
              <Text className="font-sora-bold text-sm text-primary-foreground">Dar acceso</Text>
            </Pressable>
          </View>
        ) : (
          <View className="flex-1">
            <CameraView
              style={{ flex: 1 }}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={({ data }) => {
                if (scannedRef.current) return;
                scannedRef.current = true;
                onResult(data.trim());
              }}
            />
            <View pointerEvents="none" className="absolute inset-0 items-center justify-center">
              <View className="h-64 w-64 rounded-2xl border-2 border-primary/80" />
            </View>
          </View>
        )}

        <View className="px-8 pt-4" style={{ paddingBottom: bottom + 24 }}>
          <Text className="text-center font-sora text-xs text-white/70">{hint}</Text>
        </View>
      </View>
    </Modal>
  );
}
