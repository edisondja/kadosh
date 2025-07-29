import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import Core from './funciones_extras';

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
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState(null);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = () => {
    Axios.get(`${Core.url_base}/api/configs`)  // GET api/configs
      .then((res) => setConfigs(res.data))
      .catch((err) => console.error(err));
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files && files[0]) {
      setFormData({ ...formData, [name]: files[0] });

      if (name === 'ruta_logo') {
        setLogoPreview(URL.createObjectURL(files[0]));
      }
      if (name === 'ruta_favicon') {
        setFaviconPreview(URL.createObjectURL(files[0]));
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }

    const config = {
      headers: { 'Content-Type': 'multipart/form-data' },
    };

    if (editId) {
      // Usar POST a /api/configs/{id} con _method=PUT para actualizar
      Axios.post(`${Core.url_base}/api/configs/${editId}`, data, config)
        .then(() => {
          fetchConfigs();
          resetForm();
        })
        .catch((err) => console.error(err));
    } else {
      // Crear nuevo con POST a /api/configs
      Axios.post(`${Core.url_base}/api/configs`, data, config)
        .then(() => {
          fetchConfigs();
          resetForm();
        })
        .catch((err) => console.error(err));
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
    });
    setLogoPreview(null);
    setFaviconPreview(null);
    setEditId(null);
  };

  const handleEdit = (config) => {
    setFormData({
      ...config,
      ruta_logo: '',
      ruta_favicon: '',
    });

    setLogoPreview(config.ruta_logo);
    setFaviconPreview(config.ruta_favicon);
    setEditId(config.id);
    window.scrollTo(0, 0);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Seguro que deseas eliminar esta configuración?')) {
      Axios.delete(`${Core.url_base}/api/configs/${id}`)  // DELETE api/configs/{id}
        .then(() => fetchConfigs())
        .catch((err) => console.error(err));
    }
  };

  return (
    <div className="container mt-4">
      <hr />
      <h3 className="mb-4">{editId ? 'Editar Configuración' : 'Agregar Configuración'}</h3>

      <form onSubmit={handleSubmit} className="mb-5">
        <div className="row">
          {Object.keys(formData).map((field) => {
            if (field === 'ruta_logo' || field === 'ruta_favicon') {
              const isLogo = field === 'ruta_logo';
              const preview = isLogo ? logoPreview : faviconPreview;

              return (
                <div className="col-md-6 mb-3" key={field}>
                  <label className="form-label text-capitalize">{field.replace(/_/g, ' ')}</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control"
                    name={field}
                    onChange={handleChange}
                  />
                  {preview && (
                    <div className="mt-2">
                      <img
                        src={preview}
                        alt="preview"
                        style={{ maxWidth: '100px', height: 'auto', border: '1px solid #ccc' }}
                      />
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div className="col-md-6 mb-3" key={field}>
                <label className="form-label text-capitalize">{field.replace(/_/g, ' ')}</label>
                <input
                  type="text"
                  className="form-control"
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  required
                />
              </div>
            );
          })}
        </div>
        <button type="submit" className="btn btn-primary me-2">
          {editId ? 'Actualizar' : 'Guardar'}
        </button>
        <button type="button" onClick={resetForm} className="btn btn-secondary">
          Cancelar
        </button>
      </form>

      <h4 className="mb-3">Configuraciones Registradas</h4>
      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th>Nombre</th>
              <th>Dominio</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {configs.map((cfg) => (
              <tr key={cfg.id}>
                <td>{cfg.nombre}</td>
                <td>{cfg.dominio}</td>
                <td>{cfg.email}</td>
                <td>{cfg.numero_empresa}</td>
                <td>
                  <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(cfg)}>
                    Editar
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(cfg.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {configs.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center text-muted">No hay configuraciones registradas.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConfigComponent;
