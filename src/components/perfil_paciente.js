import React from 'react';
import ReactDOM from 'react-dom';
import Alertify from 'alertifyjs';
import Axios from 'axios';
import '../css/dashboard.css';
import AgregarCita from './agregar_cita';
import VerFacturas from './ver_facturas';
import Verficar from './funciones_extras';
import Pacientes from './citas_c';
import alertify from 'alertifyjs';
import ImagenNota from '../enviar.png';
import ProcedimientoImg from '../procedimiento.png';
import FacturasImg from '../factura_hechas.png';
import FacturaSaldada from '../factura_saldada.png';
import RecibosImg from '../cheque.png';
import  { Redirect } from 'react-router-dom';
import DocumentoImg from '../adjunto.png';
import ImagenPerfil from '../usuario_listo.png'
import ImagenMas from '../mas.png';
import { Link } from 'react-router-dom';




class PerfilPaciente extends React.Component{

	/*
		Cuando existan datos de ficha clinica y abra la modal, cargar los datos en los campos en estado 
		disable y un boton que lo habilite para editarlos y guardarlos

	*/
	
		constructor(props) {
			super(props);
			this.state = {
				id_doc: 0,
				id_paciente: 0,
				actualizo: 0,
				deuda_total: 0,

				doctor: {
					nombre: '',
					apellido: ''
				},

				paciente: {
					nombre: null,
					apellido: null
				},

				select: 'perfil_paciente',
				lista_citas: [],
				cita: '',
				id_cita: '',
				eliminar: 0,

				// Modales
				modal_nota_visible: false,
				
				modal_documento_visible: false,
				modal_ver_notas_visible: false,
				modal_ficha_medica_visible: false,
				desactivar_campos_ficha: false, 

				// Notas y Documentos
				nota_texto: '',
				documentos: [],
				notasPaciente: [],
				tiene_ficha_medica:false,

				// Ficha médica
					created_at:'',
					direccion: '',
					ocupacion: '',
					tratamiento_actual: 'No',
					tratamiento_detalle: '',
					enfermedades: [],
					medicamentos: [],
					tabaquismo: '',
					alcohol: '',
					otros_habitos: '',
					antecedentes_familiares: '',
					alergias: [],
					alergias_detalle: '',

			};
		}

		cargar_ficha_medica = (id_paciente) => { 

			

			Axios.get(`${Verficar.url_base}/api/cargar_ficha_medica/${id_paciente}`)
				.then((res) => {

					this.setState({
						direccion: res.data.direccion,
						ocupacion: res.data.ocupacion,
						tratamiento_actual: res.data.tratamiento_actual,
						tratamiento_detalle: res.data.tratamiento_detalle,  
						enfermedades: res.data.enfermedades ? res.data.enfermedades.split(',') : [],
						medicamentos: res.data.medicamentos ? res.data.medicamentos.split(',') : [],
						tabaquismo: res.data.tabaquismo,
						alcohol: res.data.alcohol,
						otros_habitos: res.data.otros_habitos,
						alergias: res.data.alergias ? res.data.alergias.split(',') : [],
						created_at: res.data.created_at,
						alergias_detalle: res.data.alergias_detalle
						});

						this.setState({ desactivar_campos_ficha: true });

					console.log('Ficha medica '+res.data);
					this.setState({ tiene_ficha_medica: !!res.data });
				})
				.catch((err) => {
					console.log(err);
					this.setState({ tiene_ficha_medica: false });

				});
		}

		guardar_ficha_medica = () => {
			const fichaData = {
				paciente_id: this.props.match.params.id,
				direccion: this.state.direccion,
				ocupacion: this.state.ocupacion,
				tratamiento_actual: this.state.tratamiento_actual,
				tratamiento_detalle: this.state.tratamiento_detalle,
				enfermedades: this.state.enfermedades.toString(),
				medicamentos: this.state.medicamentos.toString(),
				tabaquismo: this.state.tabaquismo,
				alcohol: this.state.alcohol,
				otros_habitos: this.state.otros_habitos,
				alergias: this.state.alergias.toString(),
				alergias_detalle: this.state.alergias_detalle
			
			};

			Axios.post(`${Verficar.url_base}/api/guardar_ficha_medica`, fichaData)
				.then((res) => {
					alertify.success('Ficha médica guardada con éxito');
					this.setState({ modal_ficha_medica_visible: false });
					this.cargar_ficha_medica(this.props.match.params.id);
				})
				.catch((err) => {
					console.log(err);
					alertify.error('Error al guardar la ficha médica');
				});
		}

		ver_notas = () => {
				this.cargarNotas();
				this.setState({ modal_ver_notas_visible: true });

		}

		openModalNota = () => {
			this.setState({ modal_nota_visable: true });

		}

		closeModalNota = () => {

			this.setState({ modal_nota_visable: false, nota_texto: '' });
		}
		

		setNotaTexto=(valor)=>{

			this.setState({nota_texto:valor});

		}	
		
		

		guardarNota=()=>{
 

			let nota = {
				id_paciente: this.props.match.params.id,
				descripcion: this.state.nota_texto
			};


			console.log(nota);
			Axios.post(`${Verficar.url_base}/api/crear_nota`, nota)
				.then((data) => {
				console.log(data);
				alertify.message('<i class="mac-icon-check-circle" style="color:green;"></i> Nota creada con éxito');
				
					this.setState({ modal_nota_visable: false, nota_texto: '' });
				})
				.catch((error) => {
				alertify.message('<i class="mac-icon-x-circle" style="color:red;"></i> No se pudo crear la nota');
				});
		}

		componentDidMount(){

			//alert(this...id_paciente);

			const id = this.props.match.params.id;
			const id_doc = this.props.match.params.id_doc;

			this.cargar_ficha_medica(id);
			this.consultarPaciente(id);
			this.cargar_citas_paciente(id);
			this.cargar_doctor(id_doc);
			//this.setState({doctor:});
			//alert(this.props.IdDoctor);
			this.consultar_deuda_paciente(id);
			//this.cargar_notas();

			if(this.state.tiene_ficha_medica){
				this.setState({ desactivar_campos_ficha: true });
			}
		}

		handleChange = (e) => {
			const { name, value, type, checked } = e.target;

			if (type === "checkbox" && name === "enfermedades") {
				this.setState((prevState) => {
					const enfermedades = prevState.enfermedades || [];
					if (checked) {
						// Agregar al array
						return { enfermedades: [...enfermedades, value] };
					} else {
						// Quitar del array
						return { enfermedades: enfermedades.filter((item) => item !== value) };
					}
				});
			} else {
				// Para otros campos
				this.setState({ [name]: value });
			}
		};

		handleEdit = () => {
			this.setState({ desactivar_campos_ficha: false });
		};

		crear_presupuesto =()=>{

			this.setState({select:'crear_presupuesto'});

		}

		handleSubmit=(e)=>{

			this.guardar_ficha_medica();
			e.preventDefault();
			const form = e.target;

		}

		cargarNotas = () => {

			Axios.get(`${Verficar.url_base}/api/cargar_notas/${this.props.match.params.id}`)
				.then((res) => {

					console.log(res.data);
				this.setState({ notasPaciente: res.data});
				})
				.catch((err) => {
				alertify.error('No se pudieron cargar las notas');
				});
		};


		eliminarNota = (notaId) => {
		Axios.post(`${Verficar.url_base}/api/eliminar_nota`, { nota_id: notaId })
			.then(() => {
			alertify.success('Nota eliminada con éxito');
			this.setState((prevState) => ({
				notasPaciente: prevState.notasPaciente.filter((n) => n.id !== notaId),
			}));
			})
			.catch(() => {
			alertify.error('No se pudo eliminar la nota');
			});
		};


		cargar_doctor=(id_doctor)=>{

			Axios.get(`${Verficar.url_base}/api/cargar_doctor/${id_doctor}`).then(data=>{
	
					this.setState({doctor:data.data});
	
			}).catch(error=>{
	
				console.log(error);
				Alertify.message("Reconectando...");
				this.cargar_doctor(id_doctor);
	
			})
		}

		consultar_deuda_paciente(id_paciente){
			
			
					Axios.get(`${Verficar.url_base}/api/consultar_deuda/${id_paciente}`).then(data=>{
							this.setState({deuda_total:data.data.deuda_total});
					}).catch(error=>{
						Alertify.error("No se pudo cargar la deuda del paciente");
						Alertify.message("Reconectando...");
						this.consultar_deuda_paciente(id_paciente);
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

		detras=()=>{

			this.setState({select:'ver_pacientes'});
			
		}
		
		cargar_citas_paciente=(id_paciente)=>{

			Axios.get(`${Verficar.url_base}/api/cargar_citas_de_paciente/${id_paciente}`).then(data=>{

			this.setState({lista_citas:data.data});
				console.log(data.data);

				

			}).catch(error=>{
				Alertify.error("error no se pudo cargar las citas");
				Alertify.message("Reconectando...");
				this.cargar_citas_paciente(id_paciente);		
			});

		}

		consultarPaciente=(id)=>{

			Axios.get(`${Verficar.url_base}/api/paciente/${id}`).then(data=>{

				this.setState({paciente:data.data});

				
					if(this.state.paciente.foto_paciente==""){

							document.getElementById("foto_paciente").src=ImagenPerfil;
					}

			}).catch(error=>{
				
				Alertify.error(`Error al cargar paciente`);
				Alertify.message("Reconectando..");
				this.consultarPaciente(id);
			});


			}

			subirDocumento = () => {

				const formData = new FormData();
				formData.append("image", this.state.nuevoArchivo);
				formData.append("usuario_id", this.props.match.params.id);
				formData.append("comentarios", this.state.nuevoComentario);

				Axios.post(`${Verficar.url_base}/api/subir_radiografia`, formData, {
					headers: { 'Content-Type': 'multipart/form-data' }
				})
					.then(() => {
					Alertify.success("Archivo subido con éxito");
					this.setState({ nuevoArchivo: null, nuevoComentario: "" });
					this.cargar_documentos(); // refrescar lista
					})
					.catch((error) => {
					console.error(error);
					});
			};


			eliminarDocumento = (id) => {

				Axios.delete(`${Verficar.url_base}/api/eliminar_radiografia/${id}`)
					.then(() => {
					Alertify.success("Documento eliminado");
					this.cargar_documentos();
					})
					.catch((error) => {
					console.error(error);
					});

			};




			cargar_documentos = () => {

				this.setState({ modal_documento_visible: true });

				Axios.get(`${Verficar.url_base}/api/cargar_documentos/${this.props.match.params.id}`)
					.then((res) => {
					this.setState({
						documentos: res.data,
					});
					})
					.catch((err) => {
					console.error(err);
					});
			};


		

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


		ver_presupuesto=()=>{


			this.setState({select:'ver_presupuestos'});

		}

		

	render() {


			if (this.state.select === 'agregando_factura') {
				return '';
			} else if (this.state.select === 'editando_cita') {
				return <AgregarCita config="actualizar" id_cita={this.state.id_cita} />;
			} else if (this.state.select === "ver_facturas") {

				//return <VerFacturas id_paciente={this.props.id_paciente} paciente={this.state.paciente.nombre} />;
			} else if (this.state.select === "perfil_paciente") {
				return (
				<div className="col-md-10 mx-auto my-4">
					<hr />
					<h3 className="mb-4" style={{ fontWeight: '600' }}>
					{this.state.paciente.nombre} {this.state.paciente.apellido}
					</h3>

					<input type="hidden" id="paciente_id" value={this.props.id_paciente} />

					<div className="d-flex gap-4 mb-4 align-items-start">
				
					<img
							id="foto_paciente"
							src={Verficar.url_base + "/storage/" + this.state.paciente.foto_paciente}
							alt="Foto Paciente"
							style={{
								width: '100px',
								height: '100px',
								objectFit: 'cover',
								borderRadius: '50%',
								border: '2px solid #ddd',
								boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
							}}
							/>
						
					<div className="icon-buttons-container text-center">
						&nbsp;&nbsp;
						<Link to={`/agregar_factura/${this.props.match.params.id}/${this.props.match.params.id_doc}`}>
						<button
							className="icon-btn"
							title="Agregar Factura"
							aria-label="Agregar Factura"
						>
							<i className="fas fa-file-invoice-dollar"></i>
							<span>Factura</span>
						</button>
						</Link>
						<Link to={`/ver_facturas/${this.props.match.params.id}`}>
						<button
							className="icon-btn"
							title="Ver Facturas"
							aria-label="Ver Facturas"
						>
							<i className="fas fa-file-alt"></i>
							<span>Ver Facturas</span>
						</button>
						</Link>

						<button onClick={() => this.setState({ modal_ficha_medica_visible: true })}
							className="icon-btn"
							title="Ficha Medica"
							aria-label="Ficha Medica">

							<i className="fas fa-file-medical"></i>
							<span>Ficha médica</span>
						</button>

						<button
							className="icon-btn"
							onClick={this.ver_notas}
							title="Notas"
							aria-label="Notas"
						>
							<i className="fas fa-sticky-note"></i>
							<span>Notas</span>
						</button>

						<button
							className="icon-btn"
							onClick={this.openModalNota}
							title="Agregar Nota"
							aria-label="Agregar Nota"
						>
							<i className="fas fa-plus-circle"></i>
							<span>Agregar Nota</span>
						</button>

						<button
							className="icon-btn"
							onClick={this.cargar_documentos}
							title="Documentos"
							aria-label="Documentos"
						>
							<i className="fas fa-folder-open"></i>
							<span>Documentos</span>
						</button>
						
					<Link to={`/crear_prepuestos/${this.props.match.params.id}/${this.props.match.params.id_doc}`}>
					<button
						className="icon-btn"
						title="Crear Presupuesto"
						aria-label="Crear Presupuesto"
					>
						<i className="fas fa-file-signature"></i>
						<span>Presupuesto</span>
					</button>
					</Link>

					<Link to={`/presupuestos/${this.props.match.params.id}/${this.props.match.params.id_doc}/${this.props.match.params.id_doc}`}>
					<button
						className="icon-btn"
						title="Ver Presupuestos"
						aria-label="Ver Presupuestos"
					>
						<i className="fas fa-file-alt"></i>
						<span>Ver Presupuestos</span>
					</button>
					</Link>
						<button
							className="icon-btn danger"
							onClick={() => this.eliminar_paciente(this.state.paciente.id)}
							title="Eliminar Paciente"
							aria-label="Eliminar Paciente"
						>
							<i className="fas fa-trash-alt"></i>
							<span>Eliminar</span>
						</button>

					</div>


				
					</div>

					<div className="interfaz_perfil mb-4">
					<button className="btn btn-secondary mb-3" onClick={this.detras}>
						← Atrás
					</button>

					<table className="table table-hover shadow-sm">
						<thead className="table-primary">
						<tr>
							<th>Nombre</th>
							<th>Cédula</th>
							<th>Teléfono</th>
							<th>Email</th>
							<th>Ingreso</th>
							<th>Doctor</th>
							<th>Deuda Total</th>
						</tr>
						</thead>
						<tbody>
						<tr>
							<td>{this.state.paciente.nombre} {this.state.paciente.apellido}</td>
							<td>{this.state.paciente.cedula}</td>
							<td>{this.state.paciente.telefono}</td>
							<td>{this.state.paciente.correo_electronico}</td>
							<td style={{ color: 'purple', fontWeight: '600' }}>{this.state.paciente.fecha_de_ingreso}</td>
							<td>{this.state.doctor.nombre} {this.state.doctor.apellido}</td>
							<td className="fw-bold">$RD {this.state.deuda_total}</td>
						</tr>
						</tbody>
					</table>
					</div>


					<hr />

					<strong className="mb-3 d-block">Ficha Medica</strong>
					<div className="mb-4">
						{this.state.tiene_ficha_medica ? (
							<>
								<p><strong>Fecha ficha creada:</strong> {this.state.created_at}</p>
								<p><strong>Dirección:</strong> {this.state.direccion}</p>
							</>
						) : (
							<p>No tiene ficha médica registrada.</p>
						)}
					</div>

					<strong className="mb-3 d-block">Lista de citas</strong>
					<div className="mb-4">
					<h5 className="text-xl font-semibold mb-4 text-gray-800">📋 Lista de citas</h5>

					<div className="overflow-x-auto">
						<table className="table min-w-full border-collapse bg-white rounded-xl shadow-md">
						<thead className="bg-gray-50 border-b">
							<tr>
							<th className="text-left text-gray-500 font-medium px-4 py-3">Inicio</th>
							<th className="text-left text-gray-500 font-medium px-4 py-3">Fin</th>
							<th className="text-left text-gray-500 font-medium px-4 py-3">Motivo</th>
							<th className="text-left text-gray-500 font-medium px-4 py-3">Doctor</th>
							</tr>
						</thead>
						<tbody>
							{this.state.lista_citas.map((data) => (
							<tr key={data.id} className="border-t hover:bg-gray-50 transition">
								<td className="px-4 py-3 text-gray-800">{data.inicio}</td>
								<td className="px-4 py-3 text-gray-800">{data.fin}</td>
								<td className="px-4 py-3 text-gray-800">{data.motivo}</td>
								<td className="px-4 py-3 text-gray-800">{data.doctor.nombre} {data.doctor.apellido}</td>
							</tr>
							))}
						</tbody>
						</table>
					</div>
				</div>
				{this.state.modal_ficha_medica_visible && (
					<div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
						<div
						className="modal-dialog modal-xxl modal-dialog-centered"
						style={{ maxWidth: "95%" }}
						>
						<div className="modal-content shadow">
							{/* Header */}
							<div className="modal-header bg-light">
							<h5 className="modal-title">🦷 Ficha Médica del Paciente</h5>
							<button
								type="button"
								className="btn-close"
								onClick={() =>
								this.setState({ modal_ficha_medica_visible: false })
								}
							></button>
							</div>

							{/* Body */}
							<div
							className="modal-body"
							style={{ maxHeight: "80vh", overflowY: "auto" }}
							>
							<form id="form-paciente" autoComplete="off" className="container-fluid">
								{/* DATOS PERSONALES */}
								<fieldset className="mb-4">
								<legend className="fw-semibold mb-3">Datos Personales</legend>
								<div className="row g-3">
							

			
									<div className="col-md-6 col-lg-6">
									<label className="form-label">Dirección</label>
									<input
										disabled={this.state.desactivar_campos_ficha}
										name="direccion"
										type="text"
										className="form-control"
										value={this.state.direccion || ""}
										onChange={this.handleChange}
									/>
									</div>

									<div className="col-md-6 col-lg-6">
									<label className="form-label">Ocupación</label>
									<input
										disabled={this.state.desactivar_campos_ficha}
										name="ocupacion"
										type="text"
										className="form-control"
										value={this.state.ocupacion || ""}
										onChange={this.handleChange}
									/>
									</div>
								</div>
								</fieldset>

							

								{/* ANTECEDENTES MÉDICOS */}
								<fieldset className="mb-4">
								<legend className="fw-semibold mb-3">Antecedentes Médicos</legend>

								{/* Tratamiento actual */}
							<div className="mb-4">
							<label className="form-label d-block mb-2">
								¿Está bajo tratamiento médico actualmente?
							</label>
							<div className="d-flex gap-3">
								<div className="form-check form-check-inline">
									&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
								
								<input
									disabled={this.state.desactivar_campos_ficha}
									className="form-check-input"
									type="radio"
									name="tratamiento_actual"
									id="tratamientoSi"
									value="Si"
									checked={this.state.tratamiento_actual === "Si"}
									onChange={this.handleChange}
								/>
								<label className="" htmlFor="tratamientoSi">
									Sí&nbsp;&nbsp;
								</label>
								</div>
								
								<div className="form-check form-check-inline">&nbsp;&nbsp;&nbsp;
								<input
									disabled={this.state.desactivar_campos_ficha}
									className="form-check-input"
									type="radio"
									name="tratamiento_actual"
									id="tratamientoNo"
									value="No"
									checked={this.state.tratamiento_actual === "No"}
									onChange={this.handleChange}
								/>
								<label className="" htmlFor="tratamientoNo">
									No
								</label>
								</div>
							</div>
							</div>
								{/*Problemas con la anestecia*/}
								<fieldset className="mb-4">
									<div className="col-md-6 col-lg-6">
										<label className="form-label">¿Ha tenido problemas con la anestesia?</label><br/>
										<input  disabled={this.state.desactivar_campos_ficha} type='radio' name='problemas_anestesia' value='si' checked={this.state.problemas_anestesia === 'si'} onChange={this.handleChange} /> Sí &nbsp;&nbsp;
										<input disabled={this.state.desactivar_campos_ficha} type='radio' name='problemas_anestesia' value='no' checked={this.state.problemas_anestesia === 'no'} onChange={this.handleChange} /> No
								</div>
								</fieldset>


								{/* Alergias */}
								<div className="mb-3">
									<label className="form-label">Alergias</label>
									<div className="row">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
									{["Medicamentos", "Anestesia", "Alimentos", "Otros"].map((a) => (
										<div className="col-md-3 col-lg-2" key={a}>
										<div className="form-check">
											<input disabled={this.state.desactivar_campos_ficha}
											className="form-check-input"
											type="checkbox"
											name="alergias"
											value={a}
											checked={this.state.alergias?.includes(a) || false}
											onChange={this.handleChange}
											/>
											<label className="form-check-label">{a}</label>
										</div>
										</div>
									))}
									</div>
									<input
									type="text" disabled={this.state.desactivar_campos_ficha}
									name="alergias_detalle"
									placeholder="Especifique (ej. Penicilina)"
									className="form-control mt-2"
									value={this.state.alergias_detalle || ""}
									onChange={this.handleChange}
									/>
								</div>

								{/*Enfermedades */}
								<label className="form-label">Enfermedades</label>			
								<div className="row">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
									{["Hipertensión", "Diabetes", "Asma", "Cardiopatías", "Epilepsia", "Cáncer", "Hepatitis", "VIH/SIDA", "Otras"].map((e) => (
										<div className="col-md-3 col-lg-2" key={e}>
											<div className="form-check">

												{e === "Cáncer" && (
													<span style={{ textDecoration: 'underline' }}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
												)}

												<input
													className="form-check-input"
													type="checkbox"
													name="enfermedades"
													disabled={this.state.desactivar_campos_ficha}
													value={e}
													checked={this.state.enfermedades?.includes(e) || false}
													onChange={this.handleChange}
												/> 
												<label className="form-check-label">{e}</label>
											</div>
										</div>
									))}
								</div> 

								</fieldset>

								{/* HÁBITOS */}
								<fieldset className="mb-3">
								<legend className="fw-semibold mb-3">Hábitos</legend>
								<div className="row g-3">
									<div className="col-md-4 col-lg-3">
									<label className="form-label">Tabaquismo</label>
									<select
										name="tabaquismo"
										className="form-control"
										disabled={this.state.desactivar_campos_ficha}
										value={this.state.tabaquismo || ""}
										onChange={this.handleChange}
									>
										<option value="">--</option>
										<option>Nunca</option>
										<option>Actual</option>
										<option>Ex-fumador</option>
									</select>
									</div>

									<div className="col-md-4 col-lg-3">
									<label className="form-label">Consumo de alcohol</label>
									<select
										name="alcohol"
										className="form-control"
										disabled={this.state.desactivar_campos_ficha}
										value={this.state.alcohol || ""}
										onChange={this.handleChange}
									>
										<option value="">--</option>
										<option>Nunca</option>
										<option>Ocasional</option>
										<option>Frecuente</option>
									</select>
									</div>

									<div className="col-md-4 col-lg-6">
									<label className="form-label">Otros hábitos</label>
									<input
										disabled={this.state.desactivar_campos_ficha}
										type="text"
										name="otros_habitos"
										className="form-control"
										value={this.state.otros_habitos || ""}
										onChange={this.handleChange}
									/>
									</div>
								</div>
								</fieldset>
							</form>
							</div>

							{/* Footer */}
							<div className="modal-footer">
							{this.state.tiene_ficha_medica && (
								//boton de editar
								<button className='btn btn-warning' onClick={this.handleEdit}>Editar</button>
							)}
								<button
								type="button"
								className="btn btn-secondary"
								onClick={() =>
								this.setState({ modal_ficha_medica_visible: false })
								}
							>
								❌ Cerrar
							</button>
							<button
								type="button"
								className="btn btn-primary"
								onClick={this.handleSubmit}
							>
								💾 Guardar
							</button>
							</div>
						</div>
						</div>
					</div>
					)}

				{this.state.modal_documento_visible && (
				<div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
					<div className="modal-dialog modal-xl modal-dialog-centered">
					<div className="modal-content">
						<div className="modal-header">
						<h5 className="modal-title">📁 Documentos del Paciente</h5>
						<button className="btn-close" onClick={() => this.setState({ modalDocumentosVisible: false })}></button>
						</div>
						<div className="modal-body">
						<table className="table">
							<thead>
							<tr>
								<th>Documento</th>
								<th>Comentarios</th>
								<th>Fecha</th>
								<th>Eliminar</th>
							</tr>
							</thead>
							<tbody>
							{this.state.documentos.map((doc) => (
								<tr key={doc.id}>
								<td><a href={`${Verficar.url_base}/storage/${doc.ruta_radiografia}`} target="_blank" rel="noopener noreferrer">Ver documento</a></td>
								<td>{doc.comentarios}</td>
								<td>{doc.updated_at}</td>
								<td>
									<button className="btn btn-warning btn-sm" onClick={() => this.eliminarDocumento(doc.id)}>
									Eliminar
									</button>
								</td>
								</tr>
							))}
							</tbody>
						</table>

						<hr />
						<h6>➕ Agregar nuevo documento</h6>
						<input type="file" className="form-control mb-2" onChange={(e) => this.setState({ nuevoArchivo: e.target.files[0] })} />
						<textarea
							className="form-control mb-2"
							placeholder="Comentarios del documento"
							rows="3"
							value={this.state.nuevoComentario}
							onChange={(e) => this.setState({ nuevoComentario: e.target.value })}
						/>
						<button className="btn btn-primary" onClick={this.subirDocumento}>Subir Documento</button>
						</div>
						<div className="modal-footer">
						<button className="btn btn-secondary" onClick={() => this.setState({ modal_documento_visible: false })}>
							Cerrar
						</button>
						</div>
					</div>
					</div>
				</div>
				)}


			</div>
				);
			} else if (this.state.select === "ver_pacientes") {
				return <Pacientes />;
			} else if (this.state.select === "crear_presupuesto") {
				//return <CrearPresupuesto IDpaciente={this.props.id_paciente} />;
			} else if (this.state.select === "ver_presupuestos") {
			}
			}










}

export default PerfilPaciente;