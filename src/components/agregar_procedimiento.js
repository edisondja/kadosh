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
	
			return (<div className="col-md-10 mx-auto mt-4"><hr/>
						<div className="card shadow border-0 rounded-4 p-4">
							<h3 className="text-primary mb-4">
							<i className="fas fa-plus-circle me-2"></i> Agregar Procedimiento
							</h3>

							<div className="mb-3">
							<label htmlFor="nombre_procedimiento" className="form-label fw-semibold">
								<i className="fas fa-file-signature me-2"></i>Nombre
							</label>
							<input 
								type="text" 
								className="form-control rounded-pill px-4" 
								id="nombre_procedimiento" 
								placeholder="Ej. Limpieza dental"
							/>
							</div>

							<div className="mb-4">
							<label htmlFor="precio" className="form-label fw-semibold">
								<i className="fas fa-dollar-sign me-2"></i>Precio
							</label>
							<input 
								type="number" 
								className="form-control rounded-pill px-4" 
								id="precio" 
								placeholder="Ej. 1200"
							/>
							</div>

							<div className="mb-4">
							<label htmlFor="color" className="form-label fw-semibold">
								<i className="fas fa-palette me-2"></i>Color
							</label>
							 <select className="form-control rounded-pill px-4" id="color" defaultValue="#FF0000">
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

							<div className="mb-4">
							<label htmlFor="comision" className="form-label fw-semibold">
								<i className="fas fa-percent me-2"></i>Comisión (%)
							</label>
							<input 
								type="number" 
								className="form-control rounded-pill px-4" 
								id="comision" 
								placeholder="Ej. 30 (porcentaje de comisión)"
								min="0"
								max="100"
								step="0.01"
								defaultValue="0"
							/>
							<small className="form-text text-muted">Porcentaje de comisión que recibirá el doctor por este procedimiento (0-100)</small>
							</div>
							<div className="mb-4" style={{textAlign:'center'}}
>
							<button 
								
								className="btn btn-primary w-50 rounded-pill fw-semibold" 
								disabled={this.state.boton_estado} 
								onClick={this.guardar_datos}
							>
								<i className="fas fa-save me-2"></i>Guardar
							</button>
							</div>
														
						</div>

						<div className="mt-4">
							<BuscarProcedimiento />
						</div>
						</div>
						);

		}



}

export default ProcedimientoForm;