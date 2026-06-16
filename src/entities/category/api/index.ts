import * as categorySqlite from '@/shared/api/category'

export function createCategoryApi() {
  return {
    getByType: categorySqlite.getCategoriesByType,
  }
}
