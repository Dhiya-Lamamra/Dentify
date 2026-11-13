import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

// En-tête simple réutilisé par les nouveaux écrans : bouton retour + titre.
export default function EnTete({ titre, navigation }: { titre: string; navigation: any }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate("Indexx"))}
        style={styles.retour}
        accessibilityLabel="Retour"
      >
        <Feather name="arrow-left" size={24} color="white" />
      </TouchableOpacity>
      <Text style={styles.titre} numberOfLines={1}>{titre}</Text>
      <View style={styles.retour} />
    </View>
  );
}

// Couleurs de l'app, pour que les nouveaux écrans ressemblent aux anciens
export const couleurs = {
  vert: "#6a9174",
  bleu: "#34607d",
  beige: "#fbf2e8",
  bordure: "#ae9f86",
  rouge: "#d9534f",
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: couleurs.vert,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  retour: { width: 36 },
  titre: { flex: 1, textAlign: "center", color: "white", fontSize: 18, fontWeight: "bold" },
});
