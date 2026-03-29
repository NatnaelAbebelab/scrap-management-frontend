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
import MaterialRequisition from './materialManagement/MaterialRequisition'
import CsvExcelUploader from './scrapPurchase/CsvExcelUploader'
import PurchaseRecords from './scrapPurchase/PurchaseRecords'
import MaterialRate from './scrapPurchase/MaterialRate'
import AgencyRegistration from './scrapTransport/AgencyRegistration'
import InternalAgencies from './scrapTransport/InternalAgencies'
import InternalAgreements from './scrapTransport/InternalAgreements'
import UploadTransportData from './scrapTransport/UploadTransportData'
import DailyTransportAggregate from './scrapTransport/DailyTransportAggregate'
import UserManagement from './settings/UserManagement'
import Profile from './settings/Profile'
import GrnSerialSettings from './settings/GrnSerialSettings'
import StockBeginningBalance from './settings/StockBeginningBalance'
import CustomerList from './customerManagement/CustomerList'
import PlainGrnReport from './reports/PlainGrnReport'
import AggregateGrnReport from './reports/AggregateGrnReport'
import CustomerPlainReport from './reports/CustomerPlainReport'
import CustomerAggregateReport from './reports/CustomerAggregateReport'
import StockReport from './reports/StockReport'
import StockCard from './reports/StockCard'
import StockAggregatedReport from './reports/StockAggregatedReport'
import MaterialRequisitionReport from './reports/MaterialRequisitionReport'
import MaterialIssueReport from './reports/MaterialIssueReport'
import AgencyPerformanceReport from './reports/AgencyPerformanceReport'
import RawScrapTransportReport from './reports/RawScrapTransportReport'
import StockManagement from './stockManagement/StockManagement'

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

            <Route path="/raw-material/requisition" element={<RequireAuth><MaterialRequisition /></RequireAuth>} />
            <Route path="/raw-material/issue" element={<RequireAuth><MaterialIssue /></RequireAuth>} />

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
            <Route
              path="/scrap-purchase/stock"
              element={<RequireAuth><StockManagement /></RequireAuth>}
            />

            {/* Customer Management */}
            <Route
              path="/customer-management"
              element={<RequireAuth><CustomerList /></RequireAuth>}
            />

            {/* Scrap Transport */}
            <Route
              path="/scrap-transport/internal-agencies"
              element={<RequireAuth><InternalAgencies /></RequireAuth>}
            />
            <Route
              path="/scrap-transport/internal-agreements"
              element={<RequireAuth><InternalAgreements /></RequireAuth>}
            />
            <Route
              path="/scrap-transport/upload-transport-data"
              element={<RequireAuth><UploadTransportData /></RequireAuth>}
            />
            <Route
              path="/scrap-transport/daily-aggregate"
              element={<RequireAuth><DailyTransportAggregate /></RequireAuth>}
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
            <Route
              path="/reports/stock-report"
              element={<RequireAuth><StockReport /></RequireAuth>}
            />
            <Route
              path="/reports/raw-material/requisition"
              element={<RequireAuth><MaterialRequisitionReport /></RequireAuth>}
            />
            <Route
              path="/reports/raw-material/issue-report"
              element={<RequireAuth><MaterialIssueReport /></RequireAuth>}
            />
            <Route
              path="/reports/stock-card"
              element={<RequireAuth><StockCard /></RequireAuth>}
            />
            <Route
              path="/reports/stock-aggregated-report"
              element={<RequireAuth><StockAggregatedReport /></RequireAuth>}
            />
            <Route
              path="/reports/scrap-transport/agency-performance"
              element={<RequireAuth><AgencyPerformanceReport /></RequireAuth>}
            />
            <Route
              path="/reports/scrap-transport/raw-scrap-report"
              element={<RequireAuth><RawScrapTransportReport /></RequireAuth>}
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  </React.StrictMode>
)
