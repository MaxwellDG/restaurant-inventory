import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  category: string;
  unit: string;
}

export default function InventoryScreen() {
  const [activeTab, setActiveTab] = useState<"inventory" | "edit">("inventory");
  const [searchQuery, setSearchQuery] = useState("");
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([
    {
      id: "1",
      name: "Tomatoes",
      quantity: 25,
      category: "Vegetables",
      unit: "lbs",
    },
    {
      id: "2",
      name: "Chicken Breast",
      quantity: 15,
      category: "Meat",
      unit: "lbs",
    },
    { id: "3", name: "Rice", quantity: 50, category: "Grains", unit: "lbs" },
    {
      id: "4",
      name: "Olive Oil",
      quantity: 8,
      category: "Oils",
      unit: "bottles",
    },
    {
      id: "5",
      name: "Onions",
      quantity: 20,
      category: "Vegetables",
      unit: "lbs",
    },
  ]);

  const filteredItems = inventoryItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderInventoryItem = ({ item }: { item: InventoryItem }) => (
    <ThemedView style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <ThemedText style={styles.itemName}>{item.name}</ThemedText>
        <ThemedText style={styles.itemQuantity}>
          {item.quantity} {item.unit}
        </ThemedText>
      </View>
      <ThemedText style={styles.itemCategory}>{item.category}</ThemedText>
    </ThemedView>
  );

  const renderEditItem = ({ item }: { item: InventoryItem }) => (
    <ThemedView style={styles.editItemCard}>
      <View style={styles.editItemHeader}>
        <TextInput
          style={styles.editInput}
          value={item.name}
          placeholder="Item name"
          placeholderTextColor="#999"
        />
        <View style={styles.quantityContainer}>
          <TextInput
            style={styles.quantityInput}
            value={item.quantity.toString()}
            placeholder="Qty"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
          <TextInput
            style={styles.unitInput}
            value={item.unit}
            placeholder="Unit"
            placeholderTextColor="#999"
          />
        </View>
      </View>
      <TextInput
        style={styles.categoryInput}
        value={item.category}
        placeholder="Category"
        placeholderTextColor="#999"
      />
      <TouchableOpacity style={styles.deleteButton}>
        <IconSymbol name="trash" size={20} color="#FF3B30" />
      </TouchableOpacity>
    </ThemedView>
  );

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

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <IconSymbol name="magnifyingglass" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search inventory..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === "inventory" ? (
          <FlatList
            data={filteredItems}
            renderItem={renderInventoryItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <View style={styles.editContainer}>
            <FlatList
              data={inventoryItems}
              renderItem={renderEditItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
            <TouchableOpacity style={styles.addButton}>
              <IconSymbol name="plus" size={24} color="white" />
              <ThemedText style={styles.addButtonText}>Add Item</ThemedText>
            </TouchableOpacity>
          </View>
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#000",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listContainer: {
    paddingBottom: 100,
  },
  itemCard: {
    backgroundColor: "white",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
  editContainer: {
    flex: 1,
  },
  editItemCard: {
    backgroundColor: "white",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    position: "relative",
  },
  editItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  editInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E7",
    paddingBottom: 8,
    marginRight: 12,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityInput: {
    width: 60,
    fontSize: 16,
    color: "#000",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E7",
    paddingBottom: 8,
    textAlign: "center",
    marginRight: 8,
  },
  unitInput: {
    width: 60,
    fontSize: 16,
    color: "#000",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E7",
    paddingBottom: 8,
    textAlign: "center",
  },
  categoryInput: {
    fontSize: 16,
    color: "#000",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E7",
    paddingBottom: 8,
  },
  deleteButton: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 8,
  },
  addButton: {
    backgroundColor: "#007AFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
