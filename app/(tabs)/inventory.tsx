import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useCategory } from "@/context/CategoryContext";
import { useInventory } from "@/context/InventoryContext";
import { InventoryItem } from "@/data/mockData";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function InventoryScreen() {
  const [activeTab, setActiveTab] = useState<"inventory" | "edit">("edit");
  const {
    state: inventoryState,
    addItem,
    updateItem,
    deleteItem,
    adjustQuantity,
    getItemsByCategory,
    findItem,
  } = useInventory();
  const {
    state: categoryState,
    addCategory,
    removeCategory,
    updateCategory,
  } = useCategory();

  // New category dropdown state
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // New item dropdown state
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("");
  const [newItemUnit, setNewItemUnit] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Delete category dropdown state
  const [showDeleteCategory, setShowDeleteCategory] = useState(false);
  const [deleteCategoryName, setDeleteCategoryName] = useState("");

  // Edit category dropdown state
  const [showEditCategory, setShowEditCategory] = useState(false);
  const [selectedEditCategory, setSelectedEditCategory] = useState("");
  const [editCategoryName, setEditCategoryName] = useState("");

  // Delete item dropdown state
  const [showDeleteItem, setShowDeleteItem] = useState(false);
  const [deleteItemName, setDeleteItemName] = useState("");

  // Edit item dropdown state
  const [showEditItem, setShowEditItem] = useState(false);
  const [selectedEditItemCategory, setSelectedEditItemCategory] = useState("");
  const [selectedEditItem, setSelectedEditItem] = useState("");
  const [editItemName, setEditItemName] = useState("");
  const [editItemPrice, setEditItemPrice] = useState("");

  // Manual Entry modal state
  const [showManualEntryModal, setShowManualEntryModal] = useState(false);
  const [isBuying, setIsBuying] = useState(true); // true = buying, false = selling
  const [selectedManualCategory, setSelectedManualCategory] = useState("");
  const [selectedManualItem, setSelectedManualItem] = useState("");
  const [quantityToSell, setQuantityToSell] = useState(0);

  // Handle toggle between buying and selling
  const handleToggleChange = (newIsBuying: boolean) => {
    setIsBuying(newIsBuying);
  };

  // Get items for the selected edit category
  const editCategoryItems = selectedEditItemCategory
    ? getItemsByCategory(selectedEditItemCategory)
    : [];

  // Get items for the selected manual entry category
  const manualCategoryItems = selectedManualCategory
    ? getItemsByCategory(selectedManualCategory)
    : [];

  // Get the selected item's quantity for the slider
  const selectedItemQuantity = selectedManualItem
    ? findItem(selectedManualItem, selectedManualCategory)?.quantity || 0
    : 0;

  // Adjust quantity when switching to selling mode or when item changes
  useEffect(() => {
    if (
      !isBuying &&
      selectedManualItem &&
      quantityToSell > selectedItemQuantity
    ) {
      setQuantityToSell(selectedItemQuantity);
    }
  }, [isBuying, selectedManualItem, selectedItemQuantity, quantityToSell]);

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
    acc[category.name] = getItemsByCategory(category.name);
    return acc;
  }, {} as { [key: string]: InventoryItem[] });

  // Ensure we always start on "Edit" tab when navigating to this screen
  useFocusEffect(
    useCallback(() => {
      setActiveTab("edit");
    }, [])
  );

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
        price: newItemPrice.trim() ? parseFloat(newItemPrice) : undefined,
      };

      addItem(newItem);

      // Reset form
      setNewItemName("");
      setNewItemQuantity("");
      setNewItemUnit("");
      setNewItemPrice("");
      setSelectedCategory("");
      setShowAddItem(false);

      Alert.alert("Success", "Item added successfully!");
    } else {
      Alert.alert("Error", "Please fill in all required fields");
    }
  };

  const handleDeleteCategory = () => {
    if (deleteCategoryName.trim()) {
      // Find category by exact name match
      const categoryToDelete = categoryState.categories.find(
        (cat) => cat.name === deleteCategoryName.trim()
      );
      if (categoryToDelete) {
        removeCategory(categoryToDelete.id);
        Alert.alert(
          "Success",
          `Category "${deleteCategoryName.trim()}" deleted successfully!`
        );
        setDeleteCategoryName("");
        setShowDeleteCategory(false);
      } else {
        Alert.alert(
          "Error",
          `Category "${deleteCategoryName.trim()}" not found. Please check the name and try again.`
        );
      }
    } else {
      Alert.alert("Error", "Please enter a category name to delete");
    }
  };

  const handleEditCategory = () => {
    if (selectedEditCategory && editCategoryName.trim()) {
      // Find category to edit
      const categoryToEdit = categoryState.categories.find(
        (cat) => cat.name === selectedEditCategory
      );
      if (categoryToEdit) {
        // Check if new name already exists
        const nameExists = categoryState.categories.some(
          (cat) =>
            cat.name === editCategoryName.trim() && cat.id !== categoryToEdit.id
        );
        if (nameExists) {
          Alert.alert("Error", "A category with this name already exists.");
          return;
        }

        // Update category name
        const updatedCategory = {
          ...categoryToEdit,
          name: editCategoryName.trim(),
        };

        updateCategory(updatedCategory);
        Alert.alert(
          "Success",
          `Category "${selectedEditCategory}" renamed to "${editCategoryName.trim()}" successfully!`
        );
        setSelectedEditCategory("");
        setEditCategoryName("");
        setShowEditCategory(false);
      }
    } else {
      Alert.alert("Error", "Please select a category and enter a new name");
    }
  };

  const handleEditItem = () => {
    if (selectedEditItemCategory && selectedEditItem && editItemName.trim()) {
      // Find item to edit
      const itemToEdit = inventoryItems.find(
        (item) =>
          item.name === selectedEditItem &&
          item.category === selectedEditItemCategory
      );
      if (itemToEdit) {
        // Check if new name already exists
        const nameExists = inventoryItems.some(
          (item) =>
            item.name === editItemName.trim() && item.id !== itemToEdit.id
        );
        if (nameExists) {
          Alert.alert("Error", "An item with this name already exists.");
          return;
        }

        // Update item name and price
        const updatedItem = {
          ...itemToEdit,
          name: editItemName.trim(),
          price: editItemPrice.trim() ? parseFloat(editItemPrice) : undefined,
        };

        updateItem(updatedItem);
        Alert.alert(
          "Success",
          `Item "${selectedEditItem}" updated successfully!`
        );
        setSelectedEditItemCategory("");
        setSelectedEditItem("");
        setEditItemName("");
        setEditItemPrice("");
        setShowEditItem(false);
      }
    } else {
      Alert.alert(
        "Error",
        "Please select a category, item, and enter a new name"
      );
    }
  };

  const handleDeleteItem = () => {
    if (deleteItemName.trim()) {
      // Find item by exact name match
      const itemToDelete = inventoryState.items.find(
        (item) => item.name === deleteItemName.trim()
      );
      if (itemToDelete) {
        deleteItem(deleteItemName.trim());
        Alert.alert(
          "Success",
          `Item "${deleteItemName.trim()}" deleted successfully!`
        );
        setDeleteItemName("");
        setShowDeleteItem(false);
      } else {
        Alert.alert(
          "Error",
          `Item "${deleteItemName.trim()}" not found. Please check the name and try again.`
        );
      }
    } else {
      Alert.alert("Error", "Please enter an item name to delete");
    }
  };

  const handleManualEntrySubmit = () => {
    if (selectedManualCategory && selectedManualItem) {
      const existingItem = findItem(selectedManualItem, selectedManualCategory);

      if (isBuying) {
        // When buying, add to inventory
        const buyQuantity = quantityToSell || 1; // Use quantityToSell for buying too
        if (existingItem) {
          // Item exists, update quantity
          adjustQuantity(existingItem.id, buyQuantity);
        } else {
          // Item doesn't exist, create new item
          const newItem: InventoryItem = {
            id: `item-${Date.now()}`,
            name: selectedManualItem,
            category: selectedManualCategory,
            quantity: buyQuantity,
            unit: "unit", // Default unit, can be customized later
          };
          addItem(newItem);
        }
      } else {
        // When selling, remove from inventory
        if (existingItem) {
          const sellQuantity = quantityToSell || 1;

          if (existingItem.quantity >= sellQuantity) {
            if (existingItem.quantity === sellQuantity) {
              // Remove item completely if selling all
              deleteItem(existingItem.name);
            } else {
              // Reduce quantity
              adjustQuantity(existingItem.id, -sellQuantity);
            }
          } else {
            Alert.alert(
              "Error",
              `Cannot sell ${sellQuantity} items. Only ${existingItem.quantity} available in inventory.`
            );
            return;
          }
        } else {
          Alert.alert(
            "Error",
            "Item not found in inventory. Cannot sell items that don't exist."
          );
          return;
        }
      }

      const action = isBuying ? "buying" : "selling";
      const quantityText = !isBuying ? ` (quantity: ${quantityToSell})` : "";
      Alert.alert(
        "Success",
        `Manual entry submitted: ${action} ${selectedManualItem} from ${selectedManualCategory}${quantityText}`
      );

      // Reset form and close modal
      setSelectedManualCategory("");
      setSelectedManualItem("");
      setQuantityToSell(0);
      setIsBuying(true);
      setShowManualEntryModal(false);
    } else {
      Alert.alert("Error", "Please select both category and item");
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
          style={[styles.tab, activeTab === "edit" && styles.activeTab]}
          onPress={() => setActiveTab("edit")}
        >
          <ThemedText
            style={[
              styles.tabText,
              activeTab === "edit" && styles.activeTabText,
            ]}
          >
            Update
          </ThemedText>
        </TouchableOpacity>
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
            {/* Manual Entry Button */}
            <TouchableOpacity
              style={styles.manualEntryButton}
              onPress={() => setShowManualEntryModal(true)}
            >
              <ThemedText style={styles.manualEntryButtonText}>
                Manual Entry
              </ThemedText>
            </TouchableOpacity>

            {/* Category Section */}
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionHeaderText}>Category</ThemedText>
            </View>

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

            {/* Edit Category Dropdown */}
            <ThemedView style={styles.dropdownSection}>
              <TouchableOpacity
                style={styles.dropdownHeader}
                onPress={() => setShowEditCategory(!showEditCategory)}
              >
                <ThemedText style={styles.dropdownTitle}>
                  Edit Category
                </ThemedText>
                <IconSymbol
                  name={showEditCategory ? "chevron.up" : "chevron.down"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>

              {showEditCategory && (
                <View style={styles.dropdownContent}>
                  <View style={styles.categorySelector}>
                    <ThemedText style={styles.selectorLabel}>
                      Select Category to Edit:
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
                            selectedEditCategory === category.name &&
                              styles.categoryOptionSelected,
                          ]}
                          onPress={() => setSelectedEditCategory(category.name)}
                        >
                          <ThemedText
                            style={[
                              styles.categoryOptionText,
                              selectedEditCategory === category.name &&
                                styles.categoryOptionTextSelected,
                            ]}
                          >
                            {category.name}
                          </ThemedText>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  <TextInput
                    style={styles.input}
                    placeholder="Enter new category name"
                    placeholderTextColor="#999"
                    value={editCategoryName}
                    onChangeText={setEditCategoryName}
                    autoCapitalize="words"
                  />

                  <TouchableOpacity
                    style={[
                      styles.addButton,
                      (!selectedEditCategory || !editCategoryName.trim()) &&
                        styles.addButtonDisabled,
                    ]}
                    onPress={handleEditCategory}
                    disabled={!selectedEditCategory || !editCategoryName.trim()}
                  >
                    <IconSymbol name="plus" size={16} color="white" />
                    <ThemedText style={styles.addButtonText}>
                      Update Category
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              )}
            </ThemedView>

            {/* Delete Category Dropdown */}
            <ThemedView style={styles.dropdownSection}>
              <TouchableOpacity
                style={styles.dropdownHeader}
                onPress={() => setShowDeleteCategory(!showDeleteCategory)}
              >
                <ThemedText style={styles.dropdownTitle}>
                  Delete Category
                </ThemedText>
                <IconSymbol
                  name={showDeleteCategory ? "chevron.up" : "chevron.down"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>

              {showDeleteCategory && (
                <View style={styles.dropdownContent}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter exact category name"
                    placeholderTextColor="#999"
                    value={deleteCategoryName}
                    onChangeText={setDeleteCategoryName}
                    autoCapitalize="words"
                  />

                  <TouchableOpacity
                    style={[
                      styles.deleteButton,
                      !deleteCategoryName.trim() && styles.deleteButtonDisabled,
                    ]}
                    onPress={handleDeleteCategory}
                    disabled={!deleteCategoryName.trim()}
                  >
                    <IconSymbol name="trash" size={16} color="white" />
                    <ThemedText style={styles.deleteButtonText}>
                      Delete Category
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              )}
            </ThemedView>

            {/* Item Section */}
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionHeaderText}>Item</ThemedText>
            </View>

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

                  <TextInput
                    style={styles.input}
                    placeholder="Price (optional)"
                    placeholderTextColor="#999"
                    value={newItemPrice}
                    onChangeText={setNewItemPrice}
                    keyboardType="numeric"
                  />

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

            {/* Edit Item Dropdown */}
            <ThemedView style={styles.dropdownSection}>
              <TouchableOpacity
                style={styles.dropdownHeader}
                onPress={() => setShowEditItem(!showEditItem)}
              >
                <ThemedText style={styles.dropdownTitle}>Edit Item</ThemedText>
                <IconSymbol
                  name={showEditItem ? "chevron.up" : "chevron.down"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>

              {showEditItem && (
                <View style={styles.dropdownContent}>
                  {/* Step 1: Select Category */}
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
                            selectedEditItemCategory === category.name &&
                              styles.categoryOptionSelected,
                          ]}
                          onPress={() => {
                            setSelectedEditItemCategory(category.name);
                            setSelectedEditItem(""); // Clear item selection when category changes
                          }}
                        >
                          <ThemedText
                            style={[
                              styles.categoryOptionText,
                              selectedEditItemCategory === category.name &&
                                styles.categoryOptionTextSelected,
                            ]}
                          >
                            {category.name}
                          </ThemedText>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  {/* Step 2: Select Item */}
                  {selectedEditItemCategory && (
                    <View style={styles.itemSelector}>
                      <ThemedText style={styles.selectorLabel}>
                        Select Item to Edit:
                      </ThemedText>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.itemScroll}
                      >
                        {editCategoryItems.map((item) => (
                          <TouchableOpacity
                            key={item.id}
                            style={[
                              styles.itemOption,
                              selectedEditItem === item.name &&
                                styles.itemOptionSelected,
                            ]}
                            onPress={() => setSelectedEditItem(item.name)}
                          >
                            <ThemedText
                              style={[
                                styles.itemOptionText,
                                selectedEditItem === item.name &&
                                  styles.itemOptionTextSelected,
                              ]}
                            >
                              {item.name}
                            </ThemedText>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}

                  {/* Step 3: Enter New Name */}
                  <TextInput
                    style={styles.input}
                    placeholder="Enter new item name"
                    placeholderTextColor="#999"
                    value={editItemName}
                    onChangeText={setEditItemName}
                    autoCapitalize="words"
                  />

                  {/* Step 4: Enter New Price */}
                  <TextInput
                    style={styles.input}
                    placeholder="Enter new price (optional)"
                    placeholderTextColor="#999"
                    value={editItemPrice}
                    onChangeText={setEditItemPrice}
                    keyboardType="numeric"
                  />

                  <TouchableOpacity
                    style={[
                      styles.addButton,
                      (!selectedEditItemCategory ||
                        !selectedEditItem ||
                        !editItemName.trim()) &&
                        styles.addButtonDisabled,
                    ]}
                    onPress={handleEditItem}
                    disabled={
                      !selectedEditItemCategory ||
                      !selectedEditItem ||
                      !editItemName.trim()
                    }
                  >
                    <IconSymbol name="plus" size={16} color="white" />
                    <ThemedText style={styles.addButtonText}>
                      Update Item
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              )}
            </ThemedView>

            {/* Delete Item Dropdown */}
            <ThemedView style={styles.dropdownSection}>
              <TouchableOpacity
                style={styles.dropdownHeader}
                onPress={() => setShowDeleteItem(!showDeleteItem)}
              >
                <ThemedText style={styles.dropdownTitle}>
                  Delete Item
                </ThemedText>
                <IconSymbol
                  name={showDeleteItem ? "chevron.up" : "chevron.down"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>

              {showDeleteItem && (
                <View style={styles.dropdownContent}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter exact item name"
                    placeholderTextColor="#999"
                    value={deleteItemName}
                    onChangeText={setDeleteItemName}
                    autoCapitalize="words"
                  />

                  <TouchableOpacity
                    style={[
                      styles.deleteButton,
                      !deleteItemName.trim() && styles.deleteButtonDisabled,
                    ]}
                    onPress={handleDeleteItem}
                    disabled={!deleteItemName.trim()}
                  >
                    <IconSymbol name="trash" size={16} color="white" />
                    <ThemedText style={styles.deleteButtonText}>
                      Delete Item
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              )}
            </ThemedView>
          </View>
        )}
      </ScrollView>

      {/* Manual Entry Modal */}
      <Modal
        visible={showManualEntryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowManualEntryModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowManualEntryModal(false)}
        >
          <TouchableOpacity
            style={styles.modalContainer}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Have</ThemedText>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowManualEntryModal(false)}
              >
                <IconSymbol name="xmark" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Toggle Section */}
            <View style={styles.modalSection}>
              <View
                style={[
                  styles.toggleContainer,
                  isBuying
                    ? styles.toggleContainerBuying
                    : styles.toggleContainerSelling,
                ]}
              >
                <ThemedText style={styles.toggleLabel}>
                  {isBuying ? "Buying" : "Selling"}
                </ThemedText>
                <Switch
                  value={isBuying}
                  onValueChange={handleToggleChange}
                  trackColor={{ false: "#E5E5E7", true: "#007AFF" }}
                  thumbColor={isBuying ? "#FFFFFF" : "#FFFFFF"}
                />
              </View>
            </View>

            {/* Category Selection */}
            <View style={styles.modalSection}>
              <ThemedText style={styles.modalSectionTitle}>Category</ThemedText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.modalScroll}
              >
                {categoryState.categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.modalOption,
                      selectedManualCategory === category.name &&
                        styles.modalOptionSelected,
                    ]}
                    onPress={() => {
                      setSelectedManualCategory(category.name);
                      setSelectedManualItem(""); // Clear item selection when category changes
                    }}
                  >
                    <ThemedText
                      style={[
                        styles.modalOptionText,
                        selectedManualCategory === category.name &&
                          styles.modalOptionTextSelected,
                      ]}
                    >
                      {category.name}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Item Selection */}
            {selectedManualCategory && (
              <View style={styles.modalSection}>
                <ThemedText style={styles.modalSectionTitle}>Item</ThemedText>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.modalScroll}
                >
                  {manualCategoryItems.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.modalOption,
                        selectedManualItem === item.name &&
                          styles.modalOptionSelected,
                      ]}
                      onPress={() => setSelectedManualItem(item.name)}
                    >
                      <ThemedText
                        style={[
                          styles.modalOptionText,
                          selectedManualItem === item.name &&
                            styles.modalOptionTextSelected,
                        ]}
                      >
                        {item.name}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Quantity Selector - Always show */}
            <View style={styles.modalSection}>
              <ThemedText style={styles.modalSectionTitle}>
                Quantity to {isBuying ? "Buy" : "Sell"}: {quantityToSell}
              </ThemedText>
              {selectedManualItem ? (
                <>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity
                      style={[
                        styles.quantityButton,
                        quantityToSell <= 0 && styles.quantityButtonDisabled,
                      ]}
                      onPress={() =>
                        setQuantityToSell(Math.max(0, quantityToSell - 1))
                      }
                      disabled={quantityToSell <= 0}
                    >
                      <ThemedText style={styles.quantityButtonText}>
                        -
                      </ThemedText>
                    </TouchableOpacity>

                    <View style={styles.quantityDisplay}>
                      <ThemedText style={styles.quantityText}>
                        {quantityToSell}
                      </ThemedText>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.quantityButton,
                        !isBuying &&
                          quantityToSell >= selectedItemQuantity &&
                          styles.quantityButtonDisabled,
                      ]}
                      onPress={() =>
                        setQuantityToSell(
                          isBuying
                            ? quantityToSell + 1
                            : Math.min(selectedItemQuantity, quantityToSell + 1)
                        )
                      }
                      disabled={
                        !isBuying && quantityToSell >= selectedItemQuantity
                      }
                    >
                      <ThemedText style={styles.quantityButtonText}>
                        +
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                  <ThemedText style={styles.sliderHelpText}>
                    {isBuying
                      ? `Adding to inventory`
                      : `Available: ${selectedItemQuantity} ${
                          inventoryItems.find(
                            (item) =>
                              item.name === selectedManualItem &&
                              item.category === selectedManualCategory
                          )?.unit || "units"
                        }`}
                  </ThemedText>
                </>
              ) : (
                <ThemedText style={styles.sliderHelpText}>
                  Please select an item to set quantity
                </ThemedText>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.modalSubmitButton,
                (!selectedManualCategory || !selectedManualItem) &&
                  styles.modalSubmitButtonDisabled,
              ]}
              onPress={handleManualEntrySubmit}
              disabled={!selectedManualCategory || !selectedManualItem}
            >
              <ThemedText style={styles.modalSubmitButtonText}>
                Submit
              </ThemedText>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#F8F9FA",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E7",
    marginBottom: 8,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
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
  // Item selector styles
  itemSelector: {
    marginBottom: 12,
  },
  // Item selection styles
  itemScroll: {
    maxHeight: 200,
  },
  itemOption: {
    backgroundColor: "#F8F9FA",
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5E7",
  },
  itemOptionSelected: {
    backgroundColor: "#FF3B30",
    borderColor: "#FF3B30",
  },
  itemOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  itemOptionTextSelected: {
    color: "white",
  },
  // Delete button styles
  deleteButton: {
    backgroundColor: "#FF3B30",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: "#FF3B30",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  deleteButtonDisabled: {
    backgroundColor: "#A0A0A0",
  },
  deleteButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  // Manual Entry Button styles
  manualEntryButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  manualEntryButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    width: "90%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  modalCloseButton: {
    padding: 8,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E7",
  },
  toggleContainerBuying: {
    backgroundColor: "#FFE0E0", // More visible red background
    borderColor: "#FFB3B3", // More visible red border
  },
  toggleContainerSelling: {
    backgroundColor: "#E0F5E0", // More visible green background
    borderColor: "#B3E6B3", // More visible green border
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  modalScroll: {
    maxHeight: 60,
  },
  modalOption: {
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E5E5E7",
  },
  modalOptionSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  modalOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  modalOptionTextSelected: {
    color: "white",
  },
  modalSubmitButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  modalSubmitButtonDisabled: {
    backgroundColor: "#A0A0A0",
  },
  modalSubmitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  // Quantity selector styles
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 12,
  },
  quantityButton: {
    backgroundColor: "#007AFF",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  quantityButtonDisabled: {
    backgroundColor: "#A0A0A0",
  },
  quantityButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  quantityDisplay: {
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5E7",
    minWidth: 60,
    alignItems: "center",
  },
  quantityText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  sliderHelpText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
});
