import React from 'react';
import { View, ScrollView, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

export default function AboutScreen({ navigation }) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fbf2e8" }} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {/* Bouton Retour */}
      
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <FontAwesome name="chevron-left" size={24} color="white" />
            </TouchableOpacity>

      {/* Image (j'ai pris une au hasard) */}
      <Image 
        source={require("../assets/vecteezy_ai-generated-manager-man-present-successful-group-business_39322995.png")} 
        style={styles.image}
      />

      {/* Texte d'information sur nous */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>About Us</Text>
        <Text style={styles.description}>
          Texte descrivant notre "histoire"
        </Text>
        <Text style={styles.description}>
          Texte Text Text Texte Texte Texte Texte Texte Text Text Texte Texte Texte Texte
          Texte Text Text Texte Texte Texte Texte Texte Text Text Texte Texte Texte Texte
          Texte Text Text Texte Texte Texte Texte
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, // flexGrow (et non flex) : le contenu peut dépasser l'écran et défiler
    backgroundColor: '#fbf2e8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: '#34607d',
    padding: 10,
    borderRadius: 10,
    zIndex: 10,
  },
  image: {
    width: '90%',
    height: 200,
    marginTop: 60,
  },
  textContainer: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#34607d',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6a9174',
    marginBottom: 10,
  },
});
