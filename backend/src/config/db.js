const { Sequelize } = require('sequelize');
require('dotenv').config();

// 📦 Connexion à la base de données avec Sequelize
// DB_PASSWORD (docker-compose) ou DB_PASS (ancien .env) sont acceptés
const sequelize = new Sequelize(
  process.env.DB_NAME || 'dentify',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD ?? process.env.DB_PASS,
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    port: process.env.DB_PORT || 3306,
    logging: false,
    dialectOptions: process.env.DB_SOCKET
      ? { socketPath: process.env.DB_SOCKET }
      : {}
  }
);

// 🔁 Fonction de connexion à la base
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion MySQL réussie !');

    // 🔗 Charger les relations entre modèles
    require('../models');

    // 🔄 Synchroniser les modèles avec la base (modifie sans supprimer)
    await sequelize.sync();

    console.log('✅ Base de données synchronisée avec Sequelize');
  } catch (error) {
    console.error('❌ Erreur de connexion à MySQL :', error);
  }
};

module.exports = { sequelize, connectDB };
