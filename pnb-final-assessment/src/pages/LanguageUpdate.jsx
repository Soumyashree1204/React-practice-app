import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUser, logout } from '../authentication/authService'
import { updateLanguage } from '../api/vpaService'
import pnbLogo from '../images/pnb-logo.png'
import profileImage from '../images/profile-img.png'
import '../css/Dashboard.css'
import '../css/LanguageUpdate.css'

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

function LanguageUpdate() {
    const [user, setUser] = useState(null)
    const [activeMenu, setActiveMenu] = useState('Language Update')
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
    const [isProfileOverlayOpen, setIsProfileOverlayOpen] = useState(false)
    
    // Language logical state
    const [selectedLanguage, setSelectedLanguage] = useState('')
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
    const [vpaId, setVpaId] = useState('')
    const [serialNumber, setSerialNumber] = useState('')
    const [currentLanguage, setCurrentLanguage] = useState('')
    const [languages, setLanguages] = useState([])
    const [toastMessage, setToastMessage] = useState('')
    const [isUpdating, setIsUpdating] = useState(false)

    const navigate = useNavigate()

    useEffect(() => {
        const u = getUser()
        if (!u) {
            navigate('/')
        } else {
            setUser(u)
        }

        // Read VPA ID and device serial number stored by Dashboard
        const storedVpa = sessionStorage.getItem('active_vpa') || ''
        setVpaId(storedVpa)
        const storedDetails = sessionStorage.getItem('device_details')
        if (storedDetails) {
            try {
                const details = JSON.parse(storedDetails)
                setSerialNumber(details.serial_number || '')
            } catch (e) {
                console.error('Error parsing device details', e)
            }
        }

        // Read current language pre-fetched by Dashboard
        const storedLanguage = sessionStorage.getItem('current_language') || ''
        setCurrentLanguage(storedLanguage)

        // Read language list pre-fetched by Dashboard
        const storedList = sessionStorage.getItem('language_list')
        if (storedList) {
            try {
                setLanguages(JSON.parse(storedList))
            } catch (e) {
                console.error('Error parsing language list', e)
            }
        }
    }, [navigate])

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = () => {
            setIsProfileDropdownOpen(false)
            setIsDropdownOpen(false)
        }
        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [])

    if (!user) return null

    const handleUpdateLanguage = () => {
        if (!selectedLanguage || !serialNumber) return
        setIsUpdating(true)
        updateLanguage(serialNumber, selectedLanguage)
            .then(res => {
                setIsUpdating(false)
                setSelectedLanguage('')
                // Open the modal instead of showing a toast
                setIsSuccessModalOpen(true)
            })
            .catch(err => {
                setIsUpdating(false)
                setToastMessage(err.message || 'Failed to update language')
                setTimeout(() => setToastMessage(''), 4000)
            })
    }

    return (
        <div className="dashboard-wrapper">
            {/* TOAST NOTIFICATION */}
            {toastMessage && (
                <div className="toast-notification">
                    <span>{toastMessage}</span>
                    <button className="toast-close" onClick={() => setToastMessage('')}>✕</button>
                </div>
            )}

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

            {/* MAIN CONTENT */}
            <div className="main-content">
                {/* TOP NAVBAR */}
                <div className="top-navbar">
                    <div className="toggle-menu">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                    <h2 className="page-title">Language Update</h2>

                    <div className="lang-update-card">
                        <div className="lang-grid">
                            <div className="lang-field-group">
                                <label>VPA ID</label>
                                <div className="lang-input-readonly">{vpaId}</div>
                            </div>
                            <div className="lang-field-group">
                                <label>Device Serial Number</label>
                                <div className="lang-input-readonly">{serialNumber}</div>
                            </div>
                            <div className="lang-field-group">
                                <label>Current Language</label>
                                <div className="lang-input-readonly">{currentLanguage || ''}</div>
                            </div>
                            <div className="lang-field-group">
                                <label>Language Update</label>
                                <div className="lang-dropdown-wrapper">
                                    <div 
                                        className={`lang-dropdown-trigger ${!selectedLanguage ? 'placeholder' : ''}`}
                                        onClick={(e) => { e.stopPropagation(); setIsDropdownOpen(!isDropdownOpen); }}
                                    >
                                        <span>{selectedLanguage || 'Select Language Update'}</span>
                                        <span className="lang-dropdown-arrow">▼</span>
                                    </div>
                                    {isDropdownOpen && (
                                        <div className="lang-dropdown-menu">
                                            {languages.map((lang, idx) => (
                                                <div 
                                                    key={`${lang}-${idx}`} 
                                                    className={`lang-option ${selectedLanguage === lang ? 'active' : ''}`}
                                                    onClick={() => { setSelectedLanguage(lang); setIsDropdownOpen(false); }}
                                                >
                                                    {lang}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="lang-actions">
                            <button className="lang-btn-cancel" onClick={() => setSelectedLanguage('')}>Cancel</button>
                            <button 
                                className="lang-btn-update" 
                                onClick={handleUpdateLanguage}
                                disabled={!selectedLanguage || isUpdating}
                            >
                                {isUpdating ? 'Updating...' : 'Update'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* SUCCESS MODAL */}
            {isSuccessModalOpen && (
                <div className="payment-success-overlay">
                    <div className="payment-success-modal" onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ lineHeight: '1.4' }}>Language update request<br />Initiated Successfully</h3>
                        <div className="success-icon-wrapper">
                            <div className="success-icon-outer">
                                <div className="success-icon-inner">
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div style={{ height: '20px' }}></div> {/* Spacer */}
                        <button className="btn-close-payment" onClick={() => setIsSuccessModalOpen(false)}>Close</button>
                    </div>
                </div>
            )}

            {/* PROFILE MODAL (Reused) */}
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
                                        <span className="profile-val">+91 9398239231</span>
                                    </div>
                                </div>
                            </div>
                            <div className="profile-card">
                                <div className="profile-card-title">Device Information</div>
                                <div className="profile-card-body">
                                    <div className="profile-row"><span className="profile-label">Device Serial Number</span><span className="profile-val">456954659876857</span></div>
                                    <div className="profile-row"><span className="profile-label">Linked Account Number</span><span className="profile-val">XXXXXX6857</span></div>
                                    <div className="profile-row"><span className="profile-label">UPI ID</span><span className="profile-val">rudransh.panigrahi@pnb</span></div>
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

export default LanguageUpdate
