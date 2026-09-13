const fs = require('fs');

// Calcule la date locale (Europe/Paris) au format YYYY-MM-DD.
// IMPORTANT : on n'utilise pas toISOString() ici, car elle renvoie la date en UTC.
// Entre minuit et ~2h du matin en France (heure d'été), toISOString() donnerait
// encore la date de la veille. On force donc le calcul dans le fuseau Europe/Paris.
function getLocalDateISO(date, timeZone = 'Europe/Paris') {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const y = parts.find(p => p.type === 'year').value;
  const m = parts.find(p => p.type === 'month').value;
  const d = parts.find(p => p.type === 'day').value;

  return `${y}-${m}-${d}`; // format YYYY-MM-DD
}

async function run() {
  try {
    const now = new Date();
    const dateJ0 = getLocalDateISO(now);

    const payload = {
      date_j0: dateJ0,
      genere_le: now.toISOString(), // horodatage exact de génération, utile pour debug
    };

    fs.writeFileSync('maree_J0.json', JSON.stringify(payload, null, 2));
    console.log(`Fichier date_j0.json généré avec succès ! Date J0 = ${dateJ0}`);
  } catch (err) {
    console.error("Erreur lors de la génération de la date J0 :", err);
    process.exit(1);
  }
}

run();
