import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import 'antd/dist/reset.css'
import './_components/antd.css'
import CustomerEngagement from './customerEngagement/CustomerEngagement'
import Interactions from './customerEngagement/Interactions'
import CustomerComplaint from './customerEngagement/CustomerComplaint'
import PerformaRequisition from './customerEngagement/PerformaRequisition'
import ProformaList from './customerEngagement/ProformaList'
import Dashboard from './customerEngagement/Dashboard'
import ComplaintDetails from './customerEngagement/ComplaintDetails'
import { AuthProvider, RequireAuth } from './auth/AuthProvider'
import Login from './auth/Login'
import OtpVerification from './auth/OtpVerification'
import MaterialManagement from './settings/MaterialManagement'
import MeltingPlants from './settings/MeltingPlants'
import SettingsDashboard from './settings/SettingsDashboard'
import MaterialIssue from './materialManagement/MaterialIssue'
import CsvExcelUploader from './scrapPurchase/CsvExcelUploader'
import PurchaseRecords from './scrapPurchase/PurchaseRecords'
import MaterialRate from './scrapPurchase/MaterialRate'
import AgencyRegistration from './scrapTransport/AgencyRegistration'
import UserManagement from './settings/UserManagement'
import Profile from './settings/Profile'
import GrnSerialSettings from './settings/GrnSerialSettings'
import StockBeginningBalance from './settings/StockBeginningBalance'
import CustomerList from './customerManagement/CustomerList'
import PlainGrnReport from './reports/PlainGrnReport'
import AggregateGrnReport from './reports/AggregateGrnReport'
import CustomerPlainReport from './reports/CustomerPlainReport'
import CustomerAggregateReport from './reports/CustomerAggregateReport'

import { ConfigProvider } from 'antd'

const root = createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: 'rgb(245, 34, 45)',
          borderRadius: 6,
        },
      }}
    >
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/otp-verification" element={<OtpVerification />} />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/customer-engagement" element={<RequireAuth><CustomerEngagement /></RequireAuth>} />
            <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/complaints/:id" element={<RequireAuth><ComplaintDetails /></RequireAuth>} />

            <Route path="/interactions" element={<RequireAuth><Interactions /></RequireAuth>} />
            <Route path="/interactions/complaint" element={<CustomerComplaint />} />
            <Route path="/interactions/performa" element={<PerformaRequisition />} />
            <Route path="/proformas" element={<RequireAuth><ProformaList /></RequireAuth>} />

            <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />

            <Route path="/material-management/issue" element={<RequireAuth><MaterialIssue /></RequireAuth>} />

            <Route path="/settings" element={<RequireAuth><SettingsDashboard /></RequireAuth>} />
            <Route path="/settings/user-management" element={<RequireAuth><UserManagement /></RequireAuth>} />
            <Route path="/settings/materials" element={<RequireAuth><MaterialManagement /></RequireAuth>} />
            <Route path="/settings/melting-plants" element={<RequireAuth><MeltingPlants /></RequireAuth>} />
            <Route path="/settings/grn-serial" element={<RequireAuth><GrnSerialSettings /></RequireAuth>} />
            <Route path="/settings/stock-beginning-balance" element={<RequireAuth><StockBeginningBalance /></RequireAuth>} />

            {/* Scrap Purchase */}
            <Route
              path="/scrap-purchase/csv-excel-uploader"
              element={<RequireAuth><CsvExcelUploader /></RequireAuth>}
            />
            <Route
              path="/scrap-purchase/purchase-records"
              element={<RequireAuth><PurchaseRecords /></RequireAuth>}
            />
            <Route
              path="/scrap-purchase/material-rate"
              element={<RequireAuth><MaterialRate /></RequireAuth>}
            />

            {/* Customer Management */}
            <Route
              path="/customer-management"
              element={<RequireAuth><CustomerList /></RequireAuth>}
            />

            {/* Scrap Transport */}
            <Route
              path="/scrap-transport/agency-registration"
              element={<RequireAuth><AgencyRegistration /></RequireAuth>}
            />

            {/* Reports */}
            <Route
              path="/reports/plain-report"
              element={<RequireAuth><PlainGrnReport /></RequireAuth>}
            />
            <Route
              path="/reports/aggregate-report"
              element={<RequireAuth><AggregateGrnReport /></RequireAuth>}
            />
            <Route
              path="/reports/customer-plain-report"
              element={<RequireAuth><CustomerPlainReport /></RequireAuth>}
            />
            <Route
              path="/reports/customer-aggregate-report"
              element={<RequireAuth><CustomerAggregateReport /></RequireAuth>}
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  </React.StrictMode>
)
