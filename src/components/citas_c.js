import React from 'react';
import ReactDOM from 'react-dom';
import Axios from 'axios';
import '../css/bootstrap.css';
import Logo from '../logo.jpg';
import Loading from '../loading.gif';
import PerfilPaciente from './perfil_paciente';
import AgregarCita from './agregar_cita';
import Url from './funciones_extras';
import ActualizarPerfil from './actualizar_paciente';

class  Cita extends React.Component{

	constructor(props){
		super(props);
		this.id_paciente=0;
		this.state ={perfil_selec:false,
					id_doctor:0,
					nombre_paciente:"",
					clientes:[
						  
					    ],
					    id_paciente:0
					};
	}


	componentDidMount(){

		this.cargar_citas();

	}


	cargar_citas()
	{
			Axios.get(`${Url.url_base}/api/paciente`).then(data=>{
			    this.setState({clientes:data.data});
			}).catch(error=>{
					console.log(error);
			});
	}

	asignar_cita=(id,nombre)=>{

		this.setState({perfil_selec:'agregar_citas',id_cliente:id,nombre_paciente:nombre});
	}

	buscarPaciente=(e)=>{

		Axios.get(`${Url.url_base}/api/buscar_paciente/${e.target.value}`).then(data=>{
			this.setState({clientes:data.data});
		}).catch(error=>{
				console.log(error);
		});


	}

	cargar=(id,id_doct)=>{


				this.setState({perfil_selec:true,id_cliente:id,id_doctor:id_doct});

	}

	actualizar_paciente(id){

		this.setState({perfil_selec:'actualizar_paciente',id_paciente:id});
	}


	render(){

		if(this.state.perfil_selec==true){

				return <PerfilPaciente id_paciente={this.state.id_cliente} IdDoctor={this.state.id_doctor}nombre="oye esto es un nombre cabron" />;

		}else if(this.state.perfil_selec=="agregar_citas"){

			return <AgregarCita paciente={this.state.nombre_paciente} id_paciente={this.state.id_cliente}/>;

		}else if(this.state.clientes==""){
			/*
		return (<div className="col-md-8">
					<br/><strong>Buscar paciente</strong>
					<input type="text" className="form-control" id="buscar_paciente" onChange={this.buscarPaciente} />
					<br/><div className="card">
							<h4>Este paciente no existe</h4>
					</div>
					<img src={Loading}/>
				</div>
				);
					*/
		}else if(this.state.perfil_selec=="actualizar_paciente"){

				return <ActualizarPerfil IdPaciente={this.state.id_paciente}/>;
		}



		return (<div className="col-md-8"><br/><br/>
					<h3>Buscar paciente</h3><br/>
					<input type="text" className="form-control" id="buscar_paciente" onChange={this.buscarPaciente} />
					<div className="interfaz_cliente">
					<br/>
					{
						this.state.clientes.map(data=>(
							<div>
							<div className="card">
								<div className="container"><br/>
									<img src={Logo} width="30"/>
									<p>{data.nombre} {data.apellido} {this.state.perfil_select}</p><hr/>
									<button className="btn btn-secondary" onClick={()=>this.cargar(data.id,data.id_doctor)}>Ver perfil</button>&nbsp;
									<button className="btn btn-secondary" onClick={()=>this.asignar_cita(data.id,data.nombre)}>Asignar Cita</button>&nbsp;
									<button className="btn btn-secondary" onClick={()=>this.actualizar_paciente(data.id)}>Actualizar</button>

								</div>
							</div><br/>
							</div>

						))


					
					}
				</div>
				


				</div>);


	}


}

export default Cita;