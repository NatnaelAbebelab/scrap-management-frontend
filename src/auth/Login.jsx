import React, { useState } from 'react'
import { Form, Input, Button, Card, message } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import { API_BASE_URL, STATIC_FILES_URL } from '../api/config'

const Login = () => {
  const [loading, setLoading] = useState(false)
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  React.useEffect(() => {
    // Redirect if already authenticated
    const isAuth = auth?.token || localStorage.getItem('ce_token')

    if (isAuth && location.pathname === '/login') {
      navigate('/dashboard', { replace: true })
    }
  }, [auth?.token, navigate, location.pathname])

  const onFinish = async (vals) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/user/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: vals.email, password: vals.password })
      })
      if (!res.ok) throw new Error(await res.text() || 'Login failed')
      const data = await res.json()
      // If backend indicates OTP is required, redirect to OTP verification
      if (
        data.otpToken || data.otpRequired ||
        (typeof data.message === 'string' && data.message.toLowerCase().includes('otp has been sent'))
      ) {
        message.info('OTP sent. Please verify.')
        navigate('/otp-verification', { state: { username: vals.username } })
        return
      }
      // Otherwise, set token and user in context using your backend shape:
      // {
      //   result: "success",
      //   message: "logged in",
      //   logged_user: "supervisor@gmail.com",
      //   role: "supervisor",
      //   tokens: { access: "...", refresh: "..." }
      // }
      const token = data?.tokens?.access || data?.tokens?.token
      const refreshToken = data?.tokens?.refresh || null

      const user = {
        email: data?.logged_user,
        role: data?.role,
        message: data?.message,
        result: data?.result
      }

      if (!token) {
        console.warn('No usable token found in login response; received:', data)
      }

      auth.login({ token, refreshToken, user })
      message.success('Login successful')
      await new Promise((r) => setTimeout(r, 100))
      // Always go to dashboard after successful login
      navigate('/dashboard', { replace: true })
    } catch (e) {
      message.error(e.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Card style={{ width: 420, borderRadius: 8 }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <img src={`${STATIC_FILES_URL}steely.png`} alt="Steely RMI Logo" style={{ maxWidth: 320, width: '100%', marginBottom: 8 }} />
        </div>
        <h2 style={{ marginTop: 0 }}>Sign in</h2>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>Sign in</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default Login
