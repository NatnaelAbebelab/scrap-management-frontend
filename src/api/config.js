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
