import React from 'react';
import ReactDOM from 'react-dom';
import Axios from 'axios';
import alertify from 'alertifyjs';
import BuscarProcedimiento from './buscando_procedimiento';
import core from './funciones_extras';
class ProcedimientoForm extends React.Component{


		constructor(props){
			super(props);
				this.state= {estado:true,boton_estado:false};

		}

		guardar_datos=()=>{
			var nombre = document.getElementById("nombre_procedimiento").value;
			var precio = document.getElementById("precio").value;
			var color = document.getElementById("color").value;
			var comision = document.getElementById("comision").value || 0;

			// Validar campos
			if (!nombre || !precio) {
				alertify.error("Por favor complete todos los campos requeridos");
				return;
			}

			// Validar que la comisión esté entre 0 y 100
			if (comision < 0 || comision > 100) {
				alertify.error("La comisión debe estar entre 0 y 100");
				return;
			}

			// Deshabilitar botón mientras se guarda
			this.setState({boton_estado:true});

			Axios.post(`${core.url_base}/api/guardar_procedimiento`,
				{nombre:nombre,precio:precio,color:color,comision:comision}
			).then(data=>{
				alertify.success("Procedimiento guardado con éxito");
				
				// Limpiar campos inmediatamente
				document.getElementById("nombre_procedimiento").value="";
				document.getElementById("precio").value="";
				document.getElementById("color").value="#FF0000"; // Resetear al valor por defecto
				document.getElementById("comision").value="0"; // Resetear comisión
				
				// Rehabilitar botón y enfocar en el primer campo para agregar otro procedimiento
				this.setState({boton_estado:false});
				setTimeout(() => {
					document.getElementById("nombre_procedimiento").focus();
				}, 100);

			}).catch(error=>{
				alertify.error("No se pudo guardar el procedimiento");
				this.setState({boton_estado:false});
			});


		}


		


		render(){
	
			return (
				<>
					<style>{`
						@keyframes fadeIn {
							from { opacity: 0; transform: translateY(10px); }
							to { opacity: 1; transform: translateY(0); }
						}
						@keyframes slideUp {
							from { opacity: 0; transform: translateY(20px); }
							to { opacity: 1; transform: translateY(0); }
						}
					`}</style>
					<div className="col-md-10" style={{ 
						backgroundColor: '#f5f5f7',
						minHeight: '100vh',
						padding: '30px',
						borderRadius: '16px'
					}}>
						{/* Header principal */}
						<div className="card border-0 shadow-lg mb-4" style={{ 
							borderRadius: '16px',
							background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
							overflow: 'hidden',
							animation: 'fadeIn 0.5s ease'
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
										<i className="fas fa-stethoscope"></i>
									</div>
									<div>
										<h2 className="mb-0" style={{ fontWeight: 700, fontSize: '32px' }}>
											Gestión de Procedimientos
										</h2>
										<p className="mb-0" style={{ opacity: 0.9, fontSize: '15px' }}>
											Agrega y administra los procedimientos médicos de la clínica
										</p>
									</div>
								</div>
							</div>
						</div>

						{/* Formulario de agregar */}
						<div className="card border-0 shadow-sm mb-4" style={{ 
							borderRadius: '16px',
							overflow: 'hidden',
							animation: 'slideUp 0.6s ease'
						}}>
							<div className="card-body p-4">
								<h4 className="mb-4" style={{ fontWeight: 600, color: '#495057' }}>
									<i className="fas fa-plus-circle me-2" style={{ color: '#1c1c1e' }}></i>
									Agregar Nuevo Procedimiento
								</h4>

								<div className="row">
									<div className="col-md-6 mb-3">
										<label htmlFor="nombre_procedimiento" style={{ 
											fontWeight: 600, 
											color: '#495057', 
											marginBottom: '8px', 
											display: 'block' 
										}}>
											<i className="fas fa-file-signature me-2"></i>Nombre del Procedimiento
										</label>
										<input 
											type="text" 
											className="form-control" 
											id="nombre_procedimiento" 
											placeholder="Ej. Limpieza dental"
											style={{
												borderRadius: '12px',
												border: '2px solid #e0e0e0',
												padding: '12px 16px',
												fontSize: '15px',
												transition: 'all 0.2s ease'
											}}
											onFocus={(e) => {
												e.target.style.borderColor = '#1c1c1e';
												e.target.style.boxShadow = '0 0 0 3px rgba(28, 28, 30, 0.1)';
											}}
											onBlur={(e) => {
												e.target.style.borderColor = '#e0e0e0';
												e.target.style.boxShadow = 'none';
											}}
										/>
									</div>

									<div className="col-md-6 mb-3">
										<label htmlFor="precio" style={{ 
											fontWeight: 600, 
											color: '#495057', 
											marginBottom: '8px', 
											display: 'block' 
										}}>
											<i className="fas fa-dollar-sign me-2"></i>Precio (RD$)
										</label>
										<input 
											type="number" 
											className="form-control" 
											id="precio" 
											placeholder="Ej. 1200"
											style={{
												borderRadius: '12px',
												border: '2px solid #e0e0e0',
												padding: '12px 16px',
												fontSize: '15px',
												transition: 'all 0.2s ease'
											}}
											onFocus={(e) => {
												e.target.style.borderColor = '#1c1c1e';
												e.target.style.boxShadow = '0 0 0 3px rgba(28, 28, 30, 0.1)';
											}}
											onBlur={(e) => {
												e.target.style.borderColor = '#e0e0e0';
												e.target.style.boxShadow = 'none';
											}}
										/>
									</div>

									<div className="col-md-6 mb-3">
										<label htmlFor="color" style={{ 
											fontWeight: 600, 
											color: '#495057', 
											marginBottom: '8px', 
											display: 'block' 
										}}>
											<i className="fas fa-palette me-2"></i>Color
										</label>
										<select 
											className="form-control" 
											id="color" 
											defaultValue="#FF0000"
											style={{
												borderRadius: '12px',
												border: '2px solid #e0e0e0',
												padding: '14px 16px',
												fontSize: '15px',
												minHeight: '50px',
												height: 'auto',
												lineHeight: '1.5',
												transition: 'all 0.2s ease',
												appearance: 'none',
												backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
												backgroundRepeat: 'no-repeat',
												backgroundPosition: 'right 16px center',
												paddingRight: '40px'
											}}
											onFocus={(e) => {
												e.target.style.borderColor = '#1c1c1e';
												e.target.style.boxShadow = '0 0 0 3px rgba(28, 28, 30, 0.1)';
											}}
											onBlur={(e) => {
												e.target.style.borderColor = '#e0e0e0';
												e.target.style.boxShadow = 'none';
											}}
										>
											<option value="#FF0000">Rojo</option>
											<option value="#00FF00">Verde</option>
											<option value="#0000FF">Azul</option>
											<option value="#FFFF00">Amarillo</option>
											<option value="#FF00FF">Magenta</option>
											<option value="#00FFFF">Cian</option>
											<option value="#FFA500">Naranja</option>
											<option value="#800080">Morado</option>
										</select>
									</div>

									<div className="col-md-6 mb-3">
										<label htmlFor="comision" style={{ 
											fontWeight: 600, 
											color: '#495057', 
											marginBottom: '8px', 
											display: 'block' 
										}}>
											<i className="fas fa-percent me-2"></i>Comisión (%)
										</label>
										<input 
											type="number" 
											className="form-control" 
											id="comision" 
											placeholder="Ej. 30"
											min="0"
											max="100"
											step="0.01"
											defaultValue="0"
											style={{
												borderRadius: '12px',
												border: '2px solid #e0e0e0',
												padding: '12px 16px',
												fontSize: '15px',
												transition: 'all 0.2s ease'
											}}
											onFocus={(e) => {
												e.target.style.borderColor = '#1c1c1e';
												e.target.style.boxShadow = '0 0 0 3px rgba(28, 28, 30, 0.1)';
											}}
											onBlur={(e) => {
												e.target.style.borderColor = '#e0e0e0';
												e.target.style.boxShadow = 'none';
											}}
										/>
										<small className="form-text text-muted" style={{ fontSize: '13px', marginTop: '5px', display: 'block' }}>
											Porcentaje de comisión que recibirá el doctor (0-100)
										</small>
									</div>
								</div>

								<div className="text-center mt-4">
									<button 
										className="btn" 
										disabled={this.state.boton_estado} 
										onClick={this.guardar_datos}
										style={{
											background: 'linear-gradient(135deg, #2d2d2f 0%, #1c1c1e 100%)',
											color: 'white',
											border: 'none',
											borderRadius: '12px',
											padding: '14px 48px',
											fontWeight: 600,
											fontSize: '16px',
											transition: 'all 0.3s ease',
											boxShadow: '0 4px 12px rgba(28, 28, 30, 0.3)',
											minWidth: '200px'
										}}
										onMouseEnter={(e) => {
											if (!this.state.boton_estado) {
												e.target.style.transform = 'translateY(-2px)';
												e.target.style.boxShadow = '0 6px 16px rgba(28, 28, 30, 0.4)';
											}
										}}
										onMouseLeave={(e) => {
											if (!this.state.boton_estado) {
												e.target.style.transform = 'translateY(0)';
												e.target.style.boxShadow = '0 4px 12px rgba(28, 28, 30, 0.3)';
											}
										}}
									>
										<i className="fas fa-save me-2"></i>
										{this.state.boton_estado ? 'Guardando...' : 'Guardar Procedimiento'}
									</button>
								</div>
							</div>
						</div>

						{/* Lista de procedimientos */}
						<div style={{ animation: 'slideUp 0.7s ease' }}>
							<BuscarProcedimiento />
						</div>
					</div>
				</>
			);

		}



}

export default ProcedimientoForm;