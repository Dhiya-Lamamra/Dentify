import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import EnTete, { couleurs } from "../utils/EnTete";
import {
  getCandidatsOffre, accepterCandidature, formaterDate, nomAffiche,
  STATUTS_CANDIDATURE, Candidature,
} from "../utils/api";

// Clinique : liste des professionnels qui ont postulé à UNE offre. Paramètres : { id_offre, titre }
export default function CandidatsOffre({ navigation, route }) {
  const { id_offre, titre } = route.params;
  const [candidats, setCandidats] = useState<Candidature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const charger = async () => {
    setError("");
    try {
      setCandidats(await getCandidatsOffre(id_offre));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => navigation.addListener("focus", charger), [navigation]);

  const handleAccepter = async (id_candidature: number) => {
    try {
      await accepterCandidature(id_candidature);
      // Mise à jour locale du statut, sans tout recharger
      setCandidats((prev) =>
        prev.map((c) => (c.id_candidature === id_candidature ? { ...c, statut: "acceptee" } : c))
      );
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <View style={styles.container}>
      <EnTete titre={`Candidats — ${titre}`} navigation={navigation} />

      {loading ? (
        <ActivityIndicator size="large" color={couleurs.vert} style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={candidats}
          keyExtractor={(c) => String(c.id_candidature)}
          contentContainerStyle={{ padding: 16 }}
          ListHeaderComponent={error ? <Text style={styles.error}>{error}</Text> : null}
          ListEmptyComponent={<Text style={styles.vide}>Personne n'a encore postulé à cette offre.</Text>}
          renderItem={({ item }) => {
            const pro = item.ProfessionnelDentaire;
            const user = pro?.Utilisateur;
            const acceptee = item.statut === "acceptee";
            return (
              <View style={styles.carte}>
                <Text style={styles.nom}>{user ? nomAffiche(user) : "Professionnel"}</Text>
                {pro?.type_profession ? <Text>{pro.type_profession}</Text> : null}
                {pro?.annees_experience != null ? <Text>{pro.annees_experience} ans d'expérience</Text> : null}
                {user?.ville ? <Text>{user.ville}</Text> : null}
                <Text style={styles.date}>Postulé le {formaterDate(item.date_candidature)}</Text>
                {item.message_personnalise ? <Text style={styles.message}>« {item.message_personnalise} »</Text> : null}

                <Text style={[styles.statut, acceptee && { color: couleurs.vert }]}>
                  {STATUTS_CANDIDATURE[item.statut] ?? item.statut}
                </Text>

                <View style={styles.actions}>
                  {!acceptee && (
                    <TouchableOpacity style={styles.bouton} onPress={() => handleAccepter(item.id_candidature)}>
                      <Text style={styles.boutonTexte}>Accepter</Text>
                    </TouchableOpacity>
                  )}
                  {user && (
                    <TouchableOpacity
                      style={[styles.bouton, { backgroundColor: couleurs.bleu }]}
                      onPress={() =>
                        navigation.navigate("ChatScreen", { id_utilisateur: user.id_utilisateur, nom: nomAffiche(user) })
                      }
                    >
                      <Text style={styles.boutonTexte}>Écrire</Text>
                    </TouchableOpacity>
                  )}
                </View>
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
  nom: { fontSize: 17, fontWeight: "bold", color: couleurs.bleu, marginBottom: 4 },
  date: { color: "#777", marginTop: 6 },
  message: { fontStyle: "italic", marginTop: 6 },
  statut: { fontWeight: "bold", marginTop: 8, color: "#b8860b" },
  actions: { flexDirection: "row", marginTop: 10, gap: 10 },
  bouton: { flex: 1, backgroundColor: couleurs.vert, padding: 10, borderRadius: 8, alignItems: "center" },
  boutonTexte: { color: "white", fontWeight: "bold" },
  vide: { textAlign: "center", color: "#777", marginTop: 30 },
  error: { color: "red", textAlign: "center", marginBottom: 10 },
});
