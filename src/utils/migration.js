/**
 * Generic migration utility to sync localStorage data to the database
 */
export async function migrateLocalData(key, apiPath, userId, transform = (item) => item) {
  const savedData = localStorage.getItem(key);
  if (!savedData) return null;

  try {
    const itemsToMigrate = JSON.parse(savedData);
    if (!Array.isArray(itemsToMigrate)) return null;

    const migratedItems = [];
    for (const item of itemsToMigrate) {
      const res = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...transform(item), userId })
      });
      if (res.ok) {
        migratedItems.push(await res.json());
      }
    }
    
    // Once migrated, we could clear localStorage, but keeping it as backup for now
    // localStorage.removeItem(key); 
    
    return migratedItems;
  } catch (error) {
    console.error(`Migration failed for ${key}:`, error);
    return null;
  }
}
