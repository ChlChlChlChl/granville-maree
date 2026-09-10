const fs = require('fs');

async function run() {
  const apiKey = process.env.API_KEY_MAREE;
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const fmt = d => d.toISOString().split('T')[0];
  const url = `https://api-maree.fr/tide-extrema?site=granville&from=${fmt(now)}&to=${fmt(tomorrow)}&tz=Europe/Paris&key=${apiKey}`;

  try {
    const res = await fetch(url);
    const json = await res.json();
    
    // Reformatage des données à plat pour le composant Table de SenseCraft
    const tableData = [];

    if (json.data && Array.isArray(json.data)) {
      json.data.forEach((dayData, dayIndex) => {
        const jourLabel = dayIndex === 0 ? "Aujourd'hui" : "Demain";
        if (dayData.extrema && Array.isArray(dayData.extrema)) {
          dayData.extrema.forEach(e => {
            tableData.push({
              jour: jourLabel,
              type: e.type || "",
              heure: e.time || "",
              hauteur: e.height ? `${e.height}m` : "",
              coef: e.coef ? `${e.coef}` : "-"
            });
          });
        }
      });
    }

    // Sauvegarde du JSON formaté pour le widget Table
    fs.writeFileSync('maree.json', JSON.stringify(tableData, null, 2));
    console.log("Fichier maree.json mis à jour avec succès.");
  } catch (err) {
    console.error("Erreur lors de la récupération:", err);
    process.exit(1);
  }
}

run();
