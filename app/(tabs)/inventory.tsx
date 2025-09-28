import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useCategory } from "@/context/CategoryContext";
import { InventoryItem, mockInventoryItems } from "@/data/mockData";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function InventoryScreen() {
  const [activeTab, setActiveTab] = useState<"inventory" | "edit">("inventory");
  const [inventoryItems, setInventoryItems] =
    useState<InventoryItem[]>(mockInventoryItems);
  const { state: categoryState, addCategory } = useCategory();

  // New category dropdown state
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // New item dropdown state
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("");
  const [newItemUnit, setNewItemUnit] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Initialize expanded sections based on categories from context
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>(() => {
    const initialSections: { [key: string]: boolean } = {};
    categoryState.categories.forEach((category) => {
      initialSections[category.name] = false;
    });
    return initialSections;
  });

  // First establish categories from context, then populate with items
  const groupedItems = categoryState.categories.reduce((acc, category) => {
    acc[category.name] = inventoryItems.filter(
      (item) => item.category === category.name
    );
    return acc;
  }, {} as { [key: string]: InventoryItem[] });

  // Update expanded sections when categories change
  useEffect(() => {
    setExpandedSections((prev) => {
      const newSections = { ...prev };
      categoryState.categories.forEach((category) => {
        if (!(category.name in newSections)) {
          newSections[category.name] = false; // New categories start closed
        }
      });
      return newSections;
    });
  }, [categoryState.categories]);

  const toggleSection = (category: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      addCategory(newCategoryName.trim());
      setNewCategoryName("");
      setShowAddCategory(false);
      Alert.alert("Success", "Category added successfully!");
    }
  };

  const handleAddItem = () => {
    if (
      newItemName.trim() &&
      newItemQuantity.trim() &&
      newItemUnit.trim() &&
      selectedCategory
    ) {
      const newItem: InventoryItem = {
        id: `item-${Date.now()}`,
        name: newItemName.trim(),
        quantity: parseInt(newItemQuantity) || 0,
        unit: newItemUnit.trim(),
        category: selectedCategory,
      };

      setInventoryItems((prev) => [...prev, newItem]);

      // Reset form
      setNewItemName("");
      setNewItemQuantity("");
      setNewItemUnit("");
      setSelectedCategory("");
      setShowAddItem(false);

      Alert.alert("Success", "Item added successfully!");
    } else {
      Alert.alert("Error", "Please fill in all fields");
    }
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
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "inventory" ? (
          <View style={styles.accordionContainer}>
            {Object.entries(groupedItems).map(([category, items]) =>
              renderCategorySection(category, items)
            )}
          </View>
        ) : (
          <View style={styles.editContainer}>
            {/* Add Category Dropdown */}
            <ThemedView style={styles.dropdownSection}>
              <TouchableOpacity
                style={styles.dropdownHeader}
                onPress={() => setShowAddCategory(!showAddCategory)}
              >
                <ThemedText style={styles.dropdownTitle}>
                  Add New Category
                </ThemedText>
                <IconSymbol
                  name={showAddCategory ? "chevron.up" : "chevron.down"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>

              {showAddCategory && (
                <View style={styles.dropdownContent}>
                  <TextInput
                    style={styles.input}
                    placeholder="Category name"
                    placeholderTextColor="#999"
                    value={newCategoryName}
                    onChangeText={setNewCategoryName}
                    autoCapitalize="words"
                  />
                  <TouchableOpacity
                    style={[
                      styles.addButton,
                      !newCategoryName.trim() && styles.addButtonDisabled,
                    ]}
                    onPress={handleAddCategory}
                    disabled={!newCategoryName.trim()}
                  >
                    <IconSymbol name="plus" size={16} color="white" />
                    <ThemedText style={styles.addButtonText}>
                      Add Category
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              )}
            </ThemedView>

            {/* Add Item Dropdown */}
            <ThemedView style={styles.dropdownSection}>
              <TouchableOpacity
                style={styles.dropdownHeader}
                onPress={() => setShowAddItem(!showAddItem)}
              >
                <ThemedText style={styles.dropdownTitle}>
                  Add New Item
                </ThemedText>
                <IconSymbol
                  name={showAddItem ? "chevron.up" : "chevron.down"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>

              {showAddItem && (
                <View style={styles.dropdownContent}>
                  <TextInput
                    style={styles.input}
                    placeholder="Item name"
                    placeholderTextColor="#999"
                    value={newItemName}
                    onChangeText={setNewItemName}
                    autoCapitalize="words"
                  />

                  <View style={styles.inputRow}>
                    <TextInput
                      style={[styles.input, styles.inputHalf]}
                      placeholder="Quantity"
                      placeholderTextColor="#999"
                      value={newItemQuantity}
                      onChangeText={setNewItemQuantity}
                      keyboardType="numeric"
                    />
                    <TextInput
                      style={[styles.input, styles.inputHalf]}
                      placeholder="Unit (lbs, bottles, etc.)"
                      placeholderTextColor="#999"
                      value={newItemUnit}
                      onChangeText={setNewItemUnit}
                      autoCapitalize="words"
                    />
                  </View>

                  {/* Category Selection */}
                  <View style={styles.categorySelector}>
                    <ThemedText style={styles.selectorLabel}>
                      Select Category:
                    </ThemedText>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.categoryScroll}
                    >
                      {categoryState.categories.map((category) => (
                        <TouchableOpacity
                          key={category.id}
                          style={[
                            styles.categoryOption,
                            selectedCategory === category.name &&
                              styles.categoryOptionSelected,
                          ]}
                          onPress={() => setSelectedCategory(category.name)}
                        >
                          <ThemedText
                            style={[
                              styles.categoryOptionText,
                              selectedCategory === category.name &&
                                styles.categoryOptionTextSelected,
                            ]}
                          >
                            {category.name}
                          </ThemedText>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.addButton,
                      (!newItemName.trim() ||
                        !newItemQuantity.trim() ||
                        !newItemUnit.trim() ||
                        !selectedCategory) &&
                        styles.addButtonDisabled,
                    ]}
                    onPress={handleAddItem}
                    disabled={
                      !newItemName.trim() ||
                      !newItemQuantity.trim() ||
                      !newItemUnit.trim() ||
                      !selectedCategory
                    }
                  >
                    <IconSymbol name="plus" size={16} color="white" />
                    <ThemedText style={styles.addButtonText}>
                      Add Item
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              )}
            </ThemedView>
          </View>
        )}
      </ScrollView>
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
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  listContainer: {
    paddingBottom: 100,
  },
  accordionContainer: {
    flex: 1,
  },
  editContainer: {
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
  // Dropdown styles
  dropdownSection: {
    marginBottom: 16,
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E7",
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  dropdownContent: {
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E1E5E9",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "white",
    marginBottom: 12,
    color: "#000",
  },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputHalf: {
    flex: 1,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: "#007AFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonDisabled: {
    backgroundColor: "#A0A0A0",
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  categorySelector: {
    marginBottom: 12,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  categoryScroll: {
    maxHeight: 50,
  },
  categoryOption: {
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E5E5E7",
  },
  categoryOptionSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  categoryOptionTextSelected: {
    color: "white",
  },
});
