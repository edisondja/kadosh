import React from 'react';
import { Link } from 'react-router-dom';
import Alertify from 'alertifyjs';
import Core from './funciones_extras.js';
import '../css/dashboard.css';

function fechaLocalYMD(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

class ConsultaDeudas extends React.Component {
  constructor(props) {
    super(props);
    const hoy = new Date();
    const unAnoAtras = new Date(hoy.getFullYear() - 1, hoy.getMonth(), hoy.getDate());
    this.state = {
      filtrar_por_fecha: false,
      fecha_desde: fechaLocalYMD(unAnoAtras),
      fecha_hasta: fechaLocalYMD(hoy),
      cargando: false,
      resultado: null,
    };
  }

  /** Mantiene Desde ≤ Hasta y Hasta ≤ hoy en el calendario. */
  onFechaDesdeChange = (e) => {
    const value = e.target.value;
    const hoy = fechaLocalYMD(new Date());
    this.setState((prev) => {
      let hasta = prev.fecha_hasta;
      if (value && hasta && value > hasta) {
        hasta = value;
      }
      if (hasta && hasta > hoy) {
        hasta = hoy;
      }
      return { fecha_desde: value, fecha_hasta: hasta };
    });
  };

  onFechaHastaChange = (e) => {
    const value = e.target.value;
    const hoy = fechaLocalYMD(new Date());
    this.setState((prev) => {
      let desde = prev.fecha_desde;
      let hasta = value;
      if (hasta && hasta > hoy) {
        hasta = hoy;
      }
      if (hasta && desde && hasta < desde) {
        desde = hasta;
      }
      return { fecha_desde: desde, fecha_hasta: hasta };
    });
  };

  consultar = (e) => {
    e.preventDefault();
    const { filtrar_por_fecha, fecha_desde, fecha_hasta } = this.state;
    if (filtrar_por_fecha) {
      if (!fecha_desde || !fecha_hasta) {
        Alertify.warning('Seleccione ambas fechas o desactive el filtro por fecha.');
        return;
      }
      if (fecha_desde > fecha_hasta) {
        Alertify.warning('La fecha inicial no puede ser posterior a la final.');
        return;
      }
    }

    this.setState({ cargando: true, resultado: null });
    Core.obtener_deudas_por_fecha(
      filtrar_por_fecha ? fecha_desde : null,
      filtrar_por_fecha ? fecha_hasta : null
    )
      .then((data) => {
        if (!data || typeof data !== 'object') {
          Alertify.error('Respuesta inválida del servidor. Revise la URL del API o la sesión.');
          return;
        }
        if (data.success !== true) {
          Alertify.error(data.message || 'No se pudo consultar.');
          return;
        }
        this.setState({ resultado: data });
        if (data.total_pacientes === 0) {
          Alertify.message(
            data.filtrar_por_fecha_creacion
              ? 'No hay facturas con precio_estatus > 0 creadas en ese período.'
              : 'No hay facturas con precio_estatus > 0.'
          );
        }
      })
      .catch((err) => {
        const d = err.response?.data;
        const msg =
          (d && (d.message || d.error)) ||
          (typeof d === 'string' ? d : null) ||
          err.message ||
          'Error al consultar deudas.';
        console.error('consulta_deudas:', err.response?.status, d || err);
        Alertify.error(String(msg));
      })
      .finally(() => this.setState({ cargando: false }));
  };

  formatoMonto = (n) =>
    Number(n || 0).toLocaleString('es-DO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  render() {
    const { filtrar_por_fecha, fecha_desde, fecha_hasta, cargando, resultado } = this.state;
    const hoy = fechaLocalYMD(new Date());

    return (
      <div
        className="col-12 col-md-10 consulta-deudas-modulo"
        style={{
          minHeight: '100vh',
          padding: '12px 16px',
          backgroundColor: '#f5f5f7',
          borderRadius: '16px',
        }}
      >
            <h3 className="mb-3 text-primary mt-1">
              <i className="fas fa-file-invoice-dollar mr-2" />
              Consulta de deudas
            </h3>
            <p className="text-muted mb-3" style={{ fontSize: '14px' }}>
              Misma regla que la deuda del paciente: solo facturas con{' '}
              <code className="text-dark">precio_estatus</code> &gt; 0; se suma ese campo por paciente. Por defecto se
              listan <strong>todas</strong> esas facturas. Opcionalmente puede acotar por fecha de creación de la factura
              (máx. 24 meses).
            </p>

            <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4">
                <form onSubmit={this.consultar}>
                  <div className="form-group mb-3">
                    <div className="custom-control custom-checkbox">
                      <input
                        type="checkbox"
                        className="custom-control-input"
                        id="consulta-deudas-filtrar-fecha"
                        checked={filtrar_por_fecha}
                        onChange={(e) => this.setState({ filtrar_por_fecha: e.target.checked })}
                      />
                      <label className="custom-control-label" htmlFor="consulta-deudas-filtrar-fecha">
                        Filtrar por fecha de creación de la factura
                      </label>
                    </div>
                  </div>
                  <div className="form-row align-items-end">
                    <div className="form-group col-md-4">
                      <label className="font-weight-bold mb-1">Fecha inicio (Desde)</label>
                      <input
                        type="date"
                        className="form-control"
                        value={fecha_desde}
                        onChange={this.onFechaDesdeChange}
                        max={fecha_hasta || hoy}
                        aria-label="Fecha desde"
                      />
                      <small className="text-muted d-block mt-1">
                        {filtrar_por_fecha
                          ? 'Incluye facturas creadas desde esta fecha.'
                          : 'Solo se usa si activa el filtro por fecha.'}
                      </small>
                    </div>
                    <div className="form-group col-md-4">
                      <label className="font-weight-bold mb-1">Fecha fin (Hasta)</label>
                      <input
                        type="date"
                        className="form-control"
                        value={fecha_hasta}
                        onChange={this.onFechaHastaChange}
                        min={fecha_desde || undefined}
                        max={hoy}
                        aria-label="Fecha hasta"
                      />
                      <small className="text-muted d-block mt-1">No puede ser posterior a hoy.</small>
                    </div>
                    <div className="form-group col-md-4 d-flex align-items-end">
                      <button
                        type="submit"
                        className="btn btn-primary btn-block"
                        disabled={cargando}
                        style={{ padding: '10px' }}
                      >
                        {cargando ? (
                          <>
                            <span className="spinner-border spinner-border-sm mr-2" role="status" />
                            Consultando…
                          </>
                        ) : (
                          <>
                            <i className="fas fa-search mr-2" />
                            Consultar
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {resultado && resultado.success && (
              <>
                <div className="row mb-3">
                  <div className="col-md-4 mb-2">
                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px', background: '#f8f9fa' }}>
                      <div className="card-body text-center py-3">
                        <small className="text-muted d-block">Total (suma precio_estatus)</small>
                        <h4 className="mb-0 text-danger font-weight-bold">
                          ${this.formatoMonto(resultado.total_deuda)}
                        </h4>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 mb-2">
                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px', background: '#f8f9fa' }}>
                      <div className="card-body text-center py-3">
                        <small className="text-muted d-block">Pacientes con deuda</small>
                        <h4 className="mb-0 text-primary font-weight-bold">{resultado.total_pacientes}</h4>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 mb-2">
                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px', background: '#f8f9fa' }}>
                      <div className="card-body text-center py-3">
                        <small className="text-muted d-block">
                          {resultado.filtrar_por_fecha_creacion ? 'Facturas creadas' : 'Alcance'}
                        </small>
                        <h6 className="mb-0 mt-1" style={{ fontSize: '0.9rem' }}>
                          {resultado.filtrar_por_fecha_creacion
                            ? `${resultado.fecha_desde} → ${resultado.fecha_hasta}`
                            : 'Todas (precio_estatus > 0)'}
                        </h6>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card shadow-sm border-0" style={{ borderRadius: '16px' }}>
                  <div className="card-header bg-white border-bottom" style={{ borderRadius: '16px 16px 0 0' }}>
                    <h5 className="mb-0">
                      <i className="fas fa-list mr-2 text-secondary" />
                      Detalle por paciente
                    </h5>
                  </div>
                  <div className="card-body p-0">
                    {resultado.pacientes && resultado.pacientes.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-hover table-striped mb-0" style={{ fontSize: '14px' }}>
                          <thead className="thead-light">
                            <tr>
                              <th>Paciente</th>
                              <th>Cédula</th>
                              <th>Teléfono</th>
                              <th className="text-center">Facturas</th>
                              <th className="text-right">Deuda</th>
                              <th className="text-center">Perfil</th>
                            </tr>
                          </thead>
                          <tbody>
                            {resultado.pacientes.map((p) => (
                              <tr key={p.id_paciente}>
                                <td className="font-weight-bold">
                                  {p.nombre} {p.apellido}
                                </td>
                                <td>{p.cedula || '—'}</td>
                                <td>{p.telefono || '—'}</td>
                                <td className="text-center">{p.cantidad_facturas}</td>
                                <td className="text-right text-danger font-weight-bold">
                                  ${this.formatoMonto(p.deuda)}
                                </td>
                                <td className="text-center">
                                  {p.id_doctor ? (
                                    <Link
                                      to={`/perfil_paciente/${p.id_paciente}/${p.id_doctor}`}
                                      className="btn btn-sm btn-outline-primary"
                                    >
                                      <i className="fas fa-user mr-1" />
                                      Ver
                                    </Link>
                                  ) : (
                                    <span className="text-muted small">—</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-5 text-center text-muted">
                        <i className="fas fa-inbox fa-2x mb-3 d-block opacity-50" />
                        {resultado.filtrar_por_fecha_creacion
                          ? 'Sin facturas con saldo en ese período. Pruebe un rango más amplio (máx. 24 meses) o consulte sin filtro de fecha.'
                          : 'No hay facturas con precio_estatus > 0.'}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
      </div>
    );
  }
}

export default ConsultaDeudas;
