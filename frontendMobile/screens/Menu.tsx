import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import EnTete, { couleurs } from "../utils/EnTete";

// Menu des pages publiques (bouton "Menu" de Indexx, Fonctionnalite et Professions)
const LIENS: { titre: string; ecran: string; icone: keyof typeof Feather.glyphMap }[] = [
  { titre: "Accueil", ecran: "Indexx", icone: "home" },
  { titre: "Fonctionnalités", ecran: "Fonctionnalite", icone: "grid" },
  { titre: "Nos professions", ecran: "Professions", icone: "users" },
  { titre: "À propos", ecran: "AboutUs", icone: "info" },
  { titre: "Contact", ecran: "Contact", icone: "mail" },
  { titre: "Connexion professionnel", ecran: "Connexions", icone: "log-in" },
  { titre: "Connexion clinique", ecran: "ConnexionCli", icone: "log-in" },
  { titre: "Créer un compte", ecran: "Inscription", icone: "user-plus" },
];

export default function Menu({ navigation }) {
  return (
    <View style={styles.container}>
      <EnTete titre="Menu" navigation={navigation} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {LIENS.map((lien) => (
          <TouchableOpacity key={lien.ecran} style={styles.ligne} onPress={() => navigation.navigate(lien.ecran)}>
            <Feather name={lien.icone} size={20} color={couleurs.vert} />
            <Text style={styles.texte}>{lien.titre}</Text>
            <Feather name="chevron-right" size={20} color="#aaa" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: couleurs.beige },
  ligne: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: couleurs.bordure,
  },
  texte: { flex: 1, marginLeft: 12, fontSize: 16, color: couleurs.bleu, fontWeight: "600" },
});
