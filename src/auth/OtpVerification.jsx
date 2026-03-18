import React, { useState } from 'react'
import { Input, Button, Form, message, Modal } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../api/config'
import { useAuth } from './AuthProvider'

const OtpVerification = () => {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { username } = location.state || {}
  const auth = useAuth()

  const handleVerify = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/customer-engagement-service/api/v1/auth/verify-login-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, otpCode: otp })
      })
      if (!res.ok) throw new Error('Invalid OTP or verification failed')
      const data = await res.json()
      // If token and user are in content, use them
      const token = data.token || data.content?.token
      const user = data.user || data.content || null
      if (token) localStorage.setItem('authToken', token)
      if (user) localStorage.setItem('authUser', JSON.stringify(user))
      auth.login({ token, user })
      message.success(data.message || 'OTP verified!')
      navigate('/')
    } catch (e) {
      message.error(e.message || 'OTP verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      const res = await fetch(`${API_BASE_URL}/customer-engagement-service/api/v1/auth/resend-login-otp?email=${encodeURIComponent(username)}`)
      if (!res.ok) throw new Error('Failed to resend OTP')
      message.success('OTP resent to your email')
    } catch (e) {
      message.error(e.message || 'Failed to resend OTP')
    } finally {
      setResending(false)
    }
  }

  return (
    <Modal
      open={true}
      title="OTP Verification"
      footer={null}
      closable={false}
      centered
    >
      <Form onFinish={handleVerify} layout="vertical">
        <Form.Item label="Enter 6-digit OTP" required>
          <Input
            value={otp}
            onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
            maxLength={6}
            minLength={6}
            placeholder="------"
            style={{ letterSpacing: 8, fontSize: 24, textAlign: 'center' }}
            autoFocus
          />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block disabled={otp.length !== 6}>Verify OTP</Button>
        <Button type="link" onClick={handleResend} loading={resending} block style={{ marginTop: 8 }}>Resend OTP</Button>
      </Form>
    </Modal>
  )
}

export default OtpVerification
