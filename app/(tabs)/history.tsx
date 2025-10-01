import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useOrders } from "@/context/OrdersContext";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function HistoryScreen() {
  const { state } = useOrders();
  const { orders } = state;
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

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

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <ThemedText type="title" style={styles.title}>
            History
          </ThemedText>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => {
              Alert.alert("Filters", "Filter functionality coming soon!");
            }}
          >
            <IconSymbol name="plus" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.ordersList}
        showsVerticalScrollIndicator={false}
      >
        {orders.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyStateText}>
              No orders found. Create your first order to see it here.
            </ThemedText>
          </View>
        ) : (
          orders.map((order, index) => {
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
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
