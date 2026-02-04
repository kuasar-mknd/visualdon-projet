
import { fetchCountriesDetails } from '../src/services/countryService.js';

// Mock global.fetch
global.fetch = async (url) => {
    console.log(`Fetch called with: ${url}`);
    if (url.includes('codes=COL,PER')) {
        return {
            ok: true,
            json: async () => [
                { cca3: 'COL', name: { common: 'Colombia' }, translations: { fra: { common: 'Colombie' } } },
                { cca3: 'PER', name: { common: 'Peru' }, translations: { fra: { common: 'Pérou' } } }
            ]
        };
    }
    return { ok: false };
};

// Mock global.localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    }
  };
})();
global.localStorage = localStorageMock;

// Mock console.warn to suppress output during test
console.warn = () => {};

async function run() {
    console.log('Testing fetchCountriesDetails...');

    // Test 1: Fetch two countries in English (default)
    const codes = ['COL', 'PER'];
    const result = await fetchCountriesDetails(codes, 'en');

    console.log('Result (en):', JSON.stringify(result));

    if (result['COL'] === 'Colombia' && result['PER'] === 'Peru') {
        console.log('✅ SUCCESS: Batch fetch returned correct names (en).');
    } else {
        console.error('❌ FAILURE: Batch fetch returned incorrect names (en).');
        process.exit(1);
    }

    // Test 2: Fetch cached countries in French
    // Note: The service caches the *data*, not the name. So asking for 'fr' should return French name from cached data.
    const resultFr = await fetchCountriesDetails(codes, 'fr');
    console.log('Result (fr):', JSON.stringify(resultFr));

    if (resultFr['COL'] === 'Colombie' && resultFr['PER'] === 'Pérou') {
        console.log('✅ SUCCESS: Cached data returned correct names (fr).');
    } else {
        console.error('❌ FAILURE: Cached data returned incorrect names (fr).');
        process.exit(1);
    }
}

run().catch(e => {
    console.error(e);
    process.exit(1);
});
