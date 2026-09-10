const fs = require('fs');

async function run() {
  const apiKey = process.env.API_KEY_MAREE;
  
  // Calcul des dates
  const today = new Date();
  
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // On demande jusqu'à J+2 pour garantir d'avoir TOUTE la journée de demain
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
    
    const jours = [];
    const types = [];
    const heures = [];
    const coefs = [];
    const hauteurs = [];

    if (json.data && Array.isArray(json.data)) {
      // On ne garde strictement que les 2 premiers jours (index 0 = Aujourd'hui, index 1 = Demain)
      const daysToKeep = json.data.slice(0, 2);

      daysToKeep.forEach((dayData, dayIndex) => {
        const jourLabel = dayIndex === 0 ? "Aujourd'hui" : "Demain";
        
        if (dayData.extrema && Array.isArray(dayData.extrema)) {
          dayData.extrema.forEach(e => {
            jours.push(jourLabel);
            types.push(e.type || "-");
            heures.push(e.time || "--:--");
            coefs.push(e.coef ? String(e.coef) : "-");
            hauteurs.push(e.height ? `${e.height}m` : "-");
          });
        }
      });
    }

    // Matrice transposée (Ordre: Jour, Type, Heure, Coef, Hauteur)
    const transposedRows = [jours, types, heures, coefs, hauteurs];

    // Formatage : chaque ligne est un sous-tableau sur une seule ligne
    const formattedRows = transposedRows.map(row => '  ' + JSON.stringify(row)).join(',\n');
    const outputText = `[\n${formattedRows}\n]`;

    fs.writeFileSync('maree_table.json', outputText);
    console.log("Fichier maree_table.json généré avec succès au format transposé !");

  } catch (err) {
    console.error("Erreur lors de la récupération :", err);
    process.exit(1);
  }
}

run();
