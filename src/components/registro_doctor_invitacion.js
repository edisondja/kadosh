import React from 'react';
import Alertify from 'alertifyjs';
import Core from './funciones_extras.js';
import Config from './config_site.json';

function mensajeErrorApi(err, fallback) {
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

class RegistroDoctorInvitacion extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cargando: true,
      valido: false,
      mensajeError: '',
      nombreClinica: '',
      nombreDoctor: '',
      usuario: '',
      clave: '',
      clave_confirmation: '',
      enviando: false,
      registroOk: false,
    };
  }

  componentDidMount() {
    const { token } = this.props;
    if (!token) {
      this.setState({ cargando: false, mensajeError: 'Enlace incompleto.' });
      return;
    }
    Core.verificar_invitacion_doctor(token)
      .then((data) => {
        if (data && data.success && data.valid) {
          const n = [data.nombre, data.apellido].filter(Boolean).join(' ').trim();
          this.setState({
            cargando: false,
            valido: true,
            nombreClinica: data.nombre_clinica || '',
            nombreDoctor: n,
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
          mensajeError: mensajeErrorApi(err, 'No se pudo verificar el enlace.'),
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
    const { usuario, clave, clave_confirmation } = this.state;
    if (!String(usuario).trim()) {
      Alertify.warning('Escriba un nombre de usuario.');
      return;
    }
    if (!clave || clave.length < 6) {
      Alertify.warning('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (clave !== clave_confirmation) {
      Alertify.warning('Las contraseñas no coinciden.');
      return;
    }

    this.setState({ enviando: true });
    Core.registrar_doctor_invitacion({
      token,
      usuario: String(usuario).trim(),
      clave,
      clave_confirmation,
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
        Alertify.error(mensajeErrorApi(err, 'Error al registrar.'));
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
      nombreDoctor,
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
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 6px' }}>
                Acceso odontólogo
              </h1>
              <p style={{ margin: 0, opacity: 0.92, fontSize: 14 }}>{clinica}</p>
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
                    border: '1px solid #25D366',
                    borderRadius: 12,
                    padding: 18,
                    color: '#1b5e20',
                  }}
                >
                  <strong style={{ display: 'block', marginBottom: 8 }}>¡Listo!</strong>
                  <p className="mb-3" style={{ margin: 0, lineHeight: 1.5 }}>
                    Ya puede iniciar sesión en la misma dirección de la clínica con el usuario y la
                    contraseña que definió.
                  </p>
                  <a
                    href="/"
                    className="btn btn-primary btn-block"
                    style={{ borderRadius: 10, fontWeight: 600 }}
                  >
                    Ir al inicio de sesión
                  </a>
                </div>
              )}

              {!cargando && valido && !registroOk && (
                <form onSubmit={this.enviar} noValidate>
                  {nombreDoctor && (
                    <p
                      className="text-center text-muted small mb-3"
                      style={{ lineHeight: 1.5 }}
                    >
                      <strong>{nombreDoctor}</strong>
                      <br />
                      Defina su usuario y contraseña para entrar al sistema (sin acceso a módulos
                      financieros).
                    </p>
                  )}

                  <div style={{ marginBottom: 14, position: 'relative' }}>
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
                      <i className="fas fa-user" />
                    </span>
                    <input
                      type="text"
                      name="usuario"
                      placeholder="Usuario"
                      autoComplete="username"
                      value={this.state.usuario}
                      onChange={this.handleChange}
                      onFocus={this.onFocusInp}
                      onBlur={this.onBlurInp}
                      style={inp}
                      disabled={enviando}
                      required
                    />
                  </div>

                  <div style={{ marginBottom: 14, position: 'relative' }}>
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
                      <i className="fas fa-lock" />
                    </span>
                    <input
                      type="password"
                      name="clave"
                      placeholder="Contraseña (mín. 6 caracteres)"
                      autoComplete="new-password"
                      value={this.state.clave}
                      onChange={this.handleChange}
                      onFocus={this.onFocusInp}
                      onBlur={this.onBlurInp}
                      style={inp}
                      disabled={enviando}
                      required
                    />
                  </div>

                  <div style={{ marginBottom: 14, position: 'relative' }}>
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
                      <i className="fas fa-lock" />
                    </span>
                    <input
                      type="password"
                      name="clave_confirmation"
                      placeholder="Confirmar contraseña"
                      autoComplete="new-password"
                      value={this.state.clave_confirmation}
                      onChange={this.handleChange}
                      onFocus={this.onFocusInp}
                      onBlur={this.onBlurInp}
                      style={inp}
                      disabled={enviando}
                      required
                    />
                  </div>

                  <button type="submit" className="reg-inv__submit" disabled={enviando}>
                    {enviando ? (
                      <>
                        <span className="spinner-border spinner-border-sm mr-2" role="status" />
                        Guardando…
                      </>
                    ) : (
                      <>
                        <i className="fas fa-user-check mr-2" />
                        Crear mi acceso
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

export default RegistroDoctorInvitacion;
