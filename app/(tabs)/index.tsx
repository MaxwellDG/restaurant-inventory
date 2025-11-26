import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { RootState } from "@/redux/store";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";

export default function HomeScreen() {
  const { t } = useTranslation();
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            {t("home.welcome", { name: user?.name || "" })}
          </ThemedText>
          <ThemedText style={styles.subtitle}>{t("home.subtitle")}</ThemedText>
        </View>

        <View style={styles.content}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push("/(tabs)/inventory")}
          >
            <ThemedText style={styles.cardTitle}>
              {t("tabs.inventory")}
            </ThemedText>
            <ThemedText style={styles.cardSubtitle}>
              {t("home.manageInventory")}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push("/(tabs)/orders")}
          >
            <ThemedText style={styles.cardTitle}>
              {t("tabs.newOrders")}
            </ThemedText>
            <ThemedText style={styles.cardSubtitle}>
              {t("home.createOrders")}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push("/(tabs)/history")}
          >
            <ThemedText style={styles.cardTitle}>{t("tabs.orders")}</ThemedText>
            <ThemedText style={styles.cardSubtitle}>
              {t("home.viewHistory")}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    lineHeight: 22,
  },
  content: {
    gap: 16,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E1E5E9",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
});
