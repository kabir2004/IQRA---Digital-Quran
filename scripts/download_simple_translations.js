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

async function downloadTranslationsForAllSurahs() {
  console.log('Starting download of translations and transliterations for all surahs...');
  
  const dataDir = path.join(__dirname, '..', 'public', 'data');
  const translationsDir = path.join(dataDir, 'translations');
  const transliterationsDir = path.join(dataDir, 'transliterations');
  
  let allTranslations = [];
  let allTransliterations = [];
  
  try {
    // Download each surah's translation and transliteration
    for (let surahNum = 1; surahNum <= 114; surahNum++) {
      console.log(`Processing Surah ${surahNum}/114...`);
      
      try {
        // Get translation
        const translationUrl = `https://api.alquran.cloud/v1/surah/${surahNum}/en.sahih`;
        const translationResponse = await makeRequest(translationUrl);
        
        if (translationResponse.data && translationResponse.data.ayahs) {
          for (const ayah of translationResponse.data.ayahs) {
            allTranslations.push({
              surah: surahNum,
              ayah: ayah.numberInSurah,
              text: ayah.text,
              translator: "Sahih International"
            });
          }
        }
        
        // Get transliteration  
        const transliterationUrl = `https://api.alquran.cloud/v1/surah/${surahNum}/en.transliteration`;
        const transliterationResponse = await makeRequest(transliterationUrl);
        
        if (transliterationResponse.data && transliterationResponse.data.ayahs) {
          for (const ayah of transliterationResponse.data.ayahs) {
            allTransliterations.push({
              surah: surahNum,
              ayah: ayah.numberInSurah,
              text: ayah.text,
              language: "en"
            });
          }
        }
        
        // Add small delay to be respectful to the API
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error(`Error processing Surah ${surahNum}:`, error.message);
      }
    }
    
    // Save complete translations
    console.log(`Saving ${allTranslations.length} translations...`);
    fs.writeFileSync(
      path.join(translationsDir, 'en_sahih_complete.json'),
      JSON.stringify(allTranslations, null, 2)
    );
    
    // Save complete transliterations
    console.log(`Saving ${allTransliterations.length} transliterations...`);
    fs.writeFileSync(
      path.join(transliterationsDir, 'en_transliteration_complete.json'),
      JSON.stringify(allTransliterations, null, 2)
    );
    
    // Replace old files if we got enough data
    if (allTranslations.length > 1000) {
      try {
        fs.renameSync(
          path.join(translationsDir, 'en_sahih.json'),
          path.join(translationsDir, 'en_sahih_old.json')
        );
      } catch (e) {}
      
      fs.renameSync(
        path.join(translationsDir, 'en_sahih_complete.json'),
        path.join(translationsDir, 'en_sahih.json')
      );
      console.log('✅ Translations file updated successfully!');
    }
    
    if (allTransliterations.length > 1000) {
      try {
        fs.renameSync(
          path.join(transliterationsDir, 'en_transliteration.json'),
          path.join(transliterationsDir, 'en_transliteration_old.json')
        );
      } catch (e) {}
      
      fs.renameSync(
        path.join(transliterationsDir, 'en_transliteration_complete.json'),
        path.join(transliterationsDir, 'en_transliteration.json')
      );
      console.log('✅ Transliterations file updated successfully!');
    }
    
    console.log('✅ Download completed successfully!');
    console.log(`📖 Total translations: ${allTranslations.length}`);
    console.log(`🔤 Total transliterations: ${allTransliterations.length}`);
    
  } catch (error) {
    console.error('❌ Error in download process:', error);
  }
}

downloadTranslationsForAllSurahs();