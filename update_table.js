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
    
    const tableRows = [];

    if (json.data && Array.isArray(json.data)) {
      const daysToKeep = json.data.slice(0, 2);

      daysToKeep.forEach((dayData, dayIndex) => {
        const jourLabel = dayIndex === 0 ? "Aujourd'hui" : "Demain";
        
        if (dayData.extrema && Array.isArray(dayData.extrema)) {
          dayData.extrema.forEach(e => {
            // Arrondi propre de la hauteur à 1 décimale (ex: 12.2m)
            const hFormatted = e.height ? `${Math.round(e.height * 10) / 10}m` : "-";
            
            // Chaque marée est sa propre ligne [Jour, Type, Heure, Coef, Hauteur]
            tableRows.push([
              jourLabel,
              e.type || "-",
              e.time || "--:--",
              e.coef ? String(e.coef) : "-",
              hFormatted
            ]);
          });
        }
      });
    }

    // Formatage : 1 ligne par marée
    const formattedRows = tableRows.map(row => '  ' + JSON.stringify(row)).join(',\n');
    const outputText = `[\n${formattedRows}\n]`;

    fs.writeFileSync('maree_table.json', outputText);
    console.log("Fichier maree_table.json généré au format sous-tableaux par ligne.");

  } catch (err) {
    console.error("Erreur lors de la récupération :", err);
    process.exit(1);
  }
}

run();
