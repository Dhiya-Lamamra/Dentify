import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import EnTete, { couleurs } from "../utils/EnTete";
import {
  getMesCandidatures, formaterDate, formaterHeure, STATUTS_CANDIDATURE, Candidature,
} from "../utils/api";

// Professionnel : toutes ses candidatures et leur statut (en attente / acceptée)
export default function MesCandidatures({ navigation }) {
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const charger = async () => {
    setError("");
    try {
      setCandidatures(await getMesCandidatures());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => navigation.addListener("focus", charger), [navigation]);

  return (
    <View style={styles.container}>
      <EnTete titre="Mes candidatures" navigation={navigation} />

      {loading ? (
        <ActivityIndicator size="large" color={couleurs.vert} style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={candidatures}
          keyExtractor={(c) => String(c.id_candidature)}
          contentContainerStyle={{ padding: 16 }}
          ListHeaderComponent={error ? <Text style={styles.error}>{error}</Text> : null}
          ListEmptyComponent={
            <View style={{ alignItems: "center" }}>
              <Text style={styles.vide}>Vous n'avez encore postulé à aucune offre.</Text>
              <TouchableOpacity style={styles.bouton} onPress={() => navigation.navigate("Offre")}>
                <Text style={styles.boutonTexte}>Voir les offres</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => {
            const offre = item.Offre;
            const clinique = offre?.CliniqueDentaire;
            const acceptee = item.statut === "acceptee";
            return (
              <View style={styles.carte}>
                <Text style={styles.titre}>{offre?.titre ?? "Offre"}</Text>
                {clinique ? <Text>{clinique.nom_clinique}</Text> : null}
                {offre ? (
                  <Text>
                    {formaterDate(offre.date_mission)}
                    {offre.heure_debut ? `  ·  ${formaterHeure(offre.heure_debut)} - ${formaterHeure(offre.heure_fin)}` : ""}
                  </Text>
                ) : null}
                <Text style={[styles.statut, acceptee && { color: couleurs.vert }]}>
                  {STATUTS_CANDIDATURE[item.statut] ?? item.statut}
                </Text>
                {offre?.statut === "archivée" && !acceptee ? (
                  <Text style={styles.archivee}>Offre retirée par la clinique</Text>
                ) : null}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: couleurs.beige },
  carte: {
    backgroundColor: "white",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: couleurs.bordure,
  },
  titre: { fontSize: 17, fontWeight: "bold", color: couleurs.bleu, marginBottom: 4 },
  statut: { fontWeight: "bold", marginTop: 8, color: "#b8860b" },
  archivee: { color: "#999", fontStyle: "italic", marginTop: 4 },
  vide: { textAlign: "center", color: "#777", marginTop: 30, marginBottom: 16 },
  bouton: { backgroundColor: couleurs.vert, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  boutonTexte: { color: "white", fontWeight: "bold" },
  error: { color: "red", textAlign: "center", marginBottom: 10 },
});
