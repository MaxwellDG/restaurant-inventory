import { IconSymbol } from "@/components/ui/icon-symbol";
import { useLogoutMutation } from "@/redux/auth/apiSlice";
import { removeRefreshToken } from "@/redux/auth/secureStorage";
import { clearCredentials } from "@/redux/auth/slice";
import { RootState } from "@/redux/store";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

export default function SettingsScreen() {
  const { t } = useTranslation();
  const [logout, { isLoading }] = useLogoutMutation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleExportData = () => {
    router.push("/export-data");
  };

  const handleLogout = () => {
    Alert.alert(t("settings.logoutTitle"), t("settings.logoutConfirm"), [
      {
        text: t("settings.cancel"),
        style: "cancel",
      },
      {
        text: t("settings.logout"),
        style: "destructive",
        onPress: async () => {
          try {
            await logout().unwrap();
            dispatch(clearCredentials());
            await removeRefreshToken();
            router.replace("/");
          } catch (error) {
            // Even if logout fails on server, clear local credentials
            dispatch(clearCredentials());
            await removeRefreshToken();
            router.replace("/");
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{t("settings.title")}</Text>

      {/* User Info Section */}
      {user && (
        <View style={styles.section}>
          <View style={styles.userInfo}>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.exportButton}
          onPress={handleExportData}
        >
          <View style={styles.exportContent}>
            <IconSymbol name="square.and.arrow.up" size={24} color="#007AFF" />
            <Text style={styles.exportText}>{t("settings.exportData")}</Text>
          </View>
          <IconSymbol name="chevron.right" size={16} color="#999" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => router.push("/members")}
        >
          <Text style={styles.sectionTitle}>{t("settings.members")}</Text>
          <IconSymbol name="chevron.right" size={16} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Logout Section */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[
            styles.logoutButton,
            isLoading && styles.logoutButtonDisabled,
          ]}
          onPress={handleLogout}
          disabled={isLoading}
        >
          <View style={styles.logoutContent}>
            <IconSymbol
              name="rectangle.portrait.and.arrow.right"
              size={24}
              color="#FF3B30"
            />
            <Text style={styles.logoutText}>
              {isLoading ? t("settings.loggingOut") : t("settings.logout")}
            </Text>
          </View>
        </TouchableOpacity>
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
  exportButton: {
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
  exportContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  exportText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginLeft: 12,
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
  userInfo: {
    paddingVertical: 15,
    paddingHorizontal: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
  },
  logoutButton: {
    paddingVertical: 15,
    paddingHorizontal: 16,
    backgroundColor: "#fff5f5",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fed7d7",
  },
  logoutButtonDisabled: {
    backgroundColor: "#f7f7f7",
    borderColor: "#e0e0e0",
  },
  logoutContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoutText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FF3B30",
    marginLeft: 12,
  },
});
