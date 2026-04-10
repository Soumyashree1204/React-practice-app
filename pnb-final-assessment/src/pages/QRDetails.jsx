import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUser, logout } from '../authentication/authService'
import { generateQRBase64 } from '../api/vpaService'
import pnbLogo from '../images/pnb-logo.png'
import profileImage from '../images/profile-img.png'
import upiLogo from '../images/upi.jpg'
import '../css/Dashboard.css'
import '../css/TransactionReports.css'
import '../css/QRDetails.css'

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

function QRDetails() {
    const [user, setUser] = useState(null)
    const [activeMenu, setActiveMenu] = useState('QR Details')
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
    const [isProfileOverlayOpen, setIsProfileOverlayOpen] = useState(false)
    
    // QR logical state
    const [qrType, setQrType] = useState('Static')
    const [amountInput, setAmountInput] = useState('')
    const [generatedAmount, setGeneratedAmount] = useState(null)
    const [timeLeft, setTimeLeft] = useState(10)
    const [isPaymentSuccessModalOpen, setIsPaymentSuccessModalOpen] = useState(false)
    const [staticQrBase64, setStaticQrBase64] = useState('')
    const [dynamicQrBase64, setDynamicQrBase64] = useState('')
    const [isGeneratingQr, setIsGeneratingQr] = useState(false)
    const [vpaId, setVpaId] = useState('')
    const [merchantName, setMerchantName] = useState('')
    const [serialNumber, setSerialNumber] = useState('')

    const navigate = useNavigate()

    useEffect(() => {
        const u = getUser()
        if (!u) {
            navigate('/')
        } else {
            setUser(u)
        }

        // Read pre-fetched data from sessionStorage
        const storedVpa = sessionStorage.getItem('active_vpa') || ''
        setVpaId(storedVpa)

        const storedDetails = sessionStorage.getItem('device_details')
        if (storedDetails) {
            try {
                const details = JSON.parse(storedDetails)
                setMerchantName(details.merchant_name || '')
                setSerialNumber(details.serial_number || '')
            } catch (e) {
                console.error('Error parsing device details', e)
            }
        }

        const storedQr = sessionStorage.getItem('static_qr_base64') || ''
        if (storedQr) {
            setStaticQrBase64(storedQr)
        } else if (storedVpa) {
            // Self-healing fallback if static QR was not generated correctly yet
            const mName = sessionStorage.getItem('device_details') ? JSON.parse(sessionStorage.getItem('device_details')).merchant_name : '';
            const tId = sessionStorage.getItem('device_details') ? JSON.parse(sessionStorage.getItem('device_details')).serial_number : '';
            const staticQrString = `upi://pay?pa=${storedVpa}&pn=${encodeURIComponent(mName)}&mc=5411&tid=${tId}`;
            
            generateQRBase64(staticQrString)
                .then(qrRes => {
                    if (qrRes && qrRes.base64Image) {
                        setStaticQrBase64(qrRes.base64Image)
                        sessionStorage.setItem('static_qr_base64', qrRes.base64Image)
                    }
                })
                .catch(err => console.error("Self-healing static QR fetch failed:", err))
        }
    }, [navigate])

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = () => {
            setIsProfileDropdownOpen(false)
        }
        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [])

    // 10 seconds timer
    useEffect(() => {
        let interval;
        if (qrType === 'Dynamic' && generatedAmount) {
            setTimeLeft(10);
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        setIsPaymentSuccessModalOpen(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [qrType, generatedAmount]);

    if (!user) return (
        <div style={{ padding: '80px', textAlign: 'center', color: '#A20E37' }}>
            <h2>Loading...</h2>
        </div>
    )

    const handleGenerateQR = () => {
        if (amountInput && vpaId) {
            setIsGeneratingQr(true)
            setDynamicQrBase64('')
            const qrString = `upi://pay?pa=${vpaId}&pn=${encodeURIComponent(merchantName)}&mc=5411&tid=${serialNumber}&am=${amountInput}`
            generateQRBase64(qrString)
                .then(qrRes => {
                    setIsGeneratingQr(false)
                    if (qrRes && qrRes.base64Image) {
                        setDynamicQrBase64(qrRes.base64Image)
                        setGeneratedAmount(amountInput)
                    }
                })
                .catch(err => {
                    setIsGeneratingQr(false)
                    console.error('Error generating dynamic QR:', err)
                })
        }
    }

    const displayTime = `0:${timeLeft.toString().padStart(2, '0')}`


    const isDisplayVisible = qrType === 'Static' || (qrType === 'Dynamic' && generatedAmount)

    // Determine which base64 image to show
    const currentQrBase64 = qrType === 'Static' ? staticQrBase64 : dynamicQrBase64
    const qrImgSrc = currentQrBase64 ? `data:image/png;base64,${currentQrBase64}` : ''

    const handleDownloadQR = () => {
        if (!qrImgSrc) return
        const link = document.createElement('a')
        link.href = qrImgSrc
        link.download = `QR_${vpaId || 'code'}_${qrType}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
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
                <div className="page-content reporting-page">
                    <h2 className="page-title">QR Details</h2>

                    {/* Filter Card */}
                    <div className="qr-filter-card">
                        <div className="qr-filter-title">Select The Type of QR</div>
                        <div className="tr-radio-group">
                            <label className="tr-radio-label" onClick={() => { setQrType('Static'); setGeneratedAmount(null); setAmountInput(''); setDynamicQrBase64(''); setIsPaymentSuccessModalOpen(false); }}>
                                <div className={`dropdown-radio ${qrType === 'Static' ? 'selected' : ''}`}>
                                    {qrType === 'Static' && <div className="dropdown-radio-inner" />}
                                </div>
                                Static
                            </label>
                            <label className="tr-radio-label" onClick={() => setQrType('Dynamic')}>
                                <div className={`dropdown-radio ${qrType === 'Dynamic' ? 'selected' : ''}`}>
                                    {qrType === 'Dynamic' && <div className="dropdown-radio-inner" />}
                                </div>
                                Dynamic
                            </label>
                        </div>

                        {qrType === 'Dynamic' && (
                            <div className="qr-dynamic-section">
                                <div className="qr-dynamic-hint">Enter an amount to instantly generate your dynamic QR code</div>
                                <div className="qr-dynamic-input-row">
                                    <div className="qr-input-group">
                                        <label>Amount to be collected</label>
                                        <input 
                                            type="text" 
                                            className="qr-dynamic-input" 
                                            placeholder="Enter the amount to be collected" 
                                            value={amountInput}
                                            onChange={(e) => setAmountInput(e.target.value.replace(/[^0-9]/g, ''))}
                                        />
                                    </div>
                                    <button className="qr-btn-generate" onClick={handleGenerateQR} disabled={isGeneratingQr}>
                                        {isGeneratingQr ? 'Generating...' : 'Generate QR'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Display Area */}
                    {isDisplayVisible && (
                        <div className="qr-display-wrapper">
                            <div className="qr-display-card">

                                {qrType === 'Dynamic' && generatedAmount && (
                                    <>
                                        <div className="qr-dynamic-amount-label">Amount to be Collected</div>
                                        <div className="qr-dynamic-amount-val">₹ {generatedAmount}</div>
                                    </>
                                )}

                                {qrImgSrc ? (
                                    <img src={qrImgSrc} alt="UPI QR Code" className="qr-code-img" />
                                ) : (
                                    <div className="qr-loading-placeholder">Loading QR...</div>
                                )}

                                <button className="qr-btn-download" onClick={handleDownloadQR}>Download QR Code</button>

                                {qrType === 'Dynamic' && generatedAmount && (
                                    <div className="qr-valid-till">Valid till {displayTime}</div>
                                )}

                                <div className="qr-powered-by">
                                    <span className="qr-powered-text">POWERED BY</span>
                                    <img src={upiLogo} alt="UPI" className="qr-upi-logo" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* PAYMENT SUCCESS MODAL */}
            {isPaymentSuccessModalOpen && (
                <div className="payment-success-overlay">
                    <div className="payment-success-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Payment Successful!</h3>
                        <div className="success-icon-wrapper">
                            <div className="success-icon-outer">
                                <div className="success-icon-inner">
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <p>Your transaction has been completed successfully.</p>
                        <button className="btn-close-payment" onClick={() => {
                            setIsPaymentSuccessModalOpen(false);
                            setGeneratedAmount(null);
                            setAmountInput('');
                        }}>Close</button>
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

export default QRDetails
