import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useExportDataMutation } from "@/redux/export/apiSlice";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ExportDataScreen() {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [email, setEmail] = useState("");
  const [exportData, { isLoading }] = useExportDataMutation();

  const handleStartDatePress = () => {
    setShowStartDatePicker(true);
  };

  const handleEndDatePress = () => {
    setShowEndDatePicker(true);
  };

  const onStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const handleSubmit = async () => {
    if (!startDate || !endDate) {
      Alert.alert(t("exportData.error"), t("exportData.selectBothDates"));
      return;
    }
    if (!email.trim()) {
      Alert.alert(t("exportData.error"), t("exportData.enterEmail"));
      return;
    }
    await exportData({
      email: email.trim(),
      type: "csv",
      startDate: startDate.getTime(),
      endDate: endDate.getTime(),
    })
      .unwrap()
      .then(() => {
        Alert.alert(
          t("exportData.success"),
          t("exportData.exportRequestSubmitted")
        );
      })
      .catch((error) => {
        Alert.alert(t("exportData.error"), t("exportData.failedToSubmit"));
      });
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={24} color="#007AFF" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title}>
          {t("exportData.title")}
        </ThemedText>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedText style={styles.subheader}>{t("exportData.csv")}</ThemedText>

        <View style={styles.dateSection}>
          <View style={styles.dateRow}>
            <TouchableOpacity
              style={styles.calendarIconButton}
              onPress={handleStartDatePress}
            >
              <IconSymbol name="calendar" size={20} color="#007AFF" />
            </TouchableOpacity>
            <View style={styles.dateInfo}>
              <ThemedText style={styles.dateLabel}>
                {t("exportData.startDate")}
              </ThemedText>
              <ThemedText style={styles.dateValue}>
                {startDate
                  ? startDate.toLocaleDateString()
                  : t("exportData.selectDate")}
              </ThemedText>
            </View>
          </View>

          <View style={styles.dateRow}>
            <TouchableOpacity
              style={styles.calendarIconButton}
              onPress={handleEndDatePress}
            >
              <IconSymbol name="calendar" size={20} color="#007AFF" />
            </TouchableOpacity>
            <View style={styles.dateInfo}>
              <ThemedText style={styles.dateLabel}>
                {t("exportData.endDate")}
              </ThemedText>
              <ThemedText style={styles.dateValue}>
                {endDate
                  ? endDate.toLocaleDateString()
                  : t("exportData.selectDate")}
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.emailSection}>
          <ThemedText style={styles.emailLabel}>
            {t("exportData.emailAddress")}
          </ThemedText>
          <TextInput
            style={styles.emailInput}
            placeholder={t("exportData.emailPlaceholder")}
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <ThemedText style={styles.submitButtonText}>
            {t("exportData.submit")}
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>

      {showStartDatePicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onStartDateChange}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onEndDateChange}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    marginRight: 8,
    padding: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  subheader: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    marginBottom: 30,
  },
  dateSection: {
    marginBottom: 40,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  calendarIconButton: {
    backgroundColor: "#F0F0F0",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    marginRight: 16,
  },
  dateInfo: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    color: "#666",
  },
  emailSection: {
    marginBottom: 40,
  },
  emailLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  emailInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E5E5E7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
});
