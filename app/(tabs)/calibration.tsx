import { ScrollView, Text, View, TouchableOpacity, Pressable, Dimensions } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useAntiRecoil } from "@/lib/anti-recoil-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function CalibrationScreen() {
  const colors = useColors();
  const { calibrationZone, setCalibrationZone } = useAntiRecoil();
  const [calibrationMode, setCalibrationMode] = useState<"manual" | "guided" | null>(null);
  const [markedZone, setMarkedZone] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(calibrationZone);

  const handleStartManualCalibration = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCalibrationMode("manual");
    setMarkedZone(null);
  };

  const handleScreenPress = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Create a zone around the touch point (approximately 60x80 pixels)
    const zone = {
      x: locationX - 30,
      y: locationY - 40,
      width: 60,
      height: 80,
    };

    setMarkedZone(zone);
  };

  const handleSaveCalibration = async () => {
    if (markedZone) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await setCalibrationZone(markedZone);
      setCalibrationMode(null);
    }
  };

  const handleResetCalibration = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMarkedZone(null);
  };

  const handleCancelCalibration = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCalibrationMode(null);
    setMarkedZone(null);
  };

  if (calibrationMode === "manual") {
    return (
      <ScreenContainer className="p-4">
        <View className="flex-1 gap-4">
          {/* Instructions */}
          <View className="gap-2">
            <Text className="text-2xl font-bold text-foreground">معايرة يدوية</Text>
            <Text className="text-sm text-muted">
              اضغط على منطقة زر الإطلاق في الشاشة أدناه
            </Text>
          </View>

          {/* Screen Preview */}
          <Pressable
            onPress={handleScreenPress}
            className="flex-1 rounded-2xl border-2 overflow-hidden bg-background"
            style={{
              borderColor: colors.primary,
            }}
          >
            <View className="flex-1 items-center justify-center">
              {markedZone ? (
                <>
                  <View
                    className="absolute border-2 rounded-lg"
                    style={{
                      left: markedZone.x,
                      top: markedZone.y,
                      width: markedZone.width,
                      height: markedZone.height,
                      borderColor: colors.success,
                      backgroundColor: colors.success,
                      opacity: 0.3,
                    }}
                  />
                  <Text className="text-center text-foreground font-semibold">
                    تم تحديد المنطقة
                  </Text>
                </>
              ) : (
                <Text className="text-center text-muted">اضغط على زر الإطلاق</Text>
              )}
            </View>
          </Pressable>

          {/* Action Buttons */}
          <View className="gap-2">
            {markedZone && (
              <Pressable
                onPress={handleSaveCalibration}
                style={({ pressed }) => [
                  {
                    backgroundColor: colors.success,
                    borderRadius: 12,
                    paddingVertical: 14,
                    opacity: pressed ? 0.8 : 1,
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  },
                ]}
              >
                <Text className="text-center font-bold text-white">حفظ المعايرة</Text>
              </Pressable>
            )}

            {markedZone && (
              <Pressable
                onPress={handleResetCalibration}
                style={({ pressed }) => [
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.warning,
                    borderWidth: 2,
                    borderRadius: 12,
                    paddingVertical: 12,
                    opacity: pressed ? 0.8 : 1,
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  },
                ]}
              >
                <Text className="text-center font-bold" style={{ color: colors.warning }}>
                  إعادة تحديد
                </Text>
              </Pressable>
            )}

            <Pressable
              onPress={handleCancelCalibration}
              style={({ pressed }) => [
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.error,
                  borderWidth: 2,
                  borderRadius: 12,
                  paddingVertical: 12,
                  opacity: pressed ? 0.8 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
            >
              <Text className="text-center font-bold" style={{ color: colors.error }}>
                إلغاء
              </Text>
            </Pressable>
          </View>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">معايرة المنطقة</Text>
            <Text className="text-sm text-muted">
              حدد موقع زر الإطلاق في اللعبة لتحسين دقة التعويض
            </Text>
          </View>

          {/* Current Calibration Info */}
          {calibrationZone && (
            <View
              className="rounded-2xl p-4 gap-2 border"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.success,
              }}
            >
              <View className="flex-row items-center gap-2">
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                <Text className="text-sm font-semibold text-foreground">معايرة محفوظة</Text>
              </View>
              <Text className="text-xs text-muted">
                الموقع: X: {Math.round(calibrationZone.x)}, Y: {Math.round(calibrationZone.y)}
              </Text>
              <Text className="text-xs text-muted">
                الحجم: {Math.round(calibrationZone.width)} × {Math.round(calibrationZone.height)}
              </Text>
            </View>
          )}

          {/* Calibration Methods */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">اختر طريقة المعايرة</Text>

            {/* Manual Calibration */}
            <Pressable
              onPress={handleStartManualCalibration}
              style={({ pressed }) => [
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.primary,
                  borderWidth: 2,
                  borderRadius: 12,
                  paddingVertical: 16,
                  paddingHorizontal: 16,
                  opacity: pressed ? 0.8 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
            >
              <View className="gap-2">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="hand-left" size={24} color={colors.primary} />
                  <Text className="text-base font-bold text-foreground">معايرة يدوية</Text>
                </View>
                <Text className="text-xs text-muted">
                  اضغط على منطقة زر الإطلاق في الشاشة مباشرة
                </Text>
              </View>
            </Pressable>

            {/* Guided Calibration (Coming Soon) */}
            <Pressable
              disabled
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 2,
                borderRadius: 12,
                paddingVertical: 16,
                paddingHorizontal: 16,
                opacity: 0.5,
              }}
            >
              <View className="gap-2">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="compass" size={24} color={colors.muted} />
                    <Text className="text-base font-bold text-muted">معايرة موجهة</Text>
                  </View>
                  <Text className="text-xs font-semibold text-warning">قريباً</Text>
                </View>
                <Text className="text-xs text-muted">
                  اتبع التعليمات خطوة بخطوة لمعايرة دقيقة
                </Text>
              </View>
            </Pressable>
          </View>

          {/* Tips Section */}
          <View
            className="rounded-2xl p-4 gap-2 border"
            style={{
              backgroundColor: colors.background,
              borderColor: colors.border,
            }}
          >
            <Text className="text-xs font-semibold text-muted uppercase">نصائح</Text>
            <Text className="text-xs text-muted leading-relaxed">
              • حدد منطقة زر الإطلاق بدقة{"\n"}
              • تأكد من أن المنطقة تغطي الزر بالكامل{"\n"}
              • يمكنك تعديل المعايرة في أي وقت{"\n"}
              • استخدم المعايرة نفسها لجميع الألعاب
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
