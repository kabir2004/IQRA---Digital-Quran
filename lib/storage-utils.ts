/**
 * Storage utilities for handling localStorage migration and cleanup
 */

export const STORAGE_KEYS = {
  SETTINGS: 'iqra-settings',
  PROGRESS: 'iqra-progress-storage',
  BOOKMARKS: 'iqra-bookmarks',
  SIDEBAR: 'sidebar-storage',
  STUDY_GROUPS: 'iqra-study-groups',
  USER_METRICS: 'iqra-user-metrics',
} as const

/**
 * Clear all IQRA-related localStorage data
 */
export function clearAllIQRAStorage(): void {
  if (typeof window === 'undefined') return
  
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key)
  })
  
  console.log('All IQRA storage data cleared')
}

/**
 * Clear specific storage by key
 */
export function clearStorage(key: keyof typeof STORAGE_KEYS): void {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem(STORAGE_KEYS[key])
  console.log(`Storage cleared for key: ${key}`)
}

/**
 * Check if storage exists and is valid JSON
 */
export function isStorageValid(key: keyof typeof STORAGE_KEYS): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    const data = localStorage.getItem(STORAGE_KEYS[key])
    if (!data) return false
    
    JSON.parse(data)
    return true
  } catch {
    return false
  }
}

/**
 * Get storage data safely
 */
export function getStorageData<T>(key: keyof typeof STORAGE_KEYS, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  
  try {
    const data = localStorage.getItem(STORAGE_KEYS[key])
    if (!data) return defaultValue
    
    return JSON.parse(data)
  } catch {
    console.warn(`Invalid storage data for key: ${key}, using default value`)
    return defaultValue
  }
}

/**
 * Set storage data safely
 */
export function setStorageData<T>(key: keyof typeof STORAGE_KEYS, data: T): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(data))
  } catch (error) {
    console.error(`Failed to set storage data for key: ${key}`, error)
  }
}
