import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useOrders } from "@/context/OrdersContext";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function HistoryScreen() {
  const { state } = useOrders();
  const { orders } = state;
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Filter orders based on selected date range
  const filteredOrders = orders.filter((order) => {
    // Get order date as timestamp (start of day)
    const orderDate = new Date(order.createdAt);
    const orderDateStartOfDay = new Date(
      orderDate.getFullYear(),
      orderDate.getMonth(),
      orderDate.getDate()
    );
    const orderTimestamp = orderDateStartOfDay.getTime();

    if (startDate && endDate) {
      // Get start and end dates as timestamps (start of day)
      const startDateStartOfDay = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate()
      );
      const endDateStartOfDay = new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate()
      );

      const startTimestamp = startDateStartOfDay.getTime();
      const endTimestamp = endDateStartOfDay.getTime();

      return orderTimestamp >= startTimestamp && orderTimestamp <= endTimestamp;
    } else if (startDate) {
      const startDateStartOfDay = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate()
      );
      const startTimestamp = startDateStartOfDay.getTime();

      return orderTimestamp >= startTimestamp;
    } else if (endDate) {
      const endDateStartOfDay = new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate()
      );
      const endTimestamp = endDateStartOfDay.getTime();

      return orderTimestamp <= endTimestamp;
    }

    return true; // Show all orders if no dates are selected
  });

  const toggleExpanded = (orderId: string) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const handleStartDatePress = () => {
    setShowStartDatePicker(true);
  };

  const handleEndDatePress = () => {
    setShowEndDatePicker(true);
  };

  const handleClearDates = () => {
    setStartDate(null);
    setEndDate(null);
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

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.titleContainer}>
            <ThemedText type="title" style={styles.title}>
              History
            </ThemedText>
            {(startDate || endDate) && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearDates}
              >
                <ThemedText style={styles.clearButtonText}>Clear</ThemedText>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.dateFilterContainer}>
            <TouchableOpacity
              style={styles.dateFilterButton}
              onPress={handleStartDatePress}
            >
              <IconSymbol name="calendar" size={20} color="#007AFF" />
            </TouchableOpacity>
            <ThemedText style={styles.dash}>—</ThemedText>
            <TouchableOpacity
              style={styles.dateFilterButton}
              onPress={handleEndDatePress}
            >
              <IconSymbol name="calendar" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.ordersList}
        showsVerticalScrollIndicator={false}
      >
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyStateText}>
              {orders.length === 0
                ? "No orders found. Create your first order to see it here."
                : "No orders found for the selected date range."}
            </ThemedText>
          </View>
        ) : (
          filteredOrders.map((order, index) => {
            const isExpanded = expandedOrders.has(order.id);
            return (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                onPress={() => toggleExpanded(order.id)}
              >
                <View style={styles.orderHeader}>
                  <View style={styles.orderHeaderLeft}>
                    <ThemedText style={styles.orderId}>{order.id}</ThemedText>
                    <IconSymbol
                      name={isExpanded ? "chevron.up" : "chevron.down"}
                      size={16}
                      color="#666"
                    />
                  </View>
                </View>
                {isExpanded && (
                  <View style={styles.expandedContent}>
                    <ThemedText style={styles.orderText}>
                      {order.item} from {order.category}
                    </ThemedText>
                    <ThemedText style={styles.orderUser}>
                      Created by: {order.user}
                    </ThemedText>
                    <ThemedText style={styles.orderDate}>
                      {order.createdAt.toLocaleDateString()} at{" "}
                      {order.createdAt.toLocaleTimeString()}
                    </ThemedText>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
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
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  dateFilterContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  clearButton: {
    paddingHorizontal: 8,
  },
  clearButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "500",
  },
  dateFilterButton: {
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
  dash: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
  },
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
    lineHeight: 22,
  },
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
    marginRight: 8,
    flex: 1,
  },
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E7",
  },
  orderText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    flex: 1,
  },
  orderUser: {
    fontSize: 14,
    fontWeight: "400",
    color: "#666",
    marginTop: 4,
  },
  orderDate: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
  },
});
