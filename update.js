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
    const data = await res.json();
    fs.writeFileSync('maree.json', JSON.stringify(data, null, 2));
    console.log("Fichier maree.json mis à jour avec succès.");
  } catch (err) {
    console.error("Erreur lors de la récupération:", err);
    process.exit(1);
  }
}

run();
