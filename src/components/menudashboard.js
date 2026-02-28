import React from 'react';
import ReactDOM from 'react-dom';
import MenuDashBoard from  './menudashboard';
import Citas from './citas_c';
import Select from  '../select.png';
import Paciente from './paciente_admin';
import Doctor from './admin_doctor';
import ProcedimientoForm from './agregar_procedimiento';
import Notificaciones from './notificaciones';
import Reporte from './reporte';
import FuncionesExtras from './funciones_extras';
import Alertify from 'alertifyjs';
import CitasPendiente from './citas_pendiente';
import DoctorImg from '../doctor.png';
import NotificacionImg from '../alertando.png';
import PacienteImg from '../hombre.png';
import ProcedimientoImg from '../caja.png';
import CitasImg from '../cuaderno.png';
import ReporteImg from '../reporte.png';
import Bloquear from '../bloquear.png';
import Contabilidad from '../contabilidad.png';
import Contabilidad_template from './contabilidad';
import PerfilPaciente from './perfil_paciente';
import Usuario from './agregar_usuario'; 
import EditarFactura from './editar_factura';
import CrearPresupuesto from './crear_presupuesto';
import VerPresupuesto from './ver_presupuestos';
import { BrowserRouter as Router, Switch, Route, Link,Redirect } from 'react-router-dom';
import VisualizarPresupuesto from './visualizar_presupuesto';
import VerFacturas from './ver_facturas';
import VerFactura from './factura_interfaz'
import AgregarFactura from './agregando_factura';
import VerPresupuestoAhora from './visualizar_presupuesto';
import ImprimirRecibo  from './imprimir_recibo';
import Configuracion from './configuracion';
import AgregarCita from './agregar_cita';
import Modulo_p from './modulo_p';
import ActulizarPaciente from './actualizar_paciente';
import Odontograma from './odontograma';
import OdontogramaEditar from './odontograma_editar';
import ChatSoporte from './chat_soporte';
import FichaMedica from './ficha_medica';
import ver_odontogramas from './ver_odontogramas';
import VerOdontogramaIndividual from './ver_odontograma_individual';
import Auditoria from './auditoria';
import HistorialPagos from './historial_pagos';
import Nomina from './nomina';
import PuntoVenta from './punto_venta';
import SalariosDoctores from './salarios_doctores';
import Especialidades from './especialidades';
import ExportarImportar from './exportar_importar';
import Presupuestos from './presupuestos';
import AdministrarTenants from './administrar_tenants';
import AsignarGananciasRecibos from './asignar_ganancias_recibos';
import ManualUsuario from './manual_usuario';

import Axios from 'axios';
class MenuDashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      notificaciones: [], 
      notificado: false,
      alertasPagos: [],
      alertaPagoMostrada: false,
      busquedaMenu: ''
    };
    this.estilos = { listStyleType: "none" };
  }

  componentDidMount() {
    FuncionesExtras.notificar_cumple(this);
    this.contador_de_sesion();
    this.verificar_alertas_pagos();
    // Verificar alertas cada hora
    setInterval(() => {
      this.verificar_alertas_pagos();
    }, 3600000); // 1 hora
  }

  verificar_alertas_pagos() {
    // Obtener el usuario actual del localStorage
    const usuarioActual = localStorage.getItem("login");
    const usuarioId = localStorage.getItem("id_usuario");
    
    if (!usuarioId) {
      // Si no hay usuario_id, intentar obtener alertas generales
      FuncionesExtras.obtener_alertas_pagos()
        .then(alertas => {
          if (alertas && alertas.length > 0) {
            this.setState({ alertasPagos: alertas });
            this.mostrar_alerta_pago(alertas[0]);
          }
        })
        .catch(error => {
          console.error("Error al verificar alertas de pago:", error);
        });
    } else {
      // Obtener el próximo pago del usuario actual
      FuncionesExtras.obtener_proximo_pago_usuario(usuarioId)
        .then(data => {
          if (data && data.en_alerta && !this.state.alertaPagoMostrada) {
            this.mostrar_alerta_pago_usuario(data);
          }
        })
        .catch(error => {
          // Solo mostrar error si no es un 404 (no hay pagos pendientes es normal)
          if (error.response && error.response.status !== 404) {
            console.error("Error al verificar pago del usuario:", error);
          }
        });
    }
  }

  mostrar_alerta_pago_usuario(data) {
    const { pago, dias_restantes, fecha_vencimiento } = data;
    const usuarioActual = localStorage.getItem("login") || "Usuario";
    const mensaje = `⚠️ ALERTA DE PAGO ⚠️\n\n` +
      `Usuario: ${usuarioActual}\n` +
      `Le quedan ${dias_restantes} días antes de que el sistema se corte.\n` +
      `Fecha de vencimiento: ${fecha_vencimiento}\n` +
      `Monto: $${pago.monto}\n\n` +
      `El pago era hasta el día ${new Date(fecha_vencimiento).getDate()} del mes.`;
    
    Alertify.alert('Alerta de Pago Mensual', mensaje, () => {
      this.setState({ alertaPagoMostrada: true });
    });
  }

  mostrar_alerta_pago(alerta) {
    if (this.state.alertaPagoMostrada) return;
    
    const mensaje = `⚠️ ALERTA DE PAGO ⚠️\n\n` +
      `Usuario: ${alerta.usuario}\n` +
      `Le quedan ${alerta.dias_restantes} días antes de que el sistema se corte.\n` +
      `Fecha de vencimiento: ${alerta.fecha_vencimiento}\n` +
      `Monto: $${alerta.monto}\n\n` +
      `El pago era hasta el día ${new Date(alerta.fecha_vencimiento).getDate()} del mes.`;
    
    Alertify.alert('Alerta de Pago Mensual', mensaje, () => {
      this.setState({ alertaPagoMostrada: true });
    });
  }

  contador_de_sesion() {
    let interval2;
    let interval = setInterval(() => {
      Alertify.confirm(
        'La sesión expiró, desea extenderla?',
        'En 10 segundos.. el sistema cerrará si no extiende la sesión',
        () => {
          Alertify.message("Sesión extendida..");
          clearTimeout(interval2);
        },
        () => {
          Alertify.message("Bye...");
        }
      );

      interval2 = setTimeout(() => {
        document.getElementById("cerrar_sesion").click();
      }, 10000);
    }, 28800000);
  }

  render() {
    if (this.state.notificaciones.length > 0 && !this.state.notificado) {
      Alertify.success("Hoy están de cumpleaños, revise las notificaciones");
      this.setState({ notificado: true });
    }

    // Mostrar alerta de pago si hay alertas y no se ha mostrado
    if (this.state.alertasPagos.length > 0 && !this.state.alertaPagoMostrada) {
      this.mostrar_alerta_pago(this.state.alertasPagos[0]);
    }

    let Menu;

    // Función helper para crear un elemento de menú
    const crearItemMenu = (ruta, icono, texto, id = null) => {
      const linkProps = { to: ruta };
      if (id) linkProps.id = id;
      return (
        <li key={ruta}>
          <Link {...linkProps}>
            <i className={icono}></i>&nbsp;{texto}
          </Link>
        </li>
      );
    };

    // Función para filtrar opciones del menú
    const filtrarOpciones = (texto, opciones) => {
      if (!texto || texto.trim() === '') return opciones;
      const busqueda = texto.toLowerCase().trim();
      return opciones.filter(opcion => 
        opcion.texto.toLowerCase().includes(busqueda)
      );
    };

    if (localStorage.getItem("roll") === "Administrador") {
      // Definir todas las opciones del menú como objetos con datos
      const opcionesGestion = [
        { ruta: "/paciente", icono: "fas fa-user-plus", texto: FuncionesExtras.lenguaje.agregar_paciente },
        { ruta: "/doctor", icono: "fas fa-user-md", texto: FuncionesExtras.lenguaje.agregar_doctor },
        { ruta: "/asignar_ganancias_recibos", icono: "fas fa-money-bill-wave", texto: "Asignar Ganancias por Recibo" },
        { ruta: "/procedimiento", icono: "fas fa-stethoscope", texto: FuncionesExtras.lenguaje.agregar_procedimiento },
        { ruta: "/agregar_usuario", icono: "fas fa-user-cog", texto: FuncionesExtras.lenguaje.agregar_usuario },
        { ruta: "/especialidades", icono: "fas fa-user-md", texto: "Especialidades" }
      ];

      const opcionesCitas = [
        { ruta: "/notificaciones", icono: "fas fa-bell", texto: FuncionesExtras.lenguaje.notifiaciones },
        { ruta: "/agregar_cita", icono: "fas fa-calendar-check", texto: FuncionesExtras.lenguaje.administracion_citas }
      ];

      const opcionesFinanzas = [
        { ruta: "/contabilidad", icono: "fas fa-calculator", texto: FuncionesExtras.lenguaje.contabilidad },
        { ruta: "/nomina", icono: "fas fa-money-check-alt", texto: "Nómina" },
        { ruta: "/punto_venta", icono: "fas fa-cash-register", texto: "Punto de Venta" },
        { ruta: "/salarios_doctores", icono: "fas fa-hand-holding-usd", texto: "Salarios Doctores" },
        { ruta: "/historial_pagos", icono: "fas fa-credit-card", texto: "Historial de Pagos" }
      ];

      const opcionesReportes = [
        { ruta: "/reportes", icono: "fas fa-file-alt", texto: FuncionesExtras.lenguaje.generar_reportes },
        { ruta: "/auditoria", icono: "fas fa-history", texto: "Auditoría" }
      ];

      const opcionesSistema = [
        { ruta: "/manual_usuario", icono: "fas fa-book", texto: "Manual de Usuario" },
        { ruta: "/configuracion", icono: "fas fa-cog", texto: "Configuración" },
        { ruta: "/exportar_importar", icono: "fas fa-exchange-alt", texto: "Exportar/Importar" },
        { ruta: "/administrar_tenants", icono: "fas fa-building", texto: "Administrar Tenants" },
        { ruta: "/cerrar_sesion", icono: "fas fa-sign-out-alt", texto: FuncionesExtras.lenguaje.cerrar_sesion, id: "cerrar_sesion" }
      ];

      // Filtrar opciones si hay búsqueda
      const busqueda = this.state.busquedaMenu;
      const gestionFiltrado = filtrarOpciones(busqueda, opcionesGestion);
      const citasFiltrado = filtrarOpciones(busqueda, opcionesCitas);
      const finanzasFiltrado = filtrarOpciones(busqueda, opcionesFinanzas);
      const reportesFiltrado = filtrarOpciones(busqueda, opcionesReportes);
      const sistemaFiltrado = filtrarOpciones(busqueda, opcionesSistema);

      Menu = (
        <div style={{ padding: '0 10px' }}>
          <style>{`
            .menu-modern li {
              list-style: none;
              margin: 0;
              padding: 0;
            }
            .menu-modern li a {
              display: flex;
              align-items: center;
              padding: 12px 16px;
              color: #2d2d2f;
              text-decoration: none;
              font-size: '14px';
              font-weight: 500;
              border-radius: 10px;
              margin-bottom: 6px;
              transition: all 0.2s ease;
              background: rgba(255,255,255,0.6);
            }
            .menu-modern li a:hover {
              background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
              color: #1c1c1e;
              transform: translateX(4px);
              box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            }
            .menu-modern li a i {
              margin-right: 12px;
              font-size: 16px;
              width: 20px;
              text-align: center;
              color: #6c757d;
            }
            .menu-modern li a:hover i {
              color: #2d2d2f;
              transform: scale(1.1);
            }
            .menu-modern li a#cerrar_sesion {
              color: #dc3545 !important;
              background: rgba(220, 53, 69, 0.1) !important;
            }
            .menu-modern li a#cerrar_sesion:hover {
              background: linear-gradient(135deg, #dc3545 0%, #c82333 100%) !important;
              color: white !important;
            }
            .menu-modern li a#cerrar_sesion:hover i {
              color: white !important;
            }
          `}</style>
          
          {/* Buscador del menú */}
          <div style={{
            marginBottom: '20px',
            padding: '0 5px'
          }}>
            <div style={{
              position: 'relative',
              width: '100%'
            }}>
              <input
                type="text"
                placeholder="Buscar en el menú..."
                value={this.state.busquedaMenu}
                onChange={(e) => this.setState({ busquedaMenu: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 40px',
                  borderRadius: '12px',
                  border: '2px solid #e0e0e0',
                  fontSize: '14px',
                  background: '#ffffff',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0';
                  e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                }}
              />
              <i className="fas fa-search" style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6c757d',
                fontSize: '14px'
              }}></i>
              {this.state.busquedaMenu && (
                <button
                  onClick={() => this.setState({ busquedaMenu: '' })}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: '#6c757d',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#f3f4f6';
                    e.target.style.color = '#1f2937';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.color = '#6c757d';
                  }}
                >
                  <i className="fas fa-times" style={{ fontSize: '12px' }}></i>
                </button>
              )}
            </div>
          </div>
          {/* Gestión */}
          {(!busqueda || gestionFiltrado.length > 0) && (
            <div style={{ marginBottom: '24px' }}>
              <h6 style={{
                color: '#6c757d',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '12px',
                paddingLeft: '12px',
                marginTop: 0
              }}>
                Gestión
              </h6>
              <ul className="menu-modern" style={{ padding: 0, margin: 0 }}>
                {gestionFiltrado.map(opcion => crearItemMenu(opcion.ruta, opcion.icono, opcion.texto, opcion.id))}
              </ul>
            </div>
          )}

          {/* Citas y Notificaciones */}
          {(!busqueda || citasFiltrado.length > 0) && (
            <div style={{ marginBottom: '24px' }}>
              <h6 style={{
                color: '#6c757d',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '12px',
                paddingLeft: '12px'
              }}>
                Citas y Notificaciones
              </h6>
              <ul className="menu-modern" style={{ padding: 0, margin: 0 }}>
                {citasFiltrado.map(opcion => crearItemMenu(opcion.ruta, opcion.icono, opcion.texto, opcion.id))}
              </ul>
            </div>
          )}

          {/* Finanzas */}
          {(!busqueda || finanzasFiltrado.length > 0) && (
            <div style={{ marginBottom: '24px' }}>
              <h6 style={{
                color: '#6c757d',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '12px',
                paddingLeft: '12px'
              }}>
                Finanzas
              </h6>
              <ul className="menu-modern" style={{ padding: 0, margin: 0 }}>
                {finanzasFiltrado.map(opcion => crearItemMenu(opcion.ruta, opcion.icono, opcion.texto, opcion.id))}
              </ul>
            </div>
          )}

          {/* Reportes y Auditoría */}
          {(!busqueda || reportesFiltrado.length > 0) && (
            <div style={{ marginBottom: '24px' }}>
              <h6 style={{
                color: '#6c757d',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '12px',
                paddingLeft: '12px'
              }}>
                Reportes
              </h6>
              <ul className="menu-modern" style={{ padding: 0, margin: 0 }}>
                {reportesFiltrado.map(opcion => crearItemMenu(opcion.ruta, opcion.icono, opcion.texto, opcion.id))}
              </ul>
            </div>
          )}

          {/* Sistema */}
          {(!busqueda || sistemaFiltrado.length > 0) && (
            <div style={{ marginBottom: '24px' }}>
              <h6 style={{
                color: '#6c757d',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '12px',
                paddingLeft: '12px'
              }}>
                Sistema
              </h6>
              <ul className="menu-modern" style={{ padding: 0, margin: 0 }}>
                {sistemaFiltrado.map(opcion => crearItemMenu(opcion.ruta, opcion.icono, opcion.texto, opcion.id))}
              </ul>
            </div>
          )}

          {/* Mensaje cuando no hay resultados */}
          {busqueda && gestionFiltrado.length === 0 && citasFiltrado.length === 0 && 
           finanzasFiltrado.length === 0 && reportesFiltrado.length === 0 && 
           sistemaFiltrado.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#6b7280'
            }}>
              <i className="fas fa-search" style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.5, display: 'block' }}></i>
              <div style={{ fontSize: '14px' }}>
                No se encontraron resultados para "{busqueda}"
              </div>
            </div>
          )}
        </div>
      );
    } else if (localStorage.getItem("roll") === "Contable") {
      Menu = (
        <ul style={this.estilos} className="menuStilos">
          <li><Link to="/manual_usuario"><i className="fas fa-book"></i>&nbsp;Manual de Usuario</Link></li>
          <li><Link to="/contabilidad"><img src={Contabilidad} className="img_estilo" />&nbsp;Contabilidad</Link></li>
          <li><Link to="/cerrar_sesion"><img src={Bloquear} className="img_estilo" />&nbsp;Cerrar Sesión</Link></li>
        </ul>
      );
    } else if (localStorage.getItem("roll") === "Secretaria") {
      Menu = (
        <ul style={this.estilos} className="menuStilos">
          <li><Link to="/manual_usuario"><i className="fas fa-book"></i>&nbsp;Manual de Usuario</Link></li>
          <li><Link to="/notificaciones" id="notificaiones"><img src={NotificacionImg} className="img_estilo" />&nbsp;Notificaciones</Link></li>
          <li><Link to="/paciente" id="agregar_paciente"><img src={PacienteImg} className="img_estilo" />&nbsp;Agregar Paciente</Link></li>
          <li><Link to="/citas_pendiente" id="cargar_citas"><img src={CitasImg} className="img_estilo" />&nbsp;Citas Pendiente</Link></li>
          <li><Link to="/cerrar_sesion"><img src={Bloquear} className="img_estilo" />&nbsp;Cerrar Sesión</Link></li>
        </ul>
      );
    } else {
      Menu = (
        <ul style={this.estilos} className="menuStilos">
          <li><Link to="/manual_usuario"><i className="fas fa-book"></i>&nbsp;Manual de Usuario</Link></li>
          <li><Link to="/cerrar_sesion"><img src={Bloquear} className="img_estilo" />&nbsp;Cerrar Sesión</Link></li>
        </ul>
      );
    }

    return (
      <Router>
        <div className="row container-fluid">
          <div className="col-md-2" style={{ 
            background: 'linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)',
            minHeight: '100vh',
            padding: '0',
            boxShadow: '2px 0 8px rgba(0,0,0,0.05)'
          }}>
            {/* Header con Logo y Usuario */}
            <div style={{
              background: 'linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)',
              padding: '25px 20px',
              borderRadius: '0 0 20px 20px',
              marginBottom: '20px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: '1px solid rgba(0,0,0,0.05)'
            }}>
              <Link to="/cargar_pacientes" id="cargar_pacientes" style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{ 
                  textAlign: 'center',
                  marginBottom: '20px'
                }}>
                  <img 
                    src={FuncionesExtras.Config.app_logo} 
                    width={FuncionesExtras.Config.logo_width_menu || '120'} 
                    className="img-responsive" 
                    style={{ 
                      borderRadius: '12px',
                      background: 'rgba(255,255,255,0.8)',
                      padding: '10px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.05)';
                      e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    }}
                  />
                </div>
                {FuncionesExtras.Config.name_company_visible !== 'none' && (
                  <div style={{
                    textAlign: 'center',
                    marginBottom: '15px'
                  }}>
                    <h5 style={{
                      color: '#2d2d2f',
                      fontWeight: 700,
                      fontSize: '16px',
                      margin: 0
                    }}>
                      {FuncionesExtras.Config.name_company}
                    </h5>
                  </div>
                )}
              </Link>
              
              {/* Información del Usuario - Panel Moderno */}
              <div style={{
                background: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid rgba(0,0,0,0.08)',
                marginTop: '15px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
              }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  marginBottom: '15px'
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2d2d2f 0%, #1c1c1e 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px',
                    fontSize: '24px',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(28, 28, 30, 0.3)',
                    flexShrink: 0
                  }}>
                    <i className="fas fa-user"></i>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      color: '#6c757d',
                      fontSize: '11px',
                      margin: 0,
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '4px'
                    }}>
                      Usuario
                    </p>
                    <p style={{
                      color: '#2d2d2f',
                      fontSize: '15px',
                      margin: 0,
                      fontWeight: 700,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {localStorage.getItem("login") || "Usuario"}
                    </p>
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '15px',
                  borderTop: '2px solid rgba(0,0,0,0.05)',
                  marginTop: '15px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    flex: 1
                  }}>
                    <i className="fas fa-shield-alt" style={{
                      color: '#2d2d2f',
                      marginRight: '8px',
                      fontSize: '14px'
                    }}></i>
                    <span style={{
                      color: '#2d2d2f',
                      fontSize: '12px',
                      fontWeight: 600
                    }}>
                      {localStorage.getItem("roll") || "Usuario"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {Menu}
          </div>
            <Switch>
              <Route exact path="/">
                <Redirect to="/cargar_pacientes" />
              </Route>
              <Route path="/cargar_pacientes" component={Citas} />
              <Route path="/citas" component={Citas} />
              <Route path="/paciente" component={Paciente} />
              <Route path="/doctor" component={Doctor} />
              <Route path="/asignar_ganancias_recibos" component={AsignarGananciasRecibos} />
              <Route path="/procedimiento" component={ProcedimientoForm} />
              <Route path="/notificaciones" component={Notificaciones} />
              <Route path="/reportes" component={Reporte} />
              <Route path="/citas_pendiente" component={CitasPendiente} />
			        <Route path="/perfil_paciente/:id/:id_doc" component={PerfilPaciente} />
              <Route path="/crear_prepuestos/:id/:id_doc" component={CrearPresupuesto} />
              <Route path="/editar_presupuesto/:id/:id_presupuesto/:id_doc" component={CrearPresupuesto} />
              <Route path="/presupuestos/:id/:id_doc" component={VerPresupuesto} />
              <Route path="/contabilidad" component={Contabilidad_template} />
              <Route path="/nomina" component={Nomina} />
              <Route path="/punto_venta" component={PuntoVenta} />
              <Route path="/salarios_doctores" component={SalariosDoctores} />
              <Route path="/especialidades" component={Especialidades} />
              <Route path="/agregar_factura/:id/:id_doc" component={AgregarFactura} />
              <Route path="/ver_facturas/:id" component={VerFacturas} />
              <Route path="/ver_factura/:id/:id_factura" component={VerFactura} />
              <Route path="/editar_factura/:id/:id_factura" component={EditarFactura} />
              <Route path="/agregar_usuario" component={Usuario} />
              <Route path="/presupuesto/:id/:id_presupuesto/:id_doc" component={VerPresupuestoAhora} />
              <Route path="/configuracion" component={Configuracion} />
              <Route path="/historial_pagos" component={HistorialPagos} />
              <Route path="/exportar_importar" component={ExportarImportar} />
              <Route path="/presupuestos" component={Presupuestos} />
              <Route path="/actualizar_paciente/:id" component={ActulizarPaciente} />
              <Route path="/imprimir_recibo/:id_recibo/:id_factura/:id/:id_doctor" component={ImprimirRecibo} />
              <Route path="/ficha_medica/:id_paciente" component={FichaMedica} />
              <Route path="/odontograma/editar/:id" component={OdontogramaEditar} />
              <Route path="/odontograma/:id_paciente/:id_doctor" component={Odontograma} />
              <Route path="/ver_odontogramas/:id_paciente" component={ver_odontogramas} />
              <Route path="/ver_odontograma/:id" component={VerOdontogramaIndividual} />
              <Route path="/agregar_cita/" component={AgregarCita} />
              <Route path="/auditoria" component={Auditoria} />
              <Route path="/administrar_tenants" component={AdministrarTenants} />
              <Route path="/manual_usuario" component={ManualUsuario} />
              <Route path="/cerrar_sesion" render={() => {
                localStorage.clear();
                window.location.href = "/";
                return null;
              }} />
              <Route  component={Modulo_p} />
            </Switch>
        </div>
        <ChatSoporte />
      </Router>
    );
  }
}

export default MenuDashboard;
