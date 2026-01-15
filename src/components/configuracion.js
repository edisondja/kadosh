import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import Core from './funciones_extras';
import Alertify from 'alertifyjs';

const ConfigComponent = () => {
  const [configs, setConfigs] = useState([]);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    ruta_logo: '',
    ruta_favicon: '',
    email: '',
    numero_empresa: '',
    dominio: '',
    api_whatapps: '',
    api_token_ws: '',
    api_gmail: '',
    api_token_google: '',
    api_instagram: '',
    token_instagram: '',
    // Nuevos campos
    nombre_clinica: '',
    direccion_clinica: '',
    telefono_clinica: '',
    rnc_clinica: '',
    email_clinica: '',
    tipo_numero_factura: 'comprobante',
    prefijo_factura: '',
    usar_google_calendar: false,
    google_calendar_id: '',
    recordatorio_minutos: 30,
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState(null);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = () => {
    Axios.get(`${Core.url_base}/api/configs`)
      .then((res) => {
        setConfigs(res.data);
        if (res.data.length > 0) {
          handleEdit(res.data[0]); // Cargar la primera configuración por defecto
        }
      })
      .catch((err) => {
        console.error(err);
        Alertify.error("Error al cargar configuraciones");
      });
  };

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;

    if (files && files[0]) {
      setFormData({ ...formData, [name]: files[0] });

      if (name === 'ruta_logo') {
        setLogoPreview(URL.createObjectURL(files[0]));
      }
      if (name === 'ruta_favicon') {
        setFaviconPreview(URL.createObjectURL(files[0]));
      }
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();
    for (const key in formData) {
      if (formData[key] !== null && formData[key] !== undefined) {
        if (key === 'ruta_logo' || key === 'ruta_favicon') {
          if (formData[key] instanceof File) {
            data.append(key, formData[key]);
          }
        } else {
          data.append(key, formData[key]);
        }
      }
    }

    const config = {
      headers: { 'Content-Type': 'multipart/form-data' },
    };

    if (editId) {
      Axios.post(`${Core.url_base}/api/configs/${editId}`, data, config)
        .then(() => {
          Alertify.success("Configuración actualizada correctamente");
          fetchConfigs();
        })
        .catch((err) => {
          console.error(err);
          Alertify.error("Error al actualizar la configuración");
        });
    } else {
      Axios.post(`${Core.url_base}/api/configs`, data, config)
        .then(() => {
          Alertify.success("Configuración guardada correctamente");
          fetchConfigs();
          resetForm();
        })
        .catch((err) => {
          console.error(err);
          Alertify.error("Error al guardar la configuración");
        });
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      ruta_logo: '',
      ruta_favicon: '',
      email: '',
      numero_empresa: '',
      dominio: '',
      api_whatapps: '',
      api_token_ws: '',
      api_gmail: '',
      api_token_google: '',
      api_instagram: '',
      token_instagram: '',
      nombre_clinica: '',
      direccion_clinica: '',
      telefono_clinica: '',
      rnc_clinica: '',
      email_clinica: '',
      tipo_numero_factura: 'comprobante',
      prefijo_factura: '',
      usar_google_calendar: false,
      google_calendar_id: '',
      recordatorio_minutos: 30,
    });
    setLogoPreview(null);
    setFaviconPreview(null);
    setEditId(null);
  };

  const handleEdit = (config) => {
    setFormData({
      nombre: config.nombre || '',
      descripcion: config.descripcion || '',
      ruta_logo: '',
      ruta_favicon: '',
      email: config.email || '',
      numero_empresa: config.numero_empresa || '',
      dominio: config.dominio || '',
      api_whatapps: config.api_whatapps || '',
      api_token_ws: config.api_token_ws || '',
      api_gmail: config.api_gmail || '',
      api_token_google: config.api_token_google || '',
      api_instagram: config.api_instagram || '',
      token_instagram: config.token_instagram || '',
      nombre_clinica: config.nombre_clinica || '',
      direccion_clinica: config.direccion_clinica || '',
      telefono_clinica: config.telefono_clinica || '',
      rnc_clinica: config.rnc_clinica || '',
      email_clinica: config.email_clinica || '',
      tipo_numero_factura: config.tipo_numero_factura || 'comprobante',
      prefijo_factura: config.prefijo_factura || '',
      usar_google_calendar: config.usar_google_calendar || false,
      google_calendar_id: config.google_calendar_id || '',
      recordatorio_minutos: config.recordatorio_minutos || 30,
    });

    setLogoPreview(config.ruta_logo);
    setFaviconPreview(config.ruta_favicon);
    setEditId(config.id);
    window.scrollTo(0, 0);
  };

  const handleDelete = (id) => {
    Alertify.confirm(
      'Eliminar Configuración',
      '¿Está seguro de que desea eliminar esta configuración?',
      () => {
        Axios.delete(`${Core.url_base}/api/configs/${id}`)
          .then(() => {
            Alertify.success("Configuración eliminada correctamente");
            fetchConfigs();
          })
          .catch((err) => {
            console.error(err);
            Alertify.error("Error al eliminar la configuración");
          });
      },
      () => {
        Alertify.message("Operación cancelada");
      }
    );
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h3 className="mb-0">
            <i className="fas fa-cog"></i> Configuración del Sistema
          </h3>
        </div>
        <div className="card-body" style={{ padding: '30px' }}>
          <form onSubmit={handleSubmit}>
            {/* Información General */}
            <div className="card mb-4">
              <div className="card-header bg-light">
                <h5 className="mb-0"><i className="fas fa-info-circle"></i> Información General</h5>
              </div>
              <div className="card-body" style={{ padding: '20px' }}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Nombre de la Configuración</label>
                    <input
                      type="text"
                      className="form-control"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Descripción</label>
                    <input
                      type="text"
                      className="form-control"
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Información de la Clínica */}
            <div className="card mb-4">
              <div className="card-header bg-light">
                <h5 className="mb-0"><i className="fas fa-hospital"></i> Información de la Clínica</h5>
              </div>
              <div className="card-body" style={{ padding: '20px' }}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Nombre de la Clínica</label>
                    <input
                      type="text"
                      className="form-control"
                      name="nombre_clinica"
                      value={formData.nombre_clinica}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Dirección</label>
                    <textarea
                      className="form-control"
                      name="direccion_clinica"
                      value={formData.direccion_clinica}
                      onChange={handleChange}
                      rows="2"
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Teléfono</label>
                    <input
                      type="text"
                      className="form-control"
                      name="telefono_clinica"
                      value={formData.telefono_clinica}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">RNC</label>
                    <input
                      type="text"
                      className="form-control"
                      name="rnc_clinica"
                      value={formData.rnc_clinica}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Correo Electrónico de la Clínica</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email_clinica"
                      value={formData.email_clinica}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Logos */}
            <div className="card mb-4">
              <div className="card-header bg-light">
                <h5 className="mb-0"><i className="fas fa-image"></i> Logos</h5>
              </div>
              <div className="card-body" style={{ padding: '20px' }}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Logo de la Clínica</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="form-control"
                      name="ruta_logo"
                      onChange={handleChange}
                    />
                    {logoPreview && (
                      <div className="mt-2">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          style={{ maxWidth: '200px', height: 'auto', border: '1px solid #ccc', padding: '5px' }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Favicon</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="form-control"
                      name="ruta_favicon"
                      onChange={handleChange}
                    />
                    {faviconPreview && (
                      <div className="mt-2">
                        <img
                          src={faviconPreview}
                          alt="Favicon preview"
                          style={{ maxWidth: '50px', height: 'auto', border: '1px solid #ccc', padding: '5px' }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Configuración de Facturas */}
            <div className="card mb-4">
              <div className="card-header bg-light">
                <h5 className="mb-0"><i className="fas fa-file-invoice"></i> Configuración de Facturas/Comprobantes</h5>
              </div>
              <div className="card-body" style={{ padding: '20px' }}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Tipo de Numeración</label>
                    <select
                      className="form-control"
                      name="tipo_numero_factura"
                      value={formData.tipo_numero_factura}
                      onChange={handleChange}
                    >
                      <option value="comprobante">Comprobante</option>
                      <option value="factura">NO XX FACTURA</option>
                    </select>
                    <small className="form-text text-muted">
                      Seleccione cómo desea que aparezca el número en los comprobantes
                    </small>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Prefijo (Ej: "NO 22" o "COMP")</label>
                    <input
                      type="text"
                      className="form-control"
                      name="prefijo_factura"
                      value={formData.prefijo_factura}
                      onChange={handleChange}
                      placeholder="Ej: NO 22"
                    />
                    <small className="form-text text-muted">
                      Si elige "NO XX FACTURA", ingrese el número (ej: "NO 22")
                    </small>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Calendar Integration */}
            <div className="card mb-4">
              <div className="card-header bg-light">
                <h5 className="mb-0"><i className="fab fa-google"></i> Integración con Google Calendar</h5>
              </div>
              <div className="card-body" style={{ padding: '20px' }}>
                <div className="row">
                  <div className="col-md-12 mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="usar_google_calendar"
                        checked={formData.usar_google_calendar}
                        onChange={handleChange}
                        id="usar_google_calendar"
                      />
                      <label className="form-check-label" htmlFor="usar_google_calendar">
                        Activar integración con Google Calendar
                      </label>
                    </div>
                    <small className="form-text text-muted">
                      Al activar, las citas se sincronizarán automáticamente con Google Calendar y se enviarán recordatorios por correo
                    </small>
                  </div>
                  {formData.usar_google_calendar && (
                    <>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Token de Google API</label>
                        <input
                          type="text"
                          className="form-control"
                          name="api_token_google"
                          value={formData.api_token_google}
                          onChange={handleChange}
                          placeholder="Token de acceso de Google"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">ID del Calendario de Google</label>
                        <input
                          type="text"
                          className="form-control"
                          name="google_calendar_id"
                          value={formData.google_calendar_id}
                          onChange={handleChange}
                          placeholder="ID del calendario (ej: primary)"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Recordatorio (minutos antes)</label>
                        <input
                          type="number"
                          className="form-control"
                          name="recordatorio_minutos"
                          value={formData.recordatorio_minutos}
                          onChange={handleChange}
                          min="0"
                        />
                        <small className="form-text text-muted">
                          Minutos antes de la cita para enviar el recordatorio
                        </small>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* APIs y Tokens */}
            <div className="card mb-4">
              <div className="card-header bg-light">
                <h5 className="mb-0"><i className="fas fa-key"></i> APIs y Tokens</h5>
              </div>
              <div className="card-body" style={{ padding: '20px' }}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Email General</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Número de Empresa</label>
                    <input
                      type="text"
                      className="form-control"
                      name="numero_empresa"
                      value={formData.numero_empresa}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Dominio</label>
                    <input
                      type="text"
                      className="form-control"
                      name="dominio"
                      value={formData.dominio}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-between mt-4" style={{ paddingTop: '20px' }}>
              <button type="submit" className="btn btn-primary btn-lg">
                <i className="fas fa-save"></i> {editId ? 'Actualizar' : 'Guardar'} Configuración
              </button>
              {editId && (
                <button type="button" onClick={resetForm} className="btn btn-secondary btn-lg">
                  <i className="fas fa-times"></i> Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Lista de Configuraciones */}
      {configs.length > 0 && (
        <div className="card mt-4 shadow-sm">
          <div className="card-header bg-info text-white">
            <h5 className="mb-0"><i className="fas fa-list"></i> Configuraciones Registradas</h5>
          </div>
          <div className="card-body" style={{ padding: '20px' }}>
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Nombre</th>
                    <th>Clínica</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Tipo Factura</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {configs.map((cfg) => (
                    <tr key={cfg.id}>
                      <td>{cfg.nombre}</td>
                      <td>{cfg.nombre_clinica || '-'}</td>
                      <td>{cfg.email_clinica || cfg.email || '-'}</td>
                      <td>{cfg.telefono_clinica || cfg.numero_empresa || '-'}</td>
                      <td>
                        <span className={`badge ${cfg.tipo_numero_factura === 'factura' ? 'badge-warning' : 'badge-info'}`}>
                          {cfg.tipo_numero_factura === 'factura' ? 'NO XX FACTURA' : 'Comprobante'}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(cfg)}>
                          <i className="fas fa-edit"></i> Editar
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(cfg.id)}>
                          <i className="fas fa-trash"></i> Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigComponent;
