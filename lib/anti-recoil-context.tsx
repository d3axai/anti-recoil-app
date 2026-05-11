import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AccessibilityService } from "./accessibility-service";

interface AntiRecoilContextType {
  isServiceActive: boolean;
  setIsServiceActive: (active: boolean) => void;
  strength: number;
  setStrength: (strength: number) => void;
  calibrationZone: { x: number; y: number; width: number; height: number } | null;
  setCalibrationZone: (zone: { x: number; y: number; width: number; height: number } | null) => void;
  gestureCount: number;
  incrementGestureCount: () => void;
  isLoading: boolean;
}

const AntiRecoilContext = createContext<AntiRecoilContextType | undefined>(undefined);

export function AntiRecoilProvider({ children }: { children: ReactNode }) {
  const [isServiceActive, setIsServiceActive] = useState(false);
  const [strength, setStrength] = useState(50);
  const [calibrationZone, setCalibrationZone] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [gestureCount, setGestureCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedStrength = await AsyncStorage.getItem("recoilStrength");
      const savedActive = await AsyncStorage.getItem("serviceActive");
      const savedZone = await AsyncStorage.getItem("calibrationZone");
      const savedGestureCount = await AsyncStorage.getItem("gestureCount");

      if (savedStrength) setStrength(parseInt(savedStrength));
      if (savedActive) setIsServiceActive(JSON.parse(savedActive));
      if (savedZone) setCalibrationZone(JSON.parse(savedZone));
      if (savedGestureCount) setGestureCount(parseInt(savedGestureCount));
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetStrength = async (newStrength: number) => {
    setStrength(newStrength);
    try {
      await AsyncStorage.setItem("recoilStrength", newStrength.toString());
    } catch (error) {
      console.error("Error saving strength:", error);
    }
  };

  const handleSetServiceActive = async (active: boolean) => {
    setIsServiceActive(active);
    try {
      await AsyncStorage.setItem("serviceActive", JSON.stringify(active));
      if (active) {
        await AccessibilityService.startService(strength, calibrationZone);
      } else {
        await AccessibilityService.stopService();
      }
    } catch (error) {
      console.error("Error saving service status:", error);
    }
  };

  const handleSetCalibrationZone = async (
    zone: { x: number; y: number; width: number; height: number } | null
  ) => {
    setCalibrationZone(zone);
    try {
      if (zone) {
        await AsyncStorage.setItem("calibrationZone", JSON.stringify(zone));
      } else {
        await AsyncStorage.removeItem("calibrationZone");
      }
    } catch (error) {
      console.error("Error saving calibration zone:", error);
    }
  };

  const incrementGestureCount = () => {
    const newCount = gestureCount + 1;
    setGestureCount(newCount);
    AsyncStorage.setItem("gestureCount", newCount.toString()).catch((error) =>
      console.error("Error saving gesture count:", error)
    );
  };

  return (
    <AntiRecoilContext.Provider
      value={{
        isServiceActive,
        setIsServiceActive: handleSetServiceActive,
        strength,
        setStrength: handleSetStrength,
        calibrationZone,
        setCalibrationZone: handleSetCalibrationZone,
        gestureCount,
        incrementGestureCount,
        isLoading,
      }}
    >
      {children}
    </AntiRecoilContext.Provider>
  );
}

export function useAntiRecoil() {
  const context = useContext(AntiRecoilContext);
  if (!context) {
    throw new Error("useAntiRecoil must be used within AntiRecoilProvider");
  }
  return context;
}
