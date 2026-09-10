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
    
    const jours = [];
    const types = [];
    const heures = [];
    const coefs = [];
    const hauteurs = [];

    if (json.data && Array.isArray(json.data)) {
      const daysToKeep = json.data.slice(0, 2);

      daysToKeep.forEach((dayData, dayIndex) => {
        const jourLabel = dayIndex === 0 ? "Aujourd'hui" : "Demain";
        
        if (dayData.extrema && Array.isArray(dayData.extrema)) {
          dayData.extrema.forEach(e => {
            const hFormatted = e.height ? `${Math.round(e.height * 10) / 10}m` : "-";
            const cFormatted = e.coef ? String(Math.round(e.coef)) : "-";
            
            jours.push(jourLabel);
            types.push(e.type || "-");
            heures.push(e.time || "--:--");
            coefs.push(cFormatted);
            hauteurs.push(hFormatted);
          });
        }
      });
    }

    // Fusion à plat dans l'ordre transposé (Ligne 1 = Jours, Ligne 2 = Types, etc.)
    const flatTransposed = [
      ...jours,
      ...types,
      ...heures,
      ...coefs,
      ...hauteurs
    ];

    fs.writeFileSync('maree_table.json', JSON.stringify(flatTransposed, null, 2));
    console.log("Fichier maree_table.json généré avec succès (Transposé à plat) !");

  } catch (err) {
    console.error("Erreur lors de la récupération :", err);
    process.exit(1);
  }
}

run();
