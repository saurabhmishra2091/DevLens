import { useContext } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import { useDashboard } from "./hooks/useDashboard";
import { useAccountSettings } from "./hooks/useAccountSettings";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AskDevLensModal from "./components/AskDevLensModal";
import Header from "./components/Header";
import AccountSettingsModal from "./components/AccountSettingsModal";
import ChangePasswordModal from "./components/ChangePasswordModal";
import DeleteAccountModal from "./components/DeleteAccountModal";
import DashboardStats from "./components/dashboard/DashboardStats";
import RecentReports from "./components/dashboard/RecentReports";
import ProjectScanner from "./components/dashboard/ProjectScanner";
import ProjectSummary from "./components/dashboard/ProjectSummary";
import TechStack from "./components/dashboard/TechStack";
import HealthAudit from "./components/dashboard/HealthAudit";
import ProjectInsights from "./components/dashboard/ProjectInsights";
import ProjectExplanation from "./components/dashboard/ProjectExplanation";
import AskDevLensSection from "./components/dashboard/AskDevLensSection";
import ApiCalls from "./components/dashboard/ApiCalls";
import BackendRoutes from "./components/dashboard/BackendRoutes";
import ApiFlowMap from "./components/dashboard/ApiFlowMap";
import RouteHealth from "./components/dashboard/RouteHealth";
import ImportMap from "./components/dashboard/ImportMap";
import DatabaseModels from "./components/dashboard/DatabaseModels";
import UnusedFiles from "./components/dashboard/UnusedFiles";
import SecurityWarnings from "./components/dashboard/SecurityWarnings";
import DuplicateFiles from "./components/dashboard/DuplicateFiles";
import FolderStructure from "./components/dashboard/FolderStructure";
import ComplexityDetector from "./components/dashboard/ComplexityDetector";
import LargeFiles from "./components/dashboard/LargeFiles";
import AllFiles from "./components/dashboard/AllFiles";
import "./App.css";

function DashboardView() {
  const {
    dashboardStats, recentReports,
    projectFile, totalFiles, summary, files, flows,
    answer, setAnswer, healthScore, securityAudit, unusedFiles,
    folders, techStack, isAskModalOpen, setIsAskModalOpen,
    askLoading, askError, setAskError, message, loading, routeHealth, duplicateGroups,
    apiCallFiles, backendRouteFiles, modelFiles, importFiles,
    securityWarningFiles, complexFiles, largeFiles,
    loadSavedReport, deleteSavedReport, scanProject,
    generateProjectExplanation, handleModalQuestion, downloadReport, handleFileChange,
    insights,
  } = useDashboard();

  return (
    <main className="main">
      <DashboardStats dashboardStats={dashboardStats} />

      <RecentReports
        recentReports={recentReports}
        onLoad={loadSavedReport}
        onDelete={deleteSavedReport}
      />

      <ProjectScanner
        projectFile={projectFile}
        loading={loading}
        message={message}
        hasFiles={files.length > 0}
        onFileChange={handleFileChange}
        onScan={scanProject}
        onDownload={downloadReport}
      />

      <ProjectSummary totalFiles={totalFiles} summary={summary} />
      <TechStack techStack={techStack} />
      <HealthAudit healthScore={healthScore} securityAudit={securityAudit} />
      <ProjectInsights insights={insights} />
      <ProjectExplanation explanation={generateProjectExplanation()} />

      <AskDevLensSection
        answer={answer}
        onOpen={() => { setAnswer(""); setAskError(""); setIsAskModalOpen(true); }}
      />

      <ApiCalls apiCallFiles={apiCallFiles} />
      <BackendRoutes backendRouteFiles={backendRouteFiles} />
      <ApiFlowMap flows={flows} />
      <RouteHealth routeHealth={routeHealth} />
      <ImportMap importFiles={importFiles} />
      <DatabaseModels modelFiles={modelFiles} />
      <UnusedFiles unusedFiles={unusedFiles} />
      <SecurityWarnings securityWarningFiles={securityWarningFiles} />
      <DuplicateFiles duplicateGroups={duplicateGroups} />
      <FolderStructure folders={folders} />
      <ComplexityDetector complexFiles={complexFiles} />
      <LargeFiles largeFiles={largeFiles} />
      <AllFiles files={files} />

      <AskDevLensModal
        isOpen={isAskModalOpen}
        onClose={() => { setIsAskModalOpen(false); setAskError(""); }}
        onAsk={handleModalQuestion}
        onClearAnswer={() => { setAnswer(""); setAskError(""); }}
        answer={answer}
        loading={askLoading}
        error={askError}
      />
    </main>
  );
}

function App() {
  const { user } = useContext(AuthContext);
  const {
    showSettings, setShowSettings,
    showChangePassword, showDeleteAccount,
    currentPassword, newPassword, confirmPassword, deletePassword,
    error, success, loading,
    handleLogout, handleOpenSettings,
    handleOpenChangePassword, handleOpenDeleteAccount,
    handleCloseChangePassword, handleCloseDeleteAccount,
    handleChangePassword, handleDeleteAccount,
    onCurrentPasswordChange, onNewPasswordChange,
    onConfirmPasswordChange, onDeletePasswordChange,
  } = useAccountSettings();

  const location = useLocation();
  const isLanding = location.pathname === "/landing";

  return (
    <div className="app">
      {!isLanding && (
        <Header user={user} onOpenSettings={handleOpenSettings} onLogout={handleLogout} />
      )}

      {showSettings && (
        <AccountSettingsModal
          onClose={() => setShowSettings(false)}
          onChangePassword={handleOpenChangePassword}
          onDeleteAccount={handleOpenDeleteAccount}
        />
      )}

      {showChangePassword && (
        <ChangePasswordModal
          currentPassword={currentPassword}
          newPassword={newPassword}
          confirmPassword={confirmPassword}
          loading={loading}
          error={error}
          success={success}
          onCurrentPasswordChange={onCurrentPasswordChange}
          onNewPasswordChange={onNewPasswordChange}
          onConfirmPasswordChange={onConfirmPasswordChange}
          onSubmit={handleChangePassword}
          onClose={handleCloseChangePassword}
        />
      )}

      {showDeleteAccount && (
        <DeleteAccountModal
          deletePassword={deletePassword}
          loading={loading}
          error={error}
          onPasswordChange={onDeletePasswordChange}
          onSubmit={handleDeleteAccount}
          onClose={handleCloseDeleteAccount}
        />
      )}

      <Routes>
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardView />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
