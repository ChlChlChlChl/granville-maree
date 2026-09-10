const fs = require('fs');

const API_KEY = process.env.API_KEY_MAREE;
const API_URL = `https://www.api-maree.fr/m/json/?key=${API_KEY}&port=Granville`;

async function fetchAndTransform() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
    
    const apiData = await response.json();

    const jours = [];
    const types = [];
    const heures = [];
    const coefs = [];
    const hauteurs = [];

    Object.keys(apiData).forEach(dateKey => {
      const dayData = apiData[dateKey];
      const jourNom = dayData.nom_jour || dateKey;

      if (dayData.marees) {
        dayData.marees.forEach(m => {
          jours.push(String(jourNom));
          types.push(String(m.type || '-'));
          heures.push(String(m.heure || '--:--'));
          coefs.push(m.coefficient ? String(m.coefficient) : '-');
          hauteurs.push(m.hauteur ? `${m.hauteur}m` : '-');
        });
      }
    });

    // Matrice transposée : Coef avant Hauteur
    const transposedRows = [jours, types, heures, coefs, hauteurs];

    // Formate chaque sous-tableau sur sa propre ligne
    const formattedRows = transposedRows.map(row => '  ' + JSON.stringify(row)).join(',\n');

    // Englobe avec les crochets globaux [ ... ]
    const outputText = `[\n${formattedRows}\n]`;

    fs.writeFileSync('maree_table.json', outputText);
    console.log('Fichier maree_table.json généré avec Coef et Hauteur inversés.');

  } catch (error) {
    console.error('Erreur :', error);
    process.exit(1);
  }
}

fetchAndTransform();
