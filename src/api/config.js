// API base URL config
// All new backend calls would be built from this base url
// Example: `${API_BASE_URL}/user/login/`
export const API_BASE_URL = 'http://127.0.0.1:7000/api/v1'

// --- File Upload ---
export const FILE_UPLOAD_URL = `${API_BASE_URL}/service/upload-file/`

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
export const MELTING_PLANT_GET_URL = `${API_BASE_URL}/material/get-melting-plants/`
export const STOCK_BEGINNING_BALANCE_URL = `${API_BASE_URL}/stock/add-beginning-balance/`
export const STOCK_SUMMARY_GET_URL = `${API_BASE_URL}/stock/get-stock-summery/`
export const RATE_ADD_URL = `${API_BASE_URL}/rate/add/`
export const RATE_ARCHIVE_URL = `${API_BASE_URL}/rate/archive/`
export const MATERIAL_TYPES_GET_URL = `${API_BASE_URL}/grn/get-material-types/`
export const GRN_PLAIN_REPORT_URL = `${API_BASE_URL}/report/plain-report/`
export const GRN_AGGREGATE_REPORT_URL = `${API_BASE_URL}/report/aggregate-report/`

// --- Customer Management ---
export const CUSTOMERS_GET_URL = `${API_BASE_URL}/customer/get-customers/`
export const CUSTOMER_ADD_URL = `${API_BASE_URL}/customer/add-customer/`
export const CUSTOMER_EDIT_URL = (id) => `${API_BASE_URL}/customer/edit-customer/${id}/`
export const CUSTOMER_FILTER_URL = `${API_BASE_URL}/customer/filter-customer/` // takes ?tin=
export const CUSTOMER_DELETE_URL = (id) => `${API_BASE_URL}/customer/delete-customer/${id}/`
export const CUSTOMER_PAY_URL = `${API_BASE_URL}/customer/pay-customer/`
export const CUSTOMER_PLAIN_REPORT_URL = `${API_BASE_URL}/customer/purchase-customer-report/`
export const CUSTOMER_AGGREGATE_REPORT_URL = `${API_BASE_URL}/customer/purchase-customer-aggregated-report/`
