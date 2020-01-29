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

class MenuDashboard extends React.Component{

	constructor(props){
		super(props);
		this.state= {estado:true,select_opcion:'citas',notificaciones:[],notificado:false}
		this.estilos = {
					  listStyleType:"none"
			}	
	

	}

	componentDidMount(){

		FuncionesExtras.notificar_cumple(this);

	}

	menu_select=(select)=>{

			this.setState({
					select_opcion:select

			},function(){

					console.log(this.state.select_opcion);
					
			});



	}


	render(){
		if(this.state.notificaciones!="" && this.state.notificado==false){
			Alertify.success("Hoy estan de cumple años, revise las notifaciones");
			this.setState({notificado:true});
		}

		let ver;

			if(this.state.select_opcion=="citas"){
					
				ver =  <Citas/>;

			}else if(this.state.select_opcion=="paciente"){

				ver =<Paciente/>;
			

			}else if(this.state.select_opcion=="doctor"){

				ver = <Doctor/>;
			
			}else if(this.state.select_opcion=="procedimiento"){


				ver =<ProcedimientoForm/>;
			
			}else if(this.state.select_opcion=="notificaciones"){
				
				ver =<Notificaciones/>;
			
			}else if(this.state.select_opcion=="reportes"){

				ver = <Reporte/>;

			}else if(this.state.select_opcion=="cargar_pacientes"){
				
				ver =  <Citas/>;

			}else if(this.state.select_opcion=="citas_pendiente"){
				
				ver = <CitasPendiente/>;
			}


		return (<div className="row"><div className="col-md-3"><br/>
				<br/><div className="card">
					<table>
						<tr>
							<td onClick={()=>this.menu_select('cargar_pacientes')} id="cargar_pacientes"><img src={Logo} width="50" className="img-responsive" style={{marginLeft:'10px;'}} /></td>
							<td><strong>Kadosh Dental</strong></td>
						</tr>
					</table>
				</div>

					<ul style={this.estilos} className="menuStilos">
								<li onClick={(e)=>this.menu_select('notificaciones')} id="notificaiones"><img src={NotificacionImg}/>&nbsp;Notificaciones</li>
								<li onClick={(e)=>this.menu_select('paciente')} id="agregar_paciente"><img src={PacienteImg} /><span className="icon-bar"></span>&nbsp;Agregar Paciente</li>
								<li onClick={(e)=>this.menu_select('citas_pendiente')} id="cargar_citas"><img src={CitasImg} /><span className="icon-bar"></span>&nbsp;Citas Pendiente</li>
								<li onClick={(e)=>this.menu_select('doctor')}><img src={DoctorImg} />&nbsp;Agregar Doctor</li>
								<li onClick={(e)=>this.menu_select('procedimiento')}><img src={ProcedimientoImg} />&nbsp;Agregar Procedimientos</li>
								<li onClick={(e)=>this.menu_select('reportes')}><img src={ReporteImg} />&nbsp;Generar Reportes</li>
					</ul>							
				</div>
				{ver}
			</div>
			);



	}









}

export default MenuDashboard;