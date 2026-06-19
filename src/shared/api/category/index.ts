export {
  getCategoriesByType,
  getAllCategories,
  getCategoryById,
  createCategoryLocally,
  updateCategoryLocally,
  deleteCategoryLocally,
  getLastSortOrder,
  reorderCategoriesLocally,
  getLastUsedCategory,
  setLastUsedCategory,
} from '@/shared/api/category/sqlite'

export {
  fetchCategoriesByType,
  fetchSystemCategories,
  fetchUserCategories,
  createCategory,
  updateCategory,
  deleteCategoryRemote,
  reorderCategoriesRemote,
} from '@/shared/api/category/supabase'
