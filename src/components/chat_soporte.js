import React, { useState } from 'react';
import Axios from 'axios';
import Alertify from 'alertifyjs';
import Core from './funciones_extras';

const ChatSoporte = () => {
  const [abierto, setAbierto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    mensaje: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.email.trim() || !form.mensaje.trim()) {
      Alertify.warning('Complete todos los campos.');
      return;
    }
    setEnviando(true);
    Axios.post(`${Core.url_base}/api/soporte/enviar`, {
      nombre: form.nombre.trim(),
      email: form.email.trim(),
      mensaje: form.mensaje.trim()
    }, {
      headers: { 'Content-Type': 'application/json' }
    })
      .then(() => {
        Alertify.success('Mensaje enviado. Te responderemos a la brevedad.');
        setForm({ nombre: '', email: '', mensaje: '' });
        setAbierto(false);
      })
      .catch((err) => {
        const msg = err.response?.data?.message || 'No se pudo enviar. Intente más tarde.';
        Alertify.error(msg);
      })
      .finally(() => setEnviando(false));
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-label="Abrir chat de soporte"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9998,
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          border: 'none',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.5)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          transition: 'transform 0.2s, box-shadow 0.2s'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.08)';
          e.target.style.boxShadow = '0 6px 24px rgba(102, 126, 234, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.5)';
        }}
      >
        <i className="fas fa-headset" aria-hidden="true"></i>
      </button>

      {abierto && (
        <div
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '24px',
            zIndex: 9999,
            width: '100%',
            maxWidth: '380px',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            overflow: 'hidden',
            border: '1px solid #eee'
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span style={{ fontWeight: 700, fontSize: '16px' }}>
              <i className="fas fa-headset me-2"></i>Soporte
            </span>
            <button
              type="button"
              onClick={() => setAbierto(false)}
              aria-label="Cerrar"
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '18px'
              }}
            >
              ×
            </button>
          </div>
          <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
            <p className="text-muted small mb-3">
              Envíe su consulta. Le responderemos al correo que indique.
            </p>
            <div className="form-group mb-3">
              <label className="form-label small font-weight-bold">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                className="form-control"
                placeholder="Su nombre"
                required
              />
            </div>
            <div className="form-group mb-3">
              <label className="form-label small font-weight-bold">Correo</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="form-control"
                placeholder="correo@ejemplo.com"
                required
              />
            </div>
            <div className="form-group mb-4">
              <label className="form-label small font-weight-bold">Mensaje</label>
              <textarea
                name="mensaje"
                value={form.mensaje}
                onChange={handleChange}
                className="form-control"
                rows={4}
                placeholder="Escriba su mensaje..."
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary w-100 font-weight-bold py-2"
              style={{
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none'
              }}
              disabled={enviando}
            >
              {enviando ? (
                <span><i className="fas fa-spinner fa-spin me-2"></i>Enviando...</span>
              ) : (
                <span><i className="fas fa-paper-plane me-2"></i>Enviar mensaje</span>
              )}
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatSoporte;
