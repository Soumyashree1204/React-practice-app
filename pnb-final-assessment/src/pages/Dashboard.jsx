import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUser, logout, startTokenRefresh } from '../authentication/authService'
import { fetchVPAList, fetchVPADetails, fetchCurrentLanguage, fetchLanguageList, generateQRBase64 } from '../api/vpaService'
import pnbLogo from '../images/pnb-logo.png'
import profileImage from '../images/profile-img.png'
import '../css/Dashboard.css'

const menuItems = [
    {
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
            </svg>
        ),
        label: 'Dashboard'
    },
    {
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
            </svg>
        ),
        label: 'Transaction Reports'
    },
    {
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
            </svg>
        ),
        label: 'QR Details'
    },
    {
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
        ),
        label: 'Language Update'
    },
    {
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
        ),
        label: 'Help & Support'
    },
]

function Dashboard() {
    const [user, setUser] = useState(null)
    const [activeMenu, setActiveMenu] = useState('Dashboard')
    const [vpaListObjects, setVpaListObjects] = useState([])
    const [deviceDetails, setDeviceDetails] = useState(null)
    const [vpaList, setVpaList] = useState(['Pabitra.hota@pnb', '9283032322742bis@pnb', 'Pabitra@pnb'])
    const [isVpaDropdownOpen, setIsVpaDropdownOpen] = useState(false)
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false)
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
    const [isProfileOverlayOpen, setIsProfileOverlayOpen] = useState(false)
    const [activeFilter, setActiveFilter] = useState('Today')
    const [selectedVpa, setSelectedVpa] = useState('')
    const [activeVpa, setActiveVpa] = useState('')
    const [isVpaSelectionModalOpen, setIsVpaSelectionModalOpen] = useState(false)
    const [tempSelectedVpa, setTempSelectedVpa] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const u = getUser()
        if (!u) {
            navigate('/')
        } else {
            setUser(u)
            startTokenRefresh()
            const mobile = u.user_name || u.preferred_username || u.mobile_number
            if (mobile) {
                setIsLoading(true)
                fetchVPAList(mobile)
                    .then(res => {
                        setIsLoading(false)
                        if (res && res.data && Array.isArray(res.data)) {
                            setVpaListObjects(res.data)
                            const ids = res.data.map(item => item.vpa_id)
                            if (ids.length > 0) {
                                setVpaList(ids)
                                setTempSelectedVpa(ids[0])

                                // Passively boot up the dashboard using the first VPA without alerting the user
                                const targetVpa = ids[0]
                                setActiveVpa(targetVpa)
                                sessionStorage.setItem('active_vpa', targetVpa)

                                // Fetch its details in background so everything is ready
                                fetchVPADetails(targetVpa).then(detailRes => {
                                    if (detailRes && detailRes.data) {
                                        const details = Array.isArray(detailRes.data) ? detailRes.data[0] : detailRes.data
                                        setDeviceDetails(details)
                                        sessionStorage.setItem('device_details', JSON.stringify(details))
                                        if (details.serial_number) fetchCurrentLanguage(details.serial_number).then(l => l?.data && sessionStorage.setItem('current_language', l.data)).catch(() => { })
                                        fetchLanguageList().then(l => l?.data && sessionStorage.setItem('language_list', JSON.stringify(l.data))).catch(() => { })
                                        const qrString = `upi://pay?pa=${targetVpa}&pn=${encodeURIComponent(details.merchant_name || '')}&mc=5411&tid=${details.serial_number || ''}`
                                        generateQRBase64(qrString).then(qrRes => qrRes?.base64Image && sessionStorage.setItem('static_qr_base64', qrRes.base64Image)).catch(() => { })
                                    }
                                }).catch(err => console.error("Initial VPA detail fetch failed:", err))
                            }
                        }
                    })
                    .catch(err => {
                        console.error("Failed to fetch VPAs", err)
                        setIsLoading(false)
                    })
            }
        }
    }, [navigate])

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = () => {
            setIsVpaDropdownOpen(false)
            setIsFilterDropdownOpen(false)
            setIsProfileDropdownOpen(false)
        }
        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [])

    if (!user || isLoading) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', color: '#A20E37' }}>
                <h2 style={{ marginBottom: '10px' }}></h2>
                <div className="loader-spinner"></div>
            </div>
        </div>
    )

    const handleVpaProceed = (selectedItem) => {
        // Prevent React SyntheticEvents from leaking into the state.
        const targetVpa = typeof selectedItem === 'string' ? selectedItem : tempSelectedVpa;

        setActiveVpa(targetVpa)
        setIsVpaSelectionModalOpen(false)
        setIsVpaDropdownOpen(false)
        setTempSelectedVpa(targetVpa)
        sessionStorage.setItem('active_vpa', targetVpa)
        fetchVPADetails(targetVpa)
            .then(res => {
                if (res && res.data) {
                    const details = Array.isArray(res.data) ? res.data[0] : res.data
                    setDeviceDetails(details)
                    sessionStorage.setItem('device_details', JSON.stringify(details))

                    if (details.serial_number) {
                        fetchCurrentLanguage(details.serial_number)
                            .then(langRes => {
                                if (langRes && langRes.data) {
                                    sessionStorage.setItem('current_language', langRes.data)
                                }
                            })
                            .catch(err => console.error('Error pre-fetching current language:', err))
                    }

                    fetchLanguageList()
                        .then(listRes => {
                            if (listRes && listRes.data && Array.isArray(listRes.data)) {
                                sessionStorage.setItem('language_list', JSON.stringify(listRes.data))
                            }
                        })
                        .catch(err => console.error('Error pre-fetching language list:', err))

                    const merchantName = details.merchant_name || ''
                    const qrString = `upi://pay?pa=${targetVpa}&pn=${encodeURIComponent(merchantName)}&mc=5411&tid=${details.serial_number || ''}`
                    generateQRBase64(qrString)
                        .then(qrRes => {
                            if (qrRes && qrRes.base64Image) {
                                sessionStorage.setItem('static_qr_base64', qrRes.base64Image)
                            }
                        })
                        .catch(err => console.error('Error pre-fetching static QR:', err))
                }
            })
            .catch(err => {
                console.error("Failed to fetch VPA details", err)
            })
    }

    const activeVpaObj = vpaListObjects.find(v => v.vpa_id === activeVpa)
    let merchantAccountNumber = activeVpaObj?.merchant_account_no || ''
    if (merchantAccountNumber.length > 4) {
        merchantAccountNumber = 'X'.repeat(merchantAccountNumber.length - 4) + merchantAccountNumber.slice(-4)
    }

    return (
        <div className="dashboard-wrapper">

            {/* SIDEBAR */}
            <div className="sidebar">
                <div className="sidebar-logo">
                    <img src={pnbLogo} alt="PNB" />
                </div>
                <nav className="sidebar-nav">
                    {menuItems.map(item => (
                        <div
                            key={item.label}
                            className={`sidebar-item ${activeMenu === item.label ? 'active' : ''}`}
                            onClick={() => {
                                setActiveMenu(item.label);
                                if (item.label === 'Transaction Reports') navigate('/transaction-reports');
                                else if (item.label === 'Dashboard') navigate('/dashboard');
                                else if (item.label === 'QR Details') navigate('/qr-details');
                                else if (item.label === 'Language Update') navigate('/language-update');
                                else if (item.label === 'Help & Support') navigate('/help-support');
                            }}
                        >
                            <span className="sidebar-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </div>
                    ))}
                </nav>
            </div>

            {/* MAIN */}
            <div className="main-content">

                {/* TOP NAVBAR */}
                <div className="top-navbar">
                    <div className="toggle-menu">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="4" y1="7" x2="20" y2="7" />
                            <line x1="4" y1="12" x2="14" y2="12" />
                            <line x1="4" y1="17" x2="20" y2="17" />
                        </svg>
                    </div>
                    <div
                        className="navbar-user"
                        onClick={(e) => { e.stopPropagation(); setIsProfileDropdownOpen(!isProfileDropdownOpen); }}
                    >
                        <img
                            src={profileImage}
                            alt="Avatar"
                            className="user-img-avatar"
                        />
                        <span className="user-name">{user?.name || user?.preferred_username || 'User'}</span>
                        {isProfileDropdownOpen && (
                            <div className="custom-dropdown-menu dropdown-right">
                                <div className="dropdown-item" onClick={(e) => { e.stopPropagation(); setIsProfileOverlayOpen(true); setIsProfileDropdownOpen(false); }}>View Profile</div>
                                <div className="dropdown-item logout-item" onClick={logout}>Logout</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* PAGE CONTENT */}
                <div className="page-content">
                    <h2 className="page-title">Dashboard</h2>

                    {/* VPA Row */}
                    <div className="vpa-row">
                        <p className="vpa-text">
                            <span className="vpa-label">VPA ID : </span>
                            <span
                                className="vpa-value-box"
                                onClick={(e) => { e.stopPropagation(); setIsVpaSelectionModalOpen(true); setIsFilterDropdownOpen(false); setIsProfileDropdownOpen(false); }}
                            >
                                <span className="vpa-value">{activeVpa}</span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#757575" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </span>
                        </p>
                        <div
                            className="filter-dropdown"
                            onClick={(e) => { e.stopPropagation(); setIsFilterDropdownOpen(!isFilterDropdownOpen); setIsVpaDropdownOpen(false); setIsProfileDropdownOpen(false); }}
                        >
                            {activeFilter} <span className="filter-arrow">▼</span>
                            {isFilterDropdownOpen && (
                                <div className="custom-dropdown-menu dropdown-right">
                                    <div className="dropdown-item" onClick={(e) => { e.stopPropagation(); setActiveFilter('Today'); setIsFilterDropdownOpen(false); }}>
                                        <div className={`dropdown-radio ${activeFilter === 'Today' ? 'selected' : ''}`}>
                                            {activeFilter === 'Today' && <div className="dropdown-radio-inner" />}
                                        </div>
                                        Today
                                    </div>
                                    <div className="dropdown-item" onClick={(e) => { e.stopPropagation(); setActiveFilter('Yesterday'); setIsFilterDropdownOpen(false); }}>
                                        <div className={`dropdown-radio ${activeFilter === 'Yesterday' ? 'selected' : ''}`}>
                                            {activeFilter === 'Yesterday' && <div className="dropdown-radio-inner" />}
                                        </div>
                                        Yesterday
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon light-blue">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#A20E37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="17 10 21 6 17 2" />
                                    <path d="M3 11V6a4 4 0 0 1 4-4h14" />
                                    <polyline points="7 14 3 18 7 22" />
                                    <path d="M21 13v5a4 4 0 0 1-4 4H3" />
                                </svg>
                            </div>
                            <div className="stat-card-info">
                                <span className="stat-label">Total No Of Transaction</span>
                                <span className="stat-value">{activeVpa ? '20.7K' : '0'}</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon light-blue">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#A20E37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="6" width="20" height="12" rx="2" />
                                    <circle cx="12" cy="12" r="3" />
                                    <path d="M6 12h.01M18 12h.01" />
                                </svg>
                            </div>
                            <div className="stat-card-info">
                                <span className="stat-label">Total Amount</span>
                                <span className="stat-value">{activeVpa ? '76,000 cr' : '0'}</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* VPA SELECTION MODAL */}
            {isVpaSelectionModalOpen && (
                <div className="vpa-modal-overlay">
                    <div className="vpa-modal">
                        <div className="vpa-modal-header">
                            <h3>Select VPA</h3>
                        </div>
                        <div className="vpa-modal-body">
                            <p className="vpa-modal-subtitle">Select a VPA to Proceed</p>
                            <div className="vpa-modal-list">
                                {vpaList.map((vpa) => (
                                    <div
                                        key={vpa}
                                        className={`vpa-modal-item ${tempSelectedVpa === vpa ? 'selected' : ''}`}
                                        onClick={() => setTempSelectedVpa(vpa)}
                                    >
                                        <div className="vpa-radio-icon">
                                            <div className="vpa-radio-dot" />
                                        </div>
                                        <span className="vpa-modal-label">{vpa}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="vpa-modal-footer">
                            <button className="vpa-modal-btn-cancel" onClick={() => logout()}>Cancel</button>
                            <button className="vpa-modal-btn-proceed" onClick={handleVpaProceed}>Proceed</button>
                        </div>
                    </div>
                </div>
            )}

            {/* PROFILE MODAL */}
            {isProfileOverlayOpen && (
                <div className="profile-overlay-bg" onClick={() => setIsProfileOverlayOpen(false)}>
                    <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="profile-panel-header">
                            <h3>View Profile Details</h3>
                        </div>
                        <div className="profile-panel-content">
                            <div className="profile-card">
                                <div className="profile-card-title">Basic Information</div>
                                <div className="profile-card-body">
                                    <div className="profile-row">
                                        <span className="profile-label">Name</span>
                                        <span className="profile-val">{user?.name || user?.preferred_username || 'Stebin Ben'}</span>
                                    </div>
                                    <div className="profile-row">
                                        <span className="profile-label">Phone</span>
                                        <span className="profile-val">{user?.user_name || ''}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="profile-card">
                                <div className="profile-card-title">Device Information</div>
                                <div className="profile-card-body">
                                    <div className="profile-row"><span className="profile-label">Device Serial Number</span><span className="profile-val">{deviceDetails?.serial_number || ''}</span></div>
                                    <div className="profile-row"><span className="profile-label">Linked Account Number</span><span className="profile-val">{merchantAccountNumber === 'N/A' ? '' : merchantAccountNumber}</span></div>
                                    <div className="profile-row"><span className="profile-label">UPI ID</span><span className="profile-val">{activeVpa || ''}</span></div>
                                    <div className="profile-row"><span className="profile-label">IFSC Code</span><span className="profile-val">{deviceDetails?.ifsc || ''}</span></div>
                                    <div className="profile-row"><span className="profile-label">Device Model Name</span><span className="profile-val">{deviceDetails?.device_model || ''}</span></div>
                                    <div className="profile-row"><span className="profile-label">Device Mobile Number</span><span className="profile-val">{user?.user_name || ''}</span></div>
                                    <div className="profile-row"><span className="profile-label">Network Type</span><span className="profile-val">{deviceDetails?.network_type || ''}</span></div>
                                    <div className="profile-row"><span className="profile-label">Device Status</span><span className="profile-val">{deviceDetails?.device_status || ''}</span></div>
                                    <div className="profile-row"><span className="profile-label">Battery Percentage</span><span className="profile-val">{deviceDetails?.device_status?.toLowerCase() === 'active' ? (deviceDetails?.battery_percentage || '') : ''}</span></div>
                                    <div className="profile-row"><span className="profile-label">Network Strength</span><span className="profile-val">{deviceDetails?.device_status?.toLowerCase() === 'active' ? (deviceDetails?.network_strength || '') : ''}</span></div>
                                </div>
                            </div>
                        </div>
                        <div className="profile-panel-footer">
                            <button className="btn-close-profile" onClick={() => setIsProfileOverlayOpen(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default Dashboard