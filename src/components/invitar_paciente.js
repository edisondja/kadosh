import React from 'react';
import Alertify from 'alertifyjs';
import Core from './funciones_extras.js';
import '../css/dashboard.css';

const waGreen = '#25D366';
const waDark = '#128C7E';

function mensajeErrorApiInvitacion(err, fallback) {
  if (!err.response) {
    if (err.message === 'Network Error') {
      return 'Sin conexión con el servidor. Revise api_url en config_site.json y que el backend esté en marcha.';
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
  if (status === 503) return (d && d.message) || 'Servidor no listo (¿migración pendiente?).';
  return fallback;
}

function digitosParaWhatsApp(phone) {
  let d = String(phone || '').replace(/\D/g, '');
  if (d.startsWith('0')) {
    d = d.replace(/^0+/, '');
  }
  if (d.length === 10 && /^(809|829|849)/.test(d)) {
    d = `1${d}`;
  }
  return d;
}

function FieldIcon({ children }) {
  return (
    <span
      className="invitar-paciente__field-icon"
      style={{
        position: 'absolute',
        left: 14,
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#8e8e93',
        fontSize: 15,
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      {children}
    </span>
  );
}

class InvitarPaciente extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      doctores: [],
      id_doctor: '',
      telefono_destino: '',
      cargandoDoctores: true,
      generando: false,
      enlace: '',
      token: '',
      expira: '',
    };
  }

  componentDidMount() {
    const adapter = {
      _cargandoDoctores: false,
      setState: (partial, cb) => {
        this.setState({ cargandoDoctores: false, ...partial }, cb);
      },
    };
    Core.cargar_doctores(adapter);
  }

  urlRegistroDesdeToken(token) {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/registro_paciente/${token}`;
  }

  generar = (e) => {
    e.preventDefault();
    const { id_doctor, telefono_destino } = this.state;
    if (!id_doctor || id_doctor === 'seleccionar') {
      Alertify.warning('Seleccione el doctor que quedará asignado al paciente.');
      return;
    }

    this.setState({ generando: true });
    Core.crear_invitacion_paciente(id_doctor, telefono_destino.trim() || null)
      .then((data) => {
        if (!data || !data.success || !data.token) {
          Alertify.error((data && data.message) || 'No se pudo crear la invitación.');
          return;
        }
        const enlace = this.urlRegistroDesdeToken(data.token);
        this.setState({
          enlace,
          token: data.token,
          expira: data.expires_at || '',
        });
        Alertify.success('Listo: enlace de un solo uso generado.');
      })
      .catch((err) => {
        Alertify.error(mensajeErrorApiInvitacion(err, 'Error al crear la invitación.'));
      })
      .finally(() => this.setState({ generando: false }));
  };

  copiarEnlace = () => {
    const { enlace } = this.state;
    if (!enlace) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(enlace).then(() => Alertify.success('Enlace copiado.'));
    } else {
      Alertify.message(enlace);
    }
  };

  abrirWhatsApp = () => {
    const { enlace, telefono_destino } = this.state;
    const d = digitosParaWhatsApp(telefono_destino);
    if (!d || d.length < 10) {
      Alertify.warning('Escriba el teléfono del paciente para abrir WhatsApp, o copie el enlace.');
      return;
    }
    const clinica = (Core.Config && Core.Config.name_company) || 'la clínica';
    const texto = `Hola 👋 Complete su registro en *${clinica}* con este enlace (solo sirve *una vez*):\n\n${enlace}`;
    const url = `https://wa.me/${d}?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  inputBase = {
    width: '100%',
    border: '1px solid #e5e5ea',
    borderRadius: 12,
    padding: '12px 14px 12px 42px',
    fontSize: 15,
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    background: '#fafafa',
  };

  render() {
    const {
      doctores,
      id_doctor,
      telefono_destino,
      cargandoDoctores,
      generando,
      enlace,
      expira,
    } = this.state;

    const lista = Array.isArray(doctores) ? doctores : [];
    const nombreEmpresa = (Core.Config && Core.Config.name_company) || 'Su clínica';

    return (
      <div
        className="invitar-paciente-modulo col-12 col-md-10"
        style={{
          minHeight: '100vh',
          padding: '24px 16px 48px',
          background: 'linear-gradient(165deg, #f0f4ff 0%, #f5f5f7 45%, #e8f8f0 100%)',
        }}
      >
        <style>{`
          .invitar-paciente__card {
            max-width: 440px;
            margin-left: auto;
            margin-right: auto;
            background: #fff;
            border-radius: 20px;
            box-shadow: 0 12px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04);
            overflow: hidden;
            border: 1px solid rgba(0,0,0,0.06);
          }
          .invitar-paciente__hero {
            background: linear-gradient(135deg, #5b6cf0 0%, #7c3aed 55%, ${waDark} 100%);
            color: #fff;
            padding: 28px 24px 24px;
            text-align: center;
            position: relative;
          }
          .invitar-paciente__hero-wa {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 56px;
            height: 56px;
            border-radius: 16px;
            background: rgba(255,255,255,0.2);
            margin-bottom: 14px;
            font-size: 28px;
          }
          .invitar-paciente__field-wrap { position: relative; margin-bottom: 16px; }
          .invitar-paciente__field-wrap--select .invitar-paciente__select {
            width: 100%;
            border: 1px solid #e5e5ea;
            border-radius: 12px;
            padding: 12px 14px 12px 42px;
            font-size: 15px;
            background: #fafafa;
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 14px center;
          }
          .invitar-paciente__field-wrap input:focus,
          .invitar-paciente__field-wrap select:focus {
            border-color: #7c3aed;
            box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.15);
            background: #fff;
          }
          .invitar-paciente__btn-gen {
            width: 100%;
            border: none;
            border-radius: 12px;
            padding: 14px;
            font-weight: 600;
            font-size: 15px;
            background: linear-gradient(135deg, #5b6cf0, #7c3aed);
            color: #fff;
            cursor: pointer;
            transition: transform 0.15s, box-shadow 0.15s;
            box-shadow: 0 4px 14px rgba(91, 108, 240, 0.4);
          }
          .invitar-paciente__btn-gen:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(91, 108, 240, 0.45);
          }
          .invitar-paciente__btn-gen:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }
          .invitar-paciente__btn-wa {
            width: 100%;
            border: none;
            border-radius: 12px;
            padding: 14px 16px;
            font-weight: 600;
            font-size: 15px;
            background: ${waGreen};
            color: #fff;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            transition: background 0.2s, transform 0.15s;
            box-shadow: 0 4px 16px rgba(37, 211, 102, 0.35);
          }
          .invitar-paciente__btn-wa:hover { background: #20bd5a; transform: translateY(-1px); }
          .invitar-paciente__btn-copy {
            border: 1px solid #e5e5ea;
            background: #fff;
            border-radius: 12px;
            padding: 12px 16px;
            font-weight: 600;
            color: #3a3a3c;
            cursor: pointer;
            width: 100%;
            margin-bottom: 10px;
            transition: background 0.2s;
          }
          .invitar-paciente__btn-copy:hover { background: #f2f2f7; }
        `}</style>

        <div className="invitar-paciente__card">
          <div className="invitar-paciente__hero">
            <div className="invitar-paciente__hero-wa" aria-hidden="true">
              <i className="fab fa-whatsapp" style={{ color: '#fff' }} />
            </div>
            <h2 className="mb-2" style={{ fontWeight: 700, fontSize: '1.35rem', margin: 0 }}>
              Invitar paciente
            </h2>
            <p className="mb-0" style={{ opacity: 0.92, fontSize: 13, lineHeight: 1.45 }}>
              {nombreEmpresa}
              <br />
              <span style={{ fontSize: 12, opacity: 0.88 }}>
                El enlace <strong>deja de valer</strong> cuando el paciente termina el registro.
              </span>
            </p>
          </div>

          <div style={{ padding: '24px 22px 26px' }}>
            <form onSubmit={this.generar}>
              <div className="invitar-paciente__field-wrap invitar-paciente__field-wrap--select">
                <FieldIcon>
                  <i className="fas fa-user-md" />
                </FieldIcon>
                <select
                  className="invitar-paciente__select"
                  value={id_doctor}
                  onChange={(e) => this.setState({ id_doctor: e.target.value })}
                  disabled={cargandoDoctores}
                  required
                  aria-label="Doctor asignado"
                >
                  <option value="">Doctor asignado al paciente</option>
                  {lista.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.nombre} {doc.apellido}
                    </option>
                  ))}
                </select>
              </div>

              <div className="invitar-paciente__field-wrap">
                <FieldIcon>
                  <i className="fab fa-whatsapp" style={{ color: waGreen }} />
                </FieldIcon>
                <input
                  type="tel"
                  placeholder="Teléfono para enviar por WhatsApp"
                  value={telefono_destino}
                  onChange={(e) => this.setState({ telefono_destino: e.target.value })}
                  style={this.inputBase}
                  aria-label="Teléfono WhatsApp"
                />
              </div>
              <p className="text-muted small mb-3" style={{ marginTop: -8, lineHeight: 1.4 }}>
                Opcional: si lo llena, el botón verde abre el chat con el mensaje y el enlace listos.
              </p>

              <button type="submit" className="invitar-paciente__btn-gen" disabled={generando || cargandoDoctores}>
                {generando ? (
                  <>
                    <span className="spinner-border spinner-border-sm mr-2" role="status" />
                    Generando enlace…
                  </>
                ) : (
                  <>
                    <i className="fas fa-link mr-2" />
                    Generar enlace de registro
                  </>
                )}
              </button>
            </form>

            {enlace && (
              <div
                style={{
                  marginTop: 26,
                  paddingTop: 22,
                  borderTop: '1px solid #f2f2f7',
                }}
              >
                <div
                  className="d-flex align-items-center mb-3"
                  style={{ gap: 8, flexWrap: 'wrap' }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: 0.5,
                      textTransform: 'uppercase',
                      color: '#8e8e93',
                    }}
                  >
                    Enlace al paciente
                  </span>
                  {expira && (
                    <span
                      style={{
                        fontSize: 11,
                        background: '#f2f2f7',
                        color: '#636366',
                        padding: '4px 10px',
                        borderRadius: 20,
                      }}
                    >
                      <i className="far fa-clock mr-1" />
                      expira {new Date(expira).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div
                  style={{
                    background: '#f8f8fa',
                    borderRadius: 12,
                    padding: '12px 14px',
                    fontSize: 12,
                    wordBreak: 'break-all',
                    color: '#3a3a3c',
                    border: '1px solid #ececf0',
                    marginBottom: 12,
                    fontFamily: 'ui-monospace, monospace',
                  }}
                >
                  {enlace}
                </div>

                <button type="button" className="invitar-paciente__btn-copy" onClick={this.copiarEnlace}>
                  <i className="fas fa-copy mr-2" />
                  Copiar enlace
                </button>

                <button type="button" className="invitar-paciente__btn-wa" onClick={this.abrirWhatsApp}>
                  <i className="fab fa-whatsapp" style={{ fontSize: 22 }} />
                  Abrir WhatsApp con mensaje
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default InvitarPaciente;
