import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useCategory } from "@/context/CategoryContext";
import { Order, OrderItem, useOrders } from "@/context/OrdersContext";
import { mockInventoryItems } from "@/data/mockData";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function OrdersScreen() {
  const [showModal, setShowModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const { state: ordersState, addOrder, clearAllOrders } = useOrders();
  const { state: categoryState } = useCategory();

  // Get items for the selected category
  const categoryItems = selectedCategory
    ? mockInventoryItems.filter((item) => item.category === selectedCategory)
    : [];

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedItem(""); // Clear item when category changes
  };

  const handleCreateOrder = () => {
    if (selectedCategory && selectedItem) {
      // Find the selected item from mock data to get quantity and unit
      const selectedInventoryItem = mockInventoryItems.find(
        (item) =>
          item.name === selectedItem && item.category === selectedCategory
      );

      const newOrderItem: OrderItem = {
        id: `item-${Date.now()}`,
        name: selectedItem,
        category: selectedCategory,
        quantity: selectedInventoryItem?.quantity || 1,
        unit: selectedInventoryItem?.unit || "unit",
      };

      const newOrder: Order = {
        id: `order-${Date.now()}`,
        items: [newOrderItem],
        user: "Current User", // TODO: Get actual user from auth
        createdAt: new Date(),
      };

      addOrder(newOrder);
      setShowModal(false);
      setSelectedCategory("");
      setSelectedItem("");
    } else {
      Alert.alert("Error", "Please select both category and item");
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    // TODO: Implement delete functionality with context
    Alert.alert("Delete", "Delete functionality coming soon!");
  };

  const handleClearAllOrders = () => {
    clearAllOrders();
    setShowClearModal(false);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.titleContainer}>
            <ThemedText type="title" style={styles.title}>
              New Order
            </ThemedText>
            {ordersState.orders.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setShowClearModal(true)}
              >
                <ThemedText style={styles.clearText}>Clear</ThemedText>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.plusButton}
            onPress={() => setShowModal(true)}
          >
            <IconSymbol name="plus" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Orders List */}
      <ScrollView
        style={styles.ordersList}
        showsVerticalScrollIndicator={false}
      >
        {ordersState.orders.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyStateText}>
              No orders yet. Tap the + button to create your first order.
            </ThemedText>
          </View>
        ) : (
          ordersState.orders.map((order, index) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View style={styles.orderHeaderLeft}>
                  <ThemedText style={styles.orderNumber}>
                    {index + 1}.
                  </ThemedText>
                  <ThemedText style={styles.orderText}>
                    {order.items.map((item) => item.name).join(", ")}
                  </ThemedText>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteOrder(order.id)}
                >
                  <IconSymbol
                    name="trash"
                    size={18}
                    color="rgba(255, 59, 48, 0.4)"
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Submit Button */}
      {ordersState.orders.length > 0 && (
        <View style={styles.submitContainer}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => {
              Alert.alert(
                "Orders Submitted",
                `Submitted ${ordersState.orders.length} order(s) successfully!`
              );
              clearAllOrders(); // Clear orders after submission
            }}
          >
            <ThemedText style={styles.submitButtonText}>
              Submit ({ordersState.orders.length})
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}

      {/* Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>
                Create New Order
              </ThemedText>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Category Selection */}
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>
                  Select Category
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
                      onPress={() => handleCategoryChange(category.name)}
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

              {/* Item Selection */}
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Select Item</ThemedText>
                <ScrollView
                  style={styles.itemScroll}
                  showsVerticalScrollIndicator={false}
                >
                  {categoryItems.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.itemOption,
                        selectedItem === item.name && styles.itemOptionSelected,
                      ]}
                      onPress={() => setSelectedItem(item.name)}
                      disabled={!selectedCategory}
                    >
                      <ThemedText
                        style={[
                          styles.itemOptionText,
                          selectedItem === item.name &&
                            styles.itemOptionTextSelected,
                          !selectedCategory && styles.itemOptionDisabled,
                        ]}
                      >
                        {item.name} ({item.quantity} {item.unit})
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                  {!selectedCategory && (
                    <ThemedText style={styles.disabledText}>
                      Please select a category first
                    </ThemedText>
                  )}
                </ScrollView>
              </View>
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowModal(false)}
              >
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.createButton,
                  (!selectedCategory || !selectedItem) &&
                    styles.createButtonDisabled,
                ]}
                onPress={handleCreateOrder}
                disabled={!selectedCategory || !selectedItem}
              >
                <ThemedText style={styles.createButtonText}>
                  Create Order
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Clear Confirmation Modal */}
      <Modal
        visible={showClearModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowClearModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.clearModalContent}>
            <ThemedText style={styles.clearModalTitle}>
              Clear All Orders
            </ThemedText>
            <ThemedText style={styles.clearModalMessage}>
              Are you sure you want to remove all {ordersState.orders.length}{" "}
              order(s) from the list? This action cannot be undone.
            </ThemedText>
            <View style={styles.clearModalButtons}>
              <TouchableOpacity
                style={styles.clearCancelButton}
                onPress={() => setShowClearModal(false)}
              >
                <ThemedText style={styles.clearCancelButtonText}>
                  Cancel
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.clearConfirmButton}
                onPress={handleClearAllOrders}
              >
                <ThemedText style={styles.clearConfirmButtonText}>
                  Clear All
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  clearButton: {
    marginLeft: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearText: {
    fontSize: 16,
    color: "#FF3B30",
    fontWeight: "500",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  filterButton: {
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
  },
  plusButton: {
    backgroundColor: "#E3F2FD",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  // Orders list styles
  ordersList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  orderCard: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#E5E5E7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  orderHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 24,
  },
  orderHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-start",
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
    marginRight: 8,
    minWidth: 20,
    textAlignVertical: "center",
    lineHeight: 24,
  },
  orderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    flex: 1,
    textAlignVertical: "center",
    lineHeight: 24,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  orderDate: {
    fontSize: 14,
    color: "#666",
  },
  // Submit button styles
  submitContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E7",
  },
  submitButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E7",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  closeButton: {
    padding: 8,
  },
  modalBody: {
    maxHeight: 400,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  categoryScroll: {
    maxHeight: 50,
  },
  categoryOption: {
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 16,
    paddingVertical: 10,
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
  itemScroll: {
    maxHeight: 200,
  },
  itemOption: {
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5E7",
  },
  itemOptionSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  itemOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  itemOptionTextSelected: {
    color: "white",
  },
  itemOptionDisabled: {
    color: "#999",
  },
  disabledText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
    padding: 20,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E7",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5E7",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
  },
  createButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginLeft: 10,
    borderRadius: 8,
    backgroundColor: "#007AFF",
    alignItems: "center",
  },
  createButtonDisabled: {
    backgroundColor: "#A0A0A0",
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  // Clear modal styles
  clearModalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    width: "85%",
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  clearModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
  },
  clearModalMessage: {
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
    textAlign: "center",
  },
  clearModalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  clearCancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5E7",
    alignItems: "center",
  },
  clearCancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
  },
  clearConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: "#FF3B30",
    alignItems: "center",
  },
  clearConfirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
