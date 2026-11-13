import React, { useState } from "react";
import { View, ScrollView, Text, TextInput, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { connexion } from "../utils/api";


export default function ConnexionCli({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Même logique que Connexions.tsx : la redirection dépend du vrai type du compte
  const handleConnexion = async () => {
    if (!email.trim() || !password) {
      setError("Veuillez remplir le courriel et le mot de passe.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const user = await connexion(email.trim(), password);
      const accueil = user.type_utilisateur === "clinique" ? "AccueilClinique" : "Accueil";
      navigation.reset({ index: 0, routes: [{ name: accueil }] });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fbf2e8" }} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

       <TouchableOpacity style={styles.buttonBack} onPress={() => navigation.navigate("Indexx")}>
          <Text style={styles.buttonTextBack}> Retour à la page principale </Text>
        </TouchableOpacity>

      {/* L'image du logo Dentify */}
      <Image source={require("../assets/dentify_logo_noir.png")} style={styles.logo}/>

      <Text style={styles.title}>Connexion en tant que clinique</Text>

        {/* Rentrer les informations pour se connecter */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#666"
        onChangeText={setEmail}
        value={email}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        placeholderTextColor="#666"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleConnexion} disabled={loading}>
        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Se connecter</Text>}
      </TouchableOpacity>

        {/* Si un professionnel ou pas de compte */}
      <View style={styles.linkContainer}>
        <Text style={styles.textNormal}>Vous êtes un professionnel? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Connexions")}>
          <Text style={styles.linkText}>Connexion professionnel</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.linkContainer}>
        <Text style={styles.textNormal}>Première fois? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("InscriptionCli")}>
          <Text style={styles.linkText}>Créer un compte</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flexGrow: 1, // flexGrow (et non flex) : le contenu peut dépasser l'écran et défiler
    backgroundColor: "#fbf2e8", 
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  logo: {
    width: 200, 
    height: 200,
    marginBottom: 0,
    resizeMode: "contain", 
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#34607d", 
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ae9f86", 
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#6a9174", 
    paddingVertical: 12,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  linkContainer: {
    flexDirection: "row",
    marginTop: 15,
  },
  textNormal: {
    fontSize: 14,
    color: "#333",
  },
  linkText: {
    fontSize: 14,
    color: "#34607d", 
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
  },
  buttonBack: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 10,
    backgroundColor: "#34607d",
    padding: 10,
    borderRadius: 10,
  },
  buttonTextBack: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
