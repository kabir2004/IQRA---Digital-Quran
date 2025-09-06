export interface Ayah {
  surah: number
  ayah: number
  text: string
}

export interface Translation {
  surah: number
  ayah: number
  text: string
  translator?: string
}

export interface Transliteration {
  surah: number
  ayah: number
  text: string
}

export interface Surah {
  index: number
  name_ar: string
  name_en: string
  revelation_place: string
  verses: number
}

export interface Juz {
  index: number
  name: string
  name_en?: string
  start_surah: number
  start_ayah: number
  end_surah: number
  end_ayah: number
}

export interface Hizb {
  index: number
  name: string
  name_en?: string
  juz: number
  quarter: number
  start_surah: number
  start_ayah: number
  end_surah: number
  end_ayah: number
}

export interface MushafPage {
  page: number
  start_surah: number
  start_ayah: number
  end_surah: number
  end_ayah: number
}

export interface SearchResult {
  surah: number
  ayah: number
  text: string
  translation?: string
  highlight?: string
}

export interface DataAdapter {
  getSurahs(): Promise<Surah[]>
  getJuz(): Promise<Juz[]>
  getHizb(): Promise<Hizb[]>
  getMushafPages(): Promise<MushafPage[]>
  getAyahs(surah: number): Promise<Ayah[]>
  getAyah(surah: number, ayah: number): Promise<Ayah | null>
  getTranslations(surah: number, language?: string): Promise<Translation[]>
  getTranslation(surah: number, ayah: number, language?: string): Promise<Translation | null>
  getTransliterations(surah: number, language?: string): Promise<Transliteration[]>
  getTransliteration(surah: number, ayah: number, language?: string): Promise<Transliteration | null>
  getJuzAyahs(juzIndex: number): Promise<Ayah[]>
  getJuzTranslations(juzIndex: number, language?: string): Promise<Translation[]>
  getJuzTransliterations(juzIndex: number, language?: string): Promise<Transliteration[]>
  getHizbAyahs(hizbIndex: number): Promise<Ayah[]>
  getHizbTranslations(hizbIndex: number, language?: string): Promise<Translation[]>
  getHizbTransliterations(hizbIndex: number, language?: string): Promise<Transliteration[]>
  getMushafPageAyahs(pageNumber: number): Promise<Ayah[]>
  getMushafPageTranslations(pageNumber: number, language?: string): Promise<Translation[]>
  getMushafPageTransliterations(pageNumber: number, language?: string): Promise<Transliteration[]>
  search(query: string, options?: SearchOptions): Promise<SearchResult[]>
}

export interface SearchOptions {
  limit?: number
  surah?: number
  language?: string
}