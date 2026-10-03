import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export function useAccountSettings() {
  const { logout, changePassword, deleteAccount } = useContext(AuthContext);
  const navigate = useNavigate();

  const [showSettings, setShowSettings] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const clearStatus = () => { setError(""); setSuccess(""); };

  const handleLogout = () => { logout(); navigate("/login"); };

  const handleOpenSettings = () => { clearStatus(); setShowSettings(true); };

  const handleOpenChangePassword = () => {
    setShowSettings(false);
    clearStatus();
    setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    setShowChangePassword(true);
  };

  const handleOpenDeleteAccount = () => {
    setShowSettings(false);
    clearStatus();
    setDeletePassword("");
    setShowDeleteAccount(true);
  };

  const handleCloseChangePassword = () => {
    setShowChangePassword(false);
    clearStatus();
    setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
  };

  const handleCloseDeleteAccount = () => {
    setShowDeleteAccount(false);
    clearStatus();
    setDeletePassword("");
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    clearStatus();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill all fields"); return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match"); return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters"); return;
    }

    setLoading(true);
    const result = await changePassword(currentPassword, newPassword);
    setLoading(false);

    if (!result.success) { setError(result.message); return; }

    setSuccess("Password changed successfully");
    setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    setTimeout(() => { setShowChangePassword(false); setSuccess(""); }, 1500);
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    clearStatus();

    if (!deletePassword) { setError("Please enter your password to continue"); return; }
    if (!window.confirm("Are you sure? This will permanently delete your account and all saved reports. This action cannot be undone.")) return;

    setLoading(true);
    const result = await deleteAccount(deletePassword);
    setLoading(false);

    if (!result.success) { setError(result.message); return; }

    setShowDeleteAccount(false);
    setShowSettings(false);
    alert("Your account has been deleted successfully.");
    navigate("/login");
  };

  return {
    showSettings, setShowSettings,
    showChangePassword, showDeleteAccount,
    currentPassword, newPassword, confirmPassword, deletePassword,
    error, success, loading,
    handleLogout,
    handleOpenSettings, handleOpenChangePassword, handleOpenDeleteAccount,
    handleCloseChangePassword, handleCloseDeleteAccount,
    handleChangePassword, handleDeleteAccount,
    onCurrentPasswordChange: (e) => setCurrentPassword(e.target.value),
    onNewPasswordChange: (e) => setNewPassword(e.target.value),
    onConfirmPasswordChange: (e) => setConfirmPassword(e.target.value),
    onDeletePasswordChange: (e) => setDeletePassword(e.target.value),
  };
}
