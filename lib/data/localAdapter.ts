import { DataAdapter, Ayah, Translation, Transliteration, Surah, Juz, Hizb, MushafPage, SearchResult, SearchOptions } from './adapter'

export class LocalDataAdapter implements DataAdapter {
  private surahs: Surah[] | null = null
  private juz: Juz[] | null = null
  private hizb: Hizb[] | null = null
  private mushafPages: MushafPage[] | null = null
  private ayahs: Map<number, Ayah[]> = new Map()
  private translations: Map<string, Translation[]> = new Map()
  private transliterations: Map<string, Transliteration[]> = new Map()

  async getSurahs(): Promise<Surah[]> {
    if (!this.surahs) {
      try {
        const response = await fetch('/data/surahs.json')
        this.surahs = await response.json()
      } catch (error) {
        console.error('Failed to load surahs:', error)
        this.surahs = []
      }
    }
    return this.surahs || []
  }

  async getJuz(): Promise<Juz[]> {
    if (!this.juz) {
      try {
        const response = await fetch('/data/juz.json')
        this.juz = await response.json()
      } catch (error) {
        console.error('Failed to load juz:', error)
        this.juz = []
      }
    }
    return this.juz || []
  }

  async getHizb(): Promise<Hizb[]> {
    if (!this.hizb) {
      try {
        const response = await fetch('/data/hizb.json')
        this.hizb = await response.json()
      } catch (error) {
        console.error('Failed to load hizb data:', error)
        this.hizb = []
      }
    }
    return this.hizb || []
  }

  async getMushafPages(): Promise<MushafPage[]> {
    if (!this.mushafPages) {
      try {
        const response = await fetch('/data/mushaf-pages.json')
        this.mushafPages = await response.json()
      } catch (error) {
        console.error('Failed to load mushaf pages data:', error)
        this.mushafPages = []
      }
    }
    return this.mushafPages || []
  }

  async getAyahs(surah: number): Promise<Ayah[]> {
    if (!this.ayahs.has(surah)) {
      try {
        const response = await fetch('/data/quran-uthmani.json')
        const allAyahs: Ayah[] = await response.json()
        const surahAyahs = allAyahs.filter(ayah => ayah.surah === surah)
        this.ayahs.set(surah, surahAyahs)
      } catch (error) {
        console.error(`Failed to load ayahs for surah ${surah}:`, error)
        this.ayahs.set(surah, [])
      }
    }
    return this.ayahs.get(surah) || []
  }

  async getAyah(surah: number, ayah: number): Promise<Ayah | null> {
    const ayahs = await this.getAyahs(surah)
    return ayahs.find(a => a.ayah === ayah) || null
  }

  async getTranslations(surah: number, language: string = 'en'): Promise<Translation[]> {
    const key = `${surah}-${language}`
    if (!this.translations.has(key)) {
      try {
        const response = await fetch(`/data/translations/${language}_sahih.json`)
        const allTranslations: Translation[] = await response.json()
        const surahTranslations = allTranslations.filter(t => t.surah === surah)
        this.translations.set(key, surahTranslations)
      } catch (error) {
        console.error(`Failed to load translations for surah ${surah} in ${language}:`, error)
        this.translations.set(key, [])
      }
    }
    return this.translations.get(key) || []
  }

  async getTranslation(surah: number, ayah: number, language: string = 'en'): Promise<Translation | null> {
    const translations = await this.getTranslations(surah, language)
    return translations.find(t => t.ayah === ayah) || null
  }

  async getTransliterations(surah: number, language: string = 'en'): Promise<Transliteration[]> {
    const key = `${surah}-${language}`
    if (!this.transliterations.has(key)) {
      try {
        const response = await fetch(`/data/transliterations/${language}_transliteration.json`)
        const allTransliterations: Transliteration[] = await response.json()
        const surahTransliterations = allTransliterations.filter(t => t.surah === surah)
        this.transliterations.set(key, surahTransliterations)
      } catch (error) {
        console.error(`Failed to load transliterations for surah ${surah} in ${language}:`, error)
        this.transliterations.set(key, [])
      }
    }
    return this.transliterations.get(key) || []
  }

  async getTransliteration(surah: number, ayah: number, language: string = 'en'): Promise<Transliteration | null> {
    const transliterations = await this.getTransliterations(surah, language)
    return transliterations.find(t => t.ayah === ayah) || null
  }

  async getJuzAyahs(juzIndex: number): Promise<Ayah[]> {
    const juzList = await this.getJuz()
    const juz = juzList.find(j => j.index === juzIndex)
    if (!juz) return []

    let allAyahs: Ayah[] = []

    // If Juz spans multiple surahs, collect from all relevant surahs
    for (let surahNum = juz.start_surah; surahNum <= juz.end_surah; surahNum++) {
      const surahAyahs = await this.getAyahs(surahNum)
      
      if (surahNum === juz.start_surah && surahNum === juz.end_surah) {
        // Single surah Juz - filter by ayah range
        const filteredAyahs = surahAyahs.filter(
          ayah => ayah.ayah >= juz.start_ayah && ayah.ayah <= juz.end_ayah
        )
        allAyahs.push(...filteredAyahs)
      } else if (surahNum === juz.start_surah) {
        // First surah - from start_ayah to end
        const filteredAyahs = surahAyahs.filter(ayah => ayah.ayah >= juz.start_ayah)
        allAyahs.push(...filteredAyahs)
      } else if (surahNum === juz.end_surah) {
        // Last surah - from beginning to end_ayah
        const filteredAyahs = surahAyahs.filter(ayah => ayah.ayah <= juz.end_ayah)
        allAyahs.push(...filteredAyahs)
      } else {
        // Middle surahs - include all ayahs
        allAyahs.push(...surahAyahs)
      }
    }

    return allAyahs
  }

  async getJuzTranslations(juzIndex: number, language: string = 'en'): Promise<Translation[]> {
    const juzList = await this.getJuz()
    const juz = juzList.find(j => j.index === juzIndex)
    if (!juz) return []

    let allTranslations: Translation[] = []

    // Load translations for all surahs in this Juz
    for (let surahNum = juz.start_surah; surahNum <= juz.end_surah; surahNum++) {
      const surahTranslations = await this.getTranslations(surahNum, language)
      
      if (surahNum === juz.start_surah && surahNum === juz.end_surah) {
        // Single surah Juz - filter by ayah range
        const filteredTranslations = surahTranslations.filter(
          translation => translation.ayah >= juz.start_ayah && translation.ayah <= juz.end_ayah
        )
        allTranslations.push(...filteredTranslations)
      } else if (surahNum === juz.start_surah) {
        // First surah - from start_ayah to end
        const filteredTranslations = surahTranslations.filter(
          translation => translation.ayah >= juz.start_ayah
        )
        allTranslations.push(...filteredTranslations)
      } else if (surahNum === juz.end_surah) {
        // Last surah - from beginning to end_ayah
        const filteredTranslations = surahTranslations.filter(
          translation => translation.ayah <= juz.end_ayah
        )
        allTranslations.push(...filteredTranslations)
      } else {
        // Middle surahs - include all translations
        allTranslations.push(...surahTranslations)
      }
    }

    return allTranslations
  }

  async getJuzTransliterations(juzIndex: number, language: string = 'en'): Promise<Transliteration[]> {
    const juzList = await this.getJuz()
    const juz = juzList.find(j => j.index === juzIndex)
    if (!juz) return []

    let allTransliterations: Transliteration[] = []

    // Load transliterations for all surahs in this Juz
    for (let surahNum = juz.start_surah; surahNum <= juz.end_surah; surahNum++) {
      const surahTransliterations = await this.getTransliterations(surahNum, language)
      
      if (surahNum === juz.start_surah && surahNum === juz.end_surah) {
        // Single surah Juz - filter by ayah range
        const filteredTransliterations = surahTransliterations.filter(
          transliteration => transliteration.ayah >= juz.start_ayah && transliteration.ayah <= juz.end_ayah
        )
        allTransliterations.push(...filteredTransliterations)
      } else if (surahNum === juz.start_surah) {
        // First surah - from start_ayah to end
        const filteredTransliterations = surahTransliterations.filter(
          transliteration => transliteration.ayah >= juz.start_ayah
        )
        allTransliterations.push(...filteredTransliterations)
      } else if (surahNum === juz.end_surah) {
        // Last surah - from beginning to end_ayah
        const filteredTransliterations = surahTransliterations.filter(
          transliteration => transliteration.ayah <= juz.end_ayah
        )
        allTransliterations.push(...filteredTransliterations)
      } else {
        // Middle surahs - include all transliterations
        allTransliterations.push(...surahTransliterations)
      }
    }

    return allTransliterations
  }

  async getHizbAyahs(hizbIndex: number): Promise<Ayah[]> {
    const hizbList = await this.getHizb()
    const hizb = hizbList.find(h => h.index === hizbIndex)
    if (!hizb) return []

    let allAyahs: Ayah[] = []

    // If Hizb spans multiple surahs, collect from all relevant surahs
    for (let surahNum = hizb.start_surah; surahNum <= hizb.end_surah; surahNum++) {
      const surahAyahs = await this.getAyahs(surahNum)
      
      if (surahNum === hizb.start_surah && surahNum === hizb.end_surah) {
        // Single surah Hizb - filter by ayah range
        const filteredAyahs = surahAyahs.filter(
          ayah => ayah.ayah >= hizb.start_ayah && ayah.ayah <= hizb.end_ayah
        )
        allAyahs.push(...filteredAyahs)
      } else if (surahNum === hizb.start_surah) {
        // First surah - from start_ayah to end
        const filteredAyahs = surahAyahs.filter(ayah => ayah.ayah >= hizb.start_ayah)
        allAyahs.push(...filteredAyahs)
      } else if (surahNum === hizb.end_surah) {
        // Last surah - from beginning to end_ayah
        const filteredAyahs = surahAyahs.filter(ayah => ayah.ayah <= hizb.end_ayah)
        allAyahs.push(...filteredAyahs)
      } else {
        // Middle surahs - include all ayahs
        allAyahs.push(...surahAyahs)
      }
    }

    return allAyahs
  }

  async getHizbTranslations(hizbIndex: number, language: string = 'en'): Promise<Translation[]> {
    const hizbList = await this.getHizb()
    const hizb = hizbList.find(h => h.index === hizbIndex)
    if (!hizb) return []

    let allTranslations: Translation[] = []

    // Load translations for all surahs in this Hizb
    for (let surahNum = hizb.start_surah; surahNum <= hizb.end_surah; surahNum++) {
      const surahTranslations = await this.getTranslations(surahNum, language)
      
      if (surahNum === hizb.start_surah && surahNum === hizb.end_surah) {
        // Single surah Hizb - filter by ayah range
        const filteredTranslations = surahTranslations.filter(
          translation => translation.ayah >= hizb.start_ayah && translation.ayah <= hizb.end_ayah
        )
        allTranslations.push(...filteredTranslations)
      } else if (surahNum === hizb.start_surah) {
        // First surah - from start_ayah to end
        const filteredTranslations = surahTranslations.filter(
          translation => translation.ayah >= hizb.start_ayah
        )
        allTranslations.push(...filteredTranslations)
      } else if (surahNum === hizb.end_surah) {
        // Last surah - from beginning to end_ayah
        const filteredTranslations = surahTranslations.filter(
          translation => translation.ayah <= hizb.end_ayah
        )
        allTranslations.push(...filteredTranslations)
      } else {
        // Middle surahs - include all translations
        allTranslations.push(...surahTranslations)
      }
    }

    return allTranslations
  }

  async getHizbTransliterations(hizbIndex: number, language: string = 'en'): Promise<Transliteration[]> {
    const hizbList = await this.getHizb()
    const hizb = hizbList.find(h => h.index === hizbIndex)
    if (!hizb) return []

    let allTransliterations: Transliteration[] = []

    // Load transliterations for all surahs in this Hizb
    for (let surahNum = hizb.start_surah; surahNum <= hizb.end_surah; surahNum++) {
      const surahTransliterations = await this.getTransliterations(surahNum, language)
      
      if (surahNum === hizb.start_surah && surahNum === hizb.end_surah) {
        // Single surah Hizb - filter by ayah range
        const filteredTransliterations = surahTransliterations.filter(
          transliteration => transliteration.ayah >= hizb.start_ayah && transliteration.ayah <= hizb.end_ayah
        )
        allTransliterations.push(...filteredTransliterations)
      } else if (surahNum === hizb.start_surah) {
        // First surah - from start_ayah to end
        const filteredTransliterations = surahTransliterations.filter(
          transliteration => transliteration.ayah >= hizb.start_ayah
        )
        allTransliterations.push(...filteredTransliterations)
      } else if (surahNum === hizb.end_surah) {
        // Last surah - from beginning to end_ayah
        const filteredTransliterations = surahTransliterations.filter(
          transliteration => transliteration.ayah <= hizb.end_ayah
        )
        allTransliterations.push(...filteredTransliterations)
      } else {
        // Middle surahs - include all transliterations
        allTransliterations.push(...surahTransliterations)
      }
    }

    return allTransliterations
  }

  async getMushafPageAyahs(pageNumber: number): Promise<Ayah[]> {
    const pages = await this.getMushafPages()
    const page = pages.find(p => p.page === pageNumber)
    if (!page) return []

    let allAyahs: Ayah[] = []

    // If Mushaf page spans multiple surahs, collect from all relevant surahs
    for (let surahNum = page.start_surah; surahNum <= page.end_surah; surahNum++) {
      const surahAyahs = await this.getAyahs(surahNum)
      
      if (surahNum === page.start_surah && surahNum === page.end_surah) {
        // Single surah page - filter by ayah range
        const filteredAyahs = surahAyahs.filter(
          ayah => ayah.ayah >= page.start_ayah && ayah.ayah <= page.end_ayah
        )
        allAyahs.push(...filteredAyahs)
      } else if (surahNum === page.start_surah) {
        // First surah - from start_ayah to end
        const filteredAyahs = surahAyahs.filter(ayah => ayah.ayah >= page.start_ayah)
        allAyahs.push(...filteredAyahs)
      } else if (surahNum === page.end_surah) {
        // Last surah - from beginning to end_ayah
        const filteredAyahs = surahAyahs.filter(ayah => ayah.ayah <= page.end_ayah)
        allAyahs.push(...filteredAyahs)
      } else {
        // Middle surahs - include all ayahs
        allAyahs.push(...surahAyahs)
      }
    }

    return allAyahs
  }

  async getMushafPageTranslations(pageNumber: number, language: string = 'en'): Promise<Translation[]> {
    const pages = await this.getMushafPages()
    const page = pages.find(p => p.page === pageNumber)
    if (!page) return []

    let allTranslations: Translation[] = []

    // Load translations for all surahs in this Mushaf page
    for (let surahNum = page.start_surah; surahNum <= page.end_surah; surahNum++) {
      const surahTranslations = await this.getTranslations(surahNum, language)
      
      if (surahNum === page.start_surah && surahNum === page.end_surah) {
        // Single surah page - filter by ayah range
        const filteredTranslations = surahTranslations.filter(
          translation => translation.ayah >= page.start_ayah && translation.ayah <= page.end_ayah
        )
        allTranslations.push(...filteredTranslations)
      } else if (surahNum === page.start_surah) {
        // First surah - from start_ayah to end
        const filteredTranslations = surahTranslations.filter(
          translation => translation.ayah >= page.start_ayah
        )
        allTranslations.push(...filteredTranslations)
      } else if (surahNum === page.end_surah) {
        // Last surah - from beginning to end_ayah
        const filteredTranslations = surahTranslations.filter(
          translation => translation.ayah <= page.end_ayah
        )
        allTranslations.push(...filteredTranslations)
      } else {
        // Middle surahs - include all translations
        allTranslations.push(...surahTranslations)
      }
    }

    return allTranslations
  }

  async getMushafPageTransliterations(pageNumber: number, language: string = 'en'): Promise<Transliteration[]> {
    const pages = await this.getMushafPages()
    const page = pages.find(p => p.page === pageNumber)
    if (!page) return []

    let allTransliterations: Transliteration[] = []

    // Load transliterations for all surahs in this Mushaf page
    for (let surahNum = page.start_surah; surahNum <= page.end_surah; surahNum++) {
      const surahTransliterations = await this.getTransliterations(surahNum, language)
      
      if (surahNum === page.start_surah && surahNum === page.end_surah) {
        // Single surah page - filter by ayah range
        const filteredTransliterations = surahTransliterations.filter(
          transliteration => transliteration.ayah >= page.start_ayah && transliteration.ayah <= page.end_ayah
        )
        allTransliterations.push(...filteredTransliterations)
      } else if (surahNum === page.start_surah) {
        // First surah - from start_ayah to end
        const filteredTransliterations = surahTransliterations.filter(
          transliteration => transliteration.ayah >= page.start_ayah
        )
        allTransliterations.push(...filteredTransliterations)
      } else if (surahNum === page.end_surah) {
        // Last surah - from beginning to end_ayah
        const filteredTransliterations = surahTransliterations.filter(
          transliteration => transliteration.ayah <= page.end_ayah
        )
        allTransliterations.push(...filteredTransliterations)
      } else {
        // Middle surahs - include all transliterations
        allTransliterations.push(...surahTransliterations)
      }
    }

    return allTransliterations
  }

  async search(query: string, options?: SearchOptions): Promise<SearchResult[]> {
    if (!query.trim()) return []

    const results: SearchResult[] = []
    const searchTerm = query.toLowerCase()
    const limit = options?.limit || 50

    try {
      const response = await fetch('/data/quran-uthmani.json')
      const allAyahs: Ayah[] = await response.json()

      let filteredAyahs = allAyahs
      if (options?.surah) {
        filteredAyahs = allAyahs.filter(ayah => ayah.surah === options.surah)
      }

      for (const ayah of filteredAyahs) {
        if (results.length >= limit) break
        
        if (ayah.text.toLowerCase().includes(searchTerm)) {
          const translation = await this.getTranslation(ayah.surah, ayah.ayah, options?.language)
          
          results.push({
            surah: ayah.surah,
            ayah: ayah.ayah,
            text: ayah.text,
            translation: translation?.text,
            highlight: this.highlightText(ayah.text, searchTerm)
          })
        }
      }
    } catch (error) {
      console.error('Search failed:', error)
    }

    return results
  }

  private highlightText(text: string, searchTerm: string): string {
    const regex = new RegExp(`(${searchTerm})`, 'gi')
    return text.replace(regex, '<mark>$1</mark>')
  }
}

export const dataAdapter = new LocalDataAdapter()