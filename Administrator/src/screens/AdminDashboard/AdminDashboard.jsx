import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AdminDashboard() {
    const navigate = useNavigate();
    const firstName = localStorage.getItem("firstName") || "Admin";
    const lastName = localStorage.getItem("lastName") || "";

    // State to track active tab
    const [activeTab, setActiveTab] = useState("home");

    // Client data state
    const [clients, setClients] = useState([]);
    const [isLoadingClients, setIsLoadingClients] = useState(false);
    const [clientError, setClientError] = useState(null);
    const [clientSearchTerm, setClientSearchTerm] = useState("");
    const [clientFilterStatus, setClientFilterStatus] = useState("all");

    // Professional data state
    const [professionals, setProfessionals] = useState([]);
    const [isLoadingProfessionals, setIsLoadingProfessionals] = useState(false);
    const [professionalError, setProfessionalError] = useState(null);
    const [professionalSearchTerm, setProfessionalSearchTerm] = useState("");
    const [professionalFilterStatus, setProfessionalFilterStatus] = useState("all");
    // Jobs data state
    const [jobs, setJobs] = useState([]);
    const [isLoadingJobs, setIsLoadingJobs] = useState(false);
    const [jobError, setJobError] = useState(null);
    const [jobSearchTerm, setJobSearchTerm] = useState("");
    const [jobFilterStatus, setJobFilterStatus] = useState("all");

    // Quotes data state
    const [quotes, setQuotes] = useState([]);
    const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);
    const [quoteError, setQuoteError] = useState(null);
    const [quoteSearchTerm, setQuoteSearchTerm] = useState("");
    const [quoteFilterStatus, setQuoteFilterStatus] = useState("all");

    // Password change state
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordChangeStatus, setPasswordChangeStatus] = useState(null);

    // For popup when clicking on an entry in the table
    const [entryType, setEntryType] = useState(null); // 'client', 'professional', 'job', 'quote'
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [hoveredRowId, setHoveredRowId] = useState(null);

    // Function to truncate ID to first 4 characters
    const truncateId = (id) => {
        if (!id) return 'N/A';
        return id.toString().substring(0, 4);
    };


    // Function to fetch clients data
    // Update fetchClients function to fetch users both proffesional and clients
    const fetchClients = async () => {
        setIsLoadingClients(true);
        setIsLoadingProfessionals(true); // We'll load both at once
        setClientError(null);
        setProfessionalError(null);

        try {
            // Get token from localStorage
            const token = localStorage.getItem("authToken");

            // Make API request to get all users
            const response = await axios.get(
                "/api/admin/clients",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            // Split users into clients and professionals
            const allUsers = response.data.users || [];
            const clientUsers = allUsers.filter(user => user.accountType !== "professional");
            const professionalUsers = allUsers.filter(user => user.accountType === "professional");

            setClients(clientUsers);
            setProfessionals(professionalUsers);
        } catch (error) {
            console.error("Error fetching users:", error);
            const errorMsg = error.response?.data?.message || "Failed to load users. Please try again.";
            setClientError(errorMsg);
            setProfessionalError(errorMsg);
        } finally {
            setIsLoadingClients(false);
            setIsLoadingProfessionals(false);
        }
    };

    // Function to fetch jobs data
    const fetchJobs = async () => {
        setIsLoadingJobs(true);
        setJobError(null);

        try {
            // Get token from localStorage
            const token = localStorage.getItem("authToken");

            // Make API request to get jobs
            const response = await axios.get(
                "/api/admin/jobs",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setJobs(response.data.jobs || []);
        } catch (error) {
            console.error("Error fetching jobs:", error);
            const errorMsg = error.response?.data?.message || "Failed to load jobs. Please try again.";
            setJobError(errorMsg);
        } finally {
            setIsLoadingJobs(false);
        }
    };

// Function to fetch quotes data
    const fetchQuotes = async () => {
        setIsLoadingQuotes(true);
        setQuoteError(null);

        try {
            // Get token from localStorage
            const token = localStorage.getItem("authToken");

            // Make API request to get quotes
            const response = await axios.get(
                "/api/admin/quotes",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setQuotes(response.data.quotes || []);
        } catch (error) {
            console.error("Error fetching quotes:", error);
            const errorMsg = error.response?.data?.message || "Failed to load quotes. Please try again.";
            setQuoteError(errorMsg);
        } finally {
            setIsLoadingQuotes(false);
        }
    };

    // Update useEffect hook to fetch when either tab is selected
    // Fetch all data when the dashboard loads for the first time
    useEffect(() => {
        fetchClients();
        fetchJobs();
        fetchQuotes();
    }, []);

// Update useEffect hook to fetch data based on active tab
    useEffect(() => {
        if (activeTab === "clients" || activeTab === "professionals") {
            fetchClients();
        } else if (activeTab === "jobs") {
            fetchJobs();
        } else if (activeTab === "quotes") {
            fetchQuotes();
        }
    }, [activeTab]);

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
                // Updated job counting logic that's case-insensitive
                const activeJobs = jobs.filter(job => {
                    const status = job.status?.toLowerCase().trim();
                    // Count jobs with status "open", "in progress", or "pending" as active
                    return status === "open" ||
                        status === "in-progress" ||
                        status === "in progress" ||
                        status === "inprogress" ||
                        status === "pending";
                }).length;

                const completedJobs = jobs.filter(job => {
                    const status = job.status?.toLowerCase().trim();
                    // Count jobs with status "completed" as completed
                    return status === "completed" || status === "closed";
                }).length;

                // Get recent activities
                const recentActivities = [
                    ...jobs.map(job => ({
                        type: 'job',
                        item: job,
                        date: new Date(job.createdAt)
                    })),
                    ...quotes.map(quote => ({
                        type: 'quote',
                        item: quote,
                        date: new Date(quote.createdAt)
                    }))
                ].sort((a, b) => b.date - a.date).slice(0, 5);


                return (
                    <div style={styles.tabContent}>
                        <h2 style={styles.tabTitle}>Dashboard Overview</h2>
                        <div style={styles.statsContainer}>
                            <div style={styles.statCard}>
                                <h3>Total Clients</h3>
                                <p style={styles.statNumber}>{clients.length}</p>
                            </div>
                            <div style={styles.statCard}>
                                <h3>Total Professionals</h3>
                                <p style={styles.statNumber}>{professionals.length}</p>
                            </div>
                            <div style={styles.statCard}>
                                <h3>Active Jobs</h3>
                                <p style={styles.statNumber}>{activeJobs}</p>
                            </div>
                            <div style={styles.statCard}>
                                <h3>Completed Jobs</h3>
                                <p style={styles.statNumber}>{completedJobs}</p>
                            </div>
                        </div>
                        <div style={styles.recentActivity}>
                            <h3>Recent Activity</h3>
                            {recentActivities.length === 0 ? (
                                <p style={styles.emptyState}>No recent activities to show.</p>
                            ) : (
                                <div style={styles.activityList}>
                                    {recentActivities.map((activity, index) => (
                                        <div key={index} style={styles.activityItem}>
                                            {activity.type === 'job' ? (
                                                <div>
                                        <span style={styles.activityTime}>
                                            {activity.date.toLocaleDateString()} {activity.date.toLocaleTimeString()}
                                        </span>
                                                    <p style={styles.activityText}>
                                                        <strong>Job:</strong> {activity.item.title} -
                                                        <span style={{
                                                            color: activity.item.status?.toLowerCase().trim() === 'completed'
                                                                ? '#28a745'
                                                                : activity.item.status?.toLowerCase().trim() === 'closed'
                                                                    ? '#dc3545'
                                                                    : activity.item.status?.toLowerCase().trim() === 'in-progress' ||
                                                                    activity.item.status?.toLowerCase().trim() === 'inprogress' ||
                                                                    activity.item.status?.toLowerCase().trim() === 'in progress'
                                                                        ? '#ffc107'
                                                                        : activity.item.status?.toLowerCase().trim() === 'open'
                                                                            ? '#17a2b8'
                                                                            : '#6c757d'
                                                        }}>
                                                {activity.item.status && activity.item.status.charAt(0).toUpperCase() + activity.item.status.slice(1)}
                                            </span>
                                                    </p>
                                                </div>
                                            ) : (
                                                <div>
                                        <span style={styles.activityTime}>
                                            {activity.date.toLocaleDateString()} {activity.date.toLocaleTimeString()}
                                        </span>
                                                    <p style={styles.activityText}>
                                                        <strong>Quote:</strong> ${activity.item.price ? activity.item.price.toFixed(2) : '0.00'} by {activity.item.professionalEmail} -
                                                        <span style={{
                                                            color: activity.item.status?.toLowerCase().trim() === 'accepted'
                                                                ? '#28a745'
                                                                : activity.item.status?.toLowerCase().trim() === 'rejected'
                                                                    ? '#dc3545'
                                                                    : activity.item.status?.toLowerCase().trim() === 'expired'
                                                                        ? '#6c757d'
                                                                        : '#17a2b8'
                                                        }}>
                                                {activity.item.status && activity.item.status.charAt(0).toUpperCase() + activity.item.status.slice(1)}
                                            </span>
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );
            case "clients":
                // Filter clients based on search term and filter status
                const filteredClients = clients.filter(client => {
                    // Search term filtering
                    const matchesSearch =
                        client._id?.toString().toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
                        client.firstName?.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
                        client.lastName?.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
                        client.email?.toLowerCase().includes(clientSearchTerm.toLowerCase());

                    // Status filtering
                    const matchesStatus =
                        clientFilterStatus === "all" ||
                        (clientFilterStatus === "approved" && client.approved) ||
                        (clientFilterStatus === "unapproved" && !client.approved);

                    return matchesSearch && matchesStatus;
                });

                return (
                    <div style={styles.tabContent}>
                        <h2 style={styles.tabTitle}>Client Management</h2>
                        <div style={styles.searchFilterBar}>
                            <input
                                type="text"
                                placeholder="Search clients..."
                                style={styles.searchInput}
                                value={clientSearchTerm}
                                onChange={(e) => setClientSearchTerm(e.target.value)}
                            />
                            <select
                                style={styles.filterDropdown}
                                value={clientFilterStatus}
                                onChange={(e) => setClientFilterStatus(e.target.value)}
                            >
                                <option value="all">All Clients</option>
                                <option value="approved">Approved</option>
                                <option value="unapproved">Unapproved</option>
                            </select>
                            <button
                                style={styles.refreshButton}
                                onClick={fetchClients}
                                disabled={isLoadingClients}
                            >
                                {isLoadingClients ? 'Loading...' : 'Refresh'}
                            </button>
                        </div>

                        {clientError && (
                            <div style={styles.errorMessage}>
                                {clientError}
                            </div>
                        )}

                        <div style={styles.tableContainer}>
                            <table style={styles.table}>
                                <colgroup>
                                    <col style={{width: "15%"}} />
                                    <col style={{width: "25%"}} />
                                    <col style={{width: "25%"}} />
                                    <col style={{width: "35%"}} />
                                </colgroup>
                                <thead>
                                <tr>
                                    <th style={styles.tableHeader}>ID</th>
                                    <th style={styles.tableHeader}>First Name</th>
                                    <th style={styles.tableHeader}>Last Name</th>
                                    <th style={styles.tableHeader}>Email</th>
                                </tr>
                                </thead>
                                <tbody>
                                {isLoadingClients ? (
                                    <tr>
                                        <td colSpan="4" style={styles.loadingCell}>
                                            Loading clients...
                                        </td>
                                    </tr>
                                ) : filteredClients.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={styles.emptyTableCell}>
                                            No clients found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredClients.map((client) => (
                                        <tr key={client._id}
                                            onClick={() => {
                                                setSelectedEntry(client);
                                                setEntryType("client");
                                                setShowDetailsModal(true);
                                            }}
                                            onMouseEnter={() => setHoveredRowId(client._id)}
                                            onMouseLeave={() => setHoveredRowId(null)}
                                            style={{
                                                cursor: "pointer",
                                                backgroundColor: hoveredRowId === client._id ? "#f0f0f0" : "transparent",
                                                transition: "background-color 0.2s"
                                            }}
                                        >
                                            <td style={styles.tableCell}>{truncateId(client._id)}...</td>
                                            <td style={styles.tableCell}>{client.firstName || 'N/A'}</td>
                                            <td style={styles.tableCell}>{client.lastName || 'N/A'}</td>
                                            <td style={styles.tableCell}>{client.email || 'N/A'}</td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case "professionals":
                // Filter professionals based on search term and filter status
                const filteredProfessionals = professionals.filter(prof => {
                    // Search term filtering
                    const matchesSearch =
                        prof._id?.toString().toLowerCase().includes(professionalSearchTerm.toLowerCase()) ||
                        prof.firstName?.toLowerCase().includes(professionalSearchTerm.toLowerCase()) ||
                        prof.lastName?.toLowerCase().includes(professionalSearchTerm.toLowerCase()) ||
                        prof.email?.toLowerCase().includes(professionalSearchTerm.toLowerCase());

                    // Status filtering
                    const matchesStatus =
                        professionalFilterStatus === "all" ||
                        (professionalFilterStatus === "approved" && prof.approved) ||
                        (professionalFilterStatus === "unapproved" && !prof.approved);

                    return matchesSearch && matchesStatus;
                });

                return (
                    <div style={styles.tabContent}>
                        <h2 style={styles.tabTitle}>Professional Management</h2>
                        <div style={styles.searchFilterBar}>
                            <input
                                type="text"
                                placeholder="Search professionals..."
                                style={styles.searchInput}
                                value={professionalSearchTerm}
                                onChange={(e) => setProfessionalSearchTerm(e.target.value)}
                            />
                            <select
                                style={styles.filterDropdown}
                                value={professionalFilterStatus}
                                onChange={(e) => setProfessionalFilterStatus(e.target.value)}
                            >
                                <option value="all">All Professionals</option>
                                <option value="approved">Approved</option>
                                <option value="unapproved">Unapproved</option>
                            </select>
                            <button
                                style={styles.refreshButton}
                                onClick={fetchClients}
                                disabled={isLoadingProfessionals}
                            >
                                {isLoadingProfessionals ? 'Loading...' : 'Refresh'}
                            </button>
                        </div>

                        {professionalError && (
                            <div style={styles.errorMessage}>
                                {professionalError}
                            </div>
                        )}

                        <div style={styles.tableContainer}>
                            <table style={styles.table}>
                                <colgroup>
                                    <col style={{width: "20%"}} />
                                    <col style={{width: "15%"}} />
                                    <col style={{width: "15%"}} />
                                    <col style={{width: "35%"}} />
                                    <col style={{width: "15%"}} />
                                </colgroup>
                                <thead>
                                <tr>
                                    <th style={styles.tableHeader}>ID</th>
                                    <th style={styles.tableHeader}>First Name</th>
                                    <th style={styles.tableHeader}>Last Name</th>
                                    <th style={styles.tableHeader}>Email</th>
                                    <th style={styles.tableHeader}>Approved</th>
                                </tr>
                                </thead>
                                <tbody>
                                {isLoadingProfessionals ? (
                                    <tr>
                                        <td colSpan="5" style={styles.loadingCell}>
                                            Loading professionals...
                                        </td>
                                    </tr>
                                ) : filteredProfessionals.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={styles.emptyTableCell}>
                                            No professionals available
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProfessionals.map((prof) => (
                                        <tr key={prof._id}
                                            onClick={() => {
                                                setSelectedEntry(prof);
                                                setEntryType("professional");
                                                setShowDetailsModal(true);
                                            }}
                                            onMouseEnter={() => setHoveredRowId(prof._id)}
                                            onMouseLeave={() => setHoveredRowId(null)}
                                            style={{
                                                cursor: "pointer",
                                                backgroundColor: hoveredRowId === prof._id ? "#f0f0f0" : "transparent",
                                                transition: "background-color 0.2s"
                                            }}
                                        >
                                            <td style={styles.tableCell}>{truncateId(prof._id)}...</td>
                                            <td style={styles.tableCell}>{prof.firstName || 'N/A'}</td>
                                            <td style={styles.tableCell}>{prof.lastName || 'N/A'}</td>
                                            <td style={styles.tableCell}>{prof.email || 'N/A'}</td>
                                            <td style={{
                                                ...styles.tableCell,
                                                color: prof.approved ? '#28a745' : '#dc3545'
                                            }}>
                                                {prof.approved ? 'Yes' : 'No'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case "jobs":
                // Filter jobs based on search term and status filter
                const filteredJobs = jobs.filter(job => {
                    const matchesSearch =
                        (job._id?.toString().toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
                            job.title?.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
                            job.description?.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
                            job.professionalNeeded?.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
                            job.userEmail?.toLowerCase().includes(jobSearchTerm.toLowerCase()));

                    // Get normalized status (lowercase and trimmed)
                    const normalizedStatus = job.status?.toLowerCase().trim();

                    // Check if status matches the filter (case-insensitive and whitespace-insensitive)
                    const matchesStatus =
                        jobFilterStatus === "all" ||
                        (jobFilterStatus === "open" && normalizedStatus === "open") ||
                        (jobFilterStatus === "closed" && normalizedStatus === "closed") ||
                        (jobFilterStatus === "completed" && normalizedStatus === "completed") ||
                        (jobFilterStatus === "in-progress" &&
                            (normalizedStatus === "in-progress" || normalizedStatus === "inprogress" || normalizedStatus === "in progress"));

                    return matchesSearch && matchesStatus;
                });

                return (
                    <div style={styles.tabContent}>
                        <h2 style={styles.tabTitle}>Jobs Management</h2>
                        <div style={styles.searchFilterBar}>
                            <input
                                type="text"
                                placeholder="Search jobs..."
                                style={styles.searchInput}
                                value={jobSearchTerm}
                                onChange={(e) => setJobSearchTerm(e.target.value)}
                            />
                            <select
                                style={styles.filterDropdown}
                                value={jobFilterStatus}
                                onChange={(e) => setJobFilterStatus(e.target.value)}
                            >
                                <option value="all">All Jobs</option>
                                <option value="open">Open</option>
                                <option value="closed">Closed</option>
                                <option value="completed">Completed</option>
                                <option value="in-progress">In Progress</option>
                            </select>
                            <button
                                style={styles.refreshButton}
                                onClick={fetchJobs}
                                disabled={isLoadingJobs}
                            >
                                {isLoadingJobs ? 'Loading...' : 'Refresh'}
                            </button>
                        </div>

                        {jobError && (
                            <div style={styles.errorMessage}>
                                {jobError}
                            </div>
                        )}

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
                                {isLoadingJobs ? (
                                    <tr>
                                        <td colSpan="7" style={styles.loadingCell}>
                                            Loading jobs...
                                        </td>
                                    </tr>
                                ) : filteredJobs.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" style={styles.emptyTableCell}>
                                            No jobs available
                                        </td>
                                    </tr>
                                ) : (
                                    filteredJobs.map((job) => (
                                        <tr key={job._id}
                                            onClick={() => {
                                                setSelectedEntry(job);
                                                setEntryType("job");
                                                setShowDetailsModal(true);
                                            }}
                                            onMouseEnter={() => setHoveredRowId(job._id)}
                                            onMouseLeave={() => setHoveredRowId(null)}
                                            style={{
                                                cursor: "pointer",
                                                backgroundColor: hoveredRowId === job._id ? "#f0f0f0" : "transparent",
                                                transition: "background-color 0.2s"
                                            }}
                                        >
                                            <td style={styles.tableCell}>{truncateId(job._id)}...</td>
                                            <td style={styles.tableCell}>{job.title}</td>
                                            <td style={styles.tableCell}>
                                                {job.description && job.description.length > 50
                                                    ? `${job.description.substring(0, 50)}...`
                                                    : job.description}
                                            </td>
                                            <td style={styles.tableCell}>{job.professionalNeeded}</td>
                                            <td style={styles.tableCell}>{job.userEmail}</td>
                                            <td style={{
                                                ...styles.tableCell,
                                                color: job.status?.toLowerCase().trim() === 'completed'
                                                    ? '#28a745'
                                                    : job.status?.toLowerCase().trim() === 'closed'
                                                        ? '#dc3545'
                                                        : job.status?.toLowerCase().trim() === 'in-progress' ||
                                                        job.status?.toLowerCase().trim() === 'inprogress' ||
                                                        job.status?.toLowerCase().trim() === 'in progress'
                                                            ? '#ffc107'
                                                            : job.status?.toLowerCase().trim() === 'open'
                                                                ? '#17a2b8'
                                                                : '#6c757d'
                                            }}>
                                                {job.status}
                                            </td>
                                            <td style={styles.tableCell}>
                                                {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case "quotes":
                // Filter quotes based on search term and status filter
                const filteredQuotes = quotes.filter(quote => {
                    const matchesSearch =
                        (quote.professionalEmail?.toLowerCase().includes(quoteSearchTerm.toLowerCase()) ||
                            quote.clientEmail?.toLowerCase().includes(quoteSearchTerm.toLowerCase()) ||
                            quote._id?.toString().includes(quoteSearchTerm) ||
                            quote.jobId?.toString().includes(quoteSearchTerm) ||
                            (quote.price && quote.price.toString().includes(quoteSearchTerm)));

                    const matchesStatus =
                        quoteFilterStatus === "all" ||
                        quote.status === quoteFilterStatus;

                    return matchesSearch && matchesStatus;
                });

                return (
                    <div style={styles.tabContent}>
                        <h2 style={styles.tabTitle}>Quotes Management</h2>
                        <div style={styles.searchFilterBar}>
                            <input
                                type="text"
                                placeholder="Search quotes..."
                                style={styles.searchInput}
                                value={quoteSearchTerm}
                                onChange={(e) => setQuoteSearchTerm(e.target.value)}
                            />
                            <select
                                style={styles.filterDropdown}
                                value={quoteFilterStatus}
                                onChange={(e) => setQuoteFilterStatus(e.target.value)}
                            >
                                <option value="all">All Quotes</option>
                                <option value="pending">Pending</option>
                                <option value="accepted">Accepted</option>
                                <option value="rejected">Rejected</option>
                                <option value="expired">Expired</option>
                            </select>
                            <button
                                style={styles.refreshButton}
                                onClick={fetchQuotes}
                                disabled={isLoadingQuotes}
                            >
                                {isLoadingQuotes ? 'Loading...' : 'Refresh'}
                            </button>
                        </div>

                        {quoteError && (
                            <div style={styles.errorMessage}>
                                {quoteError}
                            </div>
                        )}

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
                                    <th style={styles.tableHeader}>Job ID</th>
                                </tr>
                                </thead>
                                <tbody>
                                {isLoadingQuotes ? (
                                    <tr>
                                        <td colSpan="6" style={styles.loadingCell}>
                                            Loading quotes...
                                        </td>
                                    </tr>
                                ) : filteredQuotes.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={styles.emptyTableCell}>
                                            No quotes available
                                        </td>
                                    </tr>
                                ) : (
                                    filteredQuotes.map((quote) => (
                                        <tr key={quote._id}
                                            onClick={() => {
                                                setSelectedEntry(quote);
                                                setEntryType("quote");
                                                setShowDetailsModal(true);
                                            }}
                                            onMouseEnter={() => setHoveredRowId(quote._id)}
                                            onMouseLeave={() => setHoveredRowId(null)}
                                            style={{
                                                cursor: "pointer",
                                                backgroundColor: hoveredRowId === quote._id ? "#f0f0f0" : "transparent",
                                                transition: "background-color 0.2s"
                                            }}
                                        >
                                            <td style={styles.tableCell}>{truncateId(quote._id)}...</td>
                                            <td style={styles.tableCell}>{quote.professionalEmail}</td>
                                            <td style={styles.tableCell}>{quote.clientEmail}</td>
                                            <td style={styles.tableCell}>
                                                ${quote.price ? quote.price.toFixed(2) : '0.00'}
                                            </td>
                                            <td style={{
                                                ...styles.tableCell,
                                                color: quote.status === 'accepted'
                                                    ? '#28a745'
                                                    : quote.status === 'rejected'
                                                        ? '#dc3545'
                                                        : quote.status === 'expired'
                                                            ? '#6c757d'
                                                            : '#17a2b8'
                                            }}>
                                                {quote.status && quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                                            </td>
                                            <td style={styles.tableCell}>{truncateId(quote.jobId)}</td>
                                        </tr>
                                    ))
                                )}
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

    const toggleBan = async (userId, newBanStatus) => {
        try {
            const token = localStorage.getItem("authToken"); // Get token from storage
            if (!token) {
                alert("You must be logged in to perform this action.");
                return;
            }

            console.log(`Attempting to ban user: ${userId} with status: ${newBanStatus}`);

            const response = await fetch(`/api/admin/clients/ban/${userId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` // Send token
                },
                body: JSON.stringify({ banned: newBanStatus }),
            });

            const data = await response.json();
            console.log("Response from server:", data);

            if (response.ok) {
                alert(`User has been ${newBanStatus ? "banned" : "unbanned"}`);
                window.location.reload();
            } else {
                alert(`Failed to update ban status: ${data.message}`);
            }
        } catch (error) {
            console.error("Error updating ban status:", error);
        }
    };



    return (
        <div style={{ fontFamily: "'Poppins', sans-serif" }}>
            {/* Header */}
            <header style={styles.header}>
                <h1 style={styles.headerText}>Fixr Admin</h1>
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

                {showDetailsModal && selectedEntry && (
                    <div style={styles.modalOverlay}>
                        <div style={styles.modalContent}>
                            <h3 style={styles.modalTitle}>
                                {entryType.charAt(0).toUpperCase() + entryType.slice(1)} Details
                            </h3>

                            {entryType === "client" && (
                                <>
                                    <p><strong>ID:</strong> {selectedEntry._id}</p>
                                    <p><strong>First Name:</strong> {selectedEntry.firstName}</p>
                                    <p><strong>Last Name:</strong> {selectedEntry.lastName}</p>
                                    <p><strong>Email:</strong> {selectedEntry.email}</p>
                                    <p><strong>Verified:</strong> {selectedEntry.verified ? "Yes" : "No"}</p>
                                    <p><strong>Address:</strong></p>
                                    <p>{selectedEntry.street ?? "N/A"}</p>
                                    <p>{selectedEntry.postalCode ?? ""} {selectedEntry.provinceOrState ?? ""}</p>
                                    <p>{selectedEntry.country ?? ""}</p>
                                </>
                            )}

                            {entryType === "professional" && (
                                <>
                                    <p><strong>ID:</strong> {selectedEntry._id}</p>
                                    <p><strong>First Name:</strong> {selectedEntry.firstName}</p>
                                    <p><strong>Last Name:</strong> {selectedEntry.lastName}</p>
                                    <p><strong>Email:</strong> {selectedEntry.email}</p>
                                    <p><strong>Verified:</strong> {selectedEntry.verified ? "Yes" : "No"}</p> 
                                    <p><strong>Rating:</strong> {selectedEntry.totalRating ?? "N/A"}</p>
                                    <p><strong>Review Count:</strong> {selectedEntry.reviewCount ?? 0}</p>
                                    <p><strong>Payment Setup:</strong> {selectedEntry.paymentSetup ? "Yes" : "No"}</p>
                                    <p><strong>Stripe Account ID:</strong> {selectedEntry.stripeAccountId ?? "Not connected"}</p>
                                    <p><strong>Banking Info Added:</strong> {selectedEntry.bankingInfoAdded ? "Yes" : "No"}</p>
                                    <button
                                        style={selectedEntry.banned ? styles.greenButton : styles.button}
                                        onMouseEnter={(e) =>
                                            Object.assign(
                                                e.target.style,
                                                selectedEntry.banned ? styles.greenButtonHover : styles.buttonHover
                                            )
                                        }
                                        onMouseLeave={(e) =>
                                            Object.assign(
                                                e.target.style,
                                                selectedEntry.banned ? styles.greenButton : styles.button
                                            )
                                        }
                                        onMouseDown={(e) =>
                                            Object.assign(
                                                e.target.style,
                                                selectedEntry.banned ? styles.greenButtonActive : styles.buttonActive
                                            )
                                        }
                                        onMouseUp={(e) =>
                                            Object.assign(
                                                e.target.style,
                                                selectedEntry.banned ? styles.greenButtonHover : styles.buttonHover
                                            )
                                        }
                                        onClick={() => toggleBan(selectedEntry._id, !selectedEntry.banned)}
                                    >
                                        {selectedEntry.banned ? "Unban" : "Ban"}
                                    </button>


                                </>
                            )}

                            {entryType === "job" && (
                                <>
                                    <p><strong>ID:</strong> {selectedEntry._id}</p>
                                    <p><strong>Title:</strong> {selectedEntry.title}</p>
                                    <p><strong>Description:</strong> {selectedEntry.description}</p>
                                    <p><strong>Professional Needed:</strong> {selectedEntry.professionalNeeded}</p>
                                    <p><strong>User Email:</strong> {selectedEntry.userEmail}</p>
                                    <p><strong>Status:</strong> {selectedEntry.status}</p>
                                    <p><strong>Created At:</strong> {new Date(selectedEntry.createdAt).toLocaleString()}</p>
                                    <p><strong>Latitude:</strong> {selectedEntry.latitude ?? "N/A"}</p>
                                    <p><strong>Longitude:</strong> {selectedEntry.longitude ?? "N/A"}</p>
                                    <p><strong>Timeline:</strong> {selectedEntry.timeline ?? "N/A"}</p>
                                    <p><strong>Professional Email:</strong> {selectedEntry.professionalEmail ?? "N/A"}</p>
                                    <p><strong>Accepted Quote ID:</strong> {selectedEntry.acceptedQuoteId ?? "N/A"}</p>

                                </>
                            )}

                            {entryType === "quote" && (
                                <>
                                    <p><strong>ID:</strong> {selectedEntry._id}</p>
                                    <p><strong>Professional Email:</strong> {selectedEntry.professionalEmail}</p>
                                    <p><strong>Client Email:</strong> {selectedEntry.clientEmail}</p>
                                    <p><strong>Issue Title:</strong> {selectedEntry.issueTitle}</p>
                                    <p><strong>Price:</strong> ${selectedEntry.price?.toFixed(2)}</p>
                                    <p><strong>Description:</strong> {selectedEntry.jobDescription}</p>
                                    <p><strong>Tools & Materials:</strong> {selectedEntry.toolsMaterials}</p>
                                    <p><strong>Terms & Conditions:</strong> {selectedEntry.termsConditions}</p>
                                    <p><strong>Status:</strong> {selectedEntry.status}</p>
                                    <p><strong>Job ID:</strong> {selectedEntry.issueId}</p>
                                    <p><strong>Created At:</strong> {new Date(selectedEntry.createdAt).toLocaleString()}</p>
                                </>
                            )}

                            <div style={styles.modalButtons}>
                                <button
                                style={styles.cancelButton}
                                onClick={() => {
                                    setShowDetailsModal(false);
                                    setSelectedEntry(null);
                                    setEntryType(null);
                                }}
                                >
                                Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
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
    refreshButton: {
        padding: "10px 15px",
        backgroundColor: "#3498db",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        marginLeft: "10px",
    },
    tableCell: {
        padding: "10px 15px",
        borderBottom: "1px solid #eee",
        color: "#333",
    },
    loadingCell: {
        textAlign: "center",
        padding: "20px",
        color: "#3498db",
    },
    errorMessage: {
        padding: "10px 15px",
        backgroundColor: "#f8d7da",
        color: "#721c24",
        borderRadius: "5px",
        marginBottom: "15px",
    },
    activityList: {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
    },
    activityItem: {
        padding: "10px",
        backgroundColor: "#fff",
        borderRadius: "5px",
        boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)",
    },
    activityTime: {
        fontSize: "12px",
        color: "#6c757d",
        display: "block",
        marginBottom: "5px",
    },
    activityText: {
        margin: "0",
        fontSize: "14px",
    },
    button: {
        padding: "12px 24px",
        fontSize: "16px",
        fontWeight: "bold",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        color: "#fff",
        background: "linear-gradient(135deg, #ff4d4d, #c40000)",
        boxShadow: "0 4px 10px rgba(255, 77, 77, 0.4)",
    },
    buttonHover: {
        background: "linear-gradient(135deg, #ff1a1a, #900000)",
        boxShadow: "0 6px 14px rgba(255, 26, 26, 0.5)",
        transform: "scale(1.05)"
    },
    buttonActive: {
        transform: "scale(0.98)",
        boxShadow: "0 2px 6px rgba(255, 0, 0, 0.6)"
    },
    greenButton: {
        padding: "12px 24px",
        fontSize: "16px",
        fontWeight: "bold",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        color: "#fff",
        background: "linear-gradient(135deg, #28a745, #218838)",
        boxShadow: "0 4px 10px rgba(40, 167, 69, 0.4)",
    },
    greenButtonHover: {
        background: "linear-gradient(135deg, #218838, #1e7e34)",
        boxShadow: "0 6px 14px rgba(40, 167, 69, 0.5)",
        transform: "scale(1.05)",
    },
    greenButtonActive: {
        transform: "scale(0.98)",
        boxShadow: "0 2px 6px rgba(40, 167, 69, 0.6)",
    },
    

};