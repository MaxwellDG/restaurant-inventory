import { IconSymbol } from "@/components/ui/icon-symbol";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const dummyMembers = [
  { id: 1, name: "John Smith", role: "admin" },
  { id: 2, name: "Sarah Johnson", role: "user" },
  { id: 3, name: "Mike Wilson", role: "user" },
  { id: 4, name: "Emily Davis", role: "user" },
];

export default function SettingsScreen() {
  const [isMembersExpanded, setIsMembersExpanded] = useState(false);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => setIsMembersExpanded(!isMembersExpanded)}
        >
          <Text style={styles.sectionTitle}>Members</Text>
          <IconSymbol
            name={isMembersExpanded ? "chevron.up" : "chevron.down"}
            size={20}
            color="#666"
          />
        </TouchableOpacity>

        {isMembersExpanded && (
          <View style={styles.membersList}>
            {dummyMembers.map((member) => (
              <TouchableOpacity key={member.id} style={styles.memberItem}>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.name}</Text>
                </View>
                <View style={styles.roleContainer}>
                  <Text
                    style={[
                      styles.roleText,
                      { color: member.role === "admin" ? "#FF6B35" : "#666" },
                    ]}
                  >
                    {member.role === "admin" ? "Admin" : "User"}
                  </Text>
                  <IconSymbol name="chevron.right" size={16} color="#999" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  membersList: {
    marginTop: 8,
  },
  memberItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  roleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  roleText: {
    fontSize: 14,
    fontWeight: "500",
    marginRight: 8,
  },
});
