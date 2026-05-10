import { View, Text, TextInput, TouchableOpacity, Pressable, Alert } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import { encryptionService } from "@/lib/encryption-service";

export default function LoginScreen() {
  const colors = useColors();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!password) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("تنبيه", "يرجى إدخال كلمة المرور الخاصة بك");
      return;
    }

    try {
      setLoading(true);
      
      // التحقق من كلمة المرور المحددة من قبل المستخدم: 3bdaziz00
      const isValid = await encryptionService.verifyMasterPassword(password);

      if (isValid) {
        await SecureStore.setItemAsync("auth_token", `session_${Date.now()}`);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace("/(tabs)");
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("خطأ في الوصول", "كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.");
        setPassword("");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("خطأ نظام", "حدث خطأ غير متوقع أثناء التحقق.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer className="p-6 justify-center">
      <View className="gap-8">
        {/* Stealth Header */}
        <View className="items-center gap-4">
          <View
            className="w-20 h-20 rounded-3xl items-center justify-center shadow-lg"
            style={{ backgroundColor: colors.primary }}
          >
            <Ionicons name="shield" size={40} color="white" />
          </View>
          <View className="items-center">
            <Text className="text-3xl font-bold text-foreground tracking-tight">
              نظام الحماية
            </Text>
            <Text className="text-sm text-muted text-center mt-1">
              تشفير متقدم متعدد الطبقات نشط
            </Text>
          </View>
        </View>

        {/* Password Input Area */}
        <View className="gap-4">
          <View className="gap-2">
            <Text className="text-xs font-bold text-muted uppercase tracking-widest ml-1">
              رمز الوصول الخاص
            </Text>
            <View
              className="flex-row items-center border-2 rounded-2xl px-4 py-4"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.surface,
              }}
            >
              <Ionicons name="key-outline" size={20} color={colors.muted} className="mr-2" />
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholder="أدخل رمز الوصول"
                placeholderTextColor={colors.muted}
                className="flex-1 text-foreground font-medium text-lg"
                editable={!loading}
                autoFocus
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color={colors.muted}
                />
              </TouchableOpacity>
            </View>
          </View>

          <Pressable
            onPress={handleLogin}
            disabled={loading}
            style={({ pressed }) => [
              {
                backgroundColor: colors.primary,
                borderRadius: 16,
                paddingVertical: 18,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 5,
                opacity: pressed || loading ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            <Text className="text-center font-bold text-white text-lg">
              {loading ? "جاري التحقق من التشفير..." : "فتح الوصول الآمن"}
            </Text>
          </Pressable>
        </View>

        {/* Security Status Footer */}
        <View className="flex-row justify-center items-center gap-2 mt-4">
          <View className="w-2 h-2 rounded-full bg-success" />
          <Text className="text-xs text-muted font-medium">
            جميع الاتصالات مشفرة (End-to-End)
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}
