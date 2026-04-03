// API base URL config
// All new backend calls would be built from this base url
// Example: `${API_BASE_URL}/user/login/`
export const API_BASE_URL = 'http://127.0.0.1:7000/api/v1'

// --- File Upload ---
export const FILE_UPLOAD_URL = `${API_BASE_URL}/service/upload-file/`
export const UPLOADED_FILE_URL = (filename) => `http://127.0.0.1:7000/media/uploaded-files/${filename}`
export const STATIC_FILES_URL = `http://localhost:3039/`

// --- User Management ---
export const USERS_GET_URL = `${API_BASE_URL}/user/get`
export const USER_ADD_URL = `${API_BASE_URL}/user/add/`
export const USER_UPDATE_URL = `${API_BASE_URL}/user/update/`
export const USER_DELETE_URL = (id) => `${API_BASE_URL}/user/delete/${id}/`
export const USER_GET_ROLES_URL = `${API_BASE_URL}/user/get-roles/`
export const USER_UPDATE_PROFILE_URL = `${API_BASE_URL}/user/update-profile/`
export const USER_CHANGE_PASSWORD_URL = `${API_BASE_URL}/user/change-password/`
export const USER_GET_ME_URL = (id) => `${API_BASE_URL}/user/get-me/${id}/`
export const USER_LOGOUT_URL = `${API_BASE_URL}/user/logout/`

// --- Dashboard Reports ---
export const DASHBOARD_YEARLY_PURCHASE_URL = `${API_BASE_URL}/report/yearly-purchase-report/`
export const DASHBOARD_GENERAL_METRICS_URL = `${API_BASE_URL}/report/general-metrics/`
export const DASHBOARD_SCRAP_GRADE_URL = `${API_BASE_URL}/report/scrap-grade-percentage/`


// --- Scrap Purchase ---
export const SCRAP_PURCHASE_UPLOAD_URL = `${API_BASE_URL}/grn/upload/`
export const GRN_RECORDS_URL = `${API_BASE_URL}/grn/grn/`
export const GRN_ADD_WASTE_URL = `${API_BASE_URL}/grn/add-waste/`
export const GRN_CHANGE_STATUS_URL = `${API_BASE_URL}/grn/change-grn-status/`
export const GRN_ROLLBACK_STATUS_URL = `${API_BASE_URL}/grn/rollback-grn-status/`
export const GRN_PAY_CUSTOMER_URL = `${API_BASE_URL}/grn/pay-customer/`
export const GRN_DELETE_URL = (id) => `${API_BASE_URL}/grn/delete-grn/${id}/`
export const GRN_STATUS_LIST_URL = `${API_BASE_URL}/grn/get-status-list/`
export const GRN_SERIAL_INITIALIZE_URL = `${API_BASE_URL}/grn/initialize-grn-serial-number/`
export const GRN_SERIAL_GET_URL = `${API_BASE_URL}/grn/get-grn-serial-numbers/`
export const MELTING_PLANT_ADD_URL = `${API_BASE_URL}/material/add-melting-plant/`
export const MELTING_PLANT_EDIT_URL = `${API_BASE_URL}/material/edit-melting-plant/`
export const MELTING_PLANT_GET_URL = `${API_BASE_URL}/material/get-melting-plants/`
export const MELTING_PLANT_DELETE_URL = (id) => `${API_BASE_URL}/material/delete-melting-plant/${id}/`
export const STOCK_BEGINNING_BALANCE_URL = `${API_BASE_URL}/stock/add-beginning-balance/`
export const STOCK_SUMMARY_GET_URL = `${API_BASE_URL}/stock/get-stock-summery/`
export const STOCK_BALANCE_GET_URL = `${API_BASE_URL}/stock/get-stock-balance/`
export const STOCK_AGGREGATED_REPORT_URL = `${API_BASE_URL}/stock/get-stock-aggregated-report/`
export const STOCK_CARD_URL = `${API_BASE_URL}/stock/get-stock-card/`
export const RATE_ADD_URL = `${API_BASE_URL}/rate/add/`
export const RATE_ARCHIVE_URL = `${API_BASE_URL}/rate/archive/`
export const MATERIAL_TYPES_GET_URL = `${API_BASE_URL}/grn/get-material-types/`
export const GRN_PLAIN_REPORT_URL = `${API_BASE_URL}/report/plain-report/`
export const GRN_AGGREGATE_REPORT_URL = `${API_BASE_URL}/report/aggregate-report/`
export const GRN_RECEIPT_GET_URL = (record_no) => `${API_BASE_URL}/grn/get-scrap-receipt/${record_no}/`

// --- Customer Management ---
export const CUSTOMERS_GET_URL = `${API_BASE_URL}/customer/get-customers/`
export const CUSTOMER_ADD_URL = `${API_BASE_URL}/customer/add-customer/`
export const CUSTOMER_EDIT_URL = (id) => `${API_BASE_URL}/customer/edit-customer/${id}/`
export const CUSTOMER_FILTER_URL = `${API_BASE_URL}/customer/filter-customer/` // takes ?tin=
export const CUSTOMER_DELETE_URL = (id) => `${API_BASE_URL}/customer/delete-customer/${id}/`
export const CUSTOMER_PAY_URL = `${API_BASE_URL}/customer/pay-customer/`
export const CUSTOMER_PLAIN_REPORT_URL = `${API_BASE_URL}/customer/purchase-customer-report/`
export const CUSTOMER_AGGREGATE_REPORT_URL = `${API_BASE_URL}/customer/purchase-customer-aggregated-report/`

// --- Raw Material ---
export const RAW_MATERIAL_GET_PLANTS_URL = `${API_BASE_URL}/material/get-plants/`
export const RAW_MATERIAL_REQUISITION_ADD_URL = `${API_BASE_URL}/material/add-material-requisition/`
export const RAW_MATERIAL_REQUISITION_GET_URL = `${API_BASE_URL}/material/get-material-requisitions/`
export const RAW_MATERIAL_REQUISITION_DETAIL_URL = (id) => `${API_BASE_URL}/material/get-material-requisition/${id}/`
export const RAW_MATERIAL_REQUISITION_DELETE_URL = (id) => `${API_BASE_URL}/material/delete-material-requisition/${id}/`
export const RAW_MATERIAL_REQUISITION_APPROVE_URL = (id) => `${API_BASE_URL}/material/approve-material-requisition/${id}/`
export const RAW_MATERIAL_REQUISITION_EDIT_URL = `${API_BASE_URL}/material/edit-material-requisition/`
export const MATERIAL_REQUISITION_REPORT_URL = `${API_BASE_URL}/material/material-requisition-report/`
export const MATERIAL_ISSUE_REPORT_URL = `${API_BASE_URL}/material/material-issue-report/`

// --- Raw Material Issue ---
export const RAW_MATERIAL_ISSUE_GET_URL = `${API_BASE_URL}/material/get-raw-material-issues/`
export const RAW_MATERIAL_ISSUE_ADD_URL = `${API_BASE_URL}/material/add-raw-material-issue/`
export const RAW_MATERIAL_ISSUE_EDIT_URL = `${API_BASE_URL}/material/edit-raw-material-issue/`
export const RAW_MATERIAL_ISSUE_DELETE_URL = (id) => `${API_BASE_URL}/material/delete-raw-material-issue/${id}/`
export const RAW_MATERIAL_ISSUE_DETAIL_URL = (id) => `${API_BASE_URL}/material/get-raw-material-issue/${id}/`
export const RAW_MATERIAL_ISSUE_CHANGE_STATUS_URL = (id) => `${API_BASE_URL}/material/change-status-issue/${id}/`
export const RAW_MATERIAL_ISSUE_GET_APPROVED_REQUISITIONS_URL = `${API_BASE_URL}/material/get-approved-material-requisitions/`

// --- Internal / Transport Agencies ---
export const INTERNAL_AGENCIES_GET_URL = `${API_BASE_URL}/internal/get-agencies/`
export const INTERNAL_AGENCY_ADD_URL = `${API_BASE_URL}/internal/add-agency/`
export const INTERNAL_AGENCY_UPDATE_URL = `${API_BASE_URL}/internal/update-agency/`
export const INTERNAL_AGENCY_DELETE_URL = (id) => `${API_BASE_URL}/internal/delete-agency/${id}/`

// --- Internal / Agency Agreements ---
export const INTERNAL_AGREEMENTS_LIST_URL = `${API_BASE_URL}/internal/get-agreements/`
export const INTERNAL_AGREEMENTS_GET_URL = (id) => `${API_BASE_URL}/internal/get-agreement/${id}/`
export const INTERNAL_AGREEMENT_ADD_URL = `${API_BASE_URL}/internal/add-agreement/`
export const INTERNAL_AGREEMENT_UPDATE_URL = `${API_BASE_URL}/internal/update-agreement/`
export const INTERNAL_AGREEMENT_UPDATE_RANGE_URL = `${API_BASE_URL}/internal/update-agreement-range/`
export const INTERNAL_AGREEMENT_DELETE_URL = (id) => `${API_BASE_URL}/internal/delete-agreement/${id}/`

// --- Transport Data ---
export const INTERNAL_UPLOAD_CSV_URL = `${API_BASE_URL}/internal/upload-csv-file/`
export const INTERNAL_FACTORY_SCRAP_RECORDS_URL = `${API_BASE_URL}/internal/get-filtered-factory-scrap-records/`
export const INTERNAL_DAILY_TRANSPORT_AGGREGATE_URL = `${API_BASE_URL}/internal/get-daily-scrap-move-aggregate/`
export const INTERNAL_DAILY_TRANSPORT_APPROVE_URL = `${API_BASE_URL}/internal/approve-record-supervisor/`
export const INTERNAL_DAILY_TRANSPORT_PAY_URL = `${API_BASE_URL}/internal/pay-agency-finance/`
export const INTERNAL_AGENCY_PERFORMANCE_URL = `${API_BASE_URL}/internal/get-daily-performance-calculator/`
