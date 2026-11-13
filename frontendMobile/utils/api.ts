import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "./config";

// ─────────────────────────────────────────────────────────────
// 1. Session : le token JWT + l'utilisateur connecté
// ─────────────────────────────────────────────────────────────
// AsyncStorage = l'équivalent de localStorage sur mobile.
// On y garde le token pour rester connecté même après avoir fermé l'app.

export type TypeUtilisateur = "clinique" | "professionnel";

export type Utilisateur = {
  id_utilisateur: number;
  nom: string;
  prenom: string;
  courriel: string;
  type_utilisateur: TypeUtilisateur;
};

const CLE_TOKEN = "token";
const CLE_USER = "user";

export async function sauverSession(token: string, user: Utilisateur) {
  await AsyncStorage.multiSet([
    [CLE_TOKEN, token],
    [CLE_USER, JSON.stringify(user)],
  ]);
}

export async function lireUtilisateur(): Promise<Utilisateur | null> {
  const brut = await AsyncStorage.getItem(CLE_USER);
  return brut ? JSON.parse(brut) : null;
}

export async function deconnecter() {
  await AsyncStorage.multiRemove([CLE_TOKEN, CLE_USER]);
}

// ─────────────────────────────────────────────────────────────
// 2. apiFetch : UNE seule fonction pour parler au backend
// ─────────────────────────────────────────────────────────────
// - ajoute l'URL de base
// - ajoute automatiquement "Authorization: Bearer <token>" si on est connecté
// - transforme une erreur HTTP (400, 401, 403...) en exception avec le message du backend

type Options = { method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"; body?: unknown };

export async function apiFetch<T = any>(endpoint: string, { method = "GET", body }: Options = {}): Promise<T> {
  const token = await AsyncStorage.getItem(CLE_TOKEN);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    // fetch échoue seulement si le serveur est injoignable (backend éteint, mauvaise IP, pare-feu...)
    throw new Error(`Impossible de joindre le serveur (${API_URL}). Le backend est-il lancé ?`);
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || `Erreur ${response.status}`);
  }
  return data as T;
}

// ─────────────────────────────────────────────────────────────
// 3. Fonctions par fonctionnalité (les écrans appellent celles-ci)
// ─────────────────────────────────────────────────────────────

type ReponseAuth = { token: string; user: Utilisateur };

export async function connexion(courriel: string, mot_de_passe: string) {
  const data = await apiFetch<ReponseAuth>("/users/login", {
    method: "POST",
    body: { courriel, mot_de_passe },
  });
  await sauverSession(data.token, data.user);
  return data.user;
}

// Le backend attend nom + prenom pour un professionnel, nom_clinique pour une clinique
export async function inscription(champs: {
  type_utilisateur: TypeUtilisateur;
  courriel: string;
  mot_de_passe: string;
  nom?: string;
  prenom?: string;
  nom_clinique?: string;
}) {
  const data = await apiFetch<ReponseAuth>("/users/register", { method: "POST", body: champs });
  await sauverSession(data.token, data.user);
  return data.user;
}

// Une offre telle que renvoyée par le backend (table Offre)
export type Offre = {
  id_offre: number;
  id_clinique: number;
  titre: string;
  descript: string;
  type_professionnel: string;
  date_publication: string;
  date_mission: string;
  heure_debut: string | null;
  heure_fin: string | null;
  duree_heures: number | null;
  remuneration: number;
  est_urgent: "Y" | "N";
  statut: string;
  competences_requises: string | null;
  adresse_complete: string | null;
  // Inclus par le backend sur GET /offres et dans les candidatures
  CliniqueDentaire?: { nom_clinique: string; adresse_complete: string | null; id_utilisateur: number };
};

export const getOffres = () => apiFetch<Offre[]>("/offres");
export const getMesOffres = () => apiFetch<Offre[]>("/offres/mes-offres");
export const creerOffre = (offre: Partial<Offre>) =>
  apiFetch<Offre>("/offres/creer", { method: "POST", body: offre });
export const archiverOffre = (id_offre: number) =>
  apiFetch(`/offres/${id_offre}/archive`, { method: "PATCH" });

export const postuler = (id_offre: number, message_personnalise?: string) =>
  apiFetch("/candidatures", { method: "POST", body: { id_offre, message_personnalise } });

// ── Candidatures ──
export type Candidature = {
  id_candidature: number;
  id_offre: number;
  date_candidature: string;
  statut: "en_attente" | "acceptee" | string;
  message_personnalise: string | null;
  Offre?: Offre; // côté professionnel
  ProfessionnelDentaire?: {
    // côté clinique
    type_profession: string;
    annees_experience: number | null;
    Utilisateur: { id_utilisateur: number; nom: string; prenom: string; courriel: string; ville: string };
  };
};

export const getMesCandidatures = () => apiFetch<Candidature[]>("/candidatures/mes-candidatures");
export const getCandidatsOffre = (id_offre: number) => apiFetch<Candidature[]>(`/candidatures/offre/${id_offre}`);
export const accepterCandidature = (id_candidature: number) =>
  apiFetch(`/offres/accepter/${id_candidature}`, { method: "PUT" });

export const STATUTS_CANDIDATURE: Record<string, string> = {
  en_attente: "En attente",
  acceptee: "Acceptée",
  refusee: "Refusée",
};

// ── Profil ──
export type Profil = Utilisateur & {
  adresse: string;
  ville: string;
  province: string;
  code_postal: string;
  profil_complet: boolean;
  professionnel: {
    numero_permis: string;
    type_profession: string;
    annees_experience: number | null;
    tarif_horaire: string | null;
    site_web: string | null;
  } | null;
  clinique: {
    nom_clinique: string;
    numero_entreprise: string;
    adresse_complete: string | null;
    horaire_ouverture: string | null;
    site_web: string | null;
  } | null;
};

export const getProfil = () => apiFetch<Profil>("/users/profile");
// Le backend accepte à plat les champs utilisateur ET pro/clinique (voir updateProfile)
export const majProfil = (champs: Record<string, unknown>) =>
  apiFetch("/users/profile", { method: "PUT", body: champs });

// ── Messagerie ──
export type Interlocuteur = Pick<Utilisateur, "id_utilisateur" | "nom" | "prenom" | "courriel" | "type_utilisateur">;
export type Message = {
  id_message: number;
  id_expediteur: number;
  id_destinataire: number;
  contenu: string;
  timestamp: string;
};

export const getConversations = () => apiFetch<Interlocuteur[]>("/messages/conversations");
export const getMessages = (id_utilisateur: number) => apiFetch<Message[]>(`/messages/${id_utilisateur}`);
export const envoyerMessage = (id_destinataire: number, contenu: string) =>
  apiFetch<Message>("/messages", { method: "POST", body: { id_destinataire, contenu } });

// Une clinique s'appelle "nom" (prenom vide), un pro "prenom nom"
export const nomAffiche = (u: { nom: string; prenom?: string }) => `${u.prenom ?? ""} ${u.nom}`.trim();

// ── Session au démarrage ──
// Renvoie l'utilisateur si le token sauvegardé est encore valide, sinon nettoie et renvoie null.
export async function restaurerSession(): Promise<Utilisateur | null> {
  const user = await lireUtilisateur();
  if (!user) return null;
  try {
    await getProfil(); // échoue (401) si le token est expiré ou le compte supprimé
    return user;
  } catch (e) {
    // Serveur injoignable : on garde la session (on ne déconnecte pas quelqu'un parce que le Wi-Fi coupe)
    if (String(e.message).startsWith("Impossible de joindre")) return user;
    await deconnecter();
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// 4. Petits utilitaires d'affichage
// ─────────────────────────────────────────────────────────────

// date_mission est une colonne DATE (sans heure) : le backend la renvoie comme "2026-11-20T00:00:00.000Z".
// Si on faisait new Date(iso) directement, au Québec (UTC-5) ça afficherait le 19 !
// On garde donc seulement "AAAA-MM-JJ" et on construit la date en heure locale.
export const formaterDate = (iso: string) => {
  const [a, m, j] = iso.slice(0, 10).split("-").map(Number);
  return new Date(a, m - 1, j).toLocaleDateString("fr-CA", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
};

// Date locale du téléphone → "AAAA-MM-JJ" (format attendu pour date_mission)
export const versDateSQL = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const formaterHeure = (iso: string | null) =>
  iso ? new Date(iso).toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" }) : "";
