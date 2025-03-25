import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AdminDashboard() {
    const navigate = useNavigate();
    const firstName = localStorage.getItem("firstName") || "Admin";
    const lastName = localStorage.getItem("lastName") || "";

    // State to track active tab
    const [activeTab, setActiveTab] = useState("home");

    // Password change state
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordChangeStatus, setPasswordChangeStatus] = useState(null);

    const handleLogout = () => {
        // Clear authentication data
        localStorage.removeItem("authToken");
        localStorage.removeItem("isAdmin");
        localStorage.removeItem("firstName");
        localStorage.removeItem("lastName");

        // Redirect to sign-in
        navigate("/signin");
    };

    // Handle password change submission
    const handlePasswordChange = async (e) => {
        e.preventDefault();

        // Validate passwords match
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordChangeStatus({
                type: 'error',
                message: 'New passwords do not match.'
            });
            return;
        }

        setIsChangingPassword(true);

        try {
            // Get token from localStorage
            const token = localStorage.getItem("authToken");

            // Make API request to change password
            const response = await axios.post(
                "http://localhost:5003/admin/change-password",
                {
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setPasswordChangeStatus({
                type: 'success',
                message: 'Password changed successfully!'
            });

            // Reset form after successful password change
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });

            // Close modal after 2 seconds
            setTimeout(() => {
                setShowPasswordModal(false);
                setPasswordChangeStatus(null);
            }, 2000);

        } catch (error) {
            const errorMsg = error.response?.data?.message || "Error changing password. Please try again.";
            setPasswordChangeStatus({
                type: 'error',
                message: errorMsg
            });
        } finally {
            setIsChangingPassword(false);
        }
    };

    // Tab content rendering
    const renderTabContent = () => {
        switch (activeTab) {
            case "home":
                return (
                    <div style={styles.tabContent}>
                        <h2 style={styles.tabTitle}>Dashboard Overview</h2>
                        <div style={styles.statsContainer}>
                            <div style={styles.statCard}>
                                <h3>Total Clients</h3>
                                <p style={styles.statNumber}>0</p>
                            </div>
                            <div style={styles.statCard}>
                                <h3>Total Professionals</h3>
                                <p style={styles.statNumber}>0</p>
                            </div>
                            <div style={styles.statCard}>
                                <h3>Active Jobs</h3>
                                <p style={styles.statNumber}>0</p>
                            </div>
                            <div style={styles.statCard}>
                                <h3>Completed Jobs</h3>
                                <p style={styles.statNumber}>0</p>
                            </div>
                        </div>
                        <div style={styles.recentActivity}>
                            <h3>Recent Activity</h3>
                            <p style={styles.emptyState}>No recent activities to show.</p>
                        </div>
                    </div>
                );
            case "clients":
                return (
                    <div style={styles.tabContent}>
                        <h2 style={styles.tabTitle}>Client Management</h2>
                        <div style={styles.searchFilterBar}>
                            <input
                                type="text"
                                placeholder="Search clients..."
                                style={styles.searchInput}
                            />
                            <select style={styles.filterDropdown}>
                                <option value="all">All Clients</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <div style={styles.tableContainer}>
                            <table style={styles.table}>
                                <colgroup>
                                    <col style={{width: "33%"}} />
                                    <col style={{width: "33%"}} />
                                    <col style={{width: "34%"}} />
                                </colgroup>
                                <thead>
                                <tr>
                                    <th style={styles.tableHeader}>ID</th>
                                    <th style={styles.tableHeader}>Name</th>
                                    <th style={styles.tableHeader}>Email</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td colSpan="3" style={styles.emptyTableCell}>
                                        No clients available
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case "professionals":
                return (
                    <div style={styles.tabContent}>
                        <h2 style={styles.tabTitle}>Professional Management</h2>
                        <div style={styles.searchFilterBar}>
                            <input
                                type="text"
                                placeholder="Search professionals..."
                                style={styles.searchInput}
                            />
                            <select style={styles.filterDropdown}>
                                <option value="all">All Professionals</option>
                                <option value="verified">Verified</option>
                                <option value="pending">Pending Verification</option>
                            </select>
                        </div>
                        <div style={styles.tableContainer}>
                            <table style={styles.table}>
                                <colgroup>
                                    <col style={{width: "15%"}} />
                                    <col style={{width: "20%"}} />
                                    <col style={{width: "20%"}} />
                                    <col style={{width: "15%"}} />
                                    <col style={{width: "15%"}} />
                                    <col style={{width: "15%"}} />
                                </colgroup>
                                <thead>
                                <tr>
                                    <th style={styles.tableHeader}>ID</th>
                                    <th style={styles.tableHeader}>Name</th>
                                    <th style={styles.tableHeader}>Specialty</th>
                                    <th style={styles.tableHeader}>Joined Date</th>
                                    <th style={styles.tableHeader}>Status</th>
                                    <th style={styles.tableHeader}>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td colSpan="6" style={styles.emptyTableCell}>
                                        No professionals available
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case "jobs":
                return (
                    <div style={styles.tabContent}>
                        <h2 style={styles.tabTitle}>Jobs Management</h2>
                        <div style={styles.searchFilterBar}>
                            <input
                                type="text"
                                placeholder="Search jobs..."
                                style={styles.searchInput}
                            />
                            <select style={styles.filterDropdown}>
                                <option value="all">All Jobs</option>
                                <option value="pending">Pending</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div style={styles.tableContainer}>
                            <table style={styles.table}>
                                <colgroup>
                                    <col style={{width: "10%"}} />
                                    <col style={{width: "15%"}} />
                                    <col style={{width: "20%"}} />
                                    <col style={{width: "15%"}} />
                                    <col style={{width: "15%"}} />
                                    <col style={{width: "10%"}} />
                                    <col style={{width: "15%"}} />
                                </colgroup>
                                <thead>
                                <tr>
                                    <th style={styles.tableHeader}>ID</th>
                                    <th style={styles.tableHeader}>Title</th>
                                    <th style={styles.tableHeader}>Description</th>
                                    <th style={styles.tableHeader}>Professional Needed</th>
                                    <th style={styles.tableHeader}>User Email</th>
                                    <th style={styles.tableHeader}>Status</th>
                                    <th style={styles.tableHeader}>Created At</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td colSpan="7" style={styles.emptyTableCell}>
                                        No jobs available
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case "quotes":
                return (
                    <div style={styles.tabContent}>
                        <h2 style={styles.tabTitle}>Quotes Management</h2>
                        <div style={styles.searchFilterBar}>
                            <input
                                type="text"
                                placeholder="Search quotes..."
                                style={styles.searchInput}
                            />
                            <select style={styles.filterDropdown}>
                                <option value="all">All Quotes</option>
                                <option value="pending">Pending</option>
                                <option value="accepted">Accepted</option>
                                <option value="rejected">Rejected</option>
                                <option value="expired">Expired</option>
                            </select>
                        </div>
                        <div style={styles.tableContainer}>
                            <table style={styles.table}>
                                <colgroup>
                                    <col style={{width: "10%"}} />
                                    <col style={{width: "25%"}} />
                                    <col style={{width: "25%"}} />
                                    <col style={{width: "10%"}} />
                                    <col style={{width: "15%"}} />
                                    <col style={{width: "15%"}} />
                                </colgroup>
                                <thead>
                                <tr>
                                    <th style={styles.tableHeader}>ID</th>
                                    <th style={styles.tableHeader}>Professional Email</th>
                                    <th style={styles.tableHeader}>Client Email</th>
                                    <th style={styles.tableHeader}>Price</th>
                                    <th style={styles.tableHeader}>Status</th>
                                    <th style={styles.tableHeader}>Issue ID</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td colSpan="6" style={styles.emptyTableCell}>
                                        No quotes available
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case "profile":
                return (
                    <div style={styles.tabContent}>
                        <h2 style={styles.tabTitle}>Admin Profile</h2>
                        <div style={styles.profileContainer}>
                            <div style={styles.profileAvatar}>
                                {firstName.charAt(0)}{lastName.charAt(0)}
                            </div>
                            <div style={styles.profileDetails}>
                                <h3>{firstName} {lastName}</h3>
                                <p>Role: Administrator</p>
                                <button
                                    style={styles.changePasswordButton}
                                    onClick={() => setShowPasswordModal(true)}
                                >
                                    Change Password
                                </button>
                            </div>
                        </div>

                        {/* Password Change Modal */}
                        {showPasswordModal && (
                            <div style={styles.modalOverlay}>
                                <div style={styles.modalContent}>
                                    <h3 style={styles.modalTitle}>Change Password</h3>

                                    {passwordChangeStatus && (
                                        <div style={{
                                            ...styles.statusMessage,
                                            backgroundColor: passwordChangeStatus.type === 'success' ? '#d4edda' : '#f8d7da',
                                            color: passwordChangeStatus.type === 'success' ? '#155724' : '#721c24'
                                        }}>
                                            {passwordChangeStatus.message}
                                        </div>
                                    )}

                                    <form onSubmit={handlePasswordChange} style={styles.passwordForm}>
                                        <div style={styles.formField}>
                                            <label htmlFor="currentPassword">Current Password</label>
                                            <input
                                                type="password"
                                                id="currentPassword"
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData({
                                                    ...passwordData,
                                                    currentPassword: e.target.value
                                                })}
                                                style={styles.input}
                                                required
                                            />
                                        </div>

                                        <div style={styles.formField}>
                                            <label htmlFor="newPassword">New Password</label>
                                            <input
                                                type="password"
                                                id="newPassword"
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({
                                                    ...passwordData,
                                                    newPassword: e.target.value
                                                })}
                                                style={styles.input}
                                                required
                                            />
                                        </div>

                                        <div style={styles.formField}>
                                            <label htmlFor="confirmPassword">Confirm New Password</label>
                                            <input
                                                type="password"
                                                id="confirmPassword"
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({
                                                    ...passwordData,
                                                    confirmPassword: e.target.value
                                                })}
                                                style={styles.input}
                                                required
                                            />
                                            {passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword && (
                                                <p style={styles.errorText}>Passwords do not match</p>
                                            )}
                                        </div>

                                        <div style={styles.modalButtons}>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowPasswordModal(false);
                                                    setPasswordData({
                                                        currentPassword: '',
                                                        newPassword: '',
                                                        confirmPassword: ''
                                                    });
                                                    setPasswordChangeStatus(null);
                                                }}
                                                style={styles.cancelButton}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                style={styles.saveButton}
                                                disabled={
                                                    !passwordData.currentPassword ||
                                                    !passwordData.newPassword ||
                                                    passwordData.newPassword !== passwordData.confirmPassword ||
                                                    isChangingPassword
                                                }
                                            >
                                                {isChangingPassword ? 'Changing...' : 'Change Password'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                );
            default:
                return <div>Tab content not found.</div>;
        }
    };

    return (
        <div style={{ fontFamily: "'Poppins', sans-serif" }}>
            {/* Header */}
            <header style={styles.header}>
                <h1 style={styles.headerText}>Fixer Admin</h1>
                <button
                    onClick={handleLogout}
                    style={styles.logoutButton}
                >
                    Logout
                </button>
            </header>

            <div style={styles.mainContainer}>
                {/* Sidebar Navigation */}
                <div style={styles.sidebar}>
                    <div style={styles.adminInfo}>
                        <div style={styles.adminAvatar}>
                            {firstName.charAt(0)}
                        </div>
                        <div style={styles.adminName}>
                            Welcome, {firstName}!
                        </div>
                    </div>
                    <ul style={styles.navList}>
                        <li
                            style={{
                                ...styles.navItem,
                                ...(activeTab === "home" && styles.activeNavItem)
                            }}
                            onClick={() => setActiveTab("home")}
                        >
                            <span style={styles.navIcon}>🏠</span> Home
                        </li>
                        <li
                            style={{
                                ...styles.navItem,
                                ...(activeTab === "clients" && styles.activeNavItem)
                            }}
                            onClick={() => setActiveTab("clients")}
                        >
                            <span style={styles.navIcon}>👥</span> Clients
                        </li>
                        <li
                            style={{
                                ...styles.navItem,
                                ...(activeTab === "professionals" && styles.activeNavItem)
                            }}
                            onClick={() => setActiveTab("professionals")}
                        >
                            <span style={styles.navIcon}>👷</span> Professionals
                        </li>
                        <li
                            style={{
                                ...styles.navItem,
                                ...(activeTab === "jobs" && styles.activeNavItem)
                            }}
                            onClick={() => setActiveTab("jobs")}
                        >
                            <span style={styles.navIcon}>📋</span> Jobs
                        </li>
                        <li
                            style={{
                                ...styles.navItem,
                                ...(activeTab === "quotes" && styles.activeNavItem)
                            }}
                            onClick={() => setActiveTab("quotes")}
                        >
                            <span style={styles.navIcon}>💰</span> Quotes
                        </li>
                        <li
                            style={{
                                ...styles.navItem,
                                ...(activeTab === "profile" && styles.activeNavItem)
                            }}
                            onClick={() => setActiveTab("profile")}
                        >
                            <span style={styles.navIcon}>👤</span> Profile
                        </li>
                    </ul>
                </div>

                {/* Main Content Area */}
                <div style={styles.content}>
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
}

const styles = {
    header: {
        backgroundColor: "#f4f4f4",
        padding: "15px 0px",
        textAlign: "left",
        width: "100%",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    headerText: {
        fontFamily: "'Poppins', sans-serif",
        fontSize: "24px",
        fontWeight: "700",
        margin: 0,
        color: "#333",
        padding: "0 20px",
    },
    logoutButton: {
        backgroundColor: "#dc3545",
        color: "#fff",
        padding: "8px 15px",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        marginRight: "20px",
        fontWeight: "500",
    },
    mainContainer: {
        display: "flex",
        minHeight: "100vh",
        marginTop: "60px",
    },
    sidebar: {
        width: "250px",
        backgroundColor: "#2c3e50",
        color: "#fff",
        padding: "20px 0",
        position: "fixed",
        height: "calc(100vh - 60px)",
        overflowY: "auto",
    },
    adminInfo: {
        padding: "15px 20px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        marginBottom: "15px",
        display: "flex",
        alignItems: "center",
    },
    adminAvatar: {
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        backgroundColor: "#3498db",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "18px",
        fontWeight: "bold",
        marginRight: "10px",
    },
    adminName: {
        fontSize: "14px",
        fontWeight: "500",
    },
    navList: {
        listStyle: "none",
        padding: 0,
        margin: 0,
    },
    navItem: {
        padding: "12px 20px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        display: "flex",
        alignItems: "center",
    },
    activeNavItem: {
        backgroundColor: "rgba(52, 152, 219, 0.5)",
        borderLeft: "4px solid #3498db",
    },
    navIcon: {
        marginRight: "10px",
        fontSize: "18px",
    },
    content: {
        flex: 1,
        marginLeft: "250px",
        padding: "20px",
    },
    tabContent: {
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    },
    tabTitle: {
        borderBottom: "2px solid #f1f1f1",
        paddingBottom: "10px",
        marginBottom: "20px",
        color: "#2c3e50",
    },
    statsContainer: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: "20px",
        marginBottom: "30px",
    },
    statCard: {
        backgroundColor: "#f8f9fa",
        padding: "15px",
        borderRadius: "8px",
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)",
        textAlign: "center",
    },
    statNumber: {
        fontSize: "30px",
        fontWeight: "bold",
        color: "#3498db",
        margin: "10px 0",
    },
    recentActivity: {
        backgroundColor: "#f8f9fa",
        padding: "15px",
        borderRadius: "8px",
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)",
    },
    searchFilterBar: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "20px",
    },
    searchInput: {
        flex: 1,
        padding: "10px",
        border: "1px solid #ddd",
        borderRadius: "5px",
        marginRight: "10px",
    },
    filterDropdown: {
        padding: "10px",
        border: "1px solid #ddd",
        borderRadius: "5px",
        minWidth: "150px",
    },
    tableContainer: {
        overflowX: "auto",
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
    },
    emptyTableCell: {
        textAlign: "center",
        padding: "20px",
        color: "#999",
    },
    emptyState: {
        textAlign: "center",
        color: "#999",
        padding: "20px",
    },
    profileContainer: {
        display: "flex",
        alignItems: "center",
        padding: "20px",
        backgroundColor: "#f8f9fa",
        borderRadius: "8px",
        marginBottom: "20px",
    },
    profileAvatar: {
        width: "80px",
        height: "80px",
        backgroundColor: "#3498db",
        color: "#fff",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "30px",
        fontWeight: "bold",
        marginRight: "20px",
    },
    profileDetails: {
        flex: 1,
    },
    changePasswordButton: {
        backgroundColor: "#3498db",
        color: "#fff",
        border: "none",
        padding: "8px 15px",
        borderRadius: "5px",
        cursor: "pointer",
        marginTop: "10px",
    },
    preferencesSection: {
        backgroundColor: "#f8f9fa",
        padding: "20px",
        borderRadius: "8px",
    },
    preferencesForm: {
        marginTop: "15px",
    },
    formGroup: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "15px",
        padding: "10px 0",
        borderBottom: "1px solid #eee",
    },
    toggleSwitch: {
        position: "relative",
        display: "inline-block",
        width: "50px",
        height: "24px",
    },

    // Modal styles
    modalOverlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2000,
    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: "8px",
        padding: "25px",
        width: "400px",
        maxWidth: "90%",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    },
    modalTitle: {
        margin: "0 0 20px 0",
        color: "#2c3e50",
        borderBottom: "1px solid #eee",
        paddingBottom: "10px",
    },
    passwordForm: {
        display: "flex",
        flexDirection: "column",
        gap: "15px",
    },
    formField: {
        display: "flex",
        flexDirection: "column",
        gap: "5px",
    },
    input: {
        padding: "10px",
        border: "1px solid #ddd",
        borderRadius: "5px",
        fontSize: "14px",
    },
    modalButtons: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
        marginTop: "20px",
    },
    cancelButton: {
        padding: "10px 15px",
        backgroundColor: "#f1f1f1",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        color: "#333",
    },
    saveButton: {
        padding: "10px 15px",
        backgroundColor: "#3498db",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        color: "#fff",
    },
    statusMessage: {
        padding: "10px",
        borderRadius: "5px",
        marginBottom: "15px",
        textAlign: "center",
    },
    errorText: {
        color: "#dc3545",
        fontSize: "12px",
        marginTop: "5px",
    },
    tableHeader: {
        backgroundColor: "#f8f9fa",
        padding: "12px 15px",
        textAlign: "left",
        borderBottom: "2px solid #ddd",
        fontWeight: "600",
        color: "#2c3e50",
    },
};