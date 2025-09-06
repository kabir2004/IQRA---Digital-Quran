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

// Complete Juz data with proper Arabic names
const completeJuzData = [
  {
    index: 1,
    name: "الٓمٓ",
    name_en: "Alif Lam Meem",
    start_surah: 1,
    start_ayah: 1,
    end_surah: 2,
    end_ayah: 141
  },
  {
    index: 2,
    name: "سَيَقُولُ",
    name_en: "Sa-yaqoolu",
    start_surah: 2,
    start_ayah: 142,
    end_surah: 2,
    end_ayah: 252
  },
  {
    index: 3,
    name: "تِلْكَ الرُّسُلُ",
    name_en: "Tilkar-rusul",
    start_surah: 2,
    start_ayah: 253,
    end_surah: 3,
    end_ayah: 92
  },
  {
    index: 4,
    name: "لَّن تَنَالُوا",
    name_en: "Lan tanaloo",
    start_surah: 3,
    start_ayah: 93,
    end_surah: 4,
    end_ayah: 23
  },
  {
    index: 5,
    name: "وَالْمُحْصَنَاتُ",
    name_en: "Wal-muhsanat",
    start_surah: 4,
    start_ayah: 24,
    end_surah: 4,
    end_ayah: 147
  },
  {
    index: 6,
    name: "لَّا يُحِبُّ اللَّهُ",
    name_en: "La yuhibbullahu",
    start_surah: 4,
    start_ayah: 148,
    end_surah: 5,
    end_ayah: 81
  },
  {
    index: 7,
    name: "وَإِذَا سَمِعُوا",
    name_en: "Wa iza sami'u",
    start_surah: 5,
    start_ayah: 82,
    end_surah: 6,
    end_ayah: 110
  },
  {
    index: 8,
    name: "وَلَوْ أَنَّنَا",
    name_en: "Wa law annana",
    start_surah: 6,
    start_ayah: 111,
    end_surah: 7,
    end_ayah: 87
  },
  {
    index: 9,
    name: "قَالَ الْمَلَأُ",
    name_en: "Qalal-mala'u",
    start_surah: 7,
    start_ayah: 88,
    end_surah: 8,
    end_ayah: 40
  },
  {
    index: 10,
    name: "وَاعْلَمُوا",
    name_en: "Wa'lamoo",
    start_surah: 8,
    start_ayah: 41,
    end_surah: 9,
    end_ayah: 92
  },
  {
    index: 11,
    name: "يَعْتَذِرُونَ",
    name_en: "Ya'tadhiroona",
    start_surah: 9,
    start_ayah: 93,
    end_surah: 11,
    end_ayah: 5
  },
  {
    index: 12,
    name: "وَمَا مِنْ دَابَّةٍ",
    name_en: "Wa ma min dabbatin",
    start_surah: 11,
    start_ayah: 6,
    end_surah: 12,
    end_ayah: 52
  },
  {
    index: 13,
    name: "وَمَا أُبَرِّئُ",
    name_en: "Wa ma ubarri'u",
    start_surah: 12,
    start_ayah: 53,
    end_surah: 14,
    end_ayah: 52
  },
  {
    index: 14,
    name: "رُّبَمَا",
    name_en: "Rubama",
    start_surah: 15,
    start_ayah: 1,
    end_surah: 16,
    end_ayah: 128
  },
  {
    index: 15,
    name: "سُبْحَانَ الَّذِي",
    name_en: "Subhanallathi",
    start_surah: 17,
    start_ayah: 1,
    end_surah: 18,
    end_ayah: 74
  },
  {
    index: 16,
    name: "قَالَ أَلَمْ",
    name_en: "Qal alam",
    start_surah: 18,
    start_ayah: 75,
    end_surah: 20,
    end_ayah: 135
  },
  {
    index: 17,
    name: "اقْتَرَبَ لِلنَّاسِ",
    name_en: "Iqtaraba linnasi",
    start_surah: 21,
    start_ayah: 1,
    end_surah: 22,
    end_ayah: 78
  },
  {
    index: 18,
    name: "قَدْ أَفْلَحَ",
    name_en: "Qad aflaha",
    start_surah: 23,
    start_ayah: 1,
    end_surah: 25,
    end_ayah: 20
  },
  {
    index: 19,
    name: "وَقَالَ الَّذِينَ",
    name_en: "Wa qalallathina",
    start_surah: 25,
    start_ayah: 21,
    end_surah: 27,
    end_ayah: 55
  },
  {
    index: 20,
    name: "أَمَّنْ خَلَقَ",
    name_en: "Amman khalaqa",
    start_surah: 27,
    start_ayah: 56,
    end_surah: 29,
    end_ayah: 45
  },
  {
    index: 21,
    name: "أُتْلُ مَا أُوحِيَ",
    name_en: "Utlu ma oohi",
    start_surah: 29,
    start_ayah: 46,
    end_surah: 33,
    end_ayah: 30
  },
  {
    index: 22,
    name: "وَمَنْ يَقْنُتْ",
    name_en: "Wa man yaqnut",
    start_surah: 33,
    start_ayah: 31,
    end_surah: 36,
    end_ayah: 27
  },
  {
    index: 23,
    name: "وَمَالِيَ",
    name_en: "Wa mali",
    start_surah: 36,
    start_ayah: 28,
    end_surah: 39,
    end_ayah: 31
  },
  {
    index: 24,
    name: "فَمَنْ أَظْلَمُ",
    name_en: "Faman athlamu",
    start_surah: 39,
    start_ayah: 32,
    end_surah: 41,
    end_ayah: 46
  },
  {
    index: 25,
    name: "إِلَيْهِ يُرَدُّ",
    name_en: "Ilayhi yuraddu",
    start_surah: 41,
    start_ayah: 47,
    end_surah: 45,
    end_ayah: 37
  },
  {
    index: 26,
    name: "حم",
    name_en: "Ha Meem",
    start_surah: 46,
    start_ayah: 1,
    end_surah: 51,
    end_ayah: 30
  },
  {
    index: 27,
    name: "قَالَ فَمَا خَطْبُكُمْ",
    name_en: "Qala fama khatbukum",
    start_surah: 51,
    start_ayah: 31,
    end_surah: 57,
    end_ayah: 29
  },
  {
    index: 28,
    name: "قَدْ سَمِعَ اللَّهُ",
    name_en: "Qad sami'allahu",
    start_surah: 58,
    start_ayah: 1,
    end_surah: 66,
    end_ayah: 12
  },
  {
    index: 29,
    name: "تَبَارَكَ الَّذِي",
    name_en: "Tabarakallathi",
    start_surah: 67,
    start_ayah: 1,
    end_surah: 77,
    end_ayah: 50
  },
  {
    index: 30,
    name: "عَمَّ",
    name_en: "Amma",
    start_surah: 78,
    start_ayah: 1,
    end_surah: 114,
    end_ayah: 6
  }
];

async function downloadCompleteJuz() {
  console.log('Creating complete 30 Juz/Sipara dataset...');
  
  const dataDir = path.join(__dirname, '..', 'public', 'data');
  
  try {
    // Save the complete Juz data
    console.log('Saving complete 30 Juz data...');
    fs.writeFileSync(
      path.join(dataDir, 'juz-complete.json'),
      JSON.stringify(completeJuzData, null, 2)
    );
    
    // Replace the old file with complete data
    try {
      fs.renameSync(
        path.join(dataDir, 'juz.json'),
        path.join(dataDir, 'juz-old.json')
      );
    } catch (e) {
      console.log('No existing juz.json to backup');
    }
    
    fs.renameSync(
      path.join(dataDir, 'juz-complete.json'),
      path.join(dataDir, 'juz.json')
    );
    
    console.log('✅ Complete 30 Juz/Sipara data created successfully!');
    console.log(`📖 Total Juz: ${completeJuzData.length}`);
    
    // Verify the data
    const finalJuz = JSON.parse(fs.readFileSync(path.join(dataDir, 'juz.json'), 'utf8'));
    console.log(`📊 Verification:`);
    console.log(`   - Total Juz: ${finalJuz.length}`);
    console.log(`   - First Juz: ${finalJuz[0].name} (${finalJuz[0].name_en})`);
    console.log(`   - Last Juz: ${finalJuz[finalJuz.length - 1].name} (${finalJuz[finalJuz.length - 1].name_en})`);
    console.log(`   - Covers Surahs: ${finalJuz[0].start_surah} to ${finalJuz[finalJuz.length - 1].end_surah}`);
    
  } catch (error) {
    console.error('❌ Error creating Juz data:', error);
  }
}

downloadCompleteJuz();