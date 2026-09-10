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
    const json = await res.json();
    
    const tableData = [];

    if (json.data && Array.isArray(json.data)) {
      // On ne garde strictement que les 2 premiers jours (index 0 = Aujourd'hui, index 1 = Demain)
      const daysToKeep = json.data.slice(0, 2);

      daysToKeep.forEach((dayData, dayIndex) => {
        const jourLabel = dayIndex === 0 ? "Aujourd'hui" : "Demain";
        
        if (dayData.extrema && Array.isArray(dayData.extrema)) {
          dayData.extrema.forEach(e => {
            tableData.push({
              jour: jourLabel,
              type: e.type || "",          // PM ou BM
              heure: e.time || "",        // HH:MM
              coef: e.coef ? String(e.coef) : "-", // Coef ou "-"
              hauteur: e.height ? `${e.height}m` : ""
            });
          });
        }
      });
    }

    fs.writeFileSync('maree.json', JSON.stringify(tableData, null, 2));
    console.log("Fichier maree.json mis à jour avec succès (Aujourd'hui + Demain complets).");
  } catch (err) {
    console.error("Erreur lors de la récupération:", err);
    process.exit(1);
  }
}

run();
