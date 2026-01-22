import React from 'react';
import ReactDOM from 'react-dom';
import Citas from './citas_c';
import Axios from 'axios';
import FuncionesExtras from './funciones_extras';
import alertify from 'alertifyjs';
import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'
import flags from 'react-phone-number-input/flags'
import doFlag from '../assets/flags/do.svg';

class PacienteAdmin extends  React.Component{

	constructor(props){
			super(props);
			this.state={
				estados:true,ver_paciente:false,doctores:[],
				boton_estado:true,
				telefono:'',
				customFlags: {
					DO: doFlag
				},
				nombre: '',
				nombre_tutor: '',
				apellido: '',
				cedula: '',
				fecha_nacimiento: '',
				correo_electronico: '',
				fecha_nacimiento:'',
				sexo: 'm',
				enfermedades: '',
				observaciones: '',
				es_pediatrico: 'no'
			};

	}

	componentDidMount(){
			FuncionesExtras.cargar_doctores(this);

		
	}

	ver_pacientes(){

			document.getElementById("cargar_pacientes").click();
	}

	seleccionar_doctor=()=>{

		let doctores = document.getElementById("doctores_select").value;
		if(doctores!=="seleccionar"){
		this.setState({boton_estado:false});
		}else{
			this.setState({boton_estado:true});

		}
	}
	handleChange = (event) => {
		const { name, value } = event.target;
		this.setState({ [name]: value });
	}

	capturar_telefono = (telefono) => {

		this.setState({ telefono });

	 }

	guardar_paciente=()=>{
		

				var formData = new FormData();
				var imagefile = document.querySelector('#foto_paciente');
				if(imagefile.files.length>0){
					formData.append("foto_paciente", imagefile.files[0]);
				}
				//SE AGREGAN LOS DEMÁS DATOS AL FORM DATA

				formData.append("nombre",this.state.nombre);
				formData.append("apellido",this.state.apellido);
				formData.append("cedula",this.state.cedula);
				formData.append("telefono",this.state.telefono);
				formData.append("id_doctor",document.getElementById("doctores_select").value);
				formData.append("nombre_tutor",this.state.nombre_tutor);
				formData.append("fecha_nacimiento",this.state.fecha_nacimiento);
				formData.append("correo_electronico",this.state.correo_electronico);
				formData.append("sexo",this.state.sexo);
			
			Axios.post(`${FuncionesExtras.url_base}/api/guardar_paciente`,formData).then(data=>{
					document.getElementById("cargar_pacientes").click();
					this.setState({boton_estado:true});
			}).catch(error=>{

					alert("error");
			})

			
	
	}

	render(){

		return (
			<div className="col-md-10" style={{ padding: '20px', minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
				<style>{`
					@keyframes fadeIn {
						from { opacity: 0; transform: translateY(-10px); }
						to { opacity: 1; transform: translateY(0); }
					}
					@keyframes slideUp {
						from { opacity: 0; transform: translateY(20px); }
						to { opacity: 1; transform: translateY(0); }
					}
				`}</style>

				{/* Header */}
				<div className="card border-0 shadow-lg mb-4" style={{ 
					borderRadius: '16px',
					background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
					overflow: 'hidden',
					animation: 'fadeIn 0.5s ease'
				}}>
					<div className="card-body text-white p-4">
						<div className="d-flex justify-content-between align-items-center">
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
									<i className="fas fa-user-plus"></i>
								</div>
								<div>
									<h2 className="mb-0" style={{ fontWeight: 700, fontSize: '28px' }}>
										Agregar Paciente
									</h2>
									<p className="mb-0" style={{ opacity: 0.9, fontSize: '14px' }}>
										Registre un nuevo paciente en el sistema
									</p>
								</div>
							</div>
							<button
								className="btn"
								onClick={this.ver_pacientes}
								id="ver_pacientes"
								style={{
									background: 'rgba(255,255,255,0.2)',
									border: 'none',
									borderRadius: '12px',
									padding: '12px 24px',
									color: 'white',
									fontWeight: 600,
									fontSize: '15px',
									transition: 'all 0.3s ease',
									backdropFilter: 'blur(10px)'
								}}
								onMouseEnter={(e) => {
									e.target.style.background = 'rgba(255,255,255,0.3)';
									e.target.style.transform = 'translateY(-2px)';
								}}
								onMouseLeave={(e) => {
									e.target.style.background = 'rgba(255,255,255,0.2)';
									e.target.style.transform = 'translateY(0)';
								}}
							>
								<i className="fas fa-list me-2"></i>
								Ver Pacientes
							</button>
						</div>
					</div>
				</div>

				{/* Formulario */}
				<div className="card border-0 shadow-sm" style={{ 
					borderRadius: '16px',
					background: '#ffffff',
					animation: 'slideUp 0.6s ease',
					overflow: 'hidden'
				}}>
					<div className="card-body p-4">

						<div className="row">
							<div className="col-md-6 mb-3">
								<label style={{ fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>
									<i className="fas fa-user me-2" style={{ color: '#667eea' }}></i>
									Nombre
								</label>
								<input 
									type="text" 
									id="nombre" 
									name="nombre" 
									className="form-control" 
									value={this.state.nombre} 
									onChange={this.handleChange}
									style={{
										borderRadius: '12px',
										border: '2px solid #e0e0e0',
										padding: '12px 16px',
										fontSize: '15px',
										transition: 'all 0.2s ease',
										background: '#ffffff'
									}}
									onFocus={(e) => {
										e.target.style.borderColor = '#667eea';
										e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
									}}
									onBlur={(e) => {
										e.target.style.borderColor = '#e0e0e0';
										e.target.style.boxShadow = 'none';
									}}
								/>
							</div>

							<div className="col-md-6 mb-3">
								<label style={{ fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>
									<i className="fas fa-user me-2" style={{ color: '#667eea' }}></i>
									Apellido
								</label>
								<input 
									type="text" 
									id="apellido" 
									name="apellido" 
									className="form-control" 
									value={this.state.apellido} 
									onChange={this.handleChange}
									style={{
										borderRadius: '12px',
										border: '2px solid #e0e0e0',
										padding: '12px 16px',
										fontSize: '15px',
										transition: 'all 0.2s ease',
										background: '#ffffff'
									}}
									onFocus={(e) => {
										e.target.style.borderColor = '#667eea';
										e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
									}}
									onBlur={(e) => {
										e.target.style.borderColor = '#e0e0e0';
										e.target.style.boxShadow = 'none';
									}}
								/>
							</div>
						</div>

						<div className="row mb-3">
							<div className="col-12">
								<div style={{
									padding: '20px',
									background: '#f9fafb',
									borderRadius: '12px',
									border: '2px solid #e5e7eb'
								}}>
									<div className="d-flex justify-content-between align-items-center mb-3">
										<label htmlFor="es_pediatrico" style={{ fontWeight: 600, color: '#4b5563', margin: 0 }}>
											<i className="fas fa-child me-2" style={{ color: '#667eea' }}></i>
											¿Es pediátrico?
										</label>
										<label style={{
											position: 'relative',
											display: 'inline-block',
											width: '60px',
											height: '34px',
											margin: 0,
											cursor: 'pointer'
										}}>
											<input
												type="checkbox"
												id="es_pediatrico"
												name="es_pediatrico"
												checked={this.state.es_pediatrico === "si"}
												onChange={(e) =>
													this.setState({ es_pediatrico: e.target.checked ? "si" : "no" })
												}
												style={{ opacity: 0, width: 0, height: 0 }}
											/>
											<span style={{
												position: 'absolute',
												top: 0,
												left: 0,
												right: 0,
												bottom: 0,
												background: this.state.es_pediatrico === "si" ? '#667eea' : '#ccc',
												borderRadius: '34px',
												transition: 'all 0.3s ease',
												boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
											}}>
												<span style={{
													position: 'absolute',
													content: '""',
													height: '26px',
													width: '26px',
													left: this.state.es_pediatrico === "si" ? '32px' : '4px',
													bottom: '4px',
													background: 'white',
													borderRadius: '50%',
													transition: 'all 0.3s ease',
													boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
												}}></span>
											</span>
										</label>
									</div>

									{this.state.es_pediatrico === "si" && (
										<div className="mt-3">
											<label htmlFor="nombre_tutor" style={{ fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>
												<i className="fas fa-user-friends me-2" style={{ color: '#667eea' }}></i>
												Nombre del Tutor
											</label>
											<input
												type="text"
												id="nombre_tutor"
												name="nombre_tutor"
												className="form-control"
												placeholder="Nombre del tutor"
												value={this.state.nombre_tutor}
												onChange={this.handleChange}
												style={{
													borderRadius: '12px',
													border: '2px solid #e0e0e0',
													padding: '12px 16px',
													fontSize: '15px',
													transition: 'all 0.2s ease',
													background: '#ffffff'
												}}
												onFocus={(e) => {
													e.target.style.borderColor = '#667eea';
													e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
												}}
												onBlur={(e) => {
													e.target.style.borderColor = '#e0e0e0';
													e.target.style.boxShadow = 'none';
												}}
											/>
										</div>
									)}
								</div>
							</div>
						</div>


						<div className="row">
							<div className="col-md-6 mb-3">
								<label style={{ fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>
									<i className="fas fa-id-card me-2" style={{ color: '#667eea' }}></i>
									Cédula o Pasaporte
								</label>
								<input 
									type="text" 
									id="cedula" 
									name="cedula" 
									className="form-control" 
									value={this.state.cedula} 
									onChange={this.handleChange}
									style={{
										borderRadius: '12px',
										border: '2px solid #e0e0e0',
										padding: '12px 16px',
										fontSize: '15px',
										transition: 'all 0.2s ease',
										background: '#ffffff'
									}}
									onFocus={(e) => {
										e.target.style.borderColor = '#667eea';
										e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
									}}
									onBlur={(e) => {
										e.target.style.borderColor = '#e0e0e0';
										e.target.style.boxShadow = 'none';
									}}
								/>
							</div>

							<div className="col-md-6 mb-3">
								<label style={{ fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>
									<i className="fas fa-envelope me-2" style={{ color: '#667eea' }}></i>
									Correo Electrónico
								</label>
								<input 
									type="email"
									id="correo_electronico"
									name="correo_electronico"
									className="form-control"
									placeholder="ejemplo@correo.com"
									value={this.state.correo_electronico}
									onChange={this.handleChange}
									style={{
										borderRadius: '12px',
										border: '2px solid #e0e0e0',
										padding: '12px 16px',
										fontSize: '15px',
										transition: 'all 0.2s ease',
										background: '#ffffff'
									}}
									onFocus={(e) => {
										e.target.style.borderColor = '#667eea';
										e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
									}}
									onBlur={(e) => {
										e.target.style.borderColor = '#e0e0e0';
										e.target.style.boxShadow = 'none';
									}}
								/>
							</div>
						</div>

						<div className="row">
							<div className="col-md-6 mb-3">
								<label style={{ fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>
									<i className="fas fa-image me-2" style={{ color: '#667eea' }}></i>
									Foto del Paciente
								</label>
								<input 
									type="file" 
									id="foto_paciente" 
									className="form-control"
									style={{
										borderRadius: '12px',
										border: '2px solid #e0e0e0',
										padding: '12px 16px',
										fontSize: '15px',
										transition: 'all 0.2s ease',
										background: '#ffffff'
									}}
									onFocus={(e) => {
										e.target.style.borderColor = '#667eea';
										e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
									}}
									onBlur={(e) => {
										e.target.style.borderColor = '#e0e0e0';
										e.target.style.boxShadow = 'none';
									}}
								/>
							</div>

							<div className="col-md-6 mb-3">
								<label style={{ fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>
									<i className="fas fa-venus-mars me-2" style={{ color: '#667eea' }}></i>
									Sexo
								</label>
								<select 
									id="sexo" 
									name="sexo" 
									className="form-control" 
									value={this.state.sexo} 
									onChange={this.handleChange}
									style={{
										borderRadius: '12px',
										border: '2px solid #e0e0e0',
										padding: '12px 16px',
										fontSize: '15px',
										transition: 'all 0.2s ease',
										background: '#ffffff',
										appearance: 'none',
										backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
										backgroundRepeat: 'no-repeat',
										backgroundPosition: 'right 16px center',
										paddingRight: '40px'
									}}
									onFocus={(e) => {
										e.target.style.borderColor = '#667eea';
										e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
									}}
									onBlur={(e) => {
										e.target.style.borderColor = '#e0e0e0';
										e.target.style.boxShadow = 'none';
									}}
								>
									<option value="h">Masculino</option>
									<option value="m">Femenino</option>
								</select>
							</div>
						</div>

						<div className="row">
							<div className="col-md-6 mb-3">
								<label style={{ fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>
									<i className="fas fa-calendar-alt me-2" style={{ color: '#667eea' }}></i>
									Fecha de Nacimiento
								</label>
								<input 
									type="date" 
									id="fecha_nacimiento" 
									name="fecha_nacimiento" 
									className="form-control" 
									value={this.state.fecha_nacimiento} 
									onChange={this.handleChange}
									style={{
										borderRadius: '12px',
										border: '2px solid #e0e0e0',
										padding: '12px 16px',
										fontSize: '15px',
										transition: 'all 0.2s ease',
										background: '#ffffff'
									}}
									onFocus={(e) => {
										e.target.style.borderColor = '#667eea';
										e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
									}}
									onBlur={(e) => {
										e.target.style.borderColor = '#e0e0e0';
										e.target.style.boxShadow = 'none';
									}}
								/>
							</div>

							<div className="col-md-6 mb-3">
								<label style={{ fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>
									<i className="fas fa-phone me-2" style={{ color: '#667eea' }}></i>
									Número de Teléfono
								</label>
								<div style={{
									borderRadius: '12px',
									border: '2px solid #e0e0e0',
									transition: 'all 0.2s ease',
									background: '#ffffff',
									overflow: 'hidden'
								}}
								onFocus={(e) => {
									e.currentTarget.style.borderColor = '#667eea';
									e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
								}}
								onBlur={(e) => {
									e.currentTarget.style.borderColor = '#e0e0e0';
									e.currentTarget.style.boxShadow = 'none';
								}}
								>
									<PhoneInput	
										inputClassName="form-control" 
										country="DO"
										flags={this.state.customFlags.DO}
										placeholder="Ingrese el número de teléfono"
										value={this.state.telefono}
										onChange={(value) => this.capturar_telefono(value)}
										defaultCountry="DO"
										style={{
											border: 'none',
											padding: '12px 16px'
										}}
									/>
								</div>
							</div>
						</div>

						<div className="row">
							<div className="col-md-12 mb-4">
								<label style={{ fontWeight: 600, color: '#4b5563', marginBottom: '8px', display: 'block' }}>
									<i className="fas fa-user-md me-2" style={{ color: '#667eea' }}></i>
									Ingresado por Doctor
								</label>
								<select
									id="doctores_select"
									className="form-control"
									onChange={this.seleccionar_doctor}
									style={{
										borderRadius: '12px',
										border: '2px solid #e0e0e0',
										padding: '12px 16px',
										fontSize: '15px',
										transition: 'all 0.2s ease',
										background: '#ffffff',
										appearance: 'none',
										backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
										backgroundRepeat: 'no-repeat',
										backgroundPosition: 'right 16px center',
										paddingRight: '40px'
									}}
									onFocus={(e) => {
										e.target.style.borderColor = '#667eea';
										e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
									}}
									onBlur={(e) => {
										e.target.style.borderColor = '#e0e0e0';
										e.target.style.boxShadow = 'none';
									}}
								>
									<option value="seleccionar">Seleccione el doctor</option>
									{this.state.doctores.map((data) => (
										<option key={data.id} value={data.id}>
											{data.nombre} {data.apellido}
										</option>
									))}
								</select>
							</div>
						</div>

						<div style={{ textAlign: 'center', marginTop: '30px', paddingTop: '30px', borderTop: '2px solid #e5e7eb' }}>
							<button
								className="btn"
								onClick={this.guardar_paciente}
								disabled={this.state.boton_estado}
								style={{
									background: this.state.boton_estado 
										? '#e0e0e0' 
										: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
									color: 'white',
									border: 'none',
									borderRadius: '12px',
									padding: '14px 40px',
									fontWeight: 600,
									fontSize: '16px',
									transition: 'all 0.3s ease',
									cursor: this.state.boton_estado ? 'not-allowed' : 'pointer',
									boxShadow: this.state.boton_estado ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.3)',
									minWidth: '200px'
								}}
								onMouseEnter={(e) => {
									if (!this.state.boton_estado) {
										e.target.style.transform = 'translateY(-2px)';
										e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
									}
								}}
								onMouseLeave={(e) => {
									if (!this.state.boton_estado) {
										e.target.style.transform = 'translateY(0)';
										e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
									}
								}}
							>
								<i className="fas fa-save me-2"></i>
								Guardar Paciente
							</button>
						</div>
					</div>
				</div>
			</div>
		);


	}


}

export default PacienteAdmin;