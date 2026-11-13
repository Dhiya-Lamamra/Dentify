import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import { AntDesign, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { getOffres, postuler, formaterDate, formaterHeure, Offre as OffreType } from '../utils/api';


const Offre = ({navigation}) => {
  const [offers, setOffers] = useState<OffreType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Pour chaque offre : message affiché sous le bouton après avoir postulé (succès ou erreur)
  const [retours, setRetours] = useState<Record<number, { ok: boolean; texte: string }>>({});

  // GET /api/offres : toutes les offres actives (route publique)
  const chargerOffres = async () => {
    setError("");
    try {
      setOffers(await getOffres());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', chargerOffres);
    return unsubscribe;
  }, [navigation]);

  // POST /api/candidatures : le professionnel connecté postule à l'offre
  const handlePostuler = async (id_offre: number) => {
    try {
      await postuler(id_offre);
      setRetours((r) => ({ ...r, [id_offre]: { ok: true, texte: "Candidature envoyée ✔" } }));
    } catch (e) {
      // ex : "Vous avez déjà postulé à cette offre." (409) ou "Seuls les professionnels peuvent postuler." (403)
      setRetours((r) => ({ ...r, [id_offre]: { ok: false, texte: e.message } }));
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header dans le ScrollView pour qu'il défile */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Accueil')}>
            <Image 
              source={require('../assets/dentify_logo_noir.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </TouchableOpacity>
          
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
              <AntDesign name="message1" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => navigation.navigate('Profil')}
            >
              <MaterialCommunityIcons name="account-circle-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Contenu principal */}
        <View style={styles.content}>
          <Text style={styles.mainTitle}>Offres disponibles</Text>
          
          <View style={styles.subtitleContainer}>
            <Text style={styles.subtitle}>Toutes</Text>
            <Text style={[styles.subtitle, styles.activeSubtitle]}>• Proches</Text>
          </View>

          {loading && <ActivityIndicator size="large" color="#6a9174" style={{ marginTop: 30 }} />}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {!loading && !error && offers.length === 0 && (
            <Text style={styles.emptyText}>Aucune offre disponible pour le moment.</Text>
          )}

          {offers.map((offer) => (
            <View key={offer.id_offre} style={styles.offerCard}>
              <Text style={styles.offerTitle}>{offer.titre}</Text>
              <Text style={styles.offerPrice}>{offer.remuneration} $</Text>

              <Text style={styles.clinicName}>
                {offer.CliniqueDentaire?.nom_clinique ? `${offer.CliniqueDentaire.nom_clinique} · ` : ""}
                {offer.type_professionnel}
              </Text>
              {offer.CliniqueDentaire?.adresse_complete ? <Text>{offer.CliniqueDentaire.adresse_complete}</Text> : null}
              <Text>{offer.descript}</Text>

              <View style={styles.detailsRow}>
                <Text style={styles.detailText}>{formaterDate(offer.date_mission)}</Text>
                {offer.heure_debut ? (
                  <Text style={styles.detailText}>
                    {formaterHeure(offer.heure_debut)} - {formaterHeure(offer.heure_fin)}
                  </Text>
                ) : null}
              </View>

              {/* Postuler à l'offre */}
              <TouchableOpacity style={styles.reserveButton} onPress={() => handlePostuler(offer.id_offre)}>
                <Text style={styles.reserveButtonText}>Réserver</Text>
              </TouchableOpacity>
              {retours[offer.id_offre] ? (
                <Text style={retours[offer.id_offre].ok ? styles.successText : styles.errorText}>
                  {retours[offer.id_offre].texte}
                </Text>
              ) : null}
            </View>
          ))}

          <TouchableOpacity style={styles.discoverButton}>
            <Text style={styles.discoverText}>Découvrir</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Footer fixe */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.footerButton}
          onPress={() => navigation.navigate('Horaire')}
        >
          <AntDesign name="profile" size={24} color={"white"}/>
          <Text style={styles.footerText}>Mon horaire</Text>
        </TouchableOpacity>
            
        <TouchableOpacity 
          style={styles.footerButton}
          onPress={() => navigation.navigate('Offre')}
        >
          <MaterialIcons name="work-outline" size={24} color={"black"}/>
          <Text style={styles.footerTextClick}> Offres </Text>
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
  container: {
    flex: 1,
    backgroundColor: '#fbf2e8',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 8,
  },
  successText: {
    color: '#6a9174',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#777',
    marginTop: 20,
  },
  scrollView: {
    flex: 1,
    marginBottom: 80, // Pour laisser de la place au footer
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
  content: {
    padding: 15,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  subtitleContainer: {
    flexDirection: 'row',
    marginVertical: 15,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginRight: 10,
  },
  activeSubtitle: {
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  offerCard: {
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
  offerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  offerPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginVertical: 10,
  },
  clinicName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 5,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  detailText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  ratingText: {
    fontSize: 14,
    color: '#f39c12',
  },
  distanceText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  // Styles pour le bouton Réserver
  reserveButton: {
    backgroundColor: '#6a9174',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  reserveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  discoverButton: {
    alignItems: 'center',
    marginTop: 10,
  },
  discoverText: {
    fontSize: 16,
    color: '#3498db',
    fontWeight: 'bold',
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

export default Offre;