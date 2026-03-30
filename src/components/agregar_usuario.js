import React from 'react';
import Axios from 'axios';
import Alertify from 'alertifyjs';
import Core from './funciones_extras';

const ROLES = ['Administrador', 'Secretaria', 'Contable', 'Odontologo'];
const MODULOS = [
  { key: 'cargar_pacientes', label: 'Panel pacientes/citas' },
  { key: 'paciente', label: 'Agregar paciente' },
  { key: 'invitar_paciente', label: 'Invitar paciente' },
  { key: 'doctor', label: 'Doctores' },
  { key: 'asignar_ganancias_recibos', label: 'Asignar ganancias recibos' },
  { key: 'procedimiento', label: 'Procedimientos' },
  { key: 'agregar_usuario', label: 'Usuarios' },
  { key: 'especialidades', label: 'Especialidades' },
  { key: 'notificaciones', label: 'Notificaciones' },
  { key: 'agregar_cita', label: 'Agregar cita' },
  { key: 'contabilidad', label: 'Contabilidad' },
  { key: 'nomina', label: 'Nómina' },
  { key: 'punto_venta', label: 'Punto de venta' },
  { key: 'salarios_doctores', label: 'Salarios doctores' },
  { key: 'historial_pagos', label: 'Historial de pagos' },
  { key: 'consulta_deudas', label: 'Consulta de deudas' },
  { key: 'reportes', label: 'Reportes' },
  { key: 'auditoria', label: 'Auditoría' },
  { key: 'configuracion', label: 'Configuración' },
  { key: 'exportar_importar', label: 'Exportar/Importar' },
  { key: 'administrar_tenants', label: 'Administrar tenants' },
  { key: 'manual_usuario', label: 'Manual de usuario' },
];

const permisosAllFalse = () => MODULOS.reduce((acc, m) => ({ ...acc, [m.key]: false }), {});

class Usuario extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      usuarios: [],
      buscador: '',
      guardando: false,
      form: {
        usuario: '',
        clave: '',
        nombre: '',
        apellido: '',
        roll: 'Administrador',
        id_rol: '',
        permisos: permisosAllFalse(),
      },
      modalEdicionAbierto: false,
      editandoId: null,
      formEdicion: {
        usuario: '',
        clave: '',
        nombre: '',
        apellido: '',
        roll: 'Administrador',
        id_rol: '',
        permisos: permisosAllFalse(),
      },
      rolesSistema: [],
      rolEditor: { id_rol: '', nombre: '', descripcion: '', permisos: permisosAllFalse() },
    };
  }

  componentDidMount() {
    this.cargar_usuarios();
    this.cargar_roles();
  }

  cargar_usuarios = () => {
    Axios.get(`${Core.url_base}/api/cargar_usuarios`)
      .then((r) => this.setState({ usuarios: Array.isArray(r.data) ? r.data : [] }))
      .catch(() => Alertify.error('Error cargando usuarios'));
  };

  buscar_usuario = (v) => {
    this.setState({ buscador: v });
  };

  onChange = (e) => {
    const { name, value } = e.target;
    this.setState((s) => {
      const next = { ...s.form, [name]: value };
      if (name === 'id_rol' && value) {
        next.roll = 'Personalizado';
      }
      if (name === 'roll' && value !== 'Personalizado') {
        next.id_rol = '';
      }
      return { form: next };
    });
  };

  togglePermiso = (key) => {
    this.setState((s) => ({
      form: { ...s.form, permisos: { ...s.form.permisos, [key]: !s.form.permisos[key] } },
    }));
  };

  resetForm = () => {
    this.setState({
      form: {
        usuario: '',
        clave: '',
        nombre: '',
        apellido: '',
        roll: 'Administrador',
        id_rol: '',
        permisos: permisosAllFalse(),
      },
    });
  };

  cargar_roles = () => {
    Core.listar_roles()
      .then((rows) => this.setState({ rolesSistema: Array.isArray(rows) ? rows : [] }))
      .catch(() => Alertify.warning('No se pudieron cargar los roles'));
  };

  guardar = () => {
    const { form } = this.state;
    if (!form.usuario || !form.clave || !form.nombre || !form.apellido) {
      Alertify.warning('Complete usuario, clave, nombre y apellido');
      return;
    }
    this.setState({ guardando: true });
    const payload = { ...form, id_rol: form.id_rol ? Number(form.id_rol) : null };
    const req = Axios.post(`${Core.url_base}/api/agregar_usuario`, payload);
    req.then((r) => {
      Alertify.success((r.data && r.data.message) || 'Guardado correctamente');
      this.cargar_usuarios();
      this.resetForm();
    })
      .catch((err) => {
        const msg = err.response?.data?.message || 'Error al guardar usuario';
        Alertify.error(msg);
      })
      .finally(() => this.setState({ guardando: false }));
  };

  editar = (id) => {
    Axios.get(`${Core.url_base}/api/cargar_usuario/${id}`)
      .then((r) => {
        const u = r.data || {};
        this.setState({
          modalEdicionAbierto: true,
          editandoId: id,
          formEdicion: {
            usuario: u.usuario || '',
            clave: u.clave || '',
            nombre: u.nombre || '',
            apellido: u.apellido || '',
            roll: u.roll || 'Administrador',
            id_rol: u.id_rol || '',
            permisos: { ...permisosAllFalse(), ...(u.permisos || {}) },
          },
        });
      })
      .catch(() => Alertify.error('No se pudo cargar el usuario'));
  };

  cerrarModalEdicion = () => {
    this.setState({
      modalEdicionAbierto: false,
      editandoId: null,
      formEdicion: {
        usuario: '',
        clave: '',
        nombre: '',
        apellido: '',
        roll: 'Administrador',
        id_rol: '',
        permisos: permisosAllFalse(),
      },
    });
  };

  onChangeEdicion = (e) => {
    const { name, value } = e.target;
    this.setState((s) => {
      const next = { ...s.formEdicion, [name]: value };
      if (name === 'id_rol' && value) next.roll = 'Personalizado';
      if (name === 'roll' && value !== 'Personalizado') next.id_rol = '';
      return { formEdicion: next };
    });
  };

  togglePermisoEdicion = (key) => {
    this.setState((s) => ({
      formEdicion: { ...s.formEdicion, permisos: { ...s.formEdicion.permisos, [key]: !s.formEdicion.permisos[key] } },
    }));
  };

  guardarEdicion = () => {
    const { editandoId, formEdicion } = this.state;
    if (!editandoId) return;
    if (!formEdicion.usuario || !formEdicion.clave || !formEdicion.nombre || !formEdicion.apellido) {
      Alertify.warning('Complete usuario, clave, nombre y apellido');
      return;
    }
    this.setState({ guardando: true });
    const payload = {
      ...formEdicion,
      id_usuario: editandoId,
      id_rol: formEdicion.id_rol ? Number(formEdicion.id_rol) : null,
    };
    Axios.post(`${Core.url_base}/api/actualizar_usuario`, payload)
      .then((r) => {
        Alertify.success((r.data && r.data.message) || 'Usuario actualizado');
        this.cargar_usuarios();
        this.cerrarModalEdicion();
      })
      .catch((err) => {
        Alertify.error(err.response?.data?.message || 'Error al actualizar usuario');
      })
      .finally(() => this.setState({ guardando: false }));
  };

  eliminar = (id) => {
    Alertify.confirm(
      'Eliminar usuario',
      '¿Seguro que desea eliminar este usuario?',
      () => {
        Axios.post(`${Core.url_base}/api/eliminar_usuario`, { id_usuario: id })
          .then(() => {
            Alertify.success('Usuario eliminado');
            this.cargar_usuarios();
          })
          .catch(() => Alertify.error('No se pudo eliminar'));
      },
      () => {}
    );
  };

  renderPermisosEditor() {
    if (this.state.form.roll !== 'Personalizado' || this.state.form.id_rol) return null;
    return (
      <div className="card border-0 shadow-sm mt-3">
        <div className="card-body">
          <h6 className="mb-3">Permisos por módulos</h6>
          <div className="row">
            {MODULOS.map((m) => (
              <div className="col-md-4 mb-2" key={m.key}>
                <label className="d-flex align-items-center mb-0" style={{ gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={!!this.state.form.permisos[m.key]}
                    onChange={() => this.togglePermiso(m.key)}
                  />
                  <span style={{ fontSize: 14 }}>{m.label}</span>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  renderPermisosEdicionModal() {
    const { formEdicion } = this.state;
    if (formEdicion.roll !== 'Personalizado' || formEdicion.id_rol) return null;
    return (
      <div className="card border-0 shadow-sm mt-2">
        <div className="card-body py-3">
          <h6 className="mb-2">Permisos manuales</h6>
          <div className="row">
            {MODULOS.map((m) => (
              <div className="col-md-6 mb-1" key={`em-${m.key}`}>
                <label className="d-flex align-items-center mb-0" style={{ gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={!!formEdicion.permisos[m.key]}
                    onChange={() => this.togglePermisoEdicion(m.key)}
                  />
                  <span style={{ fontSize: 13 }}>{m.label}</span>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  onRolEditorChange = (e) => {
    const { name, value } = e.target;
    this.setState((s) => ({ rolEditor: { ...s.rolEditor, [name]: value } }));
  };

  togglePermisoRolEditor = (key) => {
    this.setState((s) => ({
      rolEditor: { ...s.rolEditor, permisos: { ...s.rolEditor.permisos, [key]: !s.rolEditor.permisos[key] } },
    }));
  };

  editarRol = (r) => {
    this.setState({ rolEditor: { id_rol: r.id, nombre: r.nombre || '', descripcion: r.descripcion || '', permisos: { ...permisosAllFalse(), ...(r.permisos || {}) } } });
  };

  limpiarRolEditor = () => {
    this.setState({ rolEditor: { id_rol: '', nombre: '', descripcion: '', permisos: permisosAllFalse() } });
  };

  guardarRol = () => {
    const { rolEditor } = this.state;
    if (!rolEditor.nombre.trim()) {
      Alertify.warning('Nombre del rol requerido');
      return;
    }
    Core.guardar_rol({
      id_rol: rolEditor.id_rol || null,
      nombre: rolEditor.nombre.trim(),
      descripcion: (rolEditor.descripcion || '').trim(),
      permisos: rolEditor.permisos,
    }).then((r) => {
      Alertify.success(r.message || 'Rol guardado');
      this.cargar_roles();
      this.limpiarRolEditor();
    }).catch((e) => {
      Alertify.error(e.response?.data?.message || 'No se pudo guardar rol');
    });
  };

  eliminarRol = (idRol) => {
    Alertify.confirm('Eliminar rol', '¿Seguro que desea eliminar este rol?', () => {
      Core.eliminar_rol(idRol).then((r) => {
        Alertify.success(r.message || 'Rol eliminado');
        this.cargar_roles();
        if (String(this.state.rolEditor.id_rol) === String(idRol)) this.limpiarRolEditor();
      }).catch((e) => {
        Alertify.error(e.response?.data?.message || 'No se pudo eliminar rol');
      });
    }, () => {});
  };

  render() {
    const { usuarios, buscador, form, guardando, modalEdicionAbierto, formEdicion, rolesSistema, rolEditor } = this.state;
    const listado = !buscador.trim()
      ? usuarios
      : usuarios.filter((u) => `${u.usuario} ${u.nombre} ${u.apellido} ${u.roll}`.toLowerCase().includes(buscador.toLowerCase()));
    return (
      <div className="col-12 col-md-10" style={{ padding: 20 }}>
        <style>{`
          .roles-minimal-card {
            border-radius: 18px;
            border: 1px solid #e8e8ed;
            background: linear-gradient(180deg, #fcfcfd 0%, #ffffff 100%);
            box-shadow: 0 8px 24px rgba(17, 24, 39, 0.06);
          }
          .roles-minimal-title {
            font-size: 1.05rem;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 4px;
          }
          .roles-minimal-subtitle {
            font-size: 0.86rem;
            color: #6b7280;
            margin-bottom: 14px;
          }
          .roles-minimal-input {
            border-radius: 12px;
            border: 1px solid #dfe3ea;
            background: #fff;
            font-size: 0.92rem;
          }
          .roles-minimal-chip {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 11px;
            border-radius: 999px;
            border: 1px solid #e5e7eb;
            background: #fff;
            font-size: 12px;
            color: #374151;
            cursor: pointer;
            user-select: none;
            transition: all .15s ease;
          }
          .roles-minimal-chip:hover {
            border-color: #cbd5e1;
            background: #f9fafb;
          }
          .roles-minimal-chip--on {
            border-color: #111827;
            background: #111827;
            color: #fff;
          }
          .roles-minimal-list-item {
            border: 1px solid #eceff3;
            border-radius: 12px;
            padding: 10px 12px;
            background: #fff;
            margin-bottom: 8px;
          }
          .roles-minimal-list-item-title {
            font-size: 14px;
            font-weight: 600;
            color: #111827;
          }
          .roles-minimal-list-item-sub {
            font-size: 12px;
            color: #6b7280;
          }
          .user-form-card {
            border-radius: 18px;
            border: 1px solid #e8e8ed;
            background: linear-gradient(180deg, #fcfcfd 0%, #ffffff 100%);
            box-shadow: 0 8px 24px rgba(17, 24, 39, 0.06);
          }
          .user-form-title {
            font-size: 1.2rem;
            font-weight: 700;
            color: #111827;
            margin-bottom: 4px;
          }
          .user-form-sub {
            font-size: .9rem;
            color: #6b7280;
            margin-bottom: 16px;
          }
          .user-form-input {
            border-radius: 12px;
            border: 1px solid #dfe3ea;
            min-height: 44px;
            font-size: .92rem;
            background: #fff;
          }
          .user-form-input:focus {
            border-color: #111827;
            box-shadow: 0 0 0 3px rgba(17,24,39,.08);
          }
          .user-section-table {
            border-radius: 18px;
            border: 1px solid #e8e8ed;
            background: #fff;
            box-shadow: 0 8px 24px rgba(17, 24, 39, 0.05);
          }
          .user-row {
            transition: background .15s ease;
          }
          .user-row:hover {
            background: #fafafa;
          }
          .role-pill {
            display: inline-flex;
            align-items: center;
            border-radius: 999px;
            padding: 6px 10px;
            font-size: 12px;
            font-weight: 600;
            border: 1px solid #d1d5db;
            color: #1f2937;
            background: #f9fafb;
          }
          .role-pill--admin { background: #111827; color: #fff; border-color: #111827; }
          .role-pill--secretaria { background: #eef2ff; color: #3730a3; border-color: #c7d2fe; }
          .role-pill--contable { background: #ecfdf5; color: #065f46; border-color: #a7f3d0; }
          .role-pill--odontologo { background: #fff7ed; color: #9a3412; border-color: #fed7aa; }
          .role-pill--custom { background: #f5f3ff; color: #5b21b6; border-color: #ddd6fe; }
          .action-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            border-radius: 999px;
            padding: 6px 12px;
            font-size: 12px;
            font-weight: 600;
            border: 1px solid #d1d5db;
            background: #fff;
            color: #1f2937;
            transition: all .18s ease;
          }
          .action-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 14px rgba(17,24,39,.12);
          }
          .action-btn--edit {
            border-color: #c7d2fe;
            color: #3730a3;
            background: #eef2ff;
          }
          .action-btn--edit:hover {
            background: #e0e7ff;
          }
          .action-btn--delete {
            border-color: #fecaca;
            color: #991b1b;
            background: #fef2f2;
          }
          .action-btn--delete:hover {
            background: #fee2e2;
          }
        `}</style>
        <div className="card border-0 user-form-card mb-4">
          <div className="card-body p-4">
            <div className="user-form-title">Usuarios y roles</div>
            <div className="user-form-sub">Gestione usuarios del sistema con una interfaz limpia y rápida.</div>
            <div className="row">
              <div className="col-md-3 mb-3"><input className="form-control user-form-input" name="usuario" value={form.usuario} onChange={this.onChange} placeholder="Usuario" /></div>
              <div className="col-md-3 mb-3"><input className="form-control user-form-input" type="password" name="clave" value={form.clave} onChange={this.onChange} placeholder="Clave" /></div>
              <div className="col-md-3 mb-3"><input className="form-control user-form-input" name="nombre" value={form.nombre} onChange={this.onChange} placeholder="Nombre" /></div>
              <div className="col-md-3 mb-3"><input className="form-control user-form-input" name="apellido" value={form.apellido} onChange={this.onChange} placeholder="Apellido" /></div>
              <div className="col-md-4 mb-3">
                <select className="form-control user-form-input" name="roll" value={form.roll} onChange={this.onChange}>
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  <option value="Personalizado">Personalizado (manual)</option>
                </select>
              </div>
              <div className="col-md-4 mb-3">
                <select className="form-control user-form-input" name="id_rol" value={form.id_rol} onChange={this.onChange}>
                  <option value="">Sin rol de tabla</option>
                  {rolesSistema.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                </select>
              </div>
              <div className="col-md-8 mb-3 d-flex align-items-center" style={{ gap: 8 }}>
                <button className="btn btn-dark" disabled={guardando} onClick={this.guardar}>
                  {guardando ? 'Guardando...' : 'Crear usuario'}
                </button>
                <button className="btn btn-dark" onClick={this.resetForm}>Limpiar</button>
              </div>
            </div>
            {this.renderPermisosEditor()}
          </div>
        </div>

        <div className="card border-0 roles-minimal-card mb-4">
          <div className="card-body p-4">
            <div className="roles-minimal-title">Roles del sistema</div>
            <div className="roles-minimal-subtitle">Modo Activity Directory: cree perfiles de acceso y asígnelos a usuarios.</div>
            <div className="row">
              <div className="col-md-4 mb-2"><input className="form-control roles-minimal-input" name="nombre" value={rolEditor.nombre} onChange={this.onRolEditorChange} placeholder="Nombre del rol" /></div>
              <div className="col-md-6 mb-2"><input className="form-control roles-minimal-input" name="descripcion" value={rolEditor.descripcion} onChange={this.onRolEditorChange} placeholder="Descripción (opcional)" /></div>
              <div className="col-md-2 mb-2 d-flex" style={{ gap: 8 }}>
                <button className="btn btn-dark btn-sm" onClick={this.guardarRol}>{rolEditor.id_rol ? 'Actualizar' : 'Crear'}</button>
                {rolEditor.id_rol ? <button className="btn btn-dark btn-sm" onClick={this.limpiarRolEditor}>Cancelar</button> : null}
              </div>
            </div>
            <div className="d-flex flex-wrap mt-2" style={{ gap: 8 }}>
              {MODULOS.map((m) => (
                <label key={`re-${m.key}`} className={`roles-minimal-chip ${rolEditor.permisos[m.key] ? 'roles-minimal-chip--on' : ''}`}>
                  <input
                    type="checkbox"
                    checked={!!rolEditor.permisos[m.key]}
                    onChange={() => this.togglePermisoRolEditor(m.key)}
                    style={{ display: 'none' }}
                  />
                  {m.label}
                </label>
              ))}
            </div>
            <hr />
            <div>
              {rolesSistema.map((r) => (
                <div key={`rol-${r.id}`} className="roles-minimal-list-item d-flex justify-content-between align-items-center">
                  <div>
                    <div className="roles-minimal-list-item-title">{r.nombre}</div>
                    <div className="roles-minimal-list-item-sub">{r.descripcion || 'Sin descripción'}</div>
                  </div>
                  <div>
                    <button className="action-btn action-btn--edit mr-2" onClick={() => this.editarRol(r)}>
                      <i className="fas fa-pen" /> Editar
                    </button>
                    <button className="action-btn action-btn--delete" onClick={() => this.eliminarRol(r.id)}>
                      <i className="fas fa-trash-alt" /> Eliminar
                    </button>
                  </div>
                </div>
              ))}
              {rolesSistema.length === 0 && (
                <div className="text-muted" style={{ fontSize: 13 }}>No hay roles creados todavía.</div>
              )}
            </div>
          </div>
        </div>

        <div className="card border-0 user-section-table">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Usuarios registrados</h5>
              <input className="form-control user-form-input" style={{ maxWidth: 320 }} placeholder="Buscar usuario..." value={buscador} onChange={(e) => this.buscar_usuario(e.target.value)} />
            </div>
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead style={{ background: '#f9fafb' }}><tr><th>Usuario</th><th>Nombre</th><th>Rol del usuario</th><th style={{ width: 220 }}>Acciones</th></tr></thead>
                <tbody>
                  {listado.map((u) => (
                    <tr key={u.id} className="user-row">
                      <td><strong>{u.usuario}</strong></td>
                      <td>{`${u.nombre || ''} ${u.apellido || ''}`.trim()}</td>
                      <td>
                        <span className={`role-pill ${
                          (u.rol_nombre || u.roll) === 'Administrador' ? 'role-pill--admin' :
                          (u.rol_nombre || u.roll) === 'Secretaria' ? 'role-pill--secretaria' :
                          (u.rol_nombre || u.roll) === 'Contable' ? 'role-pill--contable' :
                          (u.rol_nombre || u.roll) === 'Odontologo' ? 'role-pill--odontologo' : 'role-pill--custom'
                        }`}>
                          {u.rol_nombre || u.roll}
                        </span>
                      </td>
                      <td>
                        <button className="action-btn action-btn--edit mr-2" onClick={() => this.editar(u.id)}>
                          <i className="fas fa-pen" /> Editar
                        </button>
                        <button className="action-btn action-btn--delete" onClick={() => this.eliminar(u.id)}>
                          <i className="fas fa-trash-alt" /> Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {modalEdicionAbierto && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div className="card border-0" style={{ width: '100%', maxWidth: 860, borderRadius: 16, boxShadow: '0 20px 48px rgba(0,0,0,.25)' }}>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">Editar usuario</h5>
                  <button className="btn btn-sm btn-dark" onClick={this.cerrarModalEdicion}>Cerrar</button>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-2"><input className="form-control user-form-input" name="usuario" value={formEdicion.usuario} onChange={this.onChangeEdicion} placeholder="Usuario" /></div>
                  <div className="col-md-6 mb-2"><input className="form-control user-form-input" type="password" name="clave" value={formEdicion.clave} onChange={this.onChangeEdicion} placeholder="Clave" /></div>
                  <div className="col-md-6 mb-2"><input className="form-control user-form-input" name="nombre" value={formEdicion.nombre} onChange={this.onChangeEdicion} placeholder="Nombre" /></div>
                  <div className="col-md-6 mb-2"><input className="form-control user-form-input" name="apellido" value={formEdicion.apellido} onChange={this.onChangeEdicion} placeholder="Apellido" /></div>
                  <div className="col-md-6 mb-2">
                    <select className="form-control user-form-input" name="roll" value={formEdicion.roll} onChange={this.onChangeEdicion}>
                      {ROLES.map((r) => <option key={`mr-${r}`} value={r}>{r}</option>)}
                      <option value="Personalizado">Personalizado (manual)</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-2">
                    <select className="form-control user-form-input" name="id_rol" value={formEdicion.id_rol} onChange={this.onChangeEdicion}>
                      <option value="">Sin rol de tabla</option>
                      {rolesSistema.map((r) => <option key={`ms-${r.id}`} value={r.id}>{r.nombre}</option>)}
                    </select>
                  </div>
                </div>
                {this.renderPermisosEdicionModal()}
                <div className="d-flex justify-content-end mt-3" style={{ gap: 8 }}>
                  <button className="btn btn-dark" onClick={this.cerrarModalEdicion}>Cancelar</button>
                  <button className="btn btn-dark" disabled={guardando} onClick={this.guardarEdicion}>
                    {guardando ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default Usuario;