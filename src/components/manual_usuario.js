import React from 'react';

const ManualUsuario = () => {
  const manualUrl = process.env.PUBLIC_URL 
    ? `${process.env.PUBLIC_URL}/manual_usuario.html` 
    : '/manual_usuario.html';

  return (
    <div className="col-md-10" style={{
      height: 'calc(100vh - 20px)',
      minHeight: 'calc(100vh - 20px)',
      background: '#f5f6f7',
      padding: '10px',
      overflow: 'hidden'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          padding: '12px 24px',
          flexShrink: 0,
          background: 'linear-gradient(135deg, #0e2b52 0%, #1e3a6b 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <i className="fas fa-book" style={{ fontSize: '24px' }}></i>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Manual de Usuario - Odontoed</h2>
            <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: '14px' }}>Guía de uso del sistema</p>
          </div>
        </div>
        <iframe
          src={manualUrl}
          title="Manual de Usuario Odontoed"
          style={{
            flex: 1,
            width: '100%',
            border: 'none',
            minHeight: '600px'
          }}
        />
      </div>
    </div>
  );
};

export default ManualUsuario;
