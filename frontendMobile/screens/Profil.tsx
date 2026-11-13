import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  ActivityIndicator, KeyboardTypeOptions,
} from "react-native";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import EnTete, { couleurs } from "../utils/EnTete";
import { getProfil, majProfil, deconnecter, Profil as ProfilType } from "../utils/api";

// Un champ du formulaire : clé envoyée au backend + libellé + limite de la colonne en base
type Champ = { cle: string; label: string; max?: number; clavier?: KeyboardTypeOptions; obligatoire?: boolean };

// Champs obligatoires = ceux que le backend vérifie pour "profil_complet"
const CHAMPS_PRO: Champ[] = [
  { cle: "prenom", label: "Prénom", max: 100, obligatoire: true },
  { cle: "nom", label: "Nom", max: 100, obligatoire: true },
  { cle: "type_profession", label: "Profession (ex : Dentiste)", max: 20, obligatoire: true },
  { cle: "numero_permis", label: "Numéro de permis", max: 10, obligatoire: true },
  { cle: "annees_experience", label: "Années d'expérience", clavier: "number-pad" },
  { cle: "tarif_horaire", label: "Tarif horaire ($)", clavier: "decimal-pad" },
  { cle: "adresse", label: "Adresse", max: 50, obligatoire: true },
  { cle: "ville", label: "Ville", max: 50, obligatoire: true },
  { cle: "province", label: "Province", max: 25 },
  { cle: "code_postal", label: "Code postal", max: 10, obligatoire: true },
  { cle: "site_web", label: "Site web", max: 100 },
];

const CHAMPS_CLINIQUE: Champ[] = [
  { cle: "nom_clinique", label: "Nom de la clinique", max: 100, obligatoire: true },
  { cle: "numero_entreprise", label: "Numéro d'entreprise (NEQ)", max: 10, obligatoire: true },
  { cle: "adresse_complete", label: "Adresse complète de la clinique", max: 255, obligatoire: true },
  { cle: "adresse", label: "Adresse", max: 50, obligatoire: true },
  { cle: "ville", label: "Ville", max: 50, obligatoire: true },
  { cle: "province", label: "Province", max: 25 },
  { cle: "code_postal", label: "Code postal", max: 10, obligatoire: true },
  { cle: "horaire_ouverture", label: "Heures d'ouverture", max: 500 },
  { cle: "site_web", label: "Site web", max: 100 },
];

const CHAMPS_NUMERIQUES = ["annees_experience", "tarif_horaire"];

// Aplatit la réponse du backend (user + professionnel/clinique) en { cle: "texte" } pour les TextInput
function versFormulaire(p: ProfilType): Record<string, string> {
  const tout = { ...p, ...(p.professionnel ?? {}), ...(p.clinique ?? {}) };
  const form: Record<string, string> = {};
  [...CHAMPS_PRO, ...CHAMPS_CLINIQUE].forEach(({ cle }) => {
    form[cle] = tout[cle] != null ? String(tout[cle]) : "";
  });
  return form;
}

// Écran de profil pour les DEUX types de compte (ProfilCli réutilise ce composant)
export default function Profil({ navigation }) {
  const [profil, setProfil] = useState<ProfilType | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [succes, setSucces] = useState("");

  const charger = async () => {
    try {
      const p = await getProfil();
      setProfil(p);
      setForm(versFormulaire(p));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    charger();
  }, []);

  const estClinique = profil?.type_utilisateur === "clinique";
  const champs = estClinique ? CHAMPS_CLINIQUE : CHAMPS_PRO;

  const handleEnregistrer = async () => {
    setError("");
    setSucces("");
    // On n'envoie que les champs de ce type de compte, en nombres pour les champs numériques
    const donnees: Record<string, unknown> = {};
    for (const { cle } of champs) {
      const valeur = form[cle].trim();
      if (CHAMPS_NUMERIQUES.includes(cle)) {
        if (valeur === "") continue; // vide = on ne touche pas à la valeur existante
        const n = Number(valeur.replace(",", "."));
        if (isNaN(n)) {
          setError(`« ${champs.find((c) => c.cle === cle)?.label} » doit être un nombre.`);
          return;
        }
        donnees[cle] = n;
      } else {
        donnees[cle] = valeur;
      }
    }
    // Pour une clinique, "nom" (Utilisateur) = nom affiché dans la messagerie : on le garde synchronisé
    if (estClinique) donnees.nom = donnees.nom_clinique;

    setSaving(true);
    try {
      await majProfil(donnees);
      await charger(); // relit le profil (et recalcule "profil complet")
      setIsEditing(false);
      setSucces("Profil mis à jour.");
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeconnexion = async () => {
    await deconnecter();
    navigation.reset({ index: 0, routes: [{ name: "Indexx" }] });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <EnTete titre="Mon profil" navigation={navigation} />
        <ActivityIndicator size="large" color={couleurs.vert} style={{ marginTop: 30 }} />
      </View>
    );
  }

  if (!profil) {
    return (
      <View style={styles.container}>
        <EnTete titre="Mon profil" navigation={navigation} />
        <Text style={styles.error}>{error || "Profil introuvable."}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <EnTete titre="Mon profil" navigation={navigation} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.entete}>
          <MaterialCommunityIcons
            name={estClinique ? "hospital-building" : "account-circle"}
            size={90}
            color={couleurs.vert}
          />
          <Text style={styles.nom}>
            {estClinique ? profil.clinique?.nom_clinique ?? profil.nom : `${profil.prenom} ${profil.nom}`}
          </Text>
          <Text style={styles.courriel}>{profil.courriel}</Text>
          <Text style={styles.type}>{estClinique ? "Clinique" : "Professionnel"}</Text>
        </View>

        {!profil.profil_complet && (
          <View style={styles.alerte}>
            <Feather name="alert-circle" size={18} color="#8a6d3b" />
            <Text style={styles.alerteTexte}>
              Profil incomplet : remplissez les champs marqués d'un *.
            </Text>
          </View>
        )}

        {succes ? <Text style={styles.succes}>{succes}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {champs.map(({ cle, label, max, clavier, obligatoire }) => (
          <View key={cle} style={styles.champ}>
            <Text style={styles.label}>{label}{obligatoire ? " *" : ""}</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={form[cle]}
                onChangeText={(t) => setForm((f) => ({ ...f, [cle]: t }))}
                maxLength={max}
                keyboardType={clavier}
                autoCapitalize={cle === "site_web" ? "none" : "sentences"}
              />
            ) : (
              <Text style={styles.valeur}>{form[cle] || "—"}</Text>
            )}
          </View>
        ))}

        {isEditing ? (
          <View style={styles.rangee}>
            <TouchableOpacity
              style={[styles.bouton, { backgroundColor: "#999" }]}
              onPress={() => {
                setForm(versFormulaire(profil)); // annule les modifications
                setIsEditing(false);
                setError("");
              }}
            >
              <Text style={styles.boutonTexte}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bouton} onPress={handleEnregistrer} disabled={saving}>
              {saving ? <ActivityIndicator color="white" /> : <Text style={styles.boutonTexte}>Enregistrer</Text>}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.bouton}
            onPress={() => {
              setSucces("");
              setIsEditing(true);
            }}
          >
            <Text style={styles.boutonTexte}>Modifier le profil</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.deconnexion} onPress={handleDeconnexion}>
          <Feather name="log-out" size={18} color={couleurs.rouge} />
          <Text style={styles.deconnexionTexte}>Se déconnecter</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: couleurs.beige },
  content: { padding: 20, paddingBottom: 40 },
  entete: { alignItems: "center", marginBottom: 16 },
  nom: { fontSize: 22, fontWeight: "bold", color: couleurs.bleu, marginTop: 6, textAlign: "center" },
  courriel: { color: "#666", marginTop: 2 },
  type: { color: couleurs.vert, fontWeight: "bold", marginTop: 4 },
  alerte: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fcf8e3",
    borderColor: "#faebcc",
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  alerteTexte: { color: "#8a6d3b", marginLeft: 8, flex: 1 },
  champ: { marginBottom: 12 },
  label: { color: couleurs.vert, fontSize: 13, marginBottom: 4, fontWeight: "600" },
  valeur: { fontSize: 16, color: "#222" },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: couleurs.bordure,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  rangee: { flexDirection: "row", gap: 10 },
  bouton: {
    flex: 1,
    backgroundColor: couleurs.vert,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  boutonTexte: { color: "white", fontWeight: "bold", fontSize: 16 },
  deconnexion: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    padding: 12,
  },
  deconnexionTexte: { color: couleurs.rouge, fontWeight: "bold", marginLeft: 8, fontSize: 16 },
  succes: { color: couleurs.vert, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  error: { color: "red", textAlign: "center", marginVertical: 10 },
});
