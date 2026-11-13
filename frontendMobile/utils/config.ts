import { Platform } from "react-native";
import Constants from "expo-constants";

/**
 * Adresse du backend (API Express).
 *
 * Problème : sur un vrai téléphone, "localhost" désigne le TÉLÉPHONE lui-même,
 * pas ton PC. Il faut donc l'IP du PC sur le Wi-Fi (ex : 192.168.1.20).
 *
 * Ordre de priorité :
 *  1. EXPO_PUBLIC_API_URL (si tu la définis dans un fichier .env) → utilisée telle quelle
 *  2. Version web (navigateur) → même machine que la page, donc localhost
 *  3. Expo Go / émulateur → on reprend l'IP que Metro utilise déjà pour envoyer
 *     l'app au téléphone (Constants.expoConfig.hostUri = "192.168.1.20:8081")
 *  4. Sinon, localhost
 */
const PORT_API = 4000;

function trouverApiUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (Platform.OS === "web") {
    return `http://localhost:${PORT_API}/api`;
  }

  const hostUri = Constants.expoConfig?.hostUri; // ex : "192.168.1.20:8081"
  if (hostUri) {
    const ipDuPc = hostUri.split(":")[0];
    return `http://${ipDuPc}:${PORT_API}/api`;
  }

  return `http://localhost:${PORT_API}/api`;
}

export const API_URL = trouverApiUrl();
