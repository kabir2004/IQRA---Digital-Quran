const fs = require('fs');
const https = require('https');
const path = require('path');

// Function to download file from URL
function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // Delete the file on error
      reject(err);
    });
  });
}

// Function to convert surah data to our format
function convertSurahToOurFormat(surahData, surahNumber) {
  const verses = [];
  const verseKeys = Object.keys(surahData.verse);
  
  for (let i = 0; i < verseKeys.length; i++) {
    const verseKey = verseKeys[i];
    const ayahNumber = parseInt(verseKey.replace('verse_', ''));
    
    verses.push({
      surah: surahNumber,
      ayah: ayahNumber,
      text: surahData.verse[verseKey]
    });
  }
  
  return verses;
}

async function downloadCompleteQuran() {
  console.log('Starting download of complete Quran dataset...');
  
  const baseUrl = 'https://raw.githubusercontent.com/semarketir/quranjson/master/source/surah/';
  const dataDir = path.join(__dirname, '..', 'public', 'data');
  
  let allVerses = [];
  let allSurahs = [];
  
  try {
    // Download surah information first
    console.log('Downloading surah information...');
    const surahInfoUrl = 'https://raw.githubusercontent.com/semarketir/quranjson/master/source/surah.json';
    await downloadFile(surahInfoUrl, path.join(dataDir, 'temp_surah_info.json'));
    
    const surahInfo = JSON.parse(fs.readFileSync(path.join(dataDir, 'temp_surah_info.json'), 'utf8'));
    
    // Download each surah
    for (let i = 1; i <= 114; i++) {
      const surahNumber = i.toString().padStart(3, '0');
      const url = `${baseUrl}surah_${i}.json`;
      const tempFile = path.join(dataDir, `temp_surah_${i}.json`);
      
      console.log(`Downloading Surah ${i}/114...`);
      
      try {
        await downloadFile(url, tempFile);
        const surahData = JSON.parse(fs.readFileSync(tempFile, 'utf8'));
        
        // Convert to our format
        const verses = convertSurahToOurFormat(surahData, i);
        allVerses.push(...verses);
        
        // Add surah metadata
        const surahMeta = surahInfo.find(s => s.index === i);
        if (surahMeta) {
          allSurahs.push({
            index: i,
            name_ar: surahMeta.name,
            name_en: surahMeta.name,
            revelation_place: surahMeta.type === 'Meccan' ? 'Meccan' : 'Medinan',
            verses: surahData.count
          });
        }
        
        // Clean up temp file
        fs.unlinkSync(tempFile);
        
        // Add small delay to be respectful to the server
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`Error downloading Surah ${i}:`, error);
      }
    }
    
    // Save the complete Quran data
    console.log(`Saving complete Quran data (${allVerses.length} verses)...`);
    fs.writeFileSync(
      path.join(dataDir, 'quran-uthmani-complete.json'), 
      JSON.stringify(allVerses, null, 2)
    );
    
    // Save the surah metadata
    console.log('Saving surah metadata...');
    fs.writeFileSync(
      path.join(dataDir, 'surahs-complete.json'), 
      JSON.stringify(allSurahs, null, 2)
    );
    
    // Clean up temp files
    try {
      fs.unlinkSync(path.join(dataDir, 'temp_surah_info.json'));
    } catch (e) {}
    
    console.log('✅ Complete Quran download finished!');
    console.log(`📊 Total verses: ${allVerses.length}`);
    console.log(`📖 Total surahs: ${allSurahs.length}`);
    
  } catch (error) {
    console.error('❌ Error downloading Quran data:', error);
  }
}

// Run the download
downloadCompleteQuran();