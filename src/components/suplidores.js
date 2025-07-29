import React from 'react';
import Axios from 'axios';
import Alertify from 'alertifyjs';
import Core from './funciones_extras';
import '../css/dashboard.css';

class Suplidores extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      suplidores: [],
      usuario_id: '',
      // Modal Registrar
      modalOpenRegistrar: false,
      nombre_suplidor: '',
      descripcion: '',
      rnc_suplidor: '',
      // Modal Actualizar
      modalOpenActualizar: false,
      suplidorActualizar: {
        id: '',
        nombre_suplidor: '',
        descripcion: '',
        rnc_suplidor: '',
      },
    };
  }

  componentDidMount() {
    this.cargar_suplidores();
    const usuario_id = localStorage.getItem('id_usuario');
    if (usuario_id) {
      this.setState({ usuario_id });
    }
  }

  cargar_suplidores = () => {
    Core.cargar_suplidores(this);
  };

  buscar_suplidor = (e) => {
    const criterio = e.target.value;
    Axios.get(`${Core.url_base}/api/buscar_suplidor/${criterio}`)
      .then((res) => this.setState({ suplidores: res.data }))
      .catch(() => Alertify.warning('Error al buscar suplidor'));
  };

  // Abrir modal registrar
  abrirModalRegistrar = () => {
    this.setState({
      modalOpenRegistrar: true,
      nombre_suplidor: '',
      descripcion: '',
      rnc_suplidor: '',
    });
  };

  cerrarModalRegistrar = () => {
    this.setState({ modalOpenRegistrar: false });
  };

  handleInputChangeRegistrar = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  registrar_suplidor = (e) => {
    e.preventDefault();
    const { nombre_suplidor, descripcion, rnc_suplidor, usuario_id } = this.state;
    if (!nombre_suplidor.trim()) {
      Alertify.error('El nombre del suplidor es obligatorio.');
      return;
    }
    const suplidor = {
      usuario_id,
      nombre_suplidor: nombre_suplidor.trim(),
      descripcion: descripcion.trim(),
      rnc_suplidor: rnc_suplidor.trim(),
    };
    Axios.post(`${Core.url_base}/api/registrar_suplidor`, suplidor)
      .then(() => {
        Alertify.success('Suplidor registrado correctamente');
        this.cargar_suplidores();
        this.cerrarModalRegistrar();
      })
      .catch(() => Alertify.error('Error al registrar suplidor'));
  };

  // Abrir modal actualizar
  abrirModalActualizar = (data) => {
    this.setState({
      modalOpenActualizar: true,
      suplidorActualizar: {
        id: data.id,
        nombre_suplidor: data.nombre,
        descripcion: data.descripcion,
        rnc_suplidor: data.rnc_suplidor,
      },
    });
  };

  cerrarModalActualizar = () => {
    this.setState({
      modalOpenActualizar: false,
      suplidorActualizar: { id: '', nombre_suplidor: '', descripcion: '', rnc_suplidor: '' },
    });
  };

  handleInputChangeActualizar = (e) => {
    const { name, value } = e.target;
    this.setState((prev) => ({
      suplidorActualizar: {
        ...prev.suplidorActualizar,
        [name]: value,
      },
    }));
  };

  actualizar_suplidor_submit = (e) => {
    e.preventDefault();
    const { id, nombre_suplidor, descripcion, rnc_suplidor } = this.state.suplidorActualizar;
    if (!nombre_suplidor.trim()) {
      Alertify.error('El nombre es obligatorio');
      return;
    }
    const datosActualizar = {
      id,
      nombre_suplidor: nombre_suplidor.trim(),
      descripcion: descripcion.trim(),
      rnc_suplidor: rnc_suplidor.trim(),
    };
    Axios.post(`${Core.url_base}/api/actualizar_suplidor`, datosActualizar)
      .then(() => {
        Alertify.success('Suplidor actualizado');
        this.cargar_suplidores();
        this.cerrarModalActualizar();
      })
      .catch(() => Alertify.error('Error al actualizar'));
  };

  eliminar_suplidor = (id_suplidor) => {
    Alertify.confirm(
      'Eliminar Suplidor',
      '¿Deseas eliminar este suplidor?',
      () => {
        Axios.get(`${Core.url_base}/api/eliminar_suplidor/${id_suplidor}`)
          .then(() => {
            Alertify.success('Suplidor eliminado');
            this.cargar_suplidores();
          })
          .catch(() => Alertify.error('Error al eliminar suplidor'));
      },
      () => {}
    );
  };

  render() {
    const {
      suplidores,
      modalOpenRegistrar,
      nombre_suplidor,
      descripcion,
      rnc_suplidor,
      modalOpenActualizar,
      suplidorActualizar,
    } = this.state;

    return (
      <div style={{ padding: '1rem', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
        <input
          type="text"
          onChange={this.buscar_suplidor}
          className="input-minimal"
          placeholder="Buscar Suplidor"
          style={{ marginBottom: '1rem' }}
        />
        <button onClick={this.abrirModalRegistrar} className="btn-minimal-primary" style={{ marginBottom: '1rem' }}>
          Agregar Suplidor
        </button>

        <table className="table-minimal" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Nombre suplidor</th>
              <th>RNC suplidor</th>
              <th>Descripción</th>
              <th>Actualizar</th>
              <th>Eliminar</th>
            </tr>
          </thead>
          <tbody>
            {suplidores.map((data) => (
              <tr key={data.id}>
                <td>{data.nombre}</td>
                <td>{data.rnc_suplidor}</td>
                <td>{data.descripcion}</td>
                <td>
                  <button className="btn-minimal-success" onClick={() => this.abrirModalActualizar(data)}>
                    Actualizar
                  </button>
                </td>
                <td>
                  <button className="btn-minimal-danger" onClick={() => this.eliminar_suplidor(data.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Modal Registrar */}
        {modalOpenRegistrar && (
          <div className="modal-overlay">
            <div className="modal-container">
              <div className="modal-header">
                <h5>Registrar Suplidor</h5>
                <button className="btn-close" onClick={this.cerrarModalRegistrar}>
                  ×
                </button>
              </div>

              <form onSubmit={this.registrar_suplidor}>
                <div className="modal-body">
                  <label className="form-label">Nombre del Suplidor</label>
                  <input
                    type="text"
                    name="nombre_suplidor"
                    value={nombre_suplidor}
                    onChange={this.handleInputChangeRegistrar}
                    className="input-minimal"
                    required
                    autoFocus
                  />

                  <label className="form-label">Descripción</label>
                  <input
                    type="text"
                    name="descripcion"
                    value={descripcion}
                    onChange={this.handleInputChangeRegistrar}
                    className="input-minimal"
                    required
                  />

                  <label className="form-label">RNC</label>
                  <input
                    type="text"
                    name="rnc_suplidor"
                    value={rnc_suplidor}
                    onChange={this.handleInputChangeRegistrar}
                    className="input-minimal"
                    required
                  />
                </div>

                <div className="modal-footer">
                  <button type="submit" className="btn-minimal-primary">
                    Guardar
                  </button>
                  <button type="button" className="btn-minimal-secondary" onClick={this.cerrarModalRegistrar}>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Actualizar */}
        {modalOpenActualizar && (
          <div className="modal-overlay">
            <div className="modal-container">
              <div className="modal-header">
                <h5>Actualizar Suplidor</h5>
                <button className="btn-close" onClick={this.cerrarModalActualizar}>
                  ×
                </button>
              </div>

              <form onSubmit={this.actualizar_suplidor_submit}>
                <div className="modal-body">
                  <label className="form-label">Nombre del Suplidor</label>
                  <input
                    type="text"
                    name="nombre_suplidor"
                    value={suplidorActualizar.nombre_suplidor}
                    onChange={this.handleInputChangeActualizar}
                    className="input-minimal"
                    required
                    autoFocus
                  />

                  <label className="form-label">Descripción</label>
                  <input
                    type="text"
                    name="descripcion"
                    value={suplidorActualizar.descripcion}
                    onChange={this.handleInputChangeActualizar}
                    className="input-minimal"
                    required
                  />

                  <label className="form-label">RNC</label>
                  <input
                    type="text"
                    name="rnc_suplidor"
                    value={suplidorActualizar.rnc_suplidor}
                    onChange={this.handleInputChangeActualizar}
                    className="input-minimal"
                    required
                  />
                </div>

                <div className="modal-footer">
                  <button type="submit" className="btn-minimal-primary">
                    Actualizar
                  </button>
                  <button type="button" className="btn-minimal-secondary" onClick={this.cerrarModalActualizar}>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Estilos minimalistas */}
        <style>{`
          .input-minimal {
            width: 100%;
            padding: 8px 10px;
            margin: 6px 0 16px 0;
            border: 1px solid #ccc;
            border-radius: 6px;
            font-size: 1rem;
            outline-offset: 2px;
            transition: border-color 0.2s ease-in-out;
          }
          .input-minimal:focus {
            border-color: #3b82f6;
            outline: none;
          }
          .btn-minimal-primary {
            background-color: #3b82f6;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            transition: background-color 0.2s ease-in-out;
          }
          .btn-minimal-primary:hover {
            background-color: #2563eb;
          }
          .btn-minimal-secondary {
            background-color: #f3f4f6;
            color: #374151;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            margin-left: 8px;
            font-weight: 600;
            transition: background-color 0.2s ease-in-out;
          }
          .btn-minimal-secondary:hover {
            background-color: #e5e7eb;
          }
          .btn-minimal-success {
            background-color: #2269c5ff;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
          }
          .btn-minimal-danger {
            background-color: #a31414ff;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
          }
          .btn-minimal-success:hover {
            background-color: #325ca8ff;
          }
          .btn-minimal-danger:hover {
            background-color: #8d3b3bff;
          }
          .modal-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background-color: rgba(0, 0, 0, 0.25);
            backdrop-filter: blur(0.5px);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1050;
          }
          .modal-container {
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(0.5px);
            -webkit-backdrop-filter: blur(0.5px);
            border-radius: 16px;
            border: 0.5px solid rgba(255, 255, 255, 0.4);
            width: 400px;
            max-width: 90vw;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            padding: 1rem 1.5rem;
            font-size: 1rem;
          }
          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
          }
          .btn-close {
            background: transparent;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #6b7280;
            line-height: 1;
          }
          .btn-close:hover {
            color: #111827;
          }
          .form-label {
            font-weight: 600;
            margin-bottom: 6px;
            display: block;
            color: #374151;
          }
          .modal-body {
            display: flex;
            flex-direction: column;
          }
          .modal-footer {
            display: flex;
            justify-content: flex-end;
            margin-top: 1rem;
          }
          table.table-minimal {
            width: 100%;
            border-collapse: collapse;
            font-size: 1rem;
          }
          table.table-minimal thead tr {
            border-bottom: 2px solid #e5e7eb;
          }
          table.table-minimal th,
          table.table-minimal td {
            padding: 12px 8px;
            text-align: left;
            border-bottom: 0.5px solid #e5e7eb;
            color: #374151;
          }
          table.table-minimal tbody tr:hover {
            background-color: #f9fafb;
          }
        `}</style>
      </div>
    );
  }
}

export default Suplidores;
