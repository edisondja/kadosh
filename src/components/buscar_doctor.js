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
			this.state= {
				estado:true,
				doctores:[],
				doctoresTodos:[],
				opcion:null,
				id_select:0
			};
				this.buscarTimeout = null;
		}

		
		componentDidMount(){
			// Cargar todos los doctores (incluyendo inactivos) para administración
			this.cargar_todos_doctores();
		}

		cargar_todos_doctores(){
			// Para gestión de doctores, necesitamos ver TODOS (activos e inactivos)
			// para poder activar los desactivados
			if (this._cargandoDoctores) {
				return;
			}

			this._cargandoDoctores = true;

			// Usar /api/doctores_todos para ver todos los doctores (activos e inactivos)
			Axios.get(`${cargar_doctores.url_base}/api/doctores_todos`).then(data=>{
				const doctores = Array.isArray(data.data) ? data.data : [];
				this.setState({
					doctores: doctores,
					doctoresTodos: doctores // También actualizar doctoresTodos para la búsqueda
				});
				this._cargandoDoctores = false;
			}).catch(error=>{
				console.error("Error al cargar doctores:", error);
				// Si falla doctores_todos, intentar con doctores activos como fallback
				Axios.get(`${cargar_doctores.url_base}/api/doctores`).then(data=>{
					const doctores = Array.isArray(data.data) ? data.data : [];
					this.setState({
						doctores: doctores,
						doctoresTodos: doctores
					});
					this._cargandoDoctores = false;
				}).catch(error2=>{
					console.error("Error al cargar doctores activos:", error2);
					this.setState({
						doctores: [],
						doctoresTodos: []
					});
					this._cargandoDoctores = false;
				});
			});
		}

		componentWillUnmount(){
			// Limpiar timeout al desmontar
			if (this.buscarTimeout) {
				clearTimeout(this.buscarTimeout);
			}
		}

		buscar_doctor=(e)=>{
			var nombre_doctor = e.target.value;
			
			// Limpiar timeout anterior
			if (this.buscarTimeout) {
				clearTimeout(this.buscarTimeout);
			}

			// Si el campo está vacío, mostrar todos los doctores
			if (!nombre_doctor || nombre_doctor.trim() === '') {
				this.setState({doctores: this.state.doctoresTodos || []});
				return;
			}

			// Búsqueda del lado del cliente (más rápido y funciona con todos los doctores)
			this.buscarTimeout = setTimeout(() => {
				const busqueda = nombre_doctor.trim().toLowerCase();
				const todosDoctores = this.state.doctoresTodos || [];
				
				if (todosDoctores.length === 0) {
					console.log('No hay doctores cargados para buscar');
					return;
				}

				const doctoresFiltrados = todosDoctores.filter(doctor => {
					if (!doctor) return false;
					
					const nombre = (doctor.nombre || '').toLowerCase().trim();
					const apellido = (doctor.apellido || '').toLowerCase().trim();
					const nombreCompleto = `${nombre} ${apellido}`.trim();
					const dni = (doctor.dni || '').toLowerCase().trim();
					
					return nombreCompleto.includes(busqueda) || 
						   nombre.includes(busqueda) ||
						   apellido.includes(busqueda) ||
						   dni.includes(busqueda);
				});
				
				console.log(`Buscando: "${busqueda}", Encontrados: ${doctoresFiltrados.length} de ${todosDoctores.length}`);
				this.setState({doctores: doctoresFiltrados});
			}, 300);
		}


		activar_doctor(id){
			alertify.confirm("¿Deseas activar este doctor?", ()=>{
				Axios.post(`${cargar_doctores.url_base}/api/activar_doctor`, {
					id_doctor: id
				}).then(data=>{
					alertify.success("Doctor activado correctamente");
					// Recargar lista
					this._cargandoDoctores = false;
					this.cargar_todos_doctores();
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
					// Recargar lista
					this._cargandoDoctores = false;
					this.cargar_todos_doctores();
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
			alertify.confirm("Seguro que deseas eliminar este doctor?", ()=>{
				Axios.get(`${cargar_doctores.url_base}/api/eliminar_doctor/${id}`).then(data=>{
					alertify.success("Registro borrado con éxito");
					// Recargar lista
					this._cargandoDoctores = false;
					this.cargar_todos_doctores();
				}).catch(error=>{
					alertify.error("No se pudo eliminar este doctor");
					console.error(error);
				});
			});
		}

		render(){


			if(this.state.opcion=="actualizar_doctor"){

				return  <ActualizarDoctor id_doctor={this.state.id_select}/>;
			}
			
			return (
						<div className="container py-5" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
							<div className="col-md-11 mx-auto">
								{/* Header con gradiente */}
								<div className="card border-0 shadow-lg mb-4" style={{ 
									background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
									borderRadius: '20px',
									overflow: 'hidden'
								}}>
									<div className="card-body text-white p-4">
										<div className="d-flex align-items-center">
											<div style={{
												width: '60px',
												height: '60px',
												borderRadius: '15px',
												background: 'rgba(255,255,255,0.2)',
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												marginRight: '20px',
												fontSize: '28px'
											}}>
												<i className="fas fa-user-md"></i>
											</div>
											<div>
												<h2 className="mb-0" style={{ fontWeight: 700, fontSize: '32px' }}>
													Gestión de Doctores
												</h2>
												<p className="mb-0" style={{ opacity: 0.9, fontSize: '14px' }}>
													Busca y administra los doctores del sistema
												</p>
											</div>
										</div>
									</div>
								</div>

								{/* Campo de búsqueda mejorado */}
								<div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
									<div className="card-body p-4">
										<div style={{ position: 'relative' }}>
											<div style={{
												position: 'absolute',
												left: '15px',
												top: '50%',
												transform: 'translateY(-50%)',
												zIndex: 10,
												color: '#667eea',
												fontSize: '18px'
											}}>
												<i className="fas fa-search"></i>
											</div>
											<input
												type="text"
												className="form-control"
												onChange={this.buscar_doctor}
												id="doctor_nombre"
												placeholder="Escribe el nombre del doctor para buscar..."
												style={{
													fontSize: "16px",
													border: '2px solid #e0e0e0',
													borderRadius: '12px',
													padding: '14px 20px 14px 50px',
													transition: 'all 0.3s ease',
													width: '100%',
													boxSizing: 'border-box'
												}}
												onFocus={(e) => {
													e.target.style.borderColor = '#667eea';
													e.target.style.boxShadow = '0 0 0 0.2rem rgba(102, 126, 234, 0.25)';
												}}
												onBlur={(e) => {
													e.target.style.borderColor = '#e0e0e0';
													e.target.style.boxShadow = 'none';
												}}
											/>
										</div>
										{this.state.doctores.length > 0 && (
											<small className="text-muted mt-2 d-block">
												<i className="fas fa-info-circle me-1"></i>
												{this.state.doctores.length} {this.state.doctores.length === 1 ? 'doctor encontrado' : 'doctores encontrados'}
											</small>
										)}
									</div>
								</div>

								{/* Lista de doctores mejorada */}
								{this._cargandoDoctores && this.state.doctoresTodos.length === 0 ? (
									<div className="card border-0 shadow-sm text-center" style={{ borderRadius: '16px' }}>
										<div className="card-body p-5">
											<div className="spinner-border text-primary mb-3" role="status">
												<span className="sr-only">Cargando...</span>
											</div>
											<h5 className="text-muted mb-2">Cargando doctores...</h5>
										</div>
									</div>
								) : this.state.doctores.length === 0 ? (
									<div className="card border-0 shadow-sm text-center" style={{ borderRadius: '16px' }}>
										<div className="card-body p-5">
											<i className="fas fa-user-md fa-4x text-muted mb-3" style={{ opacity: 0.3 }}></i>
											<h5 className="text-muted mb-2">No se encontraron doctores</h5>
											<p className="text-muted mb-0" style={{ fontSize: '14px' }}>
												{this.state.doctoresTodos.length === 0 
													? 'No hay doctores registrados en el sistema' 
													: 'Intenta con otro término de búsqueda'}
											</p>
										</div>
									</div>
								) : (
									<div className="row">
										{this.state.doctores.map((data) => (
											<div className="col-md-6 col-lg-4 mb-4" key={data.id}>
												<div
													className="card border-0 shadow-sm h-100"
													style={{
														borderRadius: "16px",
														backgroundColor: "#fff",
														transition: "all 0.3s ease",
														overflow: 'hidden',
														border: '1px solid #f0f0f0'
													}}
													onMouseEnter={(e) => {
														e.currentTarget.style.transform = 'translateY(-5px)';
														e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.15)';
													}}
													onMouseLeave={(e) => {
														e.currentTarget.style.transform = 'translateY(0)';
														e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
													}}
												>
													{/* Header de la tarjeta */}
													<div style={{
														background: data.estado === true || data.estado === 1 
															? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
															: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)',
														padding: '20px',
														textAlign: 'center'
													}}>
														<div style={{
															width: '80px',
															height: '80px',
															borderRadius: '50%',
															background: 'rgba(255,255,255,0.2)',
															display: 'inline-flex',
															alignItems: 'center',
															justifyContent: 'center',
															marginBottom: '10px',
															fontSize: '36px',
															color: 'white'
														}}>
															<i className="fas fa-user-md"></i>
														</div>
														<h5 className="text-white mb-1" style={{ fontWeight: 600, fontSize: '18px' }}>
															Dr. {data.nombre} {data.apellido}
														</h5>
														{data.estado === true || data.estado === 1 ? (
															<span className="badge bg-light text-success" style={{ 
																padding: '6px 12px',
																fontSize: '12px',
																fontWeight: 600
															}}>
																<i className="fas fa-check-circle me-1"></i>Activo
															</span>
														) : (
															<span className="badge bg-light text-secondary" style={{ 
																padding: '6px 12px',
																fontSize: '12px',
																fontWeight: 600
															}}>
																<i className="fas fa-pause-circle me-1"></i>Inactivo
															</span>
														)}
													</div>

													{/* Body de la tarjeta */}
													<div className="card-body p-4">
														{data.especialidad && (
															<div className="mb-3">
																<small className="text-muted d-block mb-1" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
																	<i className="fas fa-graduation-cap me-1"></i>Especialidad
																</small>
																<span className="badge bg-light text-dark" style={{ 
																	padding: '6px 12px',
																	fontSize: '12px'
																}}>
																	{data.especialidad}
																</span>
															</div>
														)}
														{data.numero_telefono && (
															<div className="mb-3">
																<small className="text-muted d-block mb-1" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
																	<i className="fas fa-phone me-1"></i>Teléfono
																</small>
																<span style={{ fontSize: '14px', color: '#495057' }}>
																	{data.numero_telefono}
																</span>
															</div>
														)}
														{data.dni && (
															<div className="mb-3">
																<small className="text-muted d-block mb-1" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
																	<i className="fas fa-id-card me-1"></i>Cédula
																</small>
																<span style={{ fontSize: '14px', color: '#495057' }}>
																	{data.dni}
																</span>
															</div>
														)}

														{/* Estado del usuario */}
														{data.usuario && (
															<div className="mb-3">
																<small className="text-muted d-block mb-1" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
																	<i className="fas fa-user me-1"></i>Usuario
																</small>
																<span className="badge bg-success text-white" style={{ 
																	padding: '6px 12px',
																	fontSize: '12px'
																}}>
																	<i className="fas fa-check-circle me-1"></i>{data.usuario}
																</span>
															</div>
														)}

														{/* Botones de acción */}
														<hr style={{ margin: '20px 0', borderColor: '#f0f0f0' }} />
														<div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
															<button
																className="btn btn-sm"
																onClick={() => this.actualizar_doctor(data.id)}
																style={{
																	background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
																	color: 'white',
																	border: 'none',
																	borderRadius: "8px",
																	padding: "10px 16px",
																	fontWeight: 500,
																	fontSize: '13px',
																	width: '100%',
																	transition: 'all 0.2s ease'
																}}
																onMouseEnter={(e) => {
																	e.target.style.transform = 'translateY(-2px)';
																	e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
																}}
																onMouseLeave={(e) => {
																	e.target.style.transform = 'translateY(0)';
																	e.target.style.boxShadow = 'none';
																}}
															>
																<i className="fas fa-edit me-1"></i>Actualizar
															</button>
															<div style={{ display: 'flex', gap: '10px' }}>
																{data.estado === true || data.estado === 1 ? (
																	<button
																		className="btn btn-sm btn-warning text-white"
																		onClick={() => this.desactivar_doctor(data.id)}
																		style={{
																			borderRadius: "8px",
																			padding: "10px 16px",
																			fontWeight: 500,
																			fontSize: '13px',
																			flex: 1,
																			border: 'none',
																			transition: 'all 0.2s ease'
																		}}
																		onMouseEnter={(e) => {
																			e.target.style.transform = 'translateY(-2px)';
																			e.target.style.boxShadow = '0 4px 12px rgba(255, 193, 7, 0.3)';
																		}}
																		onMouseLeave={(e) => {
																			e.target.style.transform = 'translateY(0)';
																			e.target.style.boxShadow = 'none';
																		}}
																	>
																		<i className="fas fa-pause me-1"></i>Desactivar
																	</button>
																) : (
																	<button
																		className="btn btn-sm btn-success"
																		onClick={() => this.activar_doctor(data.id)}
																		style={{
																			borderRadius: "8px",
																			padding: "10px 16px",
																			fontWeight: 500,
																			fontSize: '13px',
																			flex: 1,
																			border: 'none',
																			transition: 'all 0.2s ease'
																		}}
																		onMouseEnter={(e) => {
																			e.target.style.transform = 'translateY(-2px)';
																			e.target.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.3)';
																		}}
																		onMouseLeave={(e) => {
																			e.target.style.transform = 'translateY(0)';
																			e.target.style.boxShadow = 'none';
																		}}
																	>
																		<i className="fas fa-play me-1"></i>Activar
																	</button>
																)}
																<button
																	className="btn btn-sm btn-danger"
																	onClick={() => this.eliminar_doctor(data.id)}
																	style={{
																		borderRadius: "8px",
																		padding: "10px 16px",
																		fontWeight: 500,
																		fontSize: '13px',
																		flex: 1,
																		border: 'none',
																		transition: 'all 0.2s ease'
																	}}
																	onMouseEnter={(e) => {
																		e.target.style.transform = 'translateY(-2px)';
																		e.target.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.3)';
																	}}
																	onMouseLeave={(e) => {
																		e.target.style.transform = 'translateY(0)';
																		e.target.style.boxShadow = 'none';
																	}}
																>
																	<i className="fas fa-trash me-1"></i>Eliminar
																</button>
															</div>
														</div>
													</div>
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
						);



		}



}

export default BuscarDoctor;