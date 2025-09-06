const fs = require('fs');
const path = require('path');

// Fix surah metadata
function fixSurahMetadata() {
  const dataDir = path.join(__dirname, '..', 'public', 'data');
  
  try {
    // Read the downloaded surah info
    const surahInfoPath = path.join(dataDir, 'surah_info.json');
    const surahInfo = JSON.parse(fs.readFileSync(surahInfoPath, 'utf8'));
    
    // Convert to our format
    const surahs = surahInfo.map((surah, index) => ({
      index: index + 1,
      name_ar: surah.titleAr,
      name_en: surah.title,
      revelation_place: surah.type === 'Makkiyah' ? 'Meccan' : 'Medinan',
      verses: surah.count
    }));
    
    // Save the fixed surah metadata
    fs.writeFileSync(
      path.join(dataDir, 'surahs-complete.json'),
      JSON.stringify(surahs, null, 2)
    );
    
    console.log('✅ Surah metadata fixed successfully!');
    console.log(`📖 Total surahs: ${surahs.length}`);
    
    // Now replace the old files with new complete ones
    fs.renameSync(
      path.join(dataDir, 'quran-uthmani.json'),
      path.join(dataDir, 'quran-uthmani-old.json')
    );
    
    fs.renameSync(
      path.join(dataDir, 'quran-uthmani-complete.json'),
      path.join(dataDir, 'quran-uthmani.json')
    );
    
    fs.renameSync(
      path.join(dataDir, 'surahs.json'),
      path.join(dataDir, 'surahs-old.json')
    );
    
    fs.renameSync(
      path.join(dataDir, 'surahs-complete.json'),
      path.join(dataDir, 'surahs.json')
    );
    
    console.log('✅ Files updated successfully!');
    
    // Verify the data
    const finalQuran = JSON.parse(fs.readFileSync(path.join(dataDir, 'quran-uthmani.json'), 'utf8'));
    const finalSurahs = JSON.parse(fs.readFileSync(path.join(dataDir, 'surahs.json'), 'utf8'));
    
    console.log(`📊 Final verification:`);
    console.log(`   - Total verses: ${finalQuran.length}`);
    console.log(`   - Total surahs: ${finalSurahs.length}`);
    console.log(`   - First verse: ${finalQuran[0].text.substring(0, 50)}...`);
    console.log(`   - Last verse: ${finalQuran[finalQuran.length - 1].text.substring(0, 50)}...`);
    
  } catch (error) {
    console.error('❌ Error fixing surah metadata:', error);
  }
}

fixSurahMetadata();