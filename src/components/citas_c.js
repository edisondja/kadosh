import React from 'react';
import ReactDOM from 'react-dom';
import Axios from 'axios';
import '../css/bootstrap.css';
import Logo from '../logo.jpg';
import PerfilPaciente from './perfil_paciente';
import AgregarCita from './agregar_cita';
class  Cita extends React.Component{

	constructor(props){
		super(props);
		this.id_paciente=0;
		this.state ={perfil_selec:false,
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
			Axios.get("http://localhost:8000/api/paciente").then(data=>{
			    this.setState({clientes:data.data});
			}).catch(error=>{
					console.log(error);
			});
	}

	asignar_cita=(id,nombre)=>{

		this.setState({perfil_selec:'agregar_citas',id_cliente:id,nombre_paciente:nombre});
	}

	buscarPaciente=(e)=>{

		Axios.get(`http://localhost:8000/api/buscar_paciente/${e.target.value}`).then(data=>{
			this.setState({clientes:data.data});
		}).catch(error=>{
				console.log(error);
		});


	}

	cargar=(id)=>{


				this.setState({perfil_selec:true,id_cliente:id});

	}


	render(){

		if(this.state.perfil_selec==true){

				return <PerfilPaciente id_paciente={this.state.id_cliente} nombre="oye esto es un nombre cabron" />;

		}else if(this.state.perfil_selec=="agregar_citas"){

			return <AgregarCita paciente={this.state.nombre_paciente} id_paciente={this.state.id_cliente}/>;

		}

		return (<div className="col-md-8"><br/>
					<strong>Buscar paciente</strong><br/>
					<input type="text" className="form-control" id="buscar_paciente" onChange={this.buscarPaciente} />
					<br/>
					{
						this.state.clientes.map(data=>(
							<div>
							<div className="card">
								<div className="container"><br/>
									<img src={Logo} width="30"/>
									<p>{data.nombre} {data.apellido} {this.state.perfil_select}</p>
									<button className="btn-primary" onClick={()=>this.cargar(data.id)}>Ver perfil</button>
									<button className="btn-success" onClick={()=>this.asignar_cita(data.id,data.nombre)}>Asignar Cita</button>
								</div>
							</div><br/>
							</div>

						))


					
					}
				


				</div>);


	}


}

export default Cita;