import React from 'react';
import ReactDOM from 'react-dom';
import Axios from 'axios';
import '../css/bootstrap.css';
import '../css/dashboard.css';
import Logo from '../logo.jpg';
import Loading from '../loading.gif';
import PerfilPaciente from './perfil_paciente';
import AgregarCita from './agregar_cita';
import Url from './funciones_extras';
import ActualizarPerfil from './actualizar_paciente';
import alertify from 'alertifyjs';

class  Cita extends React.Component{

	constructor(props){
		super(props);
		this.id_paciente=0;
		this.state ={perfil_selec:false,
					id_doctor:0,
					nombre_paciente:"",
					clientes:[
						  
					    ],
						id_paciente:0,
						estado_busqueda:"paciente_por_nombre"
					};
	}


	componentDidMount(){

		this.cargar_citas();
	}

	CheckSeleccion=()=>{

		let busqueda = document.getElementById("select_busqueda").value;
	
		if(busqueda=="paciente_por_nombre"){

			alertify.message("Has seleccionado búsqueda por nombre");
			this.setState({estado_busqueda:"paciente_por_nombre"});


		}else if(busqueda=="paciente_por_telefono"){
			
			alertify.message("Has seleccionado búsqueda por teléfono");
			this.setState({estado_busqueda:"paciente_por_telefono"});

		}else if(busqueda=="paciente_por_procedimiento"){

			alertify.message("Has seleccionado búsqueda por procedimiento");
			this.setState({estado_busqueda:"paciente_por_procedimiento"});

		}else if(busqueda=="paciente_por_apellido"){

			alertify.message("Has seleccionado búsqueda por apellido");
			this.setState({estado_busqueda:"paciente_por_apellido"});
		
		}else{

			alertify.message("Has seleccionado búsqueda por cedula");
			this.setState({estado_busqueda:"paciente_por_cedula"});

		}

		

	}


	 cargar_citas(token)
	{
		
	
		

		let config = {
			headers: {
			  'Authorization': 'Bearer '+localStorage.getItem('token'),
			  'content-type': 'application/json'
			}
		  }

		 Axios.get(`${Url.url_base}/api/paciente`)
		  .then(res => {
			 // console.log(res.data);
			 this.setState({clientes:res.data});
		  }).catch(error=>{

				console.log(error);
				this.cargar_citas();
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

	leer_deuda(deuda){

		
		if(deuda>0){
			
			return {color:"#ef0808"}
		
		}else{

			return {color:"#6096e6"}

		}

		
	}


	render(){
		//let cargar_deudas =<td id={"interfaz"+data.id}>Url.Consultar_deuda_de_paciente(data.id)</td>;


		if(this.state.perfil_selec==true){

				return <PerfilPaciente id_paciente={this.state.id_cliente} IdDoctor={this.state.id_doctor}nombre="oye esto es un nombre cabron" />;

		}else if(this.state.perfil_selec=="agregar_citas"){

			return <AgregarCita paciente={this.state.nombre_paciente} id_paciente={this.state.id_cliente}/>;

		}else if(this.state.clientes==""){
		
				console.log("no hay resultados de este paciente");

		}else if(this.state.perfil_selec=="actualizar_paciente"){

				return <ActualizarPerfil IdPaciente={this.state.id_paciente}/>;
		}


		return (<div className="col-md-10"><br/><br/>
					<h3>Buscar paciente</h3><br/>
					<input type="text" placeholder="Buscar paciente" className="form-control" id="buscar_paciente" onChange={this.buscarPaciente} />
					<hr/>
					<div className="interfaz_cliente">
					<table className='table table-hover'>
					<thead>
					<tr className="fijar_columnas">
						<th  scope="col">Nombre</th>
						<th  scope="col">Apellido</th>
						<th  scope="col">Cedula</th>
						<th  scope="col">Telefono</th>
						<th  scope="col">Deuda</th> 
						<th  scope="col">Ver Perfil</th>
						<th  scope="col">Asignar Cita</th>
						<th  scope="col">Actualizar</th>
					</tr>
					</thead>
					{
						this.state.clientes.map(data=>(
							
							<tbody>
							<tr>
								<td>{data.nombre}</td>
								<td>{data.apellido}</td>
								<td>{data.cedula}</td>
								<td>{data.telefono}</td> 
								<td><p style={this.leer_deuda(data.estatus_precio_estatus_sum)}>${new Intl.NumberFormat().format(data.estatus_precio_estatus_sum)}</p></td>
								<td><button className="btn btn-secondary" onClick={()=>this.cargar(data.id,data.id_doctor)}>Ver perfil</button>&nbsp;</td>
								<td><button className="btn btn-secondary" onClick={()=>this.asignar_cita(data.id,data.nombre)}>Asignar Cita</button>&nbsp;</td>
								<td><button className="btn btn-secondary" onClick={()=>this.actualizar_paciente(data.id)}>Actualizar</button></td>
							</tr>
							</tbody>
						))


					
					}
					</table>
				</div>
				


				</div>);


	}


}

export default Cita;