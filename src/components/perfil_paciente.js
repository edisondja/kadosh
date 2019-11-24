import React from 'react';
import ReactDOM from 'react-dom';
import Alertify from 'alertifyjs';
import Axios from 'axios';
import '../css/dashboard.css';
import AgregarFactura from './agregando_factura';
class PerfilPaciente extends React.Component{

		constructor(props){
			super(props);
			this.state={paciente:{nombre:null,apellido:null},select:false}


		}
		componentDidMount(){

			//alert(this.props.id_paciente);
			this.consultarPaciente(this.props.id_paciente);
		}

		consultarPaciente=(id)=>{

			Axios.get(`http://localhost:8000/api/paciente/${id}`).then(data=>{

				this.setState({paciente:data.data});

			}).catch(error=>{

				Alertify.error(`${error}`);
			});


		}

		cargar_procedimientos(){

			
		}
		
		agregar_factura=()=>{

			this.setState({select:'agregando_factura'})
		}

		render(){
				if(this.state.select=='agregando_factura'){
					return <AgregarFactura IDpaciente={this.props.id_paciente}/>;
				}

				return (<div className="col-md-8">
							<h1>Perfil de paciente</h1><br/>
							<strong>Nombre: {this.state.paciente.nombre} {this.state.paciente.apellido}</strong><br/>
							<strong>Cedula: {this.state.paciente.cedula}</strong><br/>
							<strong>Ingrasado por el Dr: Naiel Sanchez</strong><br/><hr/>
							<button className="btn btn-primary espacio" onClick={this.agregar_factura}>Agregar Factura</button><button className="btn btn-info espacio">Ver Facturas</button><button className="btn btn-danger espacio">Eliminar Paciente</button>

						</div>);
		}










}

export default PerfilPaciente;