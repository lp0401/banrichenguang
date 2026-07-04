/**
 * 本地存储 key 迁移工具
 *
 * 将旧品牌前缀 `taibu.` / `taibu:` 的数据迁移到 `banri-chenguang.` / `banri-chenguang:`。
 * 幂等：已存在新 key 时不会覆盖。
 */

const LEGACY_PREFIXES = [
  { old: 'taibu.data_sources.', new: 'banri-chenguang.data_sources.' },
  { old: 'taibu.knowledge_bases.', new: 'banri-chenguang.knowledge_bases.' },
  { old: 'taibu.', new: 'banri-chenguang.' },
  { old: 'taibu:', new: 'banri-chenguang:' },
];

export function migrateLegacyLocalStorage(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  const keysToRemove: string[] = [];

  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (!key) continue;

    for (const mapping of LEGACY_PREFIXES) {
      if (key.startsWith(mapping.old)) {
        const newKey = mapping.new + key.slice(mapping.old.length);
        if (window.localStorage.getItem(newKey) === null) {
          const value = window.localStorage.getItem(key);
          if (value !== null) {
            window.localStorage.setItem(newKey, value);
          }
        }
        keysToRemove.push(key);
        break;
      }
    }
  }

  for (const key of keysToRemove) {
    window.localStorage.removeItem(key);
  }
}
