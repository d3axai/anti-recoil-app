import { ScrollView, Text, View, TouchableOpacity, Pressable } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HomeScreen() {
  const colors = useColors();
  const [isServiceActive, setIsServiceActive] = useState(false);
  const [strength, setStrength] = useState(50);
  const [loading, setLoading] = useState(true);

  // Load saved settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Save settings whenever they change
  useEffect(() => {
    if (!loading) {
      saveSettings();
    }
  }, [strength, isServiceActive]);

  const loadSettings = async () => {
    try {
      const savedStrength = await AsyncStorage.getItem("recoilStrength");
      const savedActive = await AsyncStorage.getItem("serviceActive");
      
      if (savedStrength) setStrength(parseInt(savedStrength));
      if (savedActive) setIsServiceActive(JSON.parse(savedActive));
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem("recoilStrength", strength.toString());
      await AsyncStorage.setItem("serviceActive", JSON.stringify(isServiceActive));
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  const toggleService = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsServiceActive(!isServiceActive);
  };

  const handleStrengthChange = (newStrength: number) => {
    setStrength(newStrength);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleCalibration = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Navigation to calibration screen will be added later
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-lg text-foreground">جاري التحميل...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="items-center gap-2 pt-4">
            <Text className="text-3xl font-bold text-foreground">مساعد مكافحة الارتداد</Text>
            <Text className="text-sm text-muted text-center">
              مراقب ذكي لتعويض حركة الشاشة أثناء اللعب
            </Text>
          </View>

          {/* Service Status Card */}
          <View
            className="rounded-2xl p-6 border"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <View className="items-center gap-4">
              {/* Status Indicator */}
              <View className="items-center gap-2">
                <View
                  className="w-20 h-20 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: isServiceActive ? colors.success : colors.error,
                    opacity: 0.1,
                  }}
                >
                  <Ionicons
                    name={isServiceActive ? "checkmark-circle" : "close-circle"}
                    size={40}
                    color={isServiceActive ? colors.success : colors.error}
                  />
                </View>
                <Text className="text-lg font-semibold text-foreground">
                  {isServiceActive ? "الخدمة نشطة" : "الخدمة معطلة"}
                </Text>
                <Text className="text-xs text-muted">
                  {isServiceActive ? "جاري المراقبة والتعويض" : "اضغط للتفعيل"}
                </Text>
              </View>
            </View>
          </View>

          {/* Strength Control Section */}
          <View
            className="rounded-2xl p-6 gap-4 border"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <View className="gap-2">
              <Text className="text-base font-semibold text-foreground">قوة التعويض</Text>
              <Text className="text-2xl font-bold text-primary">{strength}%</Text>
            </View>

            {/* Slider Visualization */}
            <View className="gap-3">
              <View className="h-2 rounded-full bg-border overflow-hidden">
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${strength}%`,
                    backgroundColor: colors.primary,
                  }}
                />
              </View>

              {/* Slider Buttons */}
              <View className="flex-row gap-2 justify-between">
                {[25, 50, 75, 100].map((value) => (
                  <TouchableOpacity
                    key={value}
                    onPress={() => handleStrengthChange(value)}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRadius: 8,
                      backgroundColor:
                        strength === value ? colors.primary : colors.background,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text
                      style={{
                        color: strength === value ? "#FFFFFF" : colors.foreground,
                        fontSize: 12,
                        fontWeight: "600",
                      }}
                    >
                      {value}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Manual Slider */}
              <View className="gap-2">
                <View className="flex-row gap-2 items-center">
                  <TouchableOpacity
                    onPress={() => handleStrengthChange(Math.max(0, strength - 5))}
                    style={{
                      padding: 8,
                      borderRadius: 6,
                      backgroundColor: colors.background,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Ionicons name="remove" size={20} color={colors.foreground} />
                  </TouchableOpacity>

                  <View className="flex-1 h-1 rounded-full bg-border">
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${strength}%`,
                        backgroundColor: colors.primary,
                      }}
                    />
                  </View>

                  <TouchableOpacity
                    onPress={() => handleStrengthChange(Math.min(100, strength + 5))}
                    style={{
                      padding: 8,
                      borderRadius: 6,
                      backgroundColor: colors.background,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Ionicons name="add" size={20} color={colors.foreground} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="gap-3">
            {/* Activate Service Button */}
            <Pressable
              onPress={toggleService}
              style={({ pressed }) => [
                {
                  backgroundColor: isServiceActive ? colors.error : colors.primary,
                  borderRadius: 12,
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                  opacity: pressed ? 0.8 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
            >
              <View className="items-center gap-2">
                <Ionicons
                  name={isServiceActive ? "stop-circle" : "play-circle"}
                  size={24}
                  color="#FFFFFF"
                />
                <Text className="text-base font-bold text-white">
                  {isServiceActive ? "إيقاف الخدمة" : "تفعيل الخدمة"}
                </Text>
              </View>
            </Pressable>

            {/* Calibration Button */}
            <Pressable
              onPress={handleCalibration}
              style={({ pressed }) => [
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.primary,
                  borderWidth: 2,
                  borderRadius: 12,
                  paddingVertical: 14,
                  paddingHorizontal: 24,
                  opacity: pressed ? 0.8 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
            >
              <View className="items-center gap-2">
                <Ionicons name="settings" size={24} color={colors.primary} />
                <Text className="text-base font-bold" style={{ color: colors.primary }}>
                  معايرة منطقة الإطلاق
                </Text>
              </View>
            </Pressable>
          </View>

          {/* Info Section */}
          <View
            className="rounded-2xl p-4 gap-2 border"
            style={{
              backgroundColor: colors.background,
              borderColor: colors.border,
            }}
          >
            <Text className="text-xs font-semibold text-muted uppercase">معلومات</Text>
            <Text className="text-xs text-muted leading-relaxed">
              • الخدمة تعمل في الخلفية لمراقبة حركة الشاشة{"\n"}
              • اضبط قوة التعويض حسب احتياجاتك{"\n"}
              • تأكد من تفعيل صلاحيات الوصول في إعدادات النظام
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
