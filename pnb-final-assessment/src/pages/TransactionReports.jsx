import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUser, logout } from '../authentication/authService'
import { fetchTransactionReports } from '../api/vpaService'
import pnbLogo from '../images/pnb-logo.png'
import profileImage from '../images/profile-img.png'
import '../css/TransactionReports.css'
import '../css/Dashboard.css'
import '../css/LanguageUpdate.css' // reusing toast styles if needed

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

function TransactionReports() {
    const [user, setUser] = useState(null)
    const [activeMenu, setActiveMenu] = useState('Transaction Reports')
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
    const [isProfileOverlayOpen, setIsProfileOverlayOpen] = useState(false)

    // Filters logic
    const [selectedFilter, setSelectedFilter] = useState('Today')
    const [monthlyOption, setMonthlyOption] = useState("Last Month's Report")
    const [isMonthlyDropdownOpen, setIsMonthlyDropdownOpen] = useState(false)
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    // Data state
    const [reportsData, setReportsData] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [totalAmount, setTotalAmount] = useState(0)
    const [totalRows, setTotalRows] = useState(0)
    const [vpaId, setVpaId] = useState('')

    // Pagination/Search state
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [currentPage, setCurrentPage] = useState(1)
    const [gotoPageValue, setGotoPageValue] = useState('')
    const [searchTerm, setSearchTerm] = useState('')

    const navigate = useNavigate()

    const formatDate = (date) => {
        const d = new Date(date)
        const day = String(d.getDate()).padStart(2, '0')
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const year = d.getFullYear()
        return `${day}/${month}/${year}`
    }

    const getYesterday = () => {
        const d = new Date()
        d.setDate(d.getDate() - 1)
        return d
    }

    const toInputFormat = (date) => {
        const d = new Date(date)
        const day = String(d.getDate()).padStart(2, '0')
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const year = d.getFullYear()
        return `${year}-${month}-${day}`
    }

    const getMonthsAgo = (n) => {
        const d = new Date()
        d.setMonth(d.getMonth() - n)
        return d
    }

    const formatDateTime = (dtStr) => {
        if (!dtStr) return ''
        try {
            const date = new Date(dtStr.replace(' ', 'T'))
            return date.toLocaleString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }).toUpperCase().replace(',', '')
        } catch (e) {
            return dtStr
        }
    }

    useEffect(() => {
        const u = getUser()
        if (!u) {
            navigate('/')
        } else {
            setUser(u)
        }

        const storedVpa = sessionStorage.getItem('active_vpa')
        if (storedVpa) {
            setVpaId(storedVpa)
            // Initial fetch for "Today"
            const todayStr = formatDate(new Date())
            handleFetchReports(todayStr, todayStr, storedVpa)
        }
    }, [navigate])

    const handleFetchReports = (sDate, eDate, vpa) => {
        setIsLoading(true)
        setReportsData([])
        fetchTransactionReports(sDate, eDate, vpa || vpaId)
            .then(res => {
                if (res && res.data) {
                    setReportsData(res.data || [])
                    setTotalAmount(res.total_amount || 0)
                    setTotalRows(res.row_count || 0)
                }
                setIsLoading(false)
            })
            .catch(err => {
                console.error("Error fetching reports:", err)
                setIsLoading(false)
            })
    }

    const handleSubmitFilter = () => {
        let sDate = ''
        let eDate = ''

        if (selectedFilter === 'Today') {
            sDate = eDate = formatDate(new Date())
        } else if (selectedFilter === 'Monthly') {
            const yesterday = formatDate(getYesterday())
            eDate = yesterday
            if (monthlyOption === "Last Month's Report") sDate = formatDate(getMonthsAgo(1))
            else if (monthlyOption === "Last 3 month's Report") sDate = formatDate(getMonthsAgo(3))
            else if (monthlyOption === "Last 6 month's Report") sDate = formatDate(getMonthsAgo(6))
            else if (monthlyOption === "Last 12 month's Report") sDate = formatDate(getMonthsAgo(12))
        } else if (selectedFilter === 'Custom Range') {
            sDate = startDate
            eDate = endDate
        }

        if (sDate && eDate) {
            handleFetchReports(sDate, eDate)
            setCurrentPage(1)
        }
    }

    // Logic for Today filter click
    useEffect(() => {
        if (selectedFilter === 'Today' && vpaId) {
            const todayStr = formatDate(new Date())
            handleFetchReports(todayStr, todayStr)
            setCurrentPage(1)
        }
    }, [selectedFilter])

    // Pagination Logic
    const filteredData = reportsData.filter(item => 
        (item.Transaction_Id?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.RRN?.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1
    const pagedData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

    const handleGotoPage = () => {
        const p = parseInt(gotoPageValue)
        if (p >= 1 && p <= totalPages) {
            setCurrentPage(p)
        }
    }

    const renderPageNumbers = () => {
        const pages = []
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i)
        } else {
            pages.push(1)
            if (currentPage > 3) pages.push('...')
            const start = Math.max(2, currentPage - 1)
            const end = Math.min(totalPages - 1, currentPage + 1)
            for (let i = start; i <= end; i++) pages.push(i)
            if (currentPage < totalPages - 2) pages.push('...')
            pages.push(totalPages)
        }
        return pages
    }

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = () => {
            setIsProfileDropdownOpen(false)
            setIsMonthlyDropdownOpen(false)
        }
        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [])

    if (!user) return (
        <div style={{ padding: '80px', textAlign: 'center', color: '#A20E37' }}>
            <h2>Loading...</h2>
        </div>
    )

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
                    <h2 className="page-title">Transaction Reports</h2>

                    {/* Filter Card */}
                    <div className="tr-filter-card">
                        <div className="tr-filter-title">Select a Report Filter</div>
                        <div className="tr-radio-group">
                            <label className="tr-radio-label" onClick={() => setSelectedFilter('Today')}>
                                <div className={`dropdown-radio ${selectedFilter === 'Today' ? 'selected' : ''}`}>
                                    {selectedFilter === 'Today' && <div className="dropdown-radio-inner" />}
                                </div>
                                Today
                            </label>
                            <label className="tr-radio-label" onClick={() => setSelectedFilter('Monthly')}>
                                <div className={`dropdown-radio ${selectedFilter === 'Monthly' ? 'selected' : ''}`}>
                                    {selectedFilter === 'Monthly' && <div className="dropdown-radio-inner" />}
                                </div>
                                Monthly
                            </label>
                            <label className="tr-radio-label" onClick={() => setSelectedFilter('Custom Range')}>
                                <div className={`dropdown-radio ${selectedFilter === 'Custom Range' ? 'selected' : ''}`}>
                                    {selectedFilter === 'Custom Range' && <div className="dropdown-radio-inner" />}
                                </div>
                                Custom Range
                            </label>
                        </div>

                        {/* Filter Sub-panels */}
                        {selectedFilter === 'Monthly' && (
                            <div className="tr-filter-sub">
                                <div className="tr-sub-field">
                                    <label>Monthly</label>
                                    <div className="tr-custom-select" onClick={(e) => { e.stopPropagation(); setIsMonthlyDropdownOpen(!isMonthlyDropdownOpen); }}>
                                        {monthlyOption}
                                        <span className="tr-select-arrow">▼</span>
                                        {isMonthlyDropdownOpen && (
                                            <div className="tr-select-dropdown">
                                                {["Last Month's Report", "Last 3 month's Report", "Last 6 month's Report", "Last 12 month's Report"].map(opt => (
                                                    <div
                                                        key={opt}
                                                        className={`tr-select-item ${monthlyOption === opt ? 'active' : ''}`}
                                                        onClick={(e) => { e.stopPropagation(); setMonthlyOption(opt); setIsMonthlyDropdownOpen(false); }}
                                                    >
                                                        {opt}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button className="tr-submit-btn" onClick={handleSubmitFilter}>Submit</button>
                            </div>
                        )}

                        {selectedFilter === 'Custom Range' && (
                            <div className="tr-filter-sub">
                                <div className="tr-sub-field">
                                    <label>Start Date</label>
                                    <div className="tr-date-input-wrapper">
                                        <input 
                                            type="date" 
                                            className="tr-date-input" 
                                            max={toInputFormat(getYesterday())}
                                            onChange={(e) => setStartDate(formatDate(new Date(e.target.value)))}
                                        />
                                    </div>
                                </div>
                                <div className="tr-sub-field">
                                    <label>End Date</label>
                                    <div className="tr-date-input-wrapper">
                                        <input 
                                            type="date" 
                                            className="tr-date-input" 
                                            max={toInputFormat(getYesterday())}
                                            onChange={(e) => setEndDate(formatDate(new Date(e.target.value)))}
                                        />
                                    </div>
                                </div>
                                <button className="tr-submit-btn" onClick={handleSubmitFilter}>Submit</button>
                            </div>
                        )}
                    </div>

                    {/* Table Card */}
                    <div className="tr-table-card">
                        <div className="tr-table-header">
                            <div className="tr-search-box">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                                <input 
                                    type="text" 
                                    placeholder="Search here..." 
                                    className="tr-search-input" 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button className="tr-btn-download">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7 10 12 15 17 10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                                Download
                            </button>
                        </div>

                        <div className="tr-table-wrapper">
                            <table className="tr-table">
                                <thead>
                                    <tr>
                                        <th>S. No. <span className="sort-arrows">↕</span></th>
                                        <th>Transaction ID <span className="sort-arrows">↕</span></th>
                                        <th>RRN Number <span className="sort-arrows">↕</span></th>
                                        <th>Amount <span className="sort-arrows">↕</span></th>
                                        <th>Date <span className="sort-arrows">↕</span></th>
                                        <th>Status <span className="sort-arrows">↕</span></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>Loading transactions...</td></tr>
                                    ) : pagedData.length > 0 ? (
                                        pagedData.map((item, index) => (
                                            <tr key={index}>
                                                <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
                                                <td>{item.Transaction_Id}</td>
                                                <td>{item.RRN}</td>
                                                <td>{item.Transaction_Amount.toLocaleString('en-IN')}</td>
                                                <td>{formatDateTime(item["Date_&_Time"])}</td>
                                                <td><span className="status-badge success">Received</span></td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>No reports found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="tr-pagination">
                            <div className="tr-page-left">
                                <span>Row per page 
                                    <select 
                                        className="tr-page-select" 
                                        value={rowsPerPage}
                                        onChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setCurrentPage(1); }}
                                    >
                                        <option value="10">10</option>
                                        <option value="20">20</option>
                                        <option value="30">30</option>
                                        <option value="50">50</option>
                                    </select>
                                </span>
                                <span>Go to 
                                    <input 
                                        type="text" 
                                        className="tr-goto-input" 
                                        value={gotoPageValue}
                                        onChange={(e) => setGotoPageValue(e.target.value.replace(/[^0-9]/g, ''))}
                                        onBlur={handleGotoPage}
                                        onKeyPress={(e) => e.key === 'Enter' && handleGotoPage()}
                                    />
                                </span>
                            </div>
                            <div className="tr-page-right">
                                <button 
                                    className="tr-page-btn" 
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                >
                                    {'<'}
                                </button>
                                
                                {renderPageNumbers().map((num, idx) => (
                                    num === '...' ? (
                                        <span key={`dots-${idx}`} className="tr-page-dots">...</span>
                                    ) : (
                                        <button 
                                            key={`page-${num}`}
                                            className={`tr-page-btn ${currentPage === num ? 'active' : ''}`}
                                            onClick={() => setCurrentPage(num)}
                                        >
                                            {num}
                                        </button>
                                    )
                                ))}

                                <button 
                                    className="tr-page-btn"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                >
                                    {'>'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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

export default TransactionReports
