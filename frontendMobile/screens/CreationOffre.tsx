import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, Modal, Platform, ActivityIndicator } from "react-native";
import { AntDesign, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { creerOffre, versDateSQL } from "../utils/api";
import { ScrollView } from "react-native-gesture-handler";
import DropDownPicker from 'react-native-dropdown-picker';

export default function CreationOffre({ navigation, route }) {
  const [activePage, setActivePage] = useState("CreationOffre");
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [profession, setProfession] = useState("");
  const [open, setOpen] = useState(false);
  const [professions, setProfessions] = useState([
    { label: "Dentiste", value: "Dentiste" },
    { label: "Assistant dentaire", value: "Assistant dentaire" },
    { label: "Hygiéniste dentaire", value: "Hygieniste dentaire" }
  ]);
  const [date, setDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [heureDebut, setHeureDebut] = useState("");
  const [heureFin, setHeureFin] = useState("");
  const [exigences, setExigences] = useState("");
  const [remuneration, setRemuneration] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNavigation = (page) => {
    setActivePage(page);
    navigation.navigate(page);
  };

  // Alert.alert ne fait rien sur la version web : on utilise window.alert dans ce cas
  const afficherMessage = (titreMsg: string, message: string) => {
    if (Platform.OS === "web") window.alert(`${titreMsg}\n\n${message}`);
    else Alert.alert(titreMsg, message);
  };

  // "9:30" → Date du jour de la mission à 9h30 (heure locale du téléphone), ou null si invalide
  const heureSurDate = (hhmm: string): Date | null => {
    const match = hhmm.trim().match(/^(\d{1,2})[:hH](\d{2})$/);
    if (!match) return null;
    const h = Number(match[1]);
    const m = Number(match[2]);
    if (h > 23 || m > 59) return null;
    const d = new Date(date);
    d.setHours(h, m, 0, 0);
    return d;
  };

  const handlePublier = async () => {
    // 1. Champs obligatoires
    if (!(titre.trim() && description.trim() && profession && heureDebut && heureFin && remuneration)) {
      afficherMessage("Erreur", "Veuillez remplir tous les champs requis.");
      return;
    }

    // 2. Conversion des heures "HH:MM" en vraies dates
    const debut = heureSurDate(heureDebut);
    const fin = heureSurDate(heureFin);
    if (!debut || !fin) {
      afficherMessage("Erreur", "Les heures doivent être au format HH:MM (ex : 09:00).");
      return;
    }
    if (fin <= debut) {
      afficherMessage("Erreur", "L'heure de fin doit être après l'heure de début.");
      return;
    }

    // 3. Rémunération : on accepte "45", "45,50" ou "45$"
    const salaire = parseFloat(remuneration.replace(",", ".").replace(/[^\d.]/g, ""));
    if (isNaN(salaire)) {
      afficherMessage("Erreur", "La rémunération doit être un nombre.");
      return;
    }

    setLoading(true);
    try {
      // 4. On traduit les champs de l'écran vers les noms de colonnes du backend
      await creerOffre({
        titre: titre.trim(),
        descript: description.trim(),
        type_professionnel: profession,
        date_mission: versDateSQL(date),
        heure_debut: debut.toISOString(), // ISO en UTC : aucune ambiguïté de fuseau horaire
        heure_fin: fin.toISOString(),
        duree_heures: Math.round(((fin.getTime() - debut.getTime()) / 3600000) * 100) / 100,
        remuneration: salaire,
        competences_requises: exigences.trim() || null,
      });

      // 5. Réinitialiser le formulaire puis aller voir la liste (qui se recharge depuis le serveur)
      setTitre("");
      setDescription("");
      setProfession("");
      setDate(new Date());
      setHeureDebut("");
      setHeureFin("");
      setExigences("");
      setRemuneration("");
      afficherMessage("Succès", "Votre offre a été publiée avec succès!");
      navigation.navigate("Mesoffres");
    } catch (e) {
      afficherMessage("Erreur", e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Image source={require("../assets/dentify_logo_noir.png")} style={styles.logo} />
            
            <View style={styles.rightIcons}>
              <TextInput style={styles.searchInput} placeholder="Recherche..." placeholderTextColor="#999"/>
              <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('MessageListeScreen')}>
                <AntDesign style={styles.iconText} name="message1" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate("ProfilCli")}>
                <MaterialCommunityIcons style={styles.iconText} name="account-circle-outline" />
              </TouchableOpacity>
            </View>
          </View>




      {/* Page content */}
      <ScrollView style={styles.container2}>
        <Text style={styles.titlecreation}>Création d'une Offre</Text>

        <Text style={styles.label}>Titre de l'offre :</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Titre de l'offre" 
          value={titre} 
          onChangeText={setTitre} 
        />

        {/* Liste déroulante */}
      <Text style={styles.label}>Choisir une profession :</Text>
      <DropDownPicker
          style={styles.input}
          open={open}
          value={profession}
          items={professions}
          setOpen={setOpen}
          setValue={setProfession}
          setItems={setProfessions}
          
          placeholder="Sélectionner une profession"
        />
      


      <Text style={styles.label}>Sélectionner une date :</Text>
      {Platform.OS === "web" ? (
        // Le DateTimePicker natif n'existe pas sur le web : on utilise le champ date du navigateur
        <input
          type="date"
          value={versDateSQL(date)}
          min={versDateSQL(new Date())}
          onChange={(e) => {
            const [a, m, j] = e.target.value.split("-").map(Number);
            if (a && m && j) setDate(new Date(a, m - 1, j));
          }}
          style={{ padding: 10, fontSize: 16, borderRadius: 10, border: "1px solid #ae9f86", marginBottom: 15 }}
        />
      ) : (
      <TouchableOpacity onPress={() => setShowModal(true)} style={styles.datePicker}>
        <AntDesign name="calendar" size={24} color="#6a9174" style={styles.icon} />
        <Text style={styles.dateText}>
          {date.toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
        </Text>
      </TouchableOpacity>
      )}

      {/* Modal pour afficher le DateTimePicker */}
      <Modal transparent={true} animationType="slide" visible={showModal} onRequestClose={() => setShowModal(false)}>
        <TouchableOpacity style={styles.modalBackground} onPress={() => setShowModal(false)}>
          <View style={styles.modalContent}>
            <DateTimePicker value={date} mode="date" display="spinner" onChange={handleDateChange} />
            <TouchableOpacity style={styles.confirmButton} onPress={() => setShowModal(false)}>
              <Text style={styles.confirmText}>Confirmer</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>



      {/* Heure début et fin */}
      <Text style={styles.label}>Heure de début :</Text>
      <TextInput style={styles.input} placeholder="Heure de début (HH:MM)" value={heureDebut} onChangeText={setHeureDebut} />
      <Text style={styles.label}>Heure de fin :</Text>
      <TextInput style={styles.input} placeholder="Heure de fin (HH:MM)" value={heureFin} onChangeText={setHeureFin} />


      <Text style={styles.label}>Description :</Text>
      <TextInput 
          style={[styles.input, styles.inputdesc]} 
          placeholder="Description" 
          value={description} 
          onChangeText={setDescription} 
          multiline 
        />
      
      {/* Exigences et rémunération */}
      <Text style={styles.label}>Exigences (optionnel) :</Text>
      <TextInput style={styles.input} placeholder="Exigences" value={exigences} onChangeText={setExigences} />

      <Text style={styles.label}>Salaire ($) :</Text>
      <TextInput style={styles.input} placeholder="Rémunération (ex : 45)" value={remuneration} onChangeText={setRemuneration} keyboardType="decimal-pad" />

        <TouchableOpacity style={styles.publishButton} onPress={handlePublier} disabled={loading}>
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.publishButtonText}>Publier l'offre</Text>}
        </TouchableOpacity>
      </ScrollView>







      {/* Barre de tâche */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => handleNavigation("Mesoffres")}
        >
          <AntDesign style={styles.footerIcon} name="calendar" />
          <Text
            style={[
              styles.footerText,
              activePage === "Mesoffres" && styles.activeButtonText,
            ]}
          >
            Mes offres
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => handleNavigation("CreationOffre")}>
          <Ionicons name="create-outline"  size={24} color="black" /> 
          <Text
            style={[
              styles.footerTextClick,
              activePage === "CreationOffre" && styles.activeButtonText,
            ]}
          >
            Création d'une offre
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => handleNavigation("AccueilMoreCli")}
        >
          <AntDesign style={styles.footerIcon} name="ellipsis1" />
          <Text
            style={[
              styles.footerText,
              activePage === "AccueilMore" && styles.activeButtonText,
            ]}
          >
            More
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    backgroundColor: "#fbf2e8",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#6a9174',
  },
  logo: {
    width: 100,
    height: 50,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    width: 120,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    padding: 8,
    backgroundColor: 'white',
    fontSize: 14,
    marginRight: 10,
  },
  iconButton: {
    marginLeft: 10,
  },
  iconText: {
    fontSize: 24,
    color: 'white',
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginTop: 200,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: '#6a9174',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  footerButton: {
    alignItems: 'center',
    flex: 1,
  },
  footerIcon: {
    fontSize: 24,
    color: 'white',
  },
  footerText: {
    fontSize: 12,
    color: 'white',
    marginTop: 5,
  },
  footerTextClick: {
    fontSize: 12,
    color: 'black',
    marginTop: 5,
  },
  activeButtonText: {
    textDecorationLine: "underline",
  },
  container2: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: "#fbf2e8" 
  },
  titlecreation: { 
    fontSize: 24, 
    fontWeight: "bold", 
    textAlign: "center", 
    marginBottom: 20 
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    backgroundColor: "white",
    fontSize: 16,
  },
  inputdesc: { 
    height: 100, 
    textAlignVertical: "top" 
  },
  publishButton: { 
    backgroundColor: "#6a9174", 
    padding: 15, 
    borderRadius: 8, 
    alignItems: "center" 
  },
  publishButtonText: { 
    color: "white", 
    fontSize: 18, 
    fontWeight: "bold" 
  },
  label: { 
    fontSize: 16, 
    fontWeight: "bold", 
    marginBottom: 5, 
  },
  datePicker: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 10,
    padding: 15,
    backgroundColor: "white",
    marginBottom: 15,
  },
  icon: { 
    marginRight: 10,
  },
  dateText: { 
    fontSize: 16, 
    color: "#333" 
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  confirmButton: {
    marginTop: 10,
    backgroundColor: "#6a9174",
    padding: 10,
    borderRadius: 5,
  },
  confirmText: { 
    color: "white", 
    fontWeight: "bold", 
},

});