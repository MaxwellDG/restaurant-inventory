import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useCategory } from "@/context/CategoryContext";
import { Order, OrderItem, useOrders } from "@/context/OrdersContext";
import { useGetInventoryQuery } from "@/redux/products/apiSlice";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Modal,
  PanResponder,
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
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const { state: ordersState, addOrder, clearAllOrders } = useOrders();
  const { state: categoryState } = useCategory();
  const { data: inventoryData, isLoading: inventoryLoading } =
    useGetInventoryQuery();

  // Helper functions to work with inventory data
  const getItemsByCategory = (categoryName: string) => {
    if (!inventoryData) return [];
    const category = inventoryData.find((cat) => cat.name === categoryName);
    return category ? category.items : [];
  };

  const findItem = (itemName: string, categoryName: string) => {
    if (!inventoryData) return null;
    const category = inventoryData.find((cat) => cat.name === categoryName);
    if (!category) return null;
    return category.items.find((item) => item.name === itemName) || null;
  };

  // Get items for the selected category, filtering out items already in pending orders
  const categoryItems = selectedCategory
    ? getItemsByCategory(selectedCategory).filter((item) => {
        // Check if this item is already in any pending order
        return !pendingOrders.some((order) =>
          order.items.some(
            (orderItem) =>
              orderItem.name === item.name &&
              orderItem.category === selectedCategory
          )
        );
      })
    : [];

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedItem(""); // Clear item when category changes
    setOrderQuantity(1); // Reset quantity when category changes
  };

  const handleItemChange = (item: string) => {
    setSelectedItem(item);
    setOrderQuantity(1); // Reset quantity when item changes
  };

  const handleCreateOrder = () => {
    if (selectedCategory && selectedItem) {
      // Find the selected item from inventory data to get quantity and unit
      const selectedInventoryItem = findItem(selectedItem, selectedCategory);

      if (!selectedInventoryItem) {
        Alert.alert("Error", "Selected item not found in inventory");
        return;
      }

      // Validate quantity doesn't exceed inventory
      if (orderQuantity > selectedInventoryItem.quantity) {
        Alert.alert(
          "Error",
          `Cannot order ${orderQuantity} items. Only ${selectedInventoryItem.quantity} available in inventory.`
        );
        return;
      }

      const newOrderItem: OrderItem = {
        id: `item-${Date.now()}`,
        name: selectedItem,
        category: selectedCategory,
        quantity: orderQuantity,
        unit: selectedInventoryItem.typeOfUnit,
      };

      const newOrder: Order = {
        id: `order-${Date.now()}`,
        items: [newOrderItem],
        user: "Current User", // TODO: Get actual user from auth
        createdAt: new Date(),
      };

      setPendingOrders([...pendingOrders, newOrder]);
      setShowModal(false);
      setSelectedCategory("");
      setSelectedItem("");
      setOrderQuantity(1);
    } else {
      Alert.alert("Error", "Please select both category and item");
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    setPendingOrders(pendingOrders.filter((order) => order.id !== orderId));
  };

  const handleClearAllOrders = () => {
    setPendingOrders([]);
    setShowClearModal(false);
  };

  const handleIncreaseQuantity = (orderId: string, itemId: string) => {
    setPendingOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            items: order.items.map((item) => {
              if (item.id === itemId) {
                // Find the inventory item to check max quantity
                const inventoryItem = findItem(item.name, item.category);
                const maxQuantity = inventoryItem?.quantity || 0;
                const newQuantity = Math.min(maxQuantity, item.quantity + 1);

                if (newQuantity > item.quantity) {
                  return { ...item, quantity: newQuantity };
                }
              }
              return item;
            }),
          };
        }
        return order;
      })
    );
  };

  const handleDecreaseQuantity = (orderId: string, itemId: string) => {
    setPendingOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            items: order.items
              .map((item) => {
                if (item.id === itemId) {
                  const newQuantity = Math.max(1, item.quantity - 1);
                  return { ...item, quantity: newQuantity };
                }
                return item;
              })
              .filter((item) => item.quantity > 0), // Remove items with 0 quantity
          };
        }
        return order;
      })
    );
  };

  const SwipeableOrderCard = ({
    order,
    index,
  }: {
    order: Order;
    index: number;
  }) => {
    const translateX = new Animated.Value(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSwiping, setIsSwiping] = useState(false);

    const panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return (
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) &&
          Math.abs(gestureState.dx) > 10
        );
      },
      onPanResponderGrant: () => {
        setIsSwiping(true);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        setIsSwiping(false);
        if (gestureState.dx < -100) {
          // Swipe left far enough to trigger delete
          setIsDeleting(true);
          Animated.timing(translateX, {
            toValue: -400,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            handleDeleteOrder(order.id);
          });
        } else {
          // Snap back to original position
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    });

    return (
      <Animated.View
        style={[
          styles.orderCard,
          {
            transform: [{ translateX }],
            opacity: isDeleting ? 0.5 : 1,
            backgroundColor: isSwiping ? "#FFE6E6" : "white",
          },
        ]}
        {...panResponder.panHandlers}
      >
        {order.items.map((item, itemIndex) => (
          <View key={`${order.id}-${item.id}`} style={styles.orderItemRow}>
            <View style={styles.orderItemTop}>
              <ThemedText style={styles.orderItemName}>{item.name}</ThemedText>
              <View style={styles.orderQuantityControls}>
                <TouchableOpacity
                  style={styles.orderQuantityButton}
                  onPress={() => handleDecreaseQuantity(order.id, item.id)}
                >
                  <ThemedText style={styles.orderQuantityButtonText}>
                    -
                  </ThemedText>
                </TouchableOpacity>
                <ThemedText style={styles.orderQuantityText}>
                  {item.quantity}
                </ThemedText>
                <TouchableOpacity
                  style={styles.orderQuantityButton}
                  onPress={() => handleIncreaseQuantity(order.id, item.id)}
                >
                  <ThemedText style={styles.orderQuantityButtonText}>
                    +
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </Animated.View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.titleContainer}>
            <ThemedText type="title" style={styles.title}>
              New Order
            </ThemedText>
            {pendingOrders.length > 0 && (
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
        {pendingOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyStateText}>
              No orders yet. Tap the + button to create your first order.
            </ThemedText>
          </View>
        ) : (
          pendingOrders.map((order, index) => (
            <SwipeableOrderCard key={order.id} order={order} index={index} />
          ))
        )}
      </ScrollView>

      {/* Submit Button */}
      {pendingOrders.length > 0 && (
        <View style={styles.submitContainer}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => {
              // Create one single order with all items
              const allItems: OrderItem[] = [];
              pendingOrders.forEach((order) => {
                allItems.push(...order.items);
              });

              const singleOrder: Order = {
                id: `order-${Date.now()}`,
                items: allItems,
                user: "Current User", // TODO: Get actual user from auth
                createdAt: new Date(),
              };

              addOrder(singleOrder);
              Alert.alert(
                "Order Submitted",
                `Submitted 1 order with ${allItems.length} item(s) successfully!`
              );
              setPendingOrders([]); // Clear pending orders after submission
            }}
          >
            <ThemedText style={styles.submitButtonText}>
              Submit ({pendingOrders.length})
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

            {inventoryLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <ThemedText style={styles.loadingText}>
                  Loading inventory...
                </ThemedText>
              </View>
            ) : (
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
                  <ThemedText style={styles.sectionTitle}>
                    Select Item
                  </ThemedText>
                  <ScrollView
                    style={styles.itemScroll}
                    showsVerticalScrollIndicator={false}
                  >
                    {categoryItems.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.itemOption,
                          selectedItem === item.name &&
                            styles.itemOptionSelected,
                        ]}
                        onPress={() => handleItemChange(item.name)}
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
                          {item.name} ({item.quantity} {item.typeOfUnit})
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                    {!selectedCategory && (
                      <ThemedText style={styles.disabledText}>
                        Please select a category first
                      </ThemedText>
                    )}
                    {selectedCategory && categoryItems.length === 0 && (
                      <ThemedText style={styles.disabledText}>
                        All items in this category have already been added to
                        the order
                      </ThemedText>
                    )}
                  </ScrollView>
                </View>

                {/* Quantity Selection */}
                {selectedItem && (
                  <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>
                      Select Quantity
                    </ThemedText>
                    <View style={styles.quantityContainer}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() =>
                          setOrderQuantity(Math.max(1, orderQuantity - 1))
                        }
                      >
                        <ThemedText style={styles.quantityButtonText}>
                          -
                        </ThemedText>
                      </TouchableOpacity>
                      <View style={styles.quantityDisplay}>
                        <ThemedText style={styles.quantityText}>
                          {orderQuantity}
                        </ThemedText>
                      </View>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => {
                          const selectedInventoryItem = findItem(
                            selectedItem,
                            selectedCategory
                          );
                          const maxQuantity =
                            selectedInventoryItem?.quantity || 0;
                          setOrderQuantity(
                            Math.min(maxQuantity, orderQuantity + 1)
                          );
                        }}
                      >
                        <ThemedText style={styles.quantityButtonText}>
                          +
                        </ThemedText>
                      </TouchableOpacity>
                    </View>
                    <ThemedText style={styles.quantityInfo}>
                      Available:{" "}
                      {findItem(selectedItem, selectedCategory)?.quantity || 0}{" "}
                      {findItem(selectedItem, selectedCategory)?.typeOfUnit ||
                        "units"}
                    </ThemedText>
                  </View>
                )}
              </ScrollView>
            )}

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
              Are you sure you want to remove all {pendingOrders.length}{" "}
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
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
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
  orderItemRow: {
    padding: 8,
  },
  orderItemTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  orderItemName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    flex: 1,
    marginBottom: 0,
  },
  orderQuantityControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  orderQuantityButton: {
    backgroundColor: "#007AFF",
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  orderQuantityButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  orderQuantityText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: "center",
    marginBottom: 0,
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
    elevation: 3,
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
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
  quantityInfo: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },
});
