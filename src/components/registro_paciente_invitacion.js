import React from 'react';
import Alertify from 'alertifyjs';
import Core from './funciones_extras.js';
import Config from './config_site.json';

const waGreen = '#25D366';

function mensajeErrorApiInvitacion(err, fallback) {
  if (!err.response) {
    if (err.message === 'Network Error') {
      return 'Sin conexión con el servidor. Revise la URL del API en config_site.json.';
    }
    return fallback;
  }
  const d = err.response.data;
  const status = err.response.status;
  if (typeof d === 'string') return d;
  if (d && d.message) return d.message;
  if (d && d.errors && typeof d.errors === 'object') {
    const k = Object.keys(d.errors)[0];
    if (k && d.errors[k] && d.errors[k][0]) return d.errors[k][0];
  }
  if (status === 503) return (d && d.message) || fallback;
  return fallback;
}

function RegField({ icon, children, className = '' }) {
  return (
    <div className={`reg-inv__field ${className}`} style={{ marginBottom: 14 }}>
      <div style={{ position: 'relative' }}>
        <span
          style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#8e8e93',
            fontSize: 14,
            zIndex: 1,
            pointerEvents: 'none',
          }}
        >
          {icon}
        </span>
        {children}
      </div>
    </div>
  );
}

const inp = {
  width: '100%',
  border: '1px solid #e5e5ea',
  borderRadius: 12,
  padding: '11px 12px 11px 40px',
  fontSize: 15,
  background: '#fafafa',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
};

class RegistroPacienteInvitacion extends React.Component {
  constructor(props) {
    super(props);
    this.fotoInputRef = React.createRef();
    this.state = {
      cargando: true,
      valido: false,
      mensajeError: '',
      nombreClinica: '',
      nombre: '',
      apellido: '',
      telefono: '',
      cedula: '',
      correo_electronico: '',
      fecha_nacimiento: '',
      sexo: 'h',
      nombre_tutor: '',
      fotoFile: null,
      fotoPreview: null,
      enviando: false,
      registroOk: false,
    };
  }

  componentWillUnmount() {
    if (this.state.fotoPreview) {
      URL.revokeObjectURL(this.state.fotoPreview);
    }
  }

  abrirFoto = (modo) => {
    const el = this.fotoInputRef.current;
    if (!el) return;
    if (modo === 'camara') {
      el.setAttribute('capture', 'environment');
    } else {
      el.removeAttribute('capture');
    }
    el.click();
    window.setTimeout(() => {
      try {
        el.removeAttribute('capture');
      } catch (e) {
        /* ignore */
      }
    }, 800);
  };

  onFotoChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      return;
    }
    if (!file.type || !file.type.startsWith('image/')) {
      Alertify.warning('Seleccione una imagen (JPG, PNG, etc.).');
      e.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      Alertify.warning('La foto no puede superar 5 MB.');
      e.target.value = '';
      return;
    }
    if (this.state.fotoPreview) {
      URL.revokeObjectURL(this.state.fotoPreview);
    }
    this.setState({
      fotoFile: file,
      fotoPreview: URL.createObjectURL(file),
    });
  };

  quitarFoto = () => {
    if (this.state.fotoPreview) {
      URL.revokeObjectURL(this.state.fotoPreview);
    }
    this.setState({ fotoFile: null, fotoPreview: null });
    if (this.fotoInputRef.current) {
      this.fotoInputRef.current.value = '';
    }
  };

  componentDidMount() {
    const { token } = this.props;
    if (!token) {
      this.setState({ cargando: false, mensajeError: 'Enlace incompleto.' });
      return;
    }
    Core.verificar_invitacion_paciente(token)
      .then((data) => {
        if (data && data.success && data.valid) {
          this.setState({
            cargando: false,
            valido: true,
            nombreClinica: data.nombre_clinica || '',
          });
        } else {
          this.setState({
            cargando: false,
            mensajeError: (data && data.message) || 'Enlace no válido.',
          });
        }
      })
      .catch((err) => {
        this.setState({
          cargando: false,
          mensajeError: mensajeErrorApiInvitacion(err, 'No se pudo verificar el enlace.'),
        });
      });
  }

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  onFocusInp = (e) => {
    e.target.style.borderColor = '#7c3aed';
    e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.12)';
    e.target.style.background = '#fff';
  };

  onBlurInp = (e) => {
    e.target.style.borderColor = '#e5e5ea';
    e.target.style.boxShadow = 'none';
    e.target.style.background = '#fafafa';
  };

  enviar = (e) => {
    e.preventDefault();
    const { token } = this.props;
    const {
      nombre,
      apellido,
      telefono,
      sexo,
      cedula,
      correo_electronico,
      fecha_nacimiento,
      nombre_tutor,
      fotoFile,
    } = this.state;

    if (!nombre.trim() || !apellido.trim() || !String(telefono).trim()) {
      Alertify.warning('Complete nombre, apellido y teléfono.');
      return;
    }

    this.setState({ enviando: true });
    Core.registrar_paciente_invitacion({
      token,
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      telefono: String(telefono).trim(),
      cedula: cedula.trim(),
      correo_electronico: correo_electronico.trim(),
      fecha_nacimiento: fecha_nacimiento || '',
      sexo,
      nombre_tutor: nombre_tutor.trim(),
      foto_paciente: fotoFile || null,
    })
      .then((data) => {
        if (data && data.success) {
          this.setState({ registroOk: true });
          Alertify.success(data.message || 'Registro completado.');
        } else {
          Alertify.error((data && data.message) || 'No se pudo registrar.');
        }
      })
      .catch((err) => {
        Alertify.error(mensajeErrorApiInvitacion(err, 'Error al registrar.'));
      })
      .finally(() => this.setState({ enviando: false }));
  };

  render() {
    const cfg = Config || {};
    const {
      cargando,
      valido,
      mensajeError,
      nombreClinica,
      registroOk,
      enviando,
    } = this.state;

    const clinica = nombreClinica || cfg.name_company || 'Clínica';

    return (
      <div
        className="login-page registro-inv-publico"
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(165deg, #eef2ff 0%, #f5f5f7 50%, #e6faf0 100%)',
        }}
      >
        <style>{`
          .reg-inv__card {
            max-width: 420px;
            margin: 0 auto;
            background: #fff;
            border-radius: 20px;
            box-shadow: 0 16px 48px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.04);
            overflow: hidden;
            border: 1px solid rgba(0,0,0,0.06);
          }
          .reg-inv__select {
            width: 100%;
            border: 1px solid #e5e5ea;
            border-radius: 12px;
            padding: 11px 12px 11px 40px;
            font-size: 15px;
            background: #fafafa url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E") no-repeat right 12px center;
            appearance: none;
          }
          .reg-inv__submit {
            width: 100%;
            border: none;
            border-radius: 12px;
            padding: 14px;
            font-weight: 600;
            font-size: 15px;
            background: linear-gradient(135deg, #5b6cf0, #7c3aed);
            color: #fff;
            margin-top: 8px;
            cursor: pointer;
            box-shadow: 0 4px 16px rgba(91, 108, 240, 0.35);
            transition: transform 0.15s, opacity 0.15s;
          }
          .reg-inv__submit:hover:not(:disabled) { transform: translateY(-1px); }
          .reg-inv__submit:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }
          .reg-inv__foto-box {
            border: 2px dashed #d1d1d6;
            border-radius: 14px;
            padding: 16px;
            text-align: center;
            background: #fafafa;
            margin-bottom: 14px;
          }
          .reg-inv__foto-btns {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-top: 10px;
          }
          @media (min-width: 400px) {
            .reg-inv__foto-btns { flex-direction: row; justify-content: center; }
          }
          .reg-inv__foto-btn {
            flex: 1;
            border: 1px solid #e5e5ea;
            background: #fff;
            border-radius: 12px;
            padding: 12px 14px;
            font-size: 14px;
            font-weight: 600;
            color: #3a3a3c;
            cursor: pointer;
            transition: background 0.2s, border-color 0.2s;
          }
          .reg-inv__foto-btn:hover:not(:disabled) {
            background: #f2f2f7;
            border-color: #7c3aed;
            color: #7c3aed;
          }
          .reg-inv__foto-btn--cam {
            border-color: rgba(37, 211, 102, 0.45);
            color: #128C7E;
          }
          .reg-inv__foto-btn--cam:hover:not(:disabled) {
            background: rgba(37, 211, 102, 0.08);
            border-color: ${waGreen};
            color: #075e54;
          }
        `}</style>

        <div className="login-page__noise" aria-hidden="true" />
        <div className="login-page__inner" style={{ maxWidth: 460, paddingTop: 28, paddingBottom: 40 }}>
          <div className="reg-inv__card">
            <div
              style={{
                background: 'linear-gradient(135deg, #5b6cf0 0%, #7c3aed 100%)',
                color: '#fff',
                padding: '22px 20px 20px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  margin: '0 auto 12px',
                  borderRadius: 18,
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={cfg.app_logo}
                  alt=""
                  style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain' }}
                />
              </div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 6px' }}>Registro de paciente</h1>
              <p style={{ margin: 0, opacity: 0.92, fontSize: 14 }}>{clinica}</p>
              {!cargando && valido && !registroOk && (
                <div
                  style={{
                    marginTop: 14,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'rgba(0,0,0,0.15)',
                    padding: '6px 14px',
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  <i className="fas fa-shield-alt" />
                  Enlace de un solo uso
                </div>
              )}
            </div>

            <div style={{ padding: '22px 20px 26px' }}>
              {cargando && (
                <div className="text-center py-4 text-muted">
                  <span className="spinner-border spinner-border-sm mr-2" role="status" />
                  Verificando enlace…
                </div>
              )}

              {!cargando && mensajeError && !valido && (
                <div
                  className="text-left"
                  style={{
                    background: '#fff8e6',
                    border: '1px solid #ffe4a0',
                    borderRadius: 12,
                    padding: 16,
                    color: '#8a6d3b',
                  }}
                >
                  <i className="fas fa-link-slash mr-2" />
                  {mensajeError}
                </div>
              )}

              {!cargando && valido && registroOk && (
                <div
                  className="text-left"
                  style={{
                    background: '#e8f8ef',
                    border: `1px solid ${waGreen}`,
                    borderRadius: 12,
                    padding: 18,
                    color: '#1b5e20',
                  }}
                >
                  <div className="d-flex align-items-start" style={{ gap: 12 }}>
                    <span
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: waGreen,
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        fontSize: 20,
                      }}
                    >
                      <i className="fas fa-check" />
                    </span>
                    <div>
                      <strong style={{ display: 'block', marginBottom: 6 }}>¡Listo!</strong>
                      Su registro fue recibido. Este enlace ya no puede usarse: puede cerrar esta
                      página.
                    </div>
                  </div>
                </div>
              )}

              {!cargando && valido && !registroOk && (
                <form onSubmit={this.enviar} noValidate>
                  <p className="text-muted small mb-3" style={{ textAlign: 'center', lineHeight: 1.5 }}>
                    Complete el formulario. Al enviarlo, <strong>este enlace se desactiva</strong> de
                    forma permanente.
                  </p>

                  <div className="row mx-n1">
                    <div className="col-12 col-sm-6 px-1">
                      <RegField icon={<i className="fas fa-user" />}>
                        <input
                          type="text"
                          name="nombre"
                          placeholder="Nombre"
                          value={this.state.nombre}
                          onChange={this.handleChange}
                          onFocus={this.onFocusInp}
                          onBlur={this.onBlurInp}
                          style={inp}
                          autoComplete="given-name"
                          required
                          disabled={enviando}
                        />
                      </RegField>
                    </div>
                    <div className="col-12 col-sm-6 px-1">
                      <RegField icon={<i className="fas fa-user" />}>
                        <input
                          type="text"
                          name="apellido"
                          placeholder="Apellido"
                          value={this.state.apellido}
                          onChange={this.handleChange}
                          onFocus={this.onFocusInp}
                          onBlur={this.onBlurInp}
                          style={inp}
                          autoComplete="family-name"
                          required
                          disabled={enviando}
                        />
                      </RegField>
                    </div>
                  </div>

                  <RegField icon={<i className="fab fa-whatsapp" style={{ color: waGreen }} />}>
                    <input
                      type="tel"
                      name="telefono"
                      placeholder="Teléfono"
                      value={this.state.telefono}
                      onChange={this.handleChange}
                      onFocus={this.onFocusInp}
                      onBlur={this.onBlurInp}
                      style={inp}
                      autoComplete="tel"
                      required
                      disabled={enviando}
                    />
                  </RegField>

                  <div className="row mx-n1">
                    <div className="col-12 col-sm-6 px-1">
                      <RegField icon={<i className="fas fa-id-card" />}>
                        <input
                          type="text"
                          name="cedula"
                          placeholder="Cédula (opcional)"
                          value={this.state.cedula}
                          onChange={this.handleChange}
                          onFocus={this.onFocusInp}
                          onBlur={this.onBlurInp}
                          style={inp}
                          disabled={enviando}
                        />
                      </RegField>
                    </div>
                    <div className="col-12 col-sm-6 px-1">
                      <RegField icon={<i className="fas fa-envelope" />}>
                        <input
                          type="email"
                          name="correo_electronico"
                          placeholder="Correo (opcional)"
                          value={this.state.correo_electronico}
                          onChange={this.handleChange}
                          onFocus={this.onFocusInp}
                          onBlur={this.onBlurInp}
                          style={inp}
                          autoComplete="email"
                          disabled={enviando}
                        />
                      </RegField>
                    </div>
                  </div>

                  <div className="row mx-n1">
                    <div className="col-12 col-sm-6 px-1">
                      <RegField icon={<i className="fas fa-birthday-cake" />}>
                        <input
                          type="date"
                          name="fecha_nacimiento"
                          value={this.state.fecha_nacimiento}
                          onChange={this.handleChange}
                          onFocus={this.onFocusInp}
                          onBlur={this.onBlurInp}
                          style={{ ...inp, paddingLeft: 40 }}
                          disabled={enviando}
                        />
                      </RegField>
                    </div>
                    <div className="col-12 col-sm-6 px-1">
                      <RegField icon={<i className="fas fa-venus-mars" />}>
                        <select
                          name="sexo"
                          className="reg-inv__select"
                          value={this.state.sexo}
                          onChange={this.handleChange}
                          disabled={enviando}
                          style={{ paddingLeft: 40 }}
                        >
                          <option value="h">Masculino</option>
                          <option value="m">Femenino</option>
                        </select>
                      </RegField>
                    </div>
                  </div>

                  <div style={{ marginBottom: 14, textAlign: 'left' }}>
                    <label
                      className="d-block font-weight-bold mb-1"
                      style={{ fontSize: 14, color: '#3a3a3c' }}
                      htmlFor="inv-tutor"
                    >
                      <i className="fas fa-child mr-2" style={{ color: '#8e8e93' }} />
                      Nombre del tutor{' '}
                      <span className="text-muted font-weight-normal" style={{ fontSize: 13 }}>
                        (si es niño o niña)
                      </span>
                    </label>
                    <p className="text-muted small mb-2" style={{ lineHeight: 1.45 }}>
                      Opcional. Si el paciente es menor, escriba el nombre del padre, madre o tutor
                      legal.
                    </p>
                    <div style={{ position: 'relative' }}>
                      <span
                        style={{
                          position: 'absolute',
                          left: 12,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#8e8e93',
                          fontSize: 14,
                          zIndex: 1,
                          pointerEvents: 'none',
                        }}
                      >
                        <i className="fas fa-user-friends" />
                      </span>
                      <input
                        type="text"
                        id="inv-tutor"
                        name="nombre_tutor"
                        placeholder="Ej. María Pérez (solo menores)"
                        value={this.state.nombre_tutor}
                        onChange={this.handleChange}
                        onFocus={this.onFocusInp}
                        onBlur={this.onBlurInp}
                        style={inp}
                        disabled={enviando}
                        autoComplete="name"
                      />
                    </div>
                  </div>

                  <input
                    ref={this.fotoInputRef}
                    type="file"
                    accept="image/*"
                    className="d-none"
                    onChange={this.onFotoChange}
                    disabled={enviando}
                    aria-hidden="true"
                  />

                  <div className="reg-inv__foto-box">
                    <div className="font-weight-bold mb-1" style={{ fontSize: 14, color: '#3a3a3c' }}>
                      <i className="fas fa-camera mr-2" style={{ color: '#7c3aed' }} />
                      Foto del paciente{' '}
                      <span className="text-muted font-weight-normal" style={{ fontSize: 13 }}>
                        (opcional)
                      </span>
                    </div>
                    <p className="text-muted small mb-0" style={{ lineHeight: 1.45 }}>
                      Puede <strong>sacar una foto</strong> con el teléfono o <strong>elegir una imagen</strong>{' '}
                      de la galería. Máximo 5 MB (JPG, PNG o GIF).
                    </p>
                    <div className="reg-inv__foto-btns">
                      <button
                        type="button"
                        className="reg-inv__foto-btn reg-inv__foto-btn--cam"
                        onClick={() => this.abrirFoto('camara')}
                        disabled={enviando}
                      >
                        <i className="fas fa-camera mr-2" aria-hidden="true" />
                        Tomar foto
                      </button>
                      <button
                        type="button"
                        className="reg-inv__foto-btn"
                        onClick={() => this.abrirFoto('galeria')}
                        disabled={enviando}
                      >
                        <i className="fas fa-image mr-2" aria-hidden="true" />
                        Elegir de galería
                      </button>
                    </div>
                    {this.state.fotoPreview && (
                      <div className="mt-3">
                        <img
                          src={this.state.fotoPreview}
                          alt="Vista previa"
                          style={{
                            maxWidth: '100%',
                            maxHeight: 160,
                            borderRadius: 12,
                            objectFit: 'cover',
                            border: '1px solid #e5e5ea',
                          }}
                        />
                        <div className="mt-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={this.quitarFoto}
                            disabled={enviando}
                          >
                            Quitar foto
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <button type="submit" className="reg-inv__submit" disabled={enviando}>
                    {enviando ? (
                      <>
                        <span className="spinner-border spinner-border-sm mr-2" role="status" />
                        Enviando…
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane mr-2" />
                        Enviar registro
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default RegistroPacienteInvitacion;
