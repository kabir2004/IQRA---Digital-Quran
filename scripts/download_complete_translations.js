const fs = require('fs');
const https = require('https');
const path = require('path');

// Function to make HTTP request and return promise
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      let data = '';
      response.on('data', (chunk) => data += chunk);
      response.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

async function downloadCompleteTranslations() {
  console.log('Starting download of complete translations and transliterations...');
  
  const dataDir = path.join(__dirname, '..', 'public', 'data');
  const translationsDir = path.join(dataDir, 'translations');
  const transliterationsDir = path.join(dataDir, 'transliterations');
  
  let translations = [];
  let transliterations = [];
  
  try {
    // Download complete Quran with English translation (Sahih International)
    console.log('Downloading Sahih International translation...');
    const translationResponse = await makeRequest('https://api.alquran.cloud/v1/quran/en.sahih');
    
    if (translationResponse.data && translationResponse.data.surahs) {
      for (const surah of translationResponse.data.surahs) {
        for (const ayah of surah.ayahs) {
          translations.push({
            surah: ayah.numberInSurah === 1 && surah.number > 1 ? surah.number : ayah.surah.number,
            ayah: ayah.numberInSurah,
            text: ayah.text,
            translator: "Sahih International"
          });
        }
      }
    }
    
    // Download transliteration
    console.log('Downloading English transliteration...');
    const transliterationResponse = await makeRequest('https://api.alquran.cloud/v1/quran/en.transliteration');
    
    if (transliterationResponse.data && transliterationResponse.data.surahs) {
      for (const surah of transliterationResponse.data.surahs) {
        for (const ayah of surah.ayahs) {
          transliterations.push({
            surah: ayah.numberInSurah === 1 && surah.number > 1 ? surah.number : ayah.surah.number,
            ayah: ayah.numberInSurah,
            text: ayah.text,
            language: "en"
          });
        }
      }
    }
    
    // Save translations
    console.log(`Saving ${translations.length} translations...`);
    fs.writeFileSync(
      path.join(translationsDir, 'en_sahih_complete.json'),
      JSON.stringify(translations, null, 2)
    );
    
    // Save transliterations
    console.log(`Saving ${transliterations.length} transliterations...`);
    fs.writeFileSync(
      path.join(transliterationsDir, 'en_transliteration_complete.json'),
      JSON.stringify(transliterations, null, 2)
    );
    
    // Replace old files with new complete ones
    if (translations.length > 1000) {
      fs.renameSync(
        path.join(translationsDir, 'en_sahih.json'),
        path.join(translationsDir, 'en_sahih_old.json')
      );
      fs.renameSync(
        path.join(translationsDir, 'en_sahih_complete.json'),
        path.join(translationsDir, 'en_sahih.json')
      );
    }
    
    if (transliterations.length > 1000) {
      fs.renameSync(
        path.join(transliterationsDir, 'en_transliteration.json'),
        path.join(transliterationsDir, 'en_transliteration_old.json')
      );
      fs.renameSync(
        path.join(transliterationsDir, 'en_transliteration_complete.json'),
        path.join(transliterationsDir, 'en_transliteration.json')
      );
    }
    
    console.log('✅ Complete translations and transliterations download finished!');
    console.log(`📖 Total translations: ${translations.length}`);
    console.log(`🔤 Total transliterations: ${transliterations.length}`);
    
  } catch (error) {
    console.error('❌ Error downloading translations:', error);
  }
}

// Add delay to be respectful
setTimeout(() => {
  downloadCompleteTranslations();
}, 1000);