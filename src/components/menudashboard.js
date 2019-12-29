import React from 'react';
import ReactDOM from 'react-dom';
import MenuDashBoard from  './menudashboard';
import Citas from './citas_c';
import Select from  '../select.png';
import Logo from  '../logo.jpg';
import Paciente from './paciente_admin';
import Doctor from './admin_doctor';
import ProcedimientoForm from './agregar_procedimiento';


class MenuDashboard extends React.Component{

	constructor(props){
		super(props);
		this.state= {estado:true,select_opcion:'citas'}
		this.estilos = {
					  listStyleType:"none"
			}	
	

	}


	menu_select=(select)=>{

			this.setState({
					select_opcion:select

			},function(){

					console.log(this.state.select_opcion);
			});



	}


	render(){
		let ver;

			if(this.state.select_opcion=="citas"){
					
				ver =  <Citas/>;

			}else if(this.state.select_opcion=="paciente"){

				ver =<Paciente/>;
			

			}else if(this.state.select_opcion=="doctor"){

				ver = <Doctor/>;
			
			}else if(this.state.select_opcion=="procedimiento"){


				ver =<ProcedimientoForm/>;
			}


		return (<div className="row"><div className="col-md-3"><br/>
				<br/><div className="card">
					<table>
						<tr>
							<td><img src={Logo} width="50" className="img-responsive" style={{marginLeft:'10px;'}} /></td>
							<td><strong>Kadosh Dental</strong></td>
						</tr>
					</table>
				</div>

					<ul style={this.estilos} className="menuStilos">
								<li><img src={Select} />Notificaciones</li>
								<li onClick={(e)=>this.menu_select('paciente')}><img src={Select} /><span className="icon-bar"></span>Agregar Paciente</li>
								<li onClick={(e)=>this.menu_select('doctor')}><img src={Select} />Agregar Doctor</li>
								<li onClick={(e)=>this.menu_select('procedimiento')}><img src={Select} />Agregar Procedimientos</li>
								<li><img src={Select} />Factura Directa</li>
								<li><img src={Select} />Generar Reportes</li>
					</ul>							
				</div>
				{ver}
			</div>
			);



	}









}

export default MenuDashboard;