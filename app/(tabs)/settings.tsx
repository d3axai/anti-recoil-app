import { ScrollView, Text, View, TouchableOpacity, Pressable, Switch } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SettingsScreen() {
  const colors = useColors();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [gestureDelay, setGestureDelay] = useState(20);
  const [appVersion] = useState("1.0.0");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem("appSettings");
      if (saved) {
        const settings = JSON.parse(saved);
        setNotificationsEnabled(settings.notificationsEnabled ?? true);
        setHapticFeedback(settings.hapticFeedback ?? true);
        setGestureDelay(settings.gestureDelay ?? 20);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const saveSettings = async (updates: any) => {
    try {
      const current = await AsyncStorage.getItem("appSettings");
      const settings = current ? JSON.parse(current) : {};
      const updated = { ...settings, ...updates };
      await AsyncStorage.setItem("appSettings", JSON.stringify(updated));
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  const handleNotificationsToggle = (value: boolean) => {
    setNotificationsEnabled(value);
    saveSettings({ notificationsEnabled: value });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleHapticToggle = (value: boolean) => {
    setHapticFeedback(value);
    saveSettings({ hapticFeedback: value });
    if (value) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleGestureDelayChange = (delta: number) => {
    const newDelay = Math.max(10, Math.min(100, gestureDelay + delta));
    setGestureDelay(newDelay);
    saveSettings({ gestureDelay: newDelay });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleResetSettings = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    try {
      await AsyncStorage.removeItem("appSettings");
      await AsyncStorage.removeItem("recoilStrength");
      await AsyncStorage.removeItem("calibrationZone");
      await AsyncStorage.removeItem("gestureCount");

      setNotificationsEnabled(true);
      setHapticFeedback(true);
      setGestureDelay(20);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error resetting settings:", error);
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="gap-2 pt-2">
            <Text className="text-3xl font-bold text-foreground">الإعدادات</Text>
            <Text className="text-sm text-muted">تخصيص تطبيق مساعد مكافحة الارتداد</Text>
          </View>

          {/* Notifications Section */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground uppercase">التنبيهات</Text>

            <View
              className="rounded-2xl p-4 flex-row items-center justify-between border"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
            >
              <View className="flex-row items-center gap-3">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: colors.primary, opacity: 0.1 }}
                >
                  <Ionicons name="notifications" size={20} color={colors.primary} />
                </View>
                <View>
                  <Text className="text-sm font-semibold text-foreground">التنبيهات</Text>
                  <Text className="text-xs text-muted">تنبيهات حالة الخدمة</Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationsToggle}
                trackColor={{ false: colors.border, true: colors.success }}
                thumbColor={notificationsEnabled ? colors.primary : colors.muted}
              />
            </View>
          </View>

          {/* Feedback Section */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground uppercase">التغذية الراجعة</Text>

            <View
              className="rounded-2xl p-4 flex-row items-center justify-between border"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
            >
              <View className="flex-row items-center gap-3">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: colors.warning, opacity: 0.1 }}
                >
                  <Ionicons name="pulse" size={20} color={colors.warning} />
                </View>
                <View>
                  <Text className="text-sm font-semibold text-foreground">الاهتزاز</Text>
                  <Text className="text-xs text-muted">تغذية راجعة عند الضغط</Text>
                </View>
              </View>
              <Switch
                value={hapticFeedback}
                onValueChange={handleHapticToggle}
                trackColor={{ false: colors.border, true: colors.success }}
                thumbColor={hapticFeedback ? colors.primary : colors.muted}
              />
            </View>
          </View>

          {/* Performance Section */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground uppercase">الأداء</Text>

            <View
              className="rounded-2xl p-4 gap-4 border"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
            >
              <View className="gap-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm font-semibold text-foreground">تأخير الإيماءة</Text>
                  <Text className="text-sm font-bold text-primary">{gestureDelay}ms</Text>
                </View>
                <Text className="text-xs text-muted">الوقت بين كل حركة تعويضية</Text>
              </View>

              <View className="flex-row gap-2 items-center justify-between">
                <TouchableOpacity
                  onPress={() => handleGestureDelayChange(-5)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 8,
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
                      width: `${((gestureDelay - 10) / 90) * 100}%`,
                      backgroundColor: colors.primary,
                    }}
                  />
                </View>

                <TouchableOpacity
                  onPress={() => handleGestureDelayChange(5)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 8,
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

          {/* About Section */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground uppercase">حول التطبيق</Text>

            <View
              className="rounded-2xl p-4 gap-3 border"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-muted">إصدار التطبيق</Text>
                <Text className="text-sm font-semibold text-foreground">{appVersion}</Text>
              </View>

              <View className="h-px bg-border" />

              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-muted">النظام الأساسي</Text>
                <Text className="text-sm font-semibold text-foreground">Android</Text>
              </View>

              <View className="h-px bg-border" />

              <View>
                <Text className="text-sm text-muted mb-1">الوصف</Text>
                <Text className="text-xs text-muted leading-relaxed">
                  مساعد ذكي لمراقبة وتعويض ارتداد الأسلحة أثناء اللعب. يستخدم تقنيات متقدمة
                  للكشف عن حركة الشاشة وتطبيق تعويض تلقائي.
                </Text>
              </View>
            </View>
          </View>

          {/* Danger Zone */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-error uppercase">منطقة الخطر</Text>

            <Pressable
              onPress={handleResetSettings}
              style={({ pressed }) => [
                {
                  backgroundColor: colors.error,
                  borderRadius: 12,
                  paddingVertical: 14,
                  opacity: pressed ? 0.8 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
            >
              <View className="items-center gap-2">
                <Ionicons name="refresh" size={20} color="#FFFFFF" />
                <Text className="text-base font-bold text-white">إعادة تعيين جميع الإعدادات</Text>
              </View>
            </Pressable>

            <Text className="text-xs text-error text-center">
              سيؤدي هذا إلى حذف جميع الإعدادات والمعايرات المحفوظة
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
