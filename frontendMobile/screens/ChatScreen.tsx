import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import EnTete, { couleurs } from "../utils/EnTete";
import { getMessages, envoyerMessage, lireUtilisateur, Message } from "../utils/api";

const INTERVALLE_RAFRAICHISSEMENT = 5000; // ms

// Conversation avec un utilisateur. Paramètres : { id_utilisateur, nom }
export default function ChatScreen({ navigation, route }) {
  const { id_utilisateur, nom } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [moi, setMoi] = useState<number | null>(null);
  const [texte, setTexte] = useState("");
  const [loading, setLoading] = useState(true);
  const [envoi, setEnvoi] = useState(false);
  const [error, setError] = useState("");
  const liste = useRef<FlatList>(null);

  const charger = async () => {
    try {
      setMessages(await getMessages(id_utilisateur));
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Mon id : pour savoir quels messages afficher à droite (les miens) ou à gauche
    lireUtilisateur().then((u) => setMoi(u?.id_utilisateur ?? null));
    charger();
    // Pas de temps réel (WebSocket) dans le backend : on redemande les messages toutes les 5 s
    const timer = setInterval(charger, INTERVALLE_RAFRAICHISSEMENT);
    return () => clearInterval(timer); // arrêté quand on quitte l'écran
  }, [id_utilisateur]);

  const handleEnvoyer = async () => {
    const contenu = texte.trim();
    if (!contenu || envoi) return;
    setEnvoi(true);
    try {
      const nouveau = await envoyerMessage(id_utilisateur, contenu);
      setMessages((prev) => [...prev, nouveau]); // affichage immédiat sans attendre le prochain rafraîchissement
      setTexte("");
    } catch (e) {
      setError(e.message);
    } finally {
      setEnvoi(false);
    }
  };

  const heure = (iso: string) =>
    new Date(iso).toLocaleString("fr-CA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <EnTete titre={nom || "Conversation"} navigation={navigation} />

      {loading ? (
        <ActivityIndicator size="large" color={couleurs.vert} style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          ref={liste}
          data={messages}
          keyExtractor={(m) => String(m.id_message)}
          contentContainerStyle={{ padding: 12 }}
          onContentSizeChange={() => liste.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={<Text style={styles.vide}>Aucun message. Écrivez le premier !</Text>}
          renderItem={({ item }) => {
            const estMoi = item.id_expediteur === moi;
            return (
              <View style={[styles.bulle, estMoi ? styles.bulleMoi : styles.bulleAutre]}>
                <Text style={estMoi ? styles.texteMoi : styles.texteAutre}>{item.contenu}</Text>
                <Text style={[styles.heure, estMoi && { color: "#e8f0ea" }]}>{heure(item.timestamp)}</Text>
              </View>
            );
          }}
        />
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.saisie}>
        <TextInput
          style={styles.input}
          placeholder="Votre message..."
          value={texte}
          onChangeText={setTexte}
          multiline
        />
        <TouchableOpacity style={styles.envoyer} onPress={handleEnvoyer} disabled={envoi || !texte.trim()}>
          {envoi ? <ActivityIndicator color="white" /> : <Feather name="send" size={20} color="white" />}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: couleurs.beige },
  bulle: { maxWidth: "80%", padding: 10, borderRadius: 12, marginBottom: 8 },
  bulleMoi: { alignSelf: "flex-end", backgroundColor: couleurs.vert, borderBottomRightRadius: 2 },
  bulleAutre: { alignSelf: "flex-start", backgroundColor: "white", borderBottomLeftRadius: 2, borderWidth: 1, borderColor: "#e3dccf" },
  texteMoi: { color: "white", fontSize: 15 },
  texteAutre: { color: "#222", fontSize: 15 },
  heure: { fontSize: 11, color: "#888", marginTop: 4, alignSelf: "flex-end" },
  vide: { textAlign: "center", color: "#777", marginTop: 30 },
  error: { color: "red", textAlign: "center", padding: 6 },
  saisie: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#e3dccf",
    backgroundColor: "white",
  },
  input: {
    flex: 1,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 15,
    backgroundColor: "white",
  },
  envoyer: {
    marginLeft: 8,
    backgroundColor: couleurs.bleu,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
});
