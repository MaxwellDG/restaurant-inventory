import EditInventoryTab from "@/components/EditInventoryTab";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { InventoryItem, mockInventoryItems } from "@/data/mockData";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export default function InventoryScreen() {
  const [activeTab, setActiveTab] = useState<"inventory" | "edit">("inventory");
  const [inventoryItems, setInventoryItems] =
    useState<InventoryItem[]>(mockInventoryItems);
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({
    Drinks: true,
    Food: true,
    Extras: true,
    Alcohol: true,
    Cleaning: true,
  });

  // Group items by category
  const groupedItems = inventoryItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as { [key: string]: InventoryItem[] });

  const toggleSection = (category: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const renderInventoryItem = ({ item }: { item: InventoryItem }) => (
    <ThemedView style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <ThemedText style={styles.itemName}>{item.name}</ThemedText>
        <ThemedText style={styles.itemQuantity}>
          {item.quantity} {item.unit}
        </ThemedText>
      </View>
    </ThemedView>
  );

  const renderCategorySection = (category: string, items: InventoryItem[]) => {
    const isExpanded = expandedSections[category];
    const itemCount = items.length;

    return (
      <ThemedView key={category} style={styles.categorySection}>
        <TouchableOpacity
          style={styles.categoryHeader}
          onPress={() => toggleSection(category)}
        >
          <View style={styles.categoryHeaderLeft}>
            <ThemedText style={styles.categoryTitle}>{category}</ThemedText>
            <ThemedText style={styles.categoryCount}>
              ({itemCount} items)
            </ThemedText>
          </View>
          <IconSymbol
            name={isExpanded ? "chevron.up" : "chevron.down"}
            size={20}
            color="#666"
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.categoryContent}>
            {items.map((item) => (
              <View key={item.id}>{renderInventoryItem({ item })}</View>
            ))}
          </View>
        )}
      </ThemedView>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Inventory
        </ThemedText>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "inventory" && styles.activeTab]}
          onPress={() => setActiveTab("inventory")}
        >
          <ThemedText
            style={[
              styles.tabText,
              activeTab === "inventory" && styles.activeTabText,
            ]}
          >
            My Inventory
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "edit" && styles.activeTab]}
          onPress={() => setActiveTab("edit")}
        >
          <ThemedText
            style={[
              styles.tabText,
              activeTab === "edit" && styles.activeTabText,
            ]}
          >
            Edit
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === "inventory" ? (
          <View style={styles.accordionContainer}>
            {Object.entries(groupedItems).map(([category, items]) =>
              renderCategorySection(category, items)
            )}
          </View>
        ) : (
          <EditInventoryTab />
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "#E5E5E7",
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  activeTabText: {
    color: "#007AFF",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listContainer: {
    paddingBottom: 100,
  },
  accordionContainer: {
    flex: 1,
  },
  categorySection: {
    marginBottom: 16,
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E7",
  },
  categoryHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginRight: 8,
  },
  categoryCount: {
    fontSize: 14,
    color: "#666",
  },
  categoryContent: {
    padding: 16,
  },
  itemCard: {
    backgroundColor: "#F8F9FA",
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5E7",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  itemQuantity: {
    fontSize: 16,
    fontWeight: "500",
    color: "#007AFF",
  },
  itemCategory: {
    fontSize: 14,
    color: "#666",
  },
});
