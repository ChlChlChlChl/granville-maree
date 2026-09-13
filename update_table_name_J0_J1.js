const fs = require('fs');

// Calcule la date locale (Europe/Paris) au format JJ/MM/AAAA.
// IMPORTANT : on n'utilise pas toISOString() ici, car elle renvoie la date en UTC.
// Entre minuit et ~2h du matin en France (heure d'été), toISOString() donnerait
// encore la date de la veille. On force donc le calcul dans le fuseau Europe/Paris.
function getLocalDateFR(date, timeZone = 'Europe/Paris') {
  const parts = new Intl.DateTimeFormat('fr-FR', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const y = parts.find(p => p.type === 'year').value;
  const m = parts.find(p => p.type === 'month').value;
  const d = parts.find(p => p.type === 'day').value;

  return `${d}/${m}/${y}`; // format JJ/MM/AAAA
}

// Renvoie le nom du jour en français, avec majuscule initiale (ex: "Dimanche")
function getDayNameFR(date, timeZone = 'Europe/Paris') {
  const jour = new Intl.DateTimeFormat('fr-FR', { timeZone, weekday: 'long' }).format(date);
  return jour.charAt(0).toUpperCase() + jour.slice(1);
}

async function run() {
  try {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);

    const dateJ0 = getLocalDateFR(now);
    const jourJ0 = getDayNameFR(now);
    const dateJ1 = getLocalDateFR(tomorrow);
    const jourJ1 = getDayNameFR(tomorrow);

    const payload = [dateJ0, jourJ0, dateJ1, jourJ1];

    fs.writeFileSync('date_j0.json', JSON.stringify(payload, null, 2));
    console.log(`Fichier date_j0.json généré avec succès ! J0 = ${jourJ0} ${dateJ0} | J1 = ${jourJ1} ${dateJ1}`);
  } catch (err) {
    console.error("Erreur lors de la génération de la date J0 :", err);
    process.exit(1);
  }
}

run();
