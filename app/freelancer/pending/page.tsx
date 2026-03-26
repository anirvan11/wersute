export default function FreelancerPending() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#020817', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', maxWidth: '480px', padding: '24px' }}>
        <div style={{ fontSize: '48px', marginBottom: '24px' }}>⏳</div>
        <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>Profile under review</h1>
        <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.7' }}>
          Thanks for submitting your profile! Our team will review it and get back to you within 24–48 hours. You'll receive an email once you're approved.
        </p>
        <p style={{ color: '#334155', fontSize: '13px', marginTop: '32px' }}>
          Questions? Email us at info@wersute.com
        </p>
      </div>
    </div>
  )
}