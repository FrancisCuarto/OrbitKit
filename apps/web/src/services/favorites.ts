const STORAGE_KEY = 'devdock_favorites';

export function getLocalFavorites(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function toggleLocalFavorite(resourceId: string): boolean {
  try {
    const favorites = getLocalFavorites();
    const index = favorites.indexOf(resourceId);
    let isNowFavorite = false;

    if (index >= 0) {
      favorites.splice(index, 1);
      isNowFavorite = false;
    } else {
      favorites.push(resourceId);
      isNowFavorite = true;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    return isNowFavorite;
  } catch {
    return false;
  }
}

export function isLocalFavorite(resourceId: string): boolean {
  return getLocalFavorites().includes(resourceId);
}
