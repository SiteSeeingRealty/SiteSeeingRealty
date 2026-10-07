import { useRef, useState } from 'react';
import { TileLayer } from 'react-leaflet';

// Map tiles that never need an API key. Commercial CDNs (CARTO, then Esri)
// started stamping "API KEY REQUIRED" over keyless tiles once traffic grew, so
// only community-run OpenStreetMap servers are used here. They are free and
// keyless by policy; the only requirement is visible attribution.
//
// If the primary server starts failing, switch to the next one instead of
// leaving the map blank.
const PROVIDERS = [
  {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxNativeZoom: 19
  },
  {
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, tiles by <a href="https://www.hotosm.org/">HOT</a>',
    subdomains: 'abc',
    maxNativeZoom: 19
  }
];

// A few failed tiles are normal (flaky network, tile edges); this many in a row
// means the server is down.
const FAILURES_BEFORE_SWITCH = 6;

export default function KeylessTileLayer() {
  const [index, setIndex] = useState(0);
  const failures = useRef(0);
  const provider = PROVIDERS[index];

  const eventHandlers = {
    tileload: () => { failures.current = 0; },
    tileerror: () => {
      failures.current += 1;
      if (failures.current >= FAILURES_BEFORE_SWITCH && index < PROVIDERS.length - 1) {
        failures.current = 0;
        setIndex(index + 1);
      }
    }
  };

  return (
    <TileLayer
      key={provider.url}
      url={provider.url}
      attribution={provider.attribution}
      subdomains={provider.subdomains || 'abc'}
      maxNativeZoom={provider.maxNativeZoom}
      maxZoom={20}
      eventHandlers={eventHandlers}
    />
  );
}
