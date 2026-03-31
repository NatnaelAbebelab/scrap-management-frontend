import React from 'react'
import { useAuth } from '../auth/AuthProvider'

/**
 * RoleBasedComponentAccess
 * 
 * Wraps a component to restrict access based on the user's role.
 * 
 * @param {Array} allowedRoles - List of roles permitted to see the children
 * @param {React.Node} children - Component to render if access is granted
 * @param {React.Node} [unauthorizedComponent=null] - Optional component to render if access is denied
 */
const RoleBasedComponentAccess = ({ allowedRoles = [], children, unauthorizedComponent = null }) => {
  const { user } = useAuth()

  // Check if user exists and has a role that is included in allowedRoles
  // Supports both user.role (string) and user.roles (array) if available
  const userRole = user?.role

  const hasAccess = allowedRoles.includes(userRole)

  if (!hasAccess) {
    return unauthorizedComponent
  }

  return <>{children}</>
}

export default RoleBasedComponentAccess

/*
================USAGE=============
import { RoleBasedComponentAccess } from '../components/accessControl'

<RoleBasedComponentAccess allowedRoles={['admin', 'manager']}>
  <Button type="primary">Delete Record</Button>
</RoleBasedComponentAccess>


===============INTERGRATED USAGE===================
<RoleBasedComponentAccess allowedRoles={['admin']}>
  <StatusBasedComponentAccess currentStatus={record.status} allowedStatuses={['pending']}>
    <Button danger>Void Transaction</Button>
  </StatusBasedComponentAccess>
</RoleBasedComponentAccess>

*/