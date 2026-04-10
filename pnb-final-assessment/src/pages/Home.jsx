import { useNavigate } from 'react-router-dom'
import pnbLogo from '../images/pnb-logo.png'
import { login } from '../authentication/authService'

function Home() {
    const navigate = useNavigate()

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f9f5f6ff 0%, #fcfcfcff 100%)',
            fontFamily: 'sans-serif'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '100px 70px',
                textAlign: 'center',
                boxShadow: '0 50px 50px rgba(0, 0, 0, 0.1)',
                maxWidth: '460px',
                width: '100%'
            }}>
                <img src={pnbLogo} alt="PNB Logo" style={{ height: '60px', marginBottom: '24px' }} />
                <h1 style={{ color: '#A20E37', marginBottom: '16px', fontSize: '28px' }}>
                    Welcome to<br />Punjab National Bank
                </h1>
                <button 
                    onClick={login}
                    style={{
                        background: '#FBBC09',
                        color: '#A20E37',
                        border: 'none',
                        padding: '14px 32px',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        width: '100%',
                        transition: 'transform 0.2s',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    Login
                </button>
            </div>
        </div>
    )
}

export default Home