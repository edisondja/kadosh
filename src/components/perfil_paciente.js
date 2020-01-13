import React from 'react';
import ReactDOM from 'react-dom';
import Alertify from 'alertifyjs';
import Axios from 'axios';
import '../css/dashboard.css';
import AgregarFactura from './agregando_factura';
import AgregarCita from './agregar_cita';
import VerFacturas from './ver_facturas';
import Verficar from './funciones_extras';

class PerfilPaciente extends React.Component{

		constructor(props){
			super(props);
			this.state={deuda_total:0,doctor:{nombre:'Noelia',apellido:'Felix'},paciente:{nombre:null,apellido:null},select:false,lista_citas:[],cita:"",id_cita:"",eliminar:0};
		}
		componentDidMount(){

			//alert(this.props.id_paciente);
			this.consultarPaciente(this.props.id_paciente);
			this.cargar_citas_paciente(this.props.id_paciente);
			Verficar.cargar_doctor(this.state,this.state.paciente.id_doctor);
			this.consultar_deuda_paciente(this.props.id_paciente);
		}

		consultar_deuda_paciente(id_paciente){
			
					Axios.get(`${Verficar.url_base}/api/consultar_deuda/${id_paciente}`).then(data=>{
							this.setState({deuda_total:data.data.deuda_total});
					}).catch(error=>{
						Alertify.error("No se pudo cargar la deuda del paciente");
					})
	    }
		eliminar_paciente(id_paciente){

			Alertify.prompt("Eliminar paciente","Digite su clave admin para eliminar este paciente","",function(event,value){
				if(Verficar.password==value){
					Alertify.success("contraseña correcta!");
					Axios.get(`${Verficar.url_base}/api/borrar_paciente/${id_paciente}`).then(data=>{
							Alertify.success("Paciente eliminado con exito");
							document.getElementById("agregar_paciente").click();
					}).catch(error=>{
							Alertify.error("No se pudo eliminar el paciente");
					});
				}
			},function(error){

			}).set("type","password");

		}
		
		cargar_citas_paciente=(id_paciente)=>{

			Axios.get(`${Verficar.url_base}/api/cargar_citas_de_paciente/${id_paciente}`).then(data=>{

			this.setState({lista_citas:data.data});
				console.log(data.data);


			}).catch(error=>{
				Alertify.error("error no se pudo cargar las citas");		
			});

		}

		consultarPaciente=(id)=>{

			Axios.get(`${Verficar.url_base}/api/paciente/${id}`).then(data=>{

				this.setState({paciente:data.data});

			}).catch(error=>{

				Alertify.error(`${error}`);
			});


		}

		eliminar_cita(id){
			
			Alertify.confirm("Eliminar esta cita","Segur@ que deseas eliminar esta cita?",function(){

				Axios.get(`${Verficar.url_base}/api/eliminar_cita/${id}`).then(data=>{
							Alertify.success("cita eliminada correctamente");
							document.getElementById("cargar_pacientes").click();
	
				}).catch(error=>{
					Alertify.success("Error al eliminar la cita");
				})

			},function(){
					Alertify.message("BYE");
			});
		
		}

		ver_facturas=()=>{

			this.setState({select:'ver_facturas'});
		}

		cargar_cita=(id)=>{
			//alert("entro");
			Axios.get(`${Verficar.url_base}/api/cargar_cita/${id}`).then(data=>{
				this.setState({cita:data.data,select:'editando_cita',id_cita:id},()=>{
						document.getElementById("hora").value= data.data.hora;
						document.getElementById("dia").value= data.data.dia;
				});
			}).catch(error=>{
				return error;
			});

		}


		agregar_factura=()=>{

			this.setState({select:'agregando_factura'})
		}

		render(){
				if(this.state.select=='agregando_factura'){
						return <AgregarFactura IDpaciente={this.props.id_paciente}/>;
				}else if(this.state.select=='editando_cita'){

						return <AgregarCita config="actualizar" id_cita={this.state.id_cita} />

				}else if(this.state.select=="ver_facturas"){

					return <VerFacturas id_paciente={this.props.id_paciente} paciente={this.state.paciente.nombre}/>;

				}

				return (<div className="col-md-8">
							<h1>Perfil de paciente</h1><br/>
							<div className="interfaz_perfil">
							<table class="table">
								<thead>
									<tr>
									<th scope="col">Nombre</th>
									<th scope="col">Cedula</th>
									<th scope="col">Telefono</th>
									<th scope="col">Ingreso</th>
									<th scope="col">Doctor</th>
									<th scope="col">Deuda Tatal</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td>{this.state.paciente.nombre} {this.state.paciente.apellido}</td>
										<td>{this.state.paciente.cedula}</td>
										<td>{this.state.paciente.telefono}</td>
										<td>{this.state.paciente.fecha_de_ingreso}</td>
										<td>{this.state.doctor.nombre} {this.state.doctor.apellido}</td>
										<td>$RD {this.state.deuda_total}</td>		
									</tr>
								</tbody>
							</table>
							</div>
							<hr/>
							<button className="btn btn-primary espacio" onClick={this.agregar_factura}>Agregar Factura</button><button className="btn btn-info espacio" onClick={this.ver_facturas}>Ver Facturas</button><button className="btn btn-danger espacio boton_perfil" onClick={()=>this.eliminar_paciente(this.state.paciente.id)}>Eliminar Paciente</button>
							<hr/>
							<strong>Lista de citas</strong>
							{
								this.state.lista_citas.map(data=>(

										<div className="card">
											<div className="card-body">
												<strong>Hora : {data.hora}  Dia : {data.dia}  </strong>
												<button className="btn-info" onClick={()=>this.cargar_cita(data.id)}>Editar</button>
												<button className="btn-primary" onClick={()=>this.eliminar_cita(data.id)}>Eliminar</button>
											</div>
										</div>
									
								))



							}
						</div>);
		}










}

export default PerfilPaciente;