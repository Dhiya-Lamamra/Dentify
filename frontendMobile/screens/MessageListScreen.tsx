import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import EnTete, { couleurs } from "../utils/EnTete";
import { getConversations, nomAffiche, Interlocuteur } from "../utils/api";

// Liste des personnes avec qui on a déjà échangé (GET /messages/conversations)
export default function MessageListScreen({ navigation }) {
  const [conversations, setConversations] = useState<Interlocuteur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const charger = async () => {
    setError("");
    try {
      setConversations(await getConversations());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Recharge en revenant d'une conversation (un nouveau contact a pu apparaître)
  useEffect(() => navigation.addListener("focus", charger), [navigation]);

  return (
    <View style={styles.container}>
      <EnTete titre="Messages" navigation={navigation} />

      {loading ? (
        <ActivityIndicator size="large" color={couleurs.vert} style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => String(item.id_utilisateur)}
          contentContainerStyle={{ padding: 16 }}
          ListHeaderComponent={error ? <Text style={styles.error}>{error}</Text> : null}
          ListEmptyComponent={
            <Text style={styles.vide}>
              Aucune conversation pour le moment.{"\n"}
              Les échanges commencent depuis une candidature.
            </Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.ligne}
              onPress={() =>
                navigation.navigate("ChatScreen", { id_utilisateur: item.id_utilisateur, nom: nomAffiche(item) })
              }
            >
              <MaterialCommunityIcons
                name={item.type_utilisateur === "clinique" ? "hospital-building" : "account-circle"}
                size={40}
                color={couleurs.vert}
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.nom}>{nomAffiche(item)}</Text>
                <Text style={styles.type}>{item.type_utilisateur === "clinique" ? "Clinique" : "Professionnel"}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: couleurs.beige },
  ligne: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: couleurs.bordure,
  },
  nom: { fontSize: 16, fontWeight: "bold", color: couleurs.bleu },
  type: { color: "#666", marginTop: 2 },
  vide: { textAlign: "center", color: "#777", marginTop: 30, lineHeight: 22 },
  error: { color: "red", textAlign: "center", marginBottom: 10 },
});
