import React from 'react';

const ModuloPremium = () => {
  return (
    <div style={styles.container} className='col-md-10'>
      <div style={styles.box}>
        <h2 style={styles.title}>🔒 Módulo Premium</h2>
        <p style={styles.text}>
          Este módulo pertenece al <strong>plan superior</strong>.<br />
          Actualízate por solo <strong>$100 USD</strong> al mes. 
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f5f6f7',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '1rem',
  },
  box: {
    background: '#fff',
    padding: '2rem 3rem',
    borderRadius: '16px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    textAlign: 'center',
    maxWidth: '400px',
  },
  title: {
    fontSize: '1.5rem',
    marginBottom: '1rem',
    color: '#333',
  },
  text: {
    fontSize: '1rem',
    color: '#666',
    lineHeight: '1.6',
  },
};

export default ModuloPremium;
