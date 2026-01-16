import React from 'react';
import ReactDOM from 'react-dom';
import '../css/dashboard.css';
import Axios from 'axios';
import ActualizarDoctor from './actualizando_doctor';
import { BrowserRouter, Route} from 'react-router-dom';
import cargar_doctores from './funciones_extras';

import alertify from 'alertifyjs';

const estilo_botones = {

	marginLeft:'75%',
	marginTop:'5px'
}



class BuscarDoctor extends React.Component{

		constructor(props){
				super(props);
				this.state= {estado:true,doctores:[{nombre:"Alex"},{nombre:"Noelia"},{nombre:"Naiel"}],opcion:null,id_select:0};
		}

		
		componentDidMount(){

				cargar_doctores.cargar_doctores(this);
		}

		buscar_doctor=(e)=>{

			var nombre_doctor =  e.target.value;
			
			Axios.get(`${cargar_doctores.url_base}/api/buscando_doctor/${nombre_doctor}`).then(data=>{
					
						this.setState({doctores:data.data});		
			});
		}	

		cargar_doctores(){
				// Cargar todos los doctores (incluyendo inactivos) para administración
				Axios.get(`${cargar_doctores.url_base}/api/doctores_todos`).then(data=>{

					this.setState({doctores:data.data})

				}).catch(error=>{

					console.log(error);

				})


		}

		activar_doctor(id){
			alertify.confirm("¿Deseas activar este doctor?", ()=>{
				Axios.post(`${cargar_doctores.url_base}/api/activar_doctor`, {
					id_doctor: id
				}).then(data=>{
					alertify.success("Doctor activado correctamente");
					this.cargar_doctores(); // Recargar lista
				}).catch(error=>{
					alertify.error("No se pudo activar el doctor");
					console.error(error);
				});
			});
		}

		desactivar_doctor(id){
			alertify.confirm("¿Deseas desactivar este doctor? No aparecerá en los filtros de facturas.", ()=>{
				Axios.post(`${cargar_doctores.url_base}/api/desactivar_doctor`, {
					id_doctor: id
				}).then(data=>{
					alertify.success("Doctor desactivado correctamente");
					this.cargar_doctores(); // Recargar lista
				}).catch(error=>{
					alertify.error("No se pudo desactivar el doctor");
					console.error(error);
				});
			});
		}

		actualizar_doctor=(id)=>{

			this.setState({opcion:"actualizar_doctor",id_select:id});
		

		}

		eliminar_doctor(id){

			alertify.confirm("Seguro que deseas eliminar este doctor?",function(){

				Axios.get(`${cargar_doctores.url_base}/api/eliminar_doctor/${id}`).then(data=>{

					alertify.message("Registro borrado con exito");

				}).catch(error=>{
					
					alertify.error("No se pudo eliminar este doctor");
				})


			},function(){

			});

		}

		render(){


			if(this.state.opcion=="actualizar_doctor"){

				return  <ActualizarDoctor id_doctor={this.state.id_select}/>;
			}
			
			return (
						<div className="container py-5">
							<div className="col-md-10 mx-auto">
							<h2 className="mb-4 text-center" style={{ fontWeight: 300, color: "#555" }}>
								Buscar Doctor
							</h2>

							<input
								type="text"
								className="form-control form-control-lg rounded-4 shadow-sm px-4"
								onChange={this.buscar_doctor}
								id="doctor_nombre"
								placeholder="🔍 Escribe el nombre del doctor..."
								style={{
								fontSize: "1.1rem",
								border: "1px solid #ddd",
								backgroundColor: "#f9f9f9",
								}}
							/>

							<div className="buscar_doctor mt-5">
								{this.state.doctores.map((data) => (
								<div className="mb-4" key={data.id}>
									<div
									className="card border-0 shadow-sm"
									style={{
										borderRadius: "20px",
										backgroundColor: "#fff",
										transition: "all 0.3s",
									}}
									>
									<div className="card-body">
										<h5
										className="mb-3"
										style={{
											fontWeight: 500,
											color: "#333",
											borderBottom: "1px solid #eee",
											paddingBottom: "10px",
										}}
										>
										{data.nombre} {data.apellido}
										</h5>

										<div className="d-flex justify-content-between align-items-center">
											<div>
												{data.estado === true || data.estado === 1 ? (
													<span className="badge bg-success">Activo</span>
												) : (
													<span className="badge bg-secondary">Inactivo</span>
												)}
											</div>
											<div>
												<button
													className="btn btn-outline-primary"
													onClick={() => this.actualizar_doctor(data.id)}
													style={{
													borderRadius: "12px",
													padding: "8px 20px",
													fontWeight: 500,
													marginRight: "10px",
													}}
												>
													✏️ Actualizar
												</button>
												{data.estado === true || data.estado === 1 ? (
													<button
														className="btn btn-outline-warning"
														onClick={() => this.desactivar_doctor(data.id)}
														style={{
														borderRadius: "12px",
														padding: "8px 20px",
														fontWeight: 500,
														marginRight: "10px",
														}}
													>
														⏸️ Desactivar
													</button>
												) : (
													<button
														className="btn btn-outline-success"
														onClick={() => this.activar_doctor(data.id)}
														style={{
														borderRadius: "12px",
														padding: "8px 20px",
														fontWeight: 500,
														marginRight: "10px",
														}}
													>
														▶️ Activar
													</button>
												)}
												<button
													className="btn btn-outline-danger"
													onClick={() => this.eliminar_doctor(data.id)}
													style={{
													borderRadius: "12px",
													padding: "8px 20px",
													fontWeight: 500,
													}}
												>
													🗑️ Eliminar
												</button>
											</div>
										</div>
									</div>
									</div>
								</div>
								))}
							</div>
							</div>
						</div>
						);



		}



}

export default BuscarDoctor;