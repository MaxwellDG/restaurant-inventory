import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import {
  useCreateCategoryMutation,
  useCreateItemMutation,
  useDeleteCategoryMutation,
  useDeleteItemMutation,
  useGetInventoryQuery,
  useUpdateCategoryMutation,
  useUpdateItemMutation,
} from "@/redux/products/apiSlice";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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

export default function UpdateScreen() {
  const { t } = useTranslation();

  const { data: inventoryData = [], isLoading, error } = useGetInventoryQuery();

  // Mutation hooks
  const [createCategory] = useCreateCategoryMutation();
  const [createItem] = useCreateItemMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
  const [deleteItem] = useDeleteItemMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [updateItem] = useUpdateItemMutation();

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
    ? inventoryData.find((cat) => cat.name === selectedEditItemCategory)
        ?.items || []
    : [];

  // Get items for the selected manual entry category
  const manualCategoryItems = selectedManualCategory
    ? inventoryData.find((cat) => cat.name === selectedManualCategory)?.items ||
      []
    : [];

  // Check if there are any items in the inventory
  const hasItems = inventoryData.some(
    (cat) => cat.items && cat.items.length > 0
  );

  // Get the selected item's quantity for the slider
  const selectedItemQuantity = selectedManualItem
    ? inventoryData
        .find((cat) => cat.name === selectedManualCategory)
        ?.items.find((item) => item.name === selectedManualItem)?.quantity || 0
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

  const handleAddCategory = async () => {
    if (newCategoryName.trim()) {
      try {
        await createCategory({
          name: newCategoryName.trim(),
          items: [],
        }).unwrap();
        setNewCategoryName("");
        setShowAddCategory(false);
      } catch (error) {
        Alert.alert(
          t("inventoryEdit.error"),
          t("inventoryEdit.failedToAddCategory")
        );
      }
    }
  };

  const handleAddItem = async () => {
    if (
      newItemName.trim() &&
      newItemQuantity.trim() &&
      newItemUnit.trim() &&
      selectedCategory
    ) {
      try {
        const categoryId = inventoryData.find(
          (cat) => cat.name === selectedCategory
        )?.id;
        if (!categoryId) {
          Alert.alert(
            t("inventoryEdit.error"),
            t("inventoryEdit.selectedCategoryNotFound")
          );
          return;
        }

        await createItem({
          name: newItemName.trim(),
          quantity: parseInt(newItemQuantity) || 0,
          typeOfUnit: newItemUnit.trim(),
          price: newItemPrice.trim() ? parseFloat(newItemPrice) : undefined,
          category_id: categoryId,
        }).unwrap();

        // Reset form
        setNewItemName("");
        setNewItemQuantity("");
        setNewItemUnit("");
        setNewItemPrice("");
        setSelectedCategory("");
        setShowAddItem(false);
      } catch (error) {
        Alert.alert(
          t("inventoryEdit.error"),
          t("inventoryEdit.failedToAddItem")
        );
      }
    } else {
      Alert.alert(
        t("inventoryEdit.error"),
        t("inventoryEdit.fillAllRequiredFields")
      );
    }
  };

  const handleDeleteCategory = async () => {
    if (deleteCategoryName.trim()) {
      const categoryToDelete = inventoryData.find(
        (cat) => cat.name === deleteCategoryName.trim()
      );
      if (categoryToDelete) {
        try {
          await deleteCategory(categoryToDelete.id).unwrap();
          setDeleteCategoryName("");
          setShowDeleteCategory(false);
        } catch (error) {
          Alert.alert(
            t("inventoryEdit.error"),
            t("inventoryEdit.failedToDeleteCategory")
          );
        }
      } else {
        Alert.alert(
          t("inventoryEdit.error"),
          t("inventoryEdit.categoryNotFound", {
            name: deleteCategoryName.trim(),
          })
        );
      }
    } else {
      Alert.alert(
        t("inventoryEdit.error"),
        t("inventoryEdit.enterCategoryNameToDelete")
      );
    }
  };

  const handleEditCategory = async () => {
    if (selectedEditCategory && editCategoryName.trim()) {
      const categoryToEdit = inventoryData.find(
        (cat) => cat.name === selectedEditCategory
      );
      if (categoryToEdit) {
        const nameExists = inventoryData.some(
          (cat) =>
            cat.name === editCategoryName.trim() && cat.id !== categoryToEdit.id
        );
        if (nameExists) {
          Alert.alert(
            t("inventoryEdit.error"),
            t("inventoryEdit.categoryNameExists")
          );
          return;
        }

        try {
          await updateCategory({
            ...categoryToEdit,
            name: editCategoryName.trim(),
          }).unwrap();
          setSelectedEditCategory("");
          setEditCategoryName("");
          setShowEditCategory(false);
        } catch (error) {
          Alert.alert(
            t("inventoryEdit.error"),
            t("inventoryEdit.failedToUpdateCategory")
          );
        }
      }
    } else {
      Alert.alert(
        t("inventoryEdit.error"),
        t("inventoryEdit.selectCategoryAndEnterName")
      );
    }
  };

  const handleEditItem = async () => {
    if (selectedEditItemCategory && selectedEditItem && editItemName.trim()) {
      const category = inventoryData.find(
        (cat) => cat.name === selectedEditItemCategory
      );
      const itemToEdit = category?.items.find(
        (item) => item.name === selectedEditItem
      );

      if (itemToEdit) {
        const allItems = inventoryData.flatMap((cat) => cat.items);
        const nameExists = allItems.some(
          (item) =>
            item.name === editItemName.trim() && item.id !== itemToEdit.id
        );
        if (nameExists) {
          Alert.alert(
            t("inventoryEdit.error"),
            t("inventoryEdit.itemNameExists")
          );
          return;
        }

        try {
          await updateItem({
            ...itemToEdit,
            name: editItemName.trim(),
            price: editItemPrice.trim() ? parseFloat(editItemPrice) : undefined,
          }).unwrap();
          setSelectedEditItemCategory("");
          setSelectedEditItem("");
          setEditItemName("");
          setEditItemPrice("");
          setShowEditItem(false);
        } catch (error) {
          Alert.alert(
            t("inventoryEdit.error"),
            t("inventoryEdit.failedToUpdateItem")
          );
        }
      }
    } else {
      Alert.alert(
        t("inventoryEdit.error"),
        t("inventoryEdit.selectCategoryItemAndEnterName")
      );
    }
  };

  const handleDeleteItem = async () => {
    if (deleteItemName.trim()) {
      const allItems = inventoryData.flatMap((cat) => cat.items);
      const itemToDelete = allItems.find(
        (item) => item.name === deleteItemName.trim()
      );
      if (itemToDelete) {
        try {
          await deleteItem(itemToDelete.id).unwrap();
          setDeleteItemName("");
          setShowDeleteItem(false);
        } catch (error) {
          Alert.alert(
            t("inventoryEdit.error"),
            t("inventoryEdit.failedToDeleteItem")
          );
        }
      } else {
        Alert.alert(
          t("inventoryEdit.error"),
          t("inventoryEdit.itemNotFound", { name: deleteItemName.trim() })
        );
      }
    } else {
      Alert.alert(
        t("inventoryEdit.error"),
        t("inventoryEdit.enterItemNameToDelete")
      );
    }
  };

  const handleManualEntrySubmit = async () => {
    if (selectedManualCategory && selectedManualItem) {
      const category = inventoryData.find(
        (cat) => cat.name === selectedManualCategory
      );
      const existingItem = category?.items.find(
        (item) => item.name === selectedManualItem
      );

      try {
        if (isBuying) {
          const buyQuantity = quantityToSell || 1;
          if (existingItem) {
            await updateItem({
              ...existingItem,
              quantity: existingItem.quantity + buyQuantity,
            }).unwrap();
          } else {
            const categoryId = category?.id;
            if (!categoryId) {
              Alert.alert("Error", "Selected category not found.");
              return;
            }
            await createItem({
              name: selectedManualItem,
              quantity: buyQuantity,
              typeOfUnit: "unit",
              category_id: categoryId,
            }).unwrap();
          }
        } else {
          if (existingItem) {
            const sellQuantity = quantityToSell || 1;

            if (existingItem.quantity >= sellQuantity) {
              if (existingItem.quantity === sellQuantity) {
                await deleteItem(existingItem.id).unwrap();
              } else {
                await updateItem({
                  ...existingItem,
                  quantity: existingItem.quantity - sellQuantity,
                }).unwrap();
              }
            } else {
              Alert.alert(
                t("inventoryEdit.error"),
                t("inventoryEdit.cannotSellQuantity", {
                  sellQuantity,
                  availableQuantity: existingItem.quantity,
                })
              );
              return;
            }
          } else {
            Alert.alert(
              t("inventoryEdit.error"),
              t("inventoryEdit.itemNotFoundInInventory")
            );
            return;
          }
        }

        // Reset form and close modal
        setSelectedManualCategory("");
        setSelectedManualItem("");
        setQuantityToSell(0);
        setIsBuying(true);
        setShowManualEntryModal(false);
      } catch (error) {
        Alert.alert(
          t("inventoryEdit.error"),
          t("inventoryEdit.failedToProcessManualEntry")
        );
      }
    } else {
      Alert.alert(
        t("inventoryEdit.error"),
        t("inventoryEdit.selectBothCategoryAndItem")
      );
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          {t("inventoryEdit.updateTab")}
        </ThemedText>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.editContainer}>
          {/* Manual Entry Button */}
          <TouchableOpacity
            style={[
              styles.manualEntryButton,
              !hasItems && styles.manualEntryButtonDisabled,
            ]}
            onPress={() => setShowManualEntryModal(true)}
            disabled={!hasItems}
          >
            <ThemedText style={styles.manualEntryButtonText}>
              {t("inventoryEdit.manualEntry")}
            </ThemedText>
          </TouchableOpacity>

          {/* Category Section */}
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionHeaderText}>
              {t("inventoryEdit.categorySection")}
            </ThemedText>
          </View>

          {/* Add Category Dropdown */}
          <ThemedView style={styles.dropdownSection}>
            <TouchableOpacity
              style={styles.dropdownHeader}
              onPress={() => setShowAddCategory(!showAddCategory)}
            >
              <ThemedText style={styles.dropdownTitle}>
                {t("inventoryEdit.addNewCategory")}
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
                  placeholder={t("inventoryEdit.categoryNamePlaceholder")}
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
                    {t("inventoryEdit.addCategory")}
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
                {t("inventoryEdit.editCategory")}
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
                    {t("inventoryEdit.selectCategoryToEdit")}
                  </ThemedText>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoryScroll}
                  >
                    {inventoryData.map((category) => (
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
                  placeholder={t("inventoryEdit.enterNewCategoryName")}
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
                    {t("inventoryEdit.updateCategory")}
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
                {t("inventoryEdit.deleteCategory")}
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
                  placeholder={t("inventoryEdit.enterExactCategoryName")}
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
                    {t("inventoryEdit.deleteCategory")}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </ThemedView>

          {/* Item Section - Only show if at least one category exists */}
          {inventoryData.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <ThemedText style={styles.sectionHeaderText}>
                  {t("inventoryEdit.itemSection")}
                </ThemedText>
              </View>

              {/* Add Item Dropdown */}
              <ThemedView style={styles.dropdownSection}>
                <TouchableOpacity
                  style={styles.dropdownHeader}
                  onPress={() => setShowAddItem(!showAddItem)}
                >
                  <ThemedText style={styles.dropdownTitle}>
                    {t("inventoryEdit.addNewItem")}
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
                      placeholder={t("inventoryEdit.itemNamePlaceholder")}
                      placeholderTextColor="#999"
                      value={newItemName}
                      onChangeText={setNewItemName}
                      autoCapitalize="words"
                    />

                    <View style={styles.inputRow}>
                      <TextInput
                        style={[styles.input, styles.inputHalf]}
                        placeholder={t("inventoryEdit.quantityPlaceholder")}
                        placeholderTextColor="#999"
                        value={newItemQuantity}
                        onChangeText={setNewItemQuantity}
                        keyboardType="numeric"
                      />
                      <TextInput
                        style={[styles.input, styles.inputHalf]}
                        placeholder={t("inventoryEdit.unitPlaceholder")}
                        placeholderTextColor="#999"
                        value={newItemUnit}
                        onChangeText={setNewItemUnit}
                        autoCapitalize="words"
                      />
                    </View>

                    <TextInput
                      style={styles.input}
                      placeholder={t("inventoryEdit.pricePlaceholder")}
                      placeholderTextColor="#999"
                      value={newItemPrice}
                      onChangeText={setNewItemPrice}
                      keyboardType="numeric"
                    />

                    {/* Category Selection */}
                    <View style={styles.categorySelector}>
                      <ThemedText style={styles.selectorLabel}>
                        {t("inventoryEdit.selectCategory")}
                      </ThemedText>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.categoryScroll}
                      >
                        {inventoryData.map((category) => (
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
                        {t("inventoryEdit.addItem")}
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
                  <ThemedText style={styles.dropdownTitle}>
                    {t("inventoryEdit.editItem")}
                  </ThemedText>
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
                        {t("inventoryEdit.selectCategory")}
                      </ThemedText>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.categoryScroll}
                      >
                        {inventoryData.map((category) => (
                          <TouchableOpacity
                            key={category.id}
                            style={[
                              styles.categoryOption,
                              selectedEditItemCategory === category.name &&
                                styles.categoryOptionSelected,
                            ]}
                            onPress={() => {
                              setSelectedEditItemCategory(category.name);
                              setSelectedEditItem("");
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
                          {t("inventoryEdit.selectItemToEdit")}
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
                      placeholder={t("inventoryEdit.enterNewItemName")}
                      placeholderTextColor="#999"
                      value={editItemName}
                      onChangeText={setEditItemName}
                      autoCapitalize="words"
                    />

                    {/* Step 4: Enter New Price */}
                    <TextInput
                      style={styles.input}
                      placeholder={t("inventoryEdit.enterNewPrice")}
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
                        {t("inventoryEdit.updateItem")}
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
                    {t("inventoryEdit.deleteItem")}
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
                      placeholder={t("inventoryEdit.enterExactItemName")}
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
                        {t("inventoryEdit.deleteItem")}
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                )}
              </ThemedView>
            </>
          )}
        </View>
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
              <ThemedText style={styles.modalTitle}>
                {t("inventoryEdit.have")}
              </ThemedText>
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
                  {isBuying
                    ? t("inventoryEdit.buying")
                    : t("inventoryEdit.selling")}
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
              <ThemedText style={styles.modalSectionTitle}>
                {t("inventoryEdit.category")}
              </ThemedText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.modalScroll}
              >
                {inventoryData.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.modalOption,
                      selectedManualCategory === category.name &&
                        styles.modalOptionSelected,
                    ]}
                    onPress={() => {
                      setSelectedManualCategory(category.name);
                      setSelectedManualItem("");
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
                <ThemedText style={styles.modalSectionTitle}>
                  {t("inventoryEdit.item")}
                </ThemedText>
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
                {isBuying
                  ? t("inventoryEdit.quantityToBuy")
                  : t("inventoryEdit.quantityToSell")}
                : {quantityToSell}
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
                      ? t("inventoryEdit.addingToInventory")
                      : t("inventoryEdit.available", {
                          quantity: selectedItemQuantity,
                          unit:
                            inventoryData
                              .find((cat) => cat.name === selectedManualCategory)
                              ?.items.find(
                                (item) => item.name === selectedManualItem
                              )?.typeOfUnit || "units",
                        })}
                  </ThemedText>
                </>
              ) : (
                <ThemedText style={styles.sliderHelpText}>
                  {t("inventoryEdit.selectItemToSetQuantity")}
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
                {t("inventoryEdit.submit")}
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
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
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
  itemSelector: {
    marginBottom: 12,
  },
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
  deleteButton: {
    backgroundColor: "#FF3B30",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
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
  manualEntryButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: "center",
  },
  manualEntryButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  manualEntryButtonDisabled: {
    backgroundColor: "#A0A0A0",
    opacity: 0.6,
  },
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
    backgroundColor: "#FFE0E0",
    borderColor: "#FFB3B3",
  },
  toggleContainerSelling: {
    backgroundColor: "#E0F5E0",
    borderColor: "#B3E6B3",
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
  },
  modalSubmitButtonDisabled: {
    backgroundColor: "#A0A0A0",
  },
  modalSubmitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
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

