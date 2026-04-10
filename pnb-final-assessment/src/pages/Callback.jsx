import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { handleCallback } from '../authentication/authService'

function Callback() {
    const navigate = useNavigate()

    useEffect(() => {
        handleCallback()
            .then(user => {
                console.log('Logged in user:', user)
                navigate('/dashboard')
            })
            .catch(err => {
                console.error('Callback error:', err)
                navigate('/')
            })
    }, [])

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #901c41ff 0%, #3d0415 100%)'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '40px 32px',
                textAlign: 'center',
                boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
                maxWidth: '360px',
                width: '100%'
            }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                <h2 style={{ color: '#A20E37', marginBottom: '8px' }}>Authenticating...</h2>
                <p style={{ color: '#666' }}>Please wait while we log you in securely.</p>
            </div>
        </div>
    )
}

export default Callback