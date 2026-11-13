import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import { AntDesign, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { getMesCandidatures, formaterDate, formaterHeure, Candidature } from '../utils/api';


// Mon horaire = mes candidatures ACCEPTÉES par une clinique, triées par date de mission
const Horaire = ({navigation}) => {
  const [missions, setMissions] = useState<Candidature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const charger = async () => {
    setError("");
    try {
      const toutes = await getMesCandidatures();
      setMissions(
        toutes
          .filter((c) => c.statut === "acceptee" && c.Offre)
          .sort((a, b) => a.Offre.date_mission.localeCompare(b.Offre.date_mission))
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => navigation.addListener('focus', charger), [navigation]);

  
  return (
    <View style={styles.container}>
      <ScrollView
              contentContainerStyle={styles.scrollContainer} // Permet au contenu de s'étendre
              style={styles.scrollView} // Prend toute la hauteur disponible
            >
        {/* Header animé */}
        <View style={styles.header}>
                <Image 
                  source={require('../assets/dentify_logo_noir.png')} 
                  style={styles.logo}
                  resizeMode="contain"
                />
                
                <View style={styles.rightIcons}>
                  <TextInput 
                    style={styles.searchInput} 
                    placeholder="Recherche..." 
                    placeholderTextColor="#999"
                  />
                  <TouchableOpacity 
                    style={styles.iconButton}
                    onPress={() => navigation.navigate('MessageListeScreen')}
                  >
                    <AntDesign name="message1" style={styles.iconText} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.iconButton}
                    onPress={() => navigation.navigate('Profil')}
                  >
                    <MaterialCommunityIcons name="account-circle-outline" style={styles.iconText} />
                  </TouchableOpacity>
                </View>
        </View>

        {/* Contenu principal */}
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Mon horaire</Text>
          
          {loading && <ActivityIndicator size="large" color="#6a9174" style={{ marginTop: 30 }} />}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {!loading && !error && missions.length === 0 && (
            <Text style={styles.emptyText}>
              Aucune mission confirmée pour le moment.{"\n"}Vos candidatures acceptées apparaîtront ici.
            </Text>
          )}

          {missions.map(({ id_candidature, Offre: offre }) => {
            const clinique = offre.CliniqueDentaire;
            return (
              <View key={id_candidature} style={styles.appointmentCard}>
                <Text style={styles.appointmentDate}>{formaterDate(offre.date_mission)}</Text>
                {offre.heure_debut ? (
                  <View style={styles.timeContainer}>
                    <Text style={styles.appointmentTime}>
                      {formaterHeure(offre.heure_debut)} - {formaterHeure(offre.heure_fin)}
                    </Text>
                  </View>
                ) : null}
                <View style={styles.detailsContainer}>
                  <Text style={styles.patientName}>{clinique?.nom_clinique ?? "Clinique"}</Text>
                  <Text style={styles.procedure}>{offre.titre}</Text>
                  {clinique?.adresse_complete ? <Text style={styles.procedure}>{clinique.adresse_complete}</Text> : null}
                </View>
                {clinique ? (
                  <View style={styles.actionsContainer}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() =>
                        navigation.navigate('ChatScreen', {
                          id_utilisateur: clinique.id_utilisateur,
                          nom: clinique.nom_clinique,
                        })
                      }
                    >
                      <Text style={styles.actionText}>Contacter la clinique</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer - Identique à l'original */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.footerButton}
            onPress={() => navigation.navigate('Horaire')}
          >
            <AntDesign name="profile" size={24} color={"black"}/>
            <Text style={styles.footerTextClick}>Mon horaire</Text>
          </TouchableOpacity>
              
          <TouchableOpacity 
            style={styles.footerButton}
            onPress={() => navigation.navigate('Offre')}
          >
            <MaterialIcons name="work-outline" size={24} color={"white"}/>
            <Text style={styles.footerText}> Offres </Text>
          </TouchableOpacity>
      
          <TouchableOpacity
            style={styles.footerButton}
            onPress={() => navigation.navigate('MesCandidatures')}
          >
            <AntDesign name="calendar" size={24} color={"white"} />
            <Text style={styles.footerText}>Candidatures</Text>
          </TouchableOpacity>
              
          <TouchableOpacity 
            style={styles.footerButton}
            onPress={() => navigation.navigate('AccueilMore')}
          >
            <MaterialIcons name="more-horiz" size={24} color={"white"} />
            <Text style={styles.footerText}>Plus</Text>
          </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#777',
    marginTop: 20,
    lineHeight: 22,
  },
  iconText: {
    fontSize: 24,
    color: 'white',
  },
  container: {
    flex: 1,
    backgroundColor: '#fbf2e8',
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 80, // Pour le footer
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#6a9174',
    width: '100%',
  },
  content: {
    padding: 15,
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
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#34607d',
    marginBottom: 20,
  },
  appointmentCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  appointmentDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34607d',
    marginBottom: 5,
  },
  timeContainer: {
    backgroundColor: '#e8f4ea',
    padding: 5,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  appointmentTime: {
    fontSize: 14,
    color: '#6a9174',
    fontWeight: '600',
  },
  detailsContainer: {
    marginBottom: 15,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  procedure: {
    fontSize: 14,
    color: '#666',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  actionButton: {
    backgroundColor: '#e8f4ea',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  actionText: {
    color: '#6a9174',
    fontWeight: 'bold',
    fontSize: 14,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: '#6a9174',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  footerButton: {
    alignItems: 'center',
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
});

export default Horaire;