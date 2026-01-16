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

import Axios from 'axios';
class MenuDashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      notificaciones: [], 
      notificado: false,
      alertasPagos: [],
      alertaPagoMostrada: false
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
          console.error("Error al verificar pago del usuario:", error);
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

    if (localStorage.getItem("roll") === "Administrador") {
      Menu = (
        <ul style={this.estilos} className="menuStilos ">
          <li><Link to="/notificaciones"><i className="fas fa-bell img_estilo"></i>&nbsp;{FuncionesExtras.lenguaje.notifiaciones}</Link></li>
          <li><Link to="/paciente"><i className="fas fa-user-plus img_estilo"></i>&nbsp;{FuncionesExtras.lenguaje.agregar_paciente}</Link></li>
          <li><Link to="/agregar_usuario"><i className="fas fa-user-cog img_estilo"></i>&nbsp;{FuncionesExtras.lenguaje.agregar_usuario}</Link></li>
          <li><Link to="/agregar_cita"><i className="fas fa-calendar-check img_estilo"></i>&nbsp;{FuncionesExtras.lenguaje.administracion_citas}</Link></li>
          <li><Link to="/auditoria"><i className="fas fa-history img_estilo"></i>&nbsp;Auditoría</Link></li>
          <li><Link to="/doctor"><i className="fas fa-user-md img_estilo"></i>&nbsp;{FuncionesExtras.lenguaje.agregar_doctor}</Link></li>
          <li><Link to="/procedimiento"><i className="fas fa-stethoscope img_estilo"></i>&nbsp;{FuncionesExtras.lenguaje.agregar_procedimiento}</Link></li>
          <li><Link to="/reportes"><i className="fas fa-file-alt img_estilo"></i>&nbsp;{FuncionesExtras.lenguaje.generar_reportes}</Link></li>
          <li><Link to="/contabilidad"><i className="fas fa-calculator img_estilo"></i>&nbsp;{FuncionesExtras.lenguaje.contabilidad}</Link></li>
          <li><Link to="/nomina"><i className="fas fa-money-check-alt img_estilo"></i>&nbsp;Nómina</Link></li>
          <li><Link to="/punto_venta"><i className="fas fa-cash-register img_estilo"></i>&nbsp;Punto de Venta</Link></li>
          <li><Link to="/salarios_doctores"><i className="fas fa-hand-holding-usd img_estilo"></i>&nbsp;Salarios Doctores</Link></li>
          <li><Link to="/especialidades"><i className="fas fa-user-md img_estilo"></i>&nbsp;Especialidades</Link></li>
          <li><Link to="/configuracion"><i className="fas fa-cog img_estilo"></i>&nbsp;Configuración</Link></li>
          <li><Link to="/historial_pagos"><i className="fas fa-credit-card img_estilo"></i>&nbsp;Historial de Pagos</Link></li>
          <li><Link to="/exportar_importar"><i className="fas fa-exchange-alt img_estilo"></i>&nbsp;Exportar/Importar</Link></li>
          <li><Link to="/cerrar_sesion" id="cerrar_sesion"><i className="fas fa-sign-out-alt img_estilo"></i>&nbsp;{FuncionesExtras.lenguaje.cerrar_sesion}</Link></li>
        </ul>
      );
    } else if (localStorage.getItem("roll") === "Contable") {
      Menu = (
        <ul style={this.estilos} className="menuStilos">
          <li><Link to="/contabilidad"><img src={Contabilidad} className="img_estilo" />&nbsp;Contabilidad</Link></li>
          <li><Link to="/cerrar_sesion"><img src={Bloquear} className="img_estilo" />&nbsp;Cerrar Sesión</Link></li>
        </ul>
      );
    } else if (localStorage.getItem("roll") === "Secretaria") {
      Menu = (
        <ul style={this.estilos} className="menuStilos">
          <li><Link to="/notificaciones" id="notificaiones"><img src={NotificacionImg} className="img_estilo" />&nbsp;Notificaciones</Link></li>
          <li><Link to="/paciente" id="agregar_paciente"><img src={PacienteImg} className="img_estilo" />&nbsp;Agregar Paciente</Link></li>
          <li><Link to="/citas_pendiente" id="cargar_citas"><img src={CitasImg} className="img_estilo" />&nbsp;Citas Pendiente</Link></li>
          <li><Link to="/cerrar_sesion"><img src={Bloquear} className="img_estilo" />&nbsp;Cerrar Sesión</Link></li>
        </ul>
      );
    } else {
      Menu = (
        <ul style={this.estilos} className="menuStilos">
          <li><Link to="/cerrar_sesion"><img src={Bloquear} className="img_estilo" />&nbsp;Cerrar Sesión</Link></li>
        </ul>
      );
    }

    return (
      <Router>
        <div className="row container-fluid">
          <div className="col-md-2">
            <br />
            <br />
            <div className="card">
              <table>
                <tbody>
                  <tr>
                    <td>
                      <Link to="/cargar_pacientes" id="cargar_pacientes">
                        <img src={FuncionesExtras.Config.app_logo} width={FuncionesExtras.Config.logo_width_menu} className="img-responsive" style={{ marginLeft: '10px', padding: '2px' }} />
                      </Link>
                    </td>
                    <td style={{display:FuncionesExtras.Config.name_company_visible}}><strong>{FuncionesExtras.Config.name_company}</strong></td>
                  </tr>
                </tbody>
              </table>
              <strong style={{ padding: '3px' }}>Usuario: {localStorage.getItem("login")}</strong>
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
              <Route path="/actualizar_paciente/:id" component={ActulizarPaciente} />
              <Route path="/imprimir_recibo/:id_recibo/:id_factura/:id/:id_doctor" component={ImprimirRecibo} />
              <Route path="/ficha_medica/:id_paciente" component={FichaMedica} />
              <Route path="/odontograma/:id_paciente/:id_doctor" component={Odontograma} />
              <Route path="/ver_odontogramas/:id_paciente" component={ver_odontogramas} />
              <Route path="/ver_odontograma/:id" component={VerOdontogramaIndividual} />
              <Route path="/agregar_cita/" component={AgregarCita} />
              <Route path="/auditoria" component={Auditoria} />
              <Route path="/cerrar_sesion" render={() => {
                localStorage.clear();
                window.location.href = "/";
                return null;
              }} />
              <Route  component={Modulo_p} />
            </Switch>
        </div>
      </Router>
    );
  }
}

export default MenuDashboard;
