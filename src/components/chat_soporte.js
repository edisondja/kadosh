import React, { useEffect, useRef, useState } from 'react';
import Axios from 'axios';
import Alertify from 'alertifyjs';
import Core from './funciones_extras';

const ChatSoporte = () => {
  const [abierto, setAbierto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [adjuntos, setAdjuntos] = useState([]); // File[]
  const [previewUrls, setPreviewUrls] = useState([]); // string[]
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    mensaje: ''
  });

  const theme = {
    grad: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    softBg: 'rgba(102, 126, 234, 0.08)',
    cardBorder: '1px solid rgba(15, 23, 42, 0.08)',
    text: '#0f172a',
    muted: '#64748b'
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    // Generar previews para adjuntos (liberar URLs antiguas)
    setPreviewUrls((prev) => {
      prev.forEach((u) => {
        try { URL.revokeObjectURL(u); } catch (_) {}
      });
      return adjuntos.map((f) => URL.createObjectURL(f));
    });

    return () => {
      // cleanup cuando se desmonta
      previewUrls.forEach((u) => {
        try { URL.revokeObjectURL(u); } catch (_) {}
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adjuntos]);

  const agregarAdjuntos = (files) => {
    const incoming = Array.from(files || []);
    const valid = incoming.filter((f) => f && f.type && f.type.startsWith('image/'));
    const rejected = incoming.length - valid.length;
    if (rejected > 0) Alertify.warning('Solo se permiten imágenes.');
    // limitar a 3 imágenes para evitar correos muy pesados
    setAdjuntos((prev) => [...prev, ...valid].slice(0, 3));
  };

  const quitarAdjunto = (idx) => {
    setAdjuntos((prev) => prev.filter((_, i) => i !== idx));
  };

  const capturarPantalla = async () => {
    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        Alertify.error('Tu navegador no soporta captura de pantalla.');
        return;
      }
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.muted = true;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // detener captura
      stream.getTracks().forEach((t) => t.stop());
      video.srcObject = null;

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 1));
      if (!blob) {
        Alertify.error('No se pudo capturar la pantalla.');
        return;
      }
      const file = new File([blob], `captura_${new Date().toISOString().replace(/[:.]/g, '-')}.png`, { type: 'image/png' });
      setAdjuntos((prev) => [...prev, file].slice(0, 3));
      Alertify.success('Captura agregada.');
    } catch (e) {
      // el usuario puede cancelar el prompt de selección de pantalla
      Alertify.error('Captura cancelada o no permitida.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.email.trim() || !form.mensaje.trim()) {
      Alertify.warning('Complete todos los campos.');
      return;
    }
    setEnviando(true);
    const formData = new FormData();
    formData.append('nombre', form.nombre.trim());
    formData.append('email', form.email.trim());
    formData.append('mensaje', form.mensaje.trim());
    adjuntos.forEach((f) => {
      formData.append('adjuntos[]', f, f.name);
    });

    Axios.post(`${Core.url_base}/api/soporte/enviar`, formData)
      .then(() => {
        Alertify.success('Mensaje enviado. Te responderemos a la brevedad.');
        setForm({ nombre: '', email: '', mensaje: '' });
        setAdjuntos([]);
        setPreviewUrls((prev) => {
          prev.forEach((u) => {
            try { URL.revokeObjectURL(u); } catch (_) {}
          });
          return [];
        });
        if (fileInputRef.current) fileInputRef.current.value = '';
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
          width: 'auto',
          height: '56px',
          borderRadius: '999px',
          border: 'none',
          background: theme.grad,
          color: 'white',
          boxShadow: '0 10px 30px rgba(102, 126, 234, 0.45)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          padding: '0 16px',
          gap: '10px',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.08)';
          e.target.style.boxShadow = '0 14px 40px rgba(102, 126, 234, 0.55)';
          e.target.style.filter = 'brightness(1.03)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.45)';
          e.target.style.filter = 'none';
        }}
      >
        <i className="fas fa-headset" aria-hidden="true"></i>
        <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: 0.2, lineHeight: 1 }}>
          Soporte
        </span>
      </button>

      {abierto && (
        <div
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '24px',
            zIndex: 9999,
            width: '100%',
            maxWidth: '392px',
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(10px)',
            borderRadius: '18px',
            boxShadow: '0 18px 60px rgba(2, 6, 23, 0.18)',
            overflow: 'hidden',
            border: theme.cardBorder,
            animation: 'kdsChatIn 160ms ease-out'
          }}
        >
          <style>{`
            @keyframes kdsChatIn {
              from { transform: translateY(10px); opacity: 0; }
              to { transform: translateY(0px); opacity: 1; }
            }
          `}</style>
          <div
            style={{
              background: theme.grad,
              color: 'white',
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span style={{ fontWeight: 800, fontSize: '15px', letterSpacing: 0.2 }}>
              <i className="fas fa-headset me-2"></i>Soporte rápido
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
          <form onSubmit={handleSubmit} style={{ padding: '16px 16px 14px' }}>
            <div
              style={{
                background: theme.softBg,
                border: '1px solid rgba(102,126,234,0.18)',
                borderRadius: 12,
                padding: '10px 12px',
                marginBottom: 12,
                color: theme.muted
              }}
            >
              <div className="small" style={{ lineHeight: 1.25 }}>
                Cuéntanos qué pasó. Si adjuntas una imagen o captura, lo resolvemos más rápido.
              </div>
            </div>
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
                style={{ borderRadius: 12 }}
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
                style={{ borderRadius: 12 }}
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
                placeholder="Describe el error, en qué pantalla ocurrió y qué estabas haciendo…"
                required
                style={{ borderRadius: 12, resize: 'none' }}
              />
            </div>

            <div className="form-group mb-3">
              <div className="d-flex align-items-center justify-content-between">
                <label className="form-label small font-weight-bold mb-1">Adjuntos</label>
                <span className="small" style={{ color: theme.muted }}>{adjuntos.length}/3</span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="form-control"
                onChange={(e) => agregarAdjuntos(e.target.files)}
                disabled={enviando}
                style={{ display: 'none' }}
              />
              <div className="d-flex mt-2" style={{ gap: 10 }}>
                <button
                  type="button"
                  onClick={capturarPantalla}
                  disabled={enviando}
                  title="Capturar pantalla y adjuntar"
                  className="btn btn-sm"
                  style={{
                    flex: 1,
                    borderRadius: 999,
                    border: '1px solid rgba(15, 23, 42, 0.12)',
                    background: 'white',
                    color: theme.text,
                    padding: '8px 10px'
                  }}
                >
                  <i className="fas fa-desktop me-1"></i>Capturar
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={enviando}
                  title="Seleccionar imagen"
                  className="btn btn-sm"
                  style={{
                    flex: 1,
                    borderRadius: 999,
                    border: '1px solid rgba(15, 23, 42, 0.12)',
                    background: 'white',
                    color: theme.text,
                    padding: '8px 10px'
                  }}
                >
                  <i className="fas fa-paperclip me-1"></i>Adjuntar
                </button>
              </div>
              {adjuntos.length > 0 && (
                <div className="mt-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {adjuntos.map((f, idx) => (
                    <div
                      key={`${f.name}-${idx}`}
                      style={{
                        border: '1px solid rgba(15, 23, 42, 0.10)',
                        borderRadius: 12,
                        background: 'white',
                        overflow: 'hidden',
                        position: 'relative'
                      }}
                      title={f.name}
                    >
                      <img
                        src={previewUrls[idx]}
                        alt={f.name}
                        style={{ width: '100%', height: 76, objectFit: 'cover', display: 'block' }}
                      />
                      <button
                        type="button"
                        onClick={() => quitarAdjunto(idx)}
                        disabled={enviando}
                        aria-label="Quitar adjunto"
                        style={{
                          position: 'absolute',
                          top: 6,
                          right: 6,
                          width: 26,
                          height: 26,
                          borderRadius: 999,
                          border: 'none',
                          cursor: 'pointer',
                          background: 'rgba(2,6,23,0.55)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <span style={{ transform: 'translateY(-1px)' }}>×</span>
                      </button>
                      <div
                        className="small"
                        style={{
                          padding: '6px 8px',
                          color: theme.muted,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {f.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn w-100 font-weight-bold py-2"
              style={{
                borderRadius: 14,
                background: theme.grad,
                border: 'none',
                color: 'white',
                boxShadow: '0 10px 26px rgba(102, 126, 234, 0.38)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease'
              }}
              disabled={enviando}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 14px 34px rgba(102, 126, 234, 0.45)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = '0 10px 26px rgba(102, 126, 234, 0.38)';
              }}
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
