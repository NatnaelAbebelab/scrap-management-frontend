import { useAuth } from '../../auth/AuthProvider'

/**
 * useRoleAccess Hook
 * 
 * Provides utilities for role-based access control within components.
 * 
 * @returns {Object} { userRole, hasAccess, filterByRole }
 */
const useRoleAccess = () => {
  const { user } = useAuth()
  
  // Extract user role consistently
  const userRole = user?.role || user?.email?.role

  /**
   * Checks if the current user has access based on allowed roles.
   * 
   * @param {Array} allowedRoles - List of roles permitted
   * @returns {Boolean}
   */
  const hasAccess = (allowedRoles) => {
    if (!allowedRoles || (Array.isArray(allowedRoles) && allowedRoles.length === 0)) return true
    return allowedRoles.includes(userRole)
  }

  /**
   * Filters an array of items (like menu items or action items) based on their allowedRoles property.
   * 
   * @param {Array} items - Array of objects with an optional allowedRoles field
   * @returns {Array} Filtered items
   */
  const filterByRole = (items) => {
    if (!Array.isArray(items)) return []
    return items.filter(item => hasAccess(item.allowedRoles))
  }

  return { userRole, hasAccess, filterByRole }
}

export default useRoleAccess
