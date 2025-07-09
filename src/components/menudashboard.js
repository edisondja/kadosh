import React from 'react';
import ReactDOM from 'react-dom';
import MenuDashBoard from  './menudashboard';
import Citas from './citas_c';
import Select from  '../select.png';
import Logo from  '../logo.jpg';
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
import Usuario from './agregar_usuario'; 
import { BrowserRouter as Router, Switch, Route, Link,Redirect } from 'react-router-dom';
import VisualizarPresupuesto from './visualizar_presupuesto';

class MenuDashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = { notificaciones: [], notificado: false };
    this.estilos = { listStyleType: "none" };
  }

  componentDidMount() {
    FuncionesExtras.notificar_cumple(this);
    this.contador_de_sesion();
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

    let Menu;

    if (localStorage.getItem("roll") === "Administrador") {
      Menu = (
        <ul style={this.estilos} className="menuStilos">
          <li><Link to="/notificaciones"><i className="fas fa-bell img_estilo"></i>&nbsp;Notificaciones</Link></li>
          <li><Link to="/paciente"><i className="fas fa-user-plus img_estilo"></i>&nbsp;Agregar Paciente</Link></li>
          <li><Link to="/agregar_usuario"><i className="fas fa-user-cog img_estilo"></i>&nbsp;Agregar Usuario</Link></li>
          <li><Link to="/citas_pendiente"><i className="fas fa-calendar-check img_estilo"></i>&nbsp;Citas Pendientes</Link></li>
          <li><Link to="/doctor"><i className="fas fa-user-md img_estilo"></i>&nbsp;Agregar Doctor</Link></li>
          <li><Link to="/procedimiento"><i className="fas fa-stethoscope img_estilo"></i>&nbsp;Agregar Procedimientos</Link></li>
          <li><Link to="/reportes"><i className="fas fa-file-alt img_estilo"></i>&nbsp;Generar Reportes</Link></li>
          <li><Link to="/contabilidad"><i className="fas fa-calculator img_estilo"></i>&nbsp;Contabilidad</Link></li>
          <li><Link to="/cerrar_sesion" id="cerrar_sesion"><i className="fas fa-sign-out-alt img_estilo"></i>&nbsp;Cerrar Sesión</Link></li>
          <li><Link to="/configuracion" id="configuracion"><i className="fas fa-cog img_estilo"></i>&nbsp;Configuración</Link></li>
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
                        <img src={Logo} width="30" className="img-responsive" style={{ marginLeft: '10px', padding: '2px' }} />
                      </Link>
                    </td>
                    <td><strong>Kadosh Dental</strong></td>
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
              <Route path="/contabilidad" component={Contabilidad_template} />
              <Route path="/agregar_usuario" component={Usuario} />
              <Route path="/cerrar_sesion" render={() => {
                localStorage.clear();
                window.location.href = "/";
                return null;
              }} />
              <Route render={() => <h3>Página no encontrada</h3>} />
            </Switch>
        </div>
      </Router>
    );
  }
}

export default MenuDashboard;
