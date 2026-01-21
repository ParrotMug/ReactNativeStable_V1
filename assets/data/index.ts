// assets/data/index.ts

// 1. Alle JSONs importieren
import synthesis from './oc_synthesis.json';
import named from './oc_named.json';
import iupac from './oc_iupac.json';
import stereo from './oc_stereo.json';
import functional from './oc_functional.json';
import reagents from './oc_reagents.json';
// import mechanisms from './oc_mechanisms.json'; // Erst einkommentieren wenn Datei da ist
// import spectroscopy from './oc_spectroscopy.json'; // Erst einkommentieren wenn Datei da ist

// 2. Exportieren & Zuordnen
export const TOPIC_DATA: Record<string, any> = {
  synthesis: synthesis,
  named: named,
  iupac: iupac,
  stereo: stereo,
  functional: functional,
  reagents: reagents,

  // Platzhalter für Locked Topics (damit nichts abstürzt)
  mechanisms: [], 
  spectroscopy: [], 

  // Universal: Kombiniert automatisch alles für den Mix-Modus
  get universal() {
    return [
      ...synthesis,
      ...named,
      ...iupac,
      ...stereo,
      ...functional,
      ...reagents
    ];
  }
};
