const fs = require('fs');

async function run() {
  const apiKey = process.env.API_KEY_MAREE;
  
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const inTwoDays = new Date(today);
  inTwoDays.setDate(today.getDate() + 2);

  const fmt = d => d.toISOString().split('T')[0];
  
  const dStart = fmt(today);
  const dEnd = fmt(inTwoDays);

  const url = `https://api-maree.fr/tide-extrema?site=granville&from=${dStart}&to=${dEnd}&tz=Europe/Paris&key=${apiKey}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);
    const json = await res.json();

    // Fonction pour générer le tableau à plat (Types, Heures, Coefs)
    const buildDayTable = (dayData) => {
      const types = [];
      const heures = [];
      const coefs = [];

      if (dayData && dayData.extrema && Array.isArray(dayData.extrema)) {
        dayData.extrema.forEach(e => {
          // Arrondi à l'entier le plus proche et conversion en String pour éviter les .0 ou .00
          const cFormatted = (e.coef !== undefined && e.coef !== null && e.coef !== "" && e.coef !== "-") 
            ? String(Math.round(Number(e.coef))) 
            : "-";
          
          types.push(e.type || "-");
          heures.push(e.time || "--:--");
          coefs.push(cFormatted);
        });
      }

      // Ordre : Types, Heures, Coefs
      return [
        ...types,
        ...heures,
        ...coefs
      ];
    };

    if (json.data && Array.isArray(json.data)) {
      // J0 = Aujourd'hui (index 0)
      if (json.data[0]) {
        const j0Flat = buildDayTable(json.data[0]);
        fs.writeFileSync('maree_table_J0.json', JSON.stringify(j0Flat, null, 2));
        console.log("Fichier maree_table_J0.json généré avec succès !");
      }

      // J1 = Demain (index 1)
      if (json.data[1]) {
        const j1Flat = buildDayTable(json.data[1]);
        fs.writeFileSync('maree_table_J1.json', JSON.stringify(j1Flat, null, 2));
        console.log("Fichier maree_table_J1.json généré avec succès !");
      }
    }

  } catch (err) {
    console.error("Erreur lors de la récupération :", err);
    process.exit(1);
  }
}

run();
