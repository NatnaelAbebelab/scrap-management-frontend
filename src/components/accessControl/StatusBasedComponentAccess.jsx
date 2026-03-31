import React from 'react'

/**
 * StatusBasedComponentAccess
 * 
 * Wraps a component to restrict access based on the status of an entity.
 * 
 * @param {string} currentStatus - The status of the current entity/record
 * @param {Array} allowedStatuses - List of statuses permitted to see the children
 * @param {React.Node} children - Component to render if access is granted
 * @param {React.Node} [deniedComponent=null] - Optional component to render if access is denied
 */
const StatusBasedComponentAccess = ({ currentStatus, allowedStatuses = [], children, deniedComponent = null }) => {
  const hasAccess = allowedStatuses.includes(currentStatus)

  if (!hasAccess) {
    return deniedComponent
  }

  return <>{children}</>
}

export default StatusBasedComponentAccess

/*
=============USAGE===================
import { StatusBasedComponentAccess } from '../components/accessControl'

<StatusBasedComponentAccess 
  currentStatus={record.status} 
  allowedStatuses={['pending', 'in_progress']}
>
  <Button>Edit Status</Button>
</StatusBasedComponentAccess>


*/
