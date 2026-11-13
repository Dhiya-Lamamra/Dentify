import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { restaurerSession } from "./utils/api";

import Inscription from "./screens/Inscription";
import Accueil from "./screens/Accueil";
import ConnexionCli from "./screens/ConnexionCli";
import InscriptionCli from "./screens/InscriptionCli";
import ContactScreen from "./screens/Contact";
import Connexions from "./screens/Connexions";
import AboutScreen from "./screens/AboutUs";
import Profil from "./screens/Profil";
import ProfilCli from "./screens/ProfilCli";
import AccueilMore from "./screens/AccueilMore";
import AccueilMoreCli from "./screens/AccueilMoreCli";
import Mesoffres from "./screens/Mesoffres";
import CreationOffre from "./screens/CreationOffre";
import Indexx from "./screens/Indexx";
import Professions from "./screens/Professions";
import Fonctionnalite from "./screens/Fonctionnalite";
import AccueilClinique from "./screens/AccueilClinique";
import Offre from "./screens/Offre";
import Horaire from "./screens/Horaire";
import MessageListScreen from "./screens/MessageListScreen";
import ChatScreen from "./screens/ChatScreen";
import MesCandidatures from "./screens/MesCandidatures";
import CandidatsOffre from "./screens/CandidatsOffre";
import Menu from "./screens/Menu";


const Stack = createStackNavigator();

export default function Navigation() {
  // null = on vérifie encore la session ; sinon le nom du premier écran à afficher
  const [ecranDepart, setEcranDepart] = useState(null);

  // Au lancement : si un token valide est sauvegardé, on va directement à l'accueil du bon type de compte
  useEffect(() => {
    restaurerSession().then((user) => {
      if (!user) setEcranDepart("Indexx");
      else setEcranDepart(user.type_utilisateur === "clinique" ? "AccueilClinique" : "Accueil");
    });
  }, []);

  if (!ecranDepart) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fbf2e8" }}>
        <ActivityIndicator size="large" color="#6a9174" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={ecranDepart}
        // Sur le web, la navigation laisse sinon chaque écran grandir avec son contenu
        // (min-height: 100%) en comptant sur le défilement de <body>, qu'Expo bloque
        // (overflow: hidden) : résultat, rien ne défile. flex: 1 fixe la hauteur de
        // l'écran à celle de la fenêtre, et les ScrollView défilent normalement.
        screenOptions={{ cardStyle: { flex: 1 } }}
      >

        <Stack.Screen name="Inscription" component={Inscription} />
        <Stack.Screen name="Accueil" component={Accueil} />
        <Stack.Screen name="ConnexionCli" component={ConnexionCli} />
        <Stack.Screen name="InscriptionCli" component={InscriptionCli} />
        <Stack.Screen name="Contact" component={ContactScreen} />
        <Stack.Screen name="Connexions" component={Connexions} />
        <Stack.Screen name="AboutUs" component={AboutScreen} />
        <Stack.Screen name="Profil" component={Profil} options={{ headerShown: false }} />
        <Stack.Screen name="ProfilCli" component={ProfilCli} options={{ headerShown: false }} />
        <Stack.Screen name="AccueilMore" component={AccueilMore} />
        <Stack.Screen name="AccueilMoreCli" component={AccueilMoreCli} />
        <Stack.Screen name="Mesoffres" component={Mesoffres} />
        <Stack.Screen name="CreationOffre" component={CreationOffre} />
        <Stack.Screen name="Indexx" component={Indexx} />
        <Stack.Screen name="Professions" component={Professions} />
        <Stack.Screen name="Fonctionnalite" component={Fonctionnalite} />
        <Stack.Screen name="AccueilClinique" component={AccueilClinique} />
        <Stack.Screen name="Offre" component={Offre} />
        <Stack.Screen name="Horaire" component={Horaire} />

        {/* Nouveaux écrans : ils ont leur propre en-tête (utils/EnTete.tsx) */}
        <Stack.Screen name="MessageListeScreen" component={MessageListScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ChatScreen" component={ChatScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MesCandidatures" component={MesCandidatures} options={{ headerShown: false }} />
        <Stack.Screen name="CandidatsOffre" component={CandidatsOffre} options={{ headerShown: false }} />
        <Stack.Screen name="menu" component={Menu} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
