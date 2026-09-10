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
    
    const flatCells = [];

    if (json.data && Array.isArray(json.data)) {
      const daysToKeep = json.data.slice(0, 2);

      daysToKeep.forEach((dayData, dayIndex) => {
        const jourLabel = dayIndex === 0 ? "Aujourd'hui" : "Demain";
        
        if (dayData.extrema && Array.isArray(dayData.extrema)) {
          dayData.extrema.forEach(e => {
            const hFormatted = e.height ? `${Math.round(e.height * 10) / 10}m` : "-";
            
            // On push chaque valeur séquentiellement (5 valeurs par ligne du tableau)
            flatCells.push(jourLabel);
            flatCells.push(e.type || "-");
            flatCells.push(e.time || "--:--");
            flatCells.push(e.coef ? String(e.coef) : "-");
            flatCells.push(hFormatted);
          });
        }
      });
    }

    // Sauvegarde du tableau 1D
    fs.writeFileSync('maree_table.json', JSON.stringify(flatCells, null, 2));
    console.log("Fichier maree_table.json généré au format plat 1D.");

  } catch (err) {
    console.error("Erreur lors de la récupération :", err);
    process.exit(1);
  }
}

run();
