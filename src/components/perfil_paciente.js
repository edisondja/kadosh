import React from 'react';
import Alertify from 'alertifyjs';
import Axios from 'axios';
import '../css/dashboard.css';
import AgregarCita from './agregar_cita';
import Verficar from './funciones_extras';
import Pacientes from './citas_c';
import alertify from 'alertifyjs';
import ImagenPerfil from '../usuario_listo.png'
import { Link } from 'react-router-dom';
import Recetas from './recetas';
import VerPresupuesto from './ver_presupuestos';




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
				modal_recetas_visible: false,
				modal_presupuestos_visible: false,
				desactivar_campos_ficha: false, 

				// Notas y Documentos
				nota_texto: '',
				documentos: [],
				notasPaciente: [],
				tiene_ficha_medica:false,
				nuevoArchivo: null,
				nuevoComentario: '',
				previewArchivo: null,
				dragActive: false,
				subiendoArchivo: false,
				vistaDocumentos: 'tabla', // 'tabla' o 'tarjetas'

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
					observaciones: '',

			};
		}

	// Función para calcular la edad a partir de la fecha de nacimiento
	calcularEdad = (fechaNacimiento) => {
		if (!fechaNacimiento) return 'N/A';
		
		const hoy = new Date();
		const fechaNac = new Date(fechaNacimiento);
		
		if (isNaN(fechaNac.getTime())) return 'N/A';
		
		let edad = hoy.getFullYear() - fechaNac.getFullYear();
		const mes = hoy.getMonth() - fechaNac.getMonth();
		
		if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
			edad--;
		}
		
		return edad;
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
						alergias_detalle: res.data.alergias_detalle,
						observaciones: res.data.observaciones || ''
						});

						this.setState({ desactivar_campos_ficha: true });

					console.log('Ficha medica', res.data);
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
				alergias_detalle: this.state.alergias_detalle,
				observaciones: this.state.observaciones
			
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
			this.setState({ modal_nota_visible: true });

		}

		closeModalNota = () => {

			this.setState({modal_nota_visible : false, nota_texto: '' });
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
				alertify.message('<i className="mac-icon-check-circle" style="color:green;"></i> Nota creada con éxito');
				
					this.setState({ modal_nota_visible: false, nota_texto: '' });
				})
				.catch((error) => {
				alertify.message('<i className="mac-icon-x-circle" style="color:red;"></i> No se pudo crear la nota');
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
		// Obtener la clave secreta de la configuración
		Axios.get(`${Verficar.url_base}/api/configs`).then(configResponse => {
			const config = configResponse.data && configResponse.data.length > 0 ? configResponse.data[0] : null;
			const claveSecreta = config ? config.clave_secreta : null;

			if (!claveSecreta) {
				Alertify.error("No se ha configurado una clave secreta. Por favor configúrela primero en Configuración.");
				return;
			}

			Alertify.prompt("Eliminar paciente","Digite la clave secreta para eliminar este paciente","",function(event,value){
				if(value === claveSecreta){
					Alertify.success("Clave correcta!");
					const usuarioId = localStorage.getItem("id_usuario");
					Axios.delete(`${Verficar.url_base}/api/borrar_paciente/${id_paciente}`, {
						data: {
							clave_secreta: value,
							usuario_id: usuarioId
						}
					}).then(data=>{
						Alertify.success("Paciente eliminado con exito");
						document.getElementById("agregar_paciente").click();
					}).catch(error=>{
						const errorMsg = error.response?.data?.message || "No se pudo eliminar el paciente";
						Alertify.error(errorMsg);
					});
				} else {
					Alertify.error("Clave secreta incorrecta");
				}
			},function(error){

			}).set("type","password");
		}).catch(error => {
			Alertify.error("Error al cargar la configuración");
		});
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
				if (!this.state.nuevoArchivo) {
					Alertify.warning("Por favor seleccione un archivo");
					return;
				}

				// Validar tamaño (10MB máximo)
				if (this.state.nuevoArchivo.size > 10 * 1024 * 1024) {
					Alertify.error("El archivo es demasiado grande. Máximo 10MB");
					return;
				}

				this.setState({ subiendoArchivo: true });

				const formData = new FormData();
				formData.append("image", this.state.nuevoArchivo);
				formData.append("usuario_id", this.props.match.params.id);
				formData.append("comentarios", this.state.nuevoComentario || "Sin comentarios");

				Axios.post(`${Verficar.url_base}/api/subir_radiografia`, formData, {
					headers: { 'Content-Type': 'multipart/form-data' }
				})
					.then(() => {
					Alertify.success("Archivo subido con éxito");
					this.setState({ 
						nuevoArchivo: null, 
						nuevoComentario: "",
						previewArchivo: null,
						subiendoArchivo: false
					});
					// Limpiar input file
					const fileInput = document.getElementById('fileInput');
					if (fileInput) fileInput.value = '';
					this.cargar_documentos(); // refrescar lista
					})
					.catch((error) => {
					Alertify.error("Error al subir el archivo");
					this.setState({ subiendoArchivo: false });
					console.error(error);
					});
			};

			handleFileSelect = (e) => {
				const file = e.target.files[0];
				if (file) {
					// Validar tamaño
					if (file.size > 10 * 1024 * 1024) {
						Alertify.error("El archivo es demasiado grande. Máximo 10MB");
						return;
					}
					
					this.setState({ nuevoArchivo: file });
					
					// Crear preview
					if (file.type.startsWith('image/')) {
						const reader = new FileReader();
						reader.onloadend = () => {
							this.setState({ previewArchivo: reader.result });
						};
						reader.readAsDataURL(file);
					} else {
						this.setState({ previewArchivo: null });
					}
				}
			};

			handleDragOver = (e) => {
				e.preventDefault();
				e.stopPropagation();
				this.setState({ dragActive: true });
			};

			handleDragLeave = (e) => {
				e.preventDefault();
				e.stopPropagation();
				this.setState({ dragActive: false });
			};

			handleDrop = (e) => {
				e.preventDefault();
				e.stopPropagation();
				this.setState({ dragActive: false });

				const file = e.dataTransfer.files[0];
				if (file) {
					// Validar tamaño
					if (file.size > 10 * 1024 * 1024) {
						Alertify.error("El archivo es demasiado grande. Máximo 10MB");
						return;
					}
					
					this.setState({ nuevoArchivo: file });
					
					// Crear preview
					if (file.type.startsWith('image/')) {
						const reader = new FileReader();
						reader.onloadend = () => {
							this.setState({ previewArchivo: reader.result });
						};
						reader.readAsDataURL(file);
					} else {
						this.setState({ previewArchivo: null });
					}
				}
			};

			descargarDocumento = (url, nombre) => {
				const link = document.createElement('a');
				link.href = url;
				link.download = nombre || 'documento';
				link.target = '_blank';
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			};

			eliminarDocumento = (id) => {

				Axios.post(`${Verficar.url_base}/api/eliminar_radiografia`,{id_radiografia:id})
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

		eliminar_cita = (id) => {
			
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
		
		};

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
					<div className="col-12 col-md-10" style={{ 
						backgroundColor: '#f5f5f7',
						minHeight: '100vh',
						padding: '15px',
						borderRadius: '16px'
					}}>
						<input type="hidden" id="paciente_id" value={this.props.id_paciente} />

						{/* Header principal */}
						<div className="card border-0 shadow-lg mb-4" style={{ 
							borderRadius: '16px',
							background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
							overflow: 'hidden',
							animation: 'fadeIn 0.5s ease'
						}}>
							<div className="card-body text-white p-4">
								<div className="d-flex justify-content-between align-items-start flex-wrap mb-3">
									<div className="d-flex align-items-center flex-wrap">
										<img
											id="foto_paciente"
											src={Verficar.url_base + "/storage/" + this.state.paciente.foto_paciente}
											alt="Foto Paciente"
											style={{
												width: '120px',
												height: '120px',
												objectFit: 'cover',
												borderRadius: '50%',
												border: '4px solid rgba(255,255,255,0.3)',
												boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
												marginRight: '25px',
												marginBottom: '15px'
											}}
										/>
										<div>
											<h2 className="mb-2" style={{ fontWeight: 700, fontSize: '36px' }}>
												{this.state.paciente.nombre} {this.state.paciente.apellido}
											</h2>
										</div>
									</div>
									<button 
										className="btn"
										onClick={this.detras}
										style={{
											background: 'rgba(255,255,255,0.2)',
											border: '2px solid rgba(255,255,255,0.3)',
											color: 'white',
											borderRadius: '12px',
											padding: '10px 20px',
											fontWeight: 600,
											fontSize: '14px',
											transition: 'all 0.3s ease',
											backdropFilter: 'blur(10px)',
											marginTop: '10px'
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
										<i className="fas fa-arrow-left me-2"></i>{Verficar.lenguaje.perfil_paciente.atras}
									</button>
								</div>
								
								{/* Datos del paciente separados */}
								<div className="row g-3 mt-2">
									<div className="col-12 col-md-6 col-lg-3">
										<div style={{
											background: 'rgba(255,255,255,0.15)',
											backdropFilter: 'blur(10px)',
											borderRadius: '12px',
											padding: '15px',
											border: '1px solid rgba(255,255,255,0.2)'
										}}>
											<div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
												<i className="fas fa-id-card me-2"></i>
												{Verficar.lenguaje.paciente_admin.cedula}
											</div>
											<div style={{ fontSize: '18px', fontWeight: 600 }}>
												{this.state.paciente.cedula || 'N/A'}
											</div>
										</div>
									</div>
									<div className="col-12 col-md-6 col-lg-3">
										<div style={{
											background: 'rgba(255,255,255,0.15)',
											backdropFilter: 'blur(10px)',
											borderRadius: '12px',
											padding: '15px',
											border: '1px solid rgba(255,255,255,0.2)'
										}}>
											<div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
												<i className="fas fa-birthday-cake me-2"></i>
												Edad
											</div>
											<div style={{ fontSize: '18px', fontWeight: 600 }}>
												{this.calcularEdad(this.state.paciente.fecha_nacimiento)} años
											</div>
										</div>
									</div>
									<div className="col-12 col-md-6 col-lg-3">
										<div style={{
											background: 'rgba(255,255,255,0.15)',
											backdropFilter: 'blur(10px)',
											borderRadius: '12px',
											padding: '15px',
											border: '1px solid rgba(255,255,255,0.2)'
										}}>
											<div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
												<i className="fas fa-phone me-2"></i>
												{Verficar.lenguaje.paciente_admin.telefono}
											</div>
											<div style={{ fontSize: '18px', fontWeight: 600 }}>
												{this.state.paciente.telefono || 'N/A'}
											</div>
										</div>
									</div>
									<div className="col-12 col-md-6 col-lg-3">
										<div style={{
											background: this.state.deuda_total > 0 ? 'rgba(220, 53, 69, 0.3)' : 'rgba(40, 167, 69, 0.3)',
											backdropFilter: 'blur(10px)',
											borderRadius: '12px',
											padding: '15px',
											border: '1px solid rgba(255,255,255,0.2)'
										}}>
											<div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
												<i className={this.state.deuda_total > 0 ? "fas fa-exclamation-triangle me-2" : "fas fa-check-circle me-2"}></i>
												Estado de Deuda
											</div>
											<div style={{ fontSize: '18px', fontWeight: 600 }}>
												{this.state.deuda_total > 0 ? (
													<>${new Intl.NumberFormat().format(this.state.deuda_total)}</>
												) : (
													<>Sin deuda</>
												)}
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Tutor si existe */}
						{this.state.paciente.nombre_tutor !== null && (
							<div className="card border-0 shadow-sm mb-4" style={{ 
								borderRadius: '16px',
								background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
								animation: 'slideUp 0.6s ease'
							}}>
								<div className="card-body p-3">
									<div style={{ display: 'flex', alignItems: 'center' }}>
										<i className="fa-solid fa-user-tie me-3" style={{ fontSize: '24px', color: '#667eea' }}></i>
										<div>
											<strong style={{ color: '#495057', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
												{Verficar.lenguaje.perfil_paciente.nombre_tutor}:
											</strong>
											<span style={{ color: '#667eea', fontWeight: 600, fontSize: '16px', marginLeft: '10px' }}>
												{this.state.paciente.nombre_tutor}
											</span>
										</div>
									</div>
								</div>
							</div>
						)}

						{/* Botones de acción */}
						<div className="card border-0 shadow-sm mb-4" style={{ 
							borderRadius: '16px',
							overflow: 'hidden',
							animation: 'slideUp 0.7s ease'
						}}>
							<div className="card-body p-4">
								<h5 className="mb-3" style={{ fontWeight: 600, color: '#495057' }}>
									<i className="fas fa-th-large me-2" style={{ color: '#1c1c1e' }}></i>
									Acciones Rápidas
								</h5>
								<div className="row">
									<div className="col-6 col-md-4 col-lg-3 mb-3">
										<Link to={`/agregar_factura/${this.props.match.params.id}/${this.props.match.params.id_doc}`} style={{ textDecoration: 'none' }}>
											<div style={{
												background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
												border: '2px solid #e0e0e0',
												borderRadius: '16px',
												padding: '20px',
												textAlign: 'center',
												cursor: 'pointer',
												transition: 'all 0.3s ease',
												boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
											}}
											onMouseEnter={(e) => {
												e.currentTarget.style.transform = 'translateY(-5px)';
												e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.2)';
												e.currentTarget.style.borderColor = '#667eea';
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.transform = 'translateY(0)';
												e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
												e.currentTarget.style.borderColor = '#e0e0e0';
											}}
											>
												<i className="fas fa-file-invoice-dollar" style={{ fontSize: '32px', color: '#667eea', marginBottom: '10px' }}></i>
												<h6 className="mb-0" style={{ fontWeight: 600, fontSize: '13px', color: '#2d2d2f' }}>
													{Verficar.lenguaje.perfil_paciente.factura}
												</h6>
											</div>
										</Link>
									</div>
									<div className="col-6 col-md-4 col-lg-3 mb-3">
										<Link to={`/ver_facturas/${this.props.match.params.id}`} style={{ textDecoration: 'none' }}>
											<div style={{
												background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
												border: '2px solid #e0e0e0',
												borderRadius: '16px',
												padding: '20px',
												textAlign: 'center',
												cursor: 'pointer',
												transition: 'all 0.3s ease',
												boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
											}}
											onMouseEnter={(e) => {
												e.currentTarget.style.transform = 'translateY(-5px)';
												e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.2)';
												e.currentTarget.style.borderColor = '#667eea';
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.transform = 'translateY(0)';
												e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
												e.currentTarget.style.borderColor = '#e0e0e0';
											}}
											>
												<i className="fas fa-file-alt" style={{ fontSize: '32px', color: '#667eea', marginBottom: '10px' }}></i>
												<h6 className="mb-0" style={{ fontWeight: 600, fontSize: '13px', color: '#2d2d2f' }}>
													{Verficar.lenguaje.perfil_paciente.ver_facturas}
												</h6>
											</div>
										</Link>
									</div>
									<div className="col-6 col-md-4 col-lg-3 mb-3">
										<div 
											onClick={() => this.setState({ modal_ficha_medica_visible: true })}
											style={{
												background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
												border: '2px solid #e0e0e0',
												borderRadius: '16px',
												padding: '20px',
												textAlign: 'center',
												cursor: 'pointer',
												transition: 'all 0.3s ease',
												boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
											}}
											onMouseEnter={(e) => {
												e.currentTarget.style.transform = 'translateY(-5px)';
												e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.2)';
												e.currentTarget.style.borderColor = '#667eea';
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.transform = 'translateY(0)';
												e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
												e.currentTarget.style.borderColor = '#e0e0e0';
											}}
										>
											<i className="fas fa-file-medical" style={{ fontSize: '32px', color: '#667eea', marginBottom: '10px' }}></i>
											<h6 className="mb-0" style={{ fontWeight: 600, fontSize: '13px', color: '#2d2d2f' }}>
												{Verficar.lenguaje.perfil_paciente.ficha_medica.nombre}
											</h6>
										</div>
									</div>
									<div className="col-6 col-md-4 col-lg-3 mb-3">
										<div 
											onClick={this.ver_notas}
											style={{
												background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
												border: '2px solid #e0e0e0',
												borderRadius: '16px',
												padding: '20px',
												textAlign: 'center',
												cursor: 'pointer',
												transition: 'all 0.3s ease',
												boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
											}}
											onMouseEnter={(e) => {
												e.currentTarget.style.transform = 'translateY(-5px)';
												e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.2)';
												e.currentTarget.style.borderColor = '#667eea';
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.transform = 'translateY(0)';
												e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
												e.currentTarget.style.borderColor = '#e0e0e0';
											}}
										>
											<i className="fas fa-sticky-note" style={{ fontSize: '32px', color: '#667eea', marginBottom: '10px' }}></i>
											<h6 className="mb-0" style={{ fontWeight: 600, fontSize: '13px', color: '#2d2d2f' }}>
												{Verficar.lenguaje.perfil_paciente.notas}
											</h6>
										</div>
									</div>
									<div className="col-6 col-md-4 col-lg-3 mb-3">
										<div 
											onClick={this.openModalNota}
											style={{
												background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
												border: '2px solid #e0e0e0',
												borderRadius: '16px',
												padding: '20px',
												textAlign: 'center',
												cursor: 'pointer',
												transition: 'all 0.3s ease',
												boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
											}}
											onMouseEnter={(e) => {
												e.currentTarget.style.transform = 'translateY(-5px)';
												e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.2)';
												e.currentTarget.style.borderColor = '#667eea';
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.transform = 'translateY(0)';
												e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
												e.currentTarget.style.borderColor = '#e0e0e0';
											}}
										>
											<i className="fas fa-plus-circle" style={{ fontSize: '32px', color: '#667eea', marginBottom: '10px' }}></i>
											<h6 className="mb-0" style={{ fontWeight: 600, fontSize: '13px', color: '#2d2d2f' }}>
												{Verficar.lenguaje.perfil_paciente.agregar_nota}
											</h6>
										</div>
									</div>
									<div className="col-6 col-md-4 col-lg-3 mb-3">
										<div 
											onClick={this.cargar_documentos}
											style={{
												background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
												border: '2px solid #e0e0e0',
												borderRadius: '16px',
												padding: '20px',
												textAlign: 'center',
												cursor: 'pointer',
												transition: 'all 0.3s ease',
												boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
											}}
											onMouseEnter={(e) => {
												e.currentTarget.style.transform = 'translateY(-5px)';
												e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.2)';
												e.currentTarget.style.borderColor = '#667eea';
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.transform = 'translateY(0)';
												e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
												e.currentTarget.style.borderColor = '#e0e0e0';
											}}
										>
											<i className="fas fa-folder-open" style={{ fontSize: '32px', color: '#667eea', marginBottom: '10px' }}></i>
											<h6 className="mb-0" style={{ fontWeight: 600, fontSize: '13px', color: '#2d2d2f' }}>
												{Verficar.lenguaje.perfil_paciente.documentos}
											</h6>
										</div>
									</div>
									<div className="col-6 col-md-4 col-lg-3 mb-3">
										<div 
											onClick={() => this.setState({ modal_presupuestos_visible: true })}
											style={{
												background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
												border: '2px solid #e0e0e0',
												borderRadius: '16px',
												padding: '20px',
												textAlign: 'center',
												cursor: 'pointer',
												transition: 'all 0.3s ease',
												boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
											}}
											onMouseEnter={(e) => {
												e.currentTarget.style.transform = 'translateY(-5px)';
												e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.2)';
												e.currentTarget.style.borderColor = '#667eea';
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.transform = 'translateY(0)';
												e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
												e.currentTarget.style.borderColor = '#e0e0e0';
											}}
										>
											<i className="fas fa-file-invoice-dollar" style={{ fontSize: '32px', color: '#667eea', marginBottom: '10px' }}></i>
											<h6 className="mb-0" style={{ fontWeight: 600, fontSize: '13px', color: '#2d2d2f' }}>
												Presupuestos
											</h6>
										</div>
									</div>
									<div className="col-6 col-md-4 col-lg-3 mb-3">
										<Link to={`/odontograma/${this.props.match.params.id}/${this.props.match.params.id_doc}`} style={{ textDecoration: 'none' }}>
											<div style={{
												background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
												border: '2px solid #e0e0e0',
												borderRadius: '16px',
												padding: '20px',
												textAlign: 'center',
												cursor: 'pointer',
												transition: 'all 0.3s ease',
												boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
											}}
											onMouseEnter={(e) => {
												e.currentTarget.style.transform = 'translateY(-5px)';
												e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.2)';
												e.currentTarget.style.borderColor = '#667eea';
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.transform = 'translateY(0)';
												e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
												e.currentTarget.style.borderColor = '#e0e0e0';
											}}
											>
												<i className="fas fa-tooth" style={{ fontSize: '32px', color: '#667eea', marginBottom: '10px' }}></i>
												<h6 className="mb-0" style={{ fontWeight: 600, fontSize: '13px', color: '#2d2d2f' }}>
													Odontograma
												</h6>
											</div>
										</Link>
									</div>
									<div className="col-6 col-md-4 col-lg-3 mb-3">
										<Link to={`/ver_odontogramas/${this.props.match.params.id}`} style={{ textDecoration: 'none' }}>
											<div style={{
												background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
												border: '2px solid #e0e0e0',
												borderRadius: '16px',
												padding: '20px',
												textAlign: 'center',
												cursor: 'pointer',
												transition: 'all 0.3s ease',
												boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
											}}
											onMouseEnter={(e) => {
												e.currentTarget.style.transform = 'translateY(-5px)';
												e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.2)';
												e.currentTarget.style.borderColor = '#667eea';
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.transform = 'translateY(0)';
												e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
												e.currentTarget.style.borderColor = '#e0e0e0';
											}}
											>
												<i className="fas fa-list" style={{ fontSize: '32px', color: '#667eea', marginBottom: '10px' }}></i>
												<h6 className="mb-0" style={{ fontWeight: 600, fontSize: '13px', color: '#2d2d2f' }}>
													Ver Odontogramas
												</h6>
											</div>
										</Link>
									</div>
									<div className="col-6 col-md-4 col-lg-3 mb-3">
										<div 
											onClick={() => this.setState({ modal_recetas_visible: true })}
											style={{
												background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
												border: '2px solid #e0e0e0',
												borderRadius: '16px',
												padding: '20px',
												textAlign: 'center',
												cursor: 'pointer',
												transition: 'all 0.3s ease',
												boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
											}}
											onMouseEnter={(e) => {
												e.currentTarget.style.transform = 'translateY(-5px)';
												e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.2)';
												e.currentTarget.style.borderColor = '#667eea';
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.transform = 'translateY(0)';
												e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
												e.currentTarget.style.borderColor = '#e0e0e0';
											}}
										>
											<i className="fas fa-prescription" style={{ fontSize: '32px', color: '#667eea', marginBottom: '10px' }}></i>
											<h6 className="mb-0" style={{ fontWeight: 600, fontSize: '13px', color: '#2d2d2f' }}>
												Recetas
											</h6>
										</div>
									</div>
									<div className="col-6 col-md-4 col-lg-3 mb-3">
										<div 
											onClick={() => this.eliminar_paciente(this.state.paciente.id)}
											style={{
												background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
												border: '2px solid transparent',
												borderRadius: '16px',
												padding: '20px',
												textAlign: 'center',
												cursor: 'pointer',
												transition: 'all 0.3s ease',
												boxShadow: '0 2px 8px rgba(220, 53, 69, 0.3)'
											}}
											onMouseEnter={(e) => {
												e.currentTarget.style.transform = 'translateY(-5px)';
												e.currentTarget.style.boxShadow = '0 6px 16px rgba(220, 53, 69, 0.4)';
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.transform = 'translateY(0)';
												e.currentTarget.style.boxShadow = '0 2px 8px rgba(220, 53, 69, 0.3)';
											}}
										>
											<i className="fas fa-trash-alt" style={{ fontSize: '32px', color: 'white', marginBottom: '10px' }}></i>
											<h6 className="mb-0" style={{ fontWeight: 600, fontSize: '13px', color: 'white' }}>
												{Verficar.lenguaje.perfil_paciente.eliminar}
											</h6>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Información del paciente */}
						<div className="card border-0 shadow-sm mb-4" style={{ 
							borderRadius: '16px',
							overflow: 'hidden',
							animation: 'slideUp 0.8s ease'
						}}>
							<div className="table-responsive">
								<table className="table table-hover mb-0">
									<thead style={{
										background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
										borderBottom: '2px solid #e0e0e0'
									}}>
										<tr>
											<th style={{ 
												fontWeight: 600, 
												fontSize: '13px',
												textTransform: 'uppercase',
												letterSpacing: '0.5px',
												color: '#495057',
												padding: '15px 20px',
												border: 'none'
											}}>{Verficar.lenguaje.paciente_admin.nombre}</th>
											<th style={{ 
												fontWeight: 600, 
												fontSize: '13px',
												textTransform: 'uppercase',
												letterSpacing: '0.5px',
												color: '#495057',
												padding: '15px 20px',
												border: 'none'
											}}>{Verficar.lenguaje.paciente_admin.cedula}</th>
											<th style={{ 
												fontWeight: 600, 
												fontSize: '13px',
												textTransform: 'uppercase',
												letterSpacing: '0.5px',
												color: '#495057',
												padding: '15px 20px',
												border: 'none'
											}}>Edad</th>
											<th style={{ 
												fontWeight: 600, 
												fontSize: '13px',
												textTransform: 'uppercase',
												letterSpacing: '0.5px',
												color: '#495057',
												padding: '15px 20px',
												border: 'none'
											}}>{Verficar.lenguaje.paciente_admin.telefono}</th>
											<th style={{ 
												fontWeight: 600, 
												fontSize: '13px',
												textTransform: 'uppercase',
												letterSpacing: '0.5px',
												color: '#495057',
												padding: '15px 20px',
												border: 'none'
											}}>{Verficar.lenguaje.paciente_admin.correo_electronico}</th>
											<th style={{ 
												fontWeight: 600, 
												fontSize: '13px',
												textTransform: 'uppercase',
												letterSpacing: '0.5px',
												color: '#495057',
												padding: '15px 20px',
												border: 'none'
											}}>{Verficar.lenguaje.paciente_admin.fecha_de_ingreso}</th>
											<th style={{ 
												fontWeight: 600, 
												fontSize: '13px',
												textTransform: 'uppercase',
												letterSpacing: '0.5px',
												color: '#495057',
												padding: '15px 20px',
												border: 'none'
											}}>{Verficar.lenguaje.paciente_admin.ingresado}</th>
											<th style={{ 
												fontWeight: 600, 
												fontSize: '13px',
												textTransform: 'uppercase',
												letterSpacing: '0.5px',
												color: '#495057',
												padding: '15px 20px',
												border: 'none',
												textAlign: 'right'
											}}>{Verficar.lenguaje.citas_c.deuda}</th>
										</tr>
									</thead>
									<tbody>
										<tr style={{
											transition: 'all 0.2s ease',
											borderBottom: '1px solid #f0f0f0'
										}}
										onMouseEnter={(e) => {
											e.currentTarget.style.background = '#f8f9fa';
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.background = 'white';
										}}
										>
											<td style={{ padding: '15px 20px', verticalAlign: 'middle', fontWeight: 500 }}>
												{this.state.paciente.nombre} {this.state.paciente.apellido}
											</td>
											<td style={{ padding: '15px 20px', verticalAlign: 'middle' }}>{this.state.paciente.cedula}</td>
											<td style={{ padding: '15px 20px', verticalAlign: 'middle' }}>
												<span className="badge" style={{
													background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
													color: 'white',
													padding: '6px 12px',
													borderRadius: '8px',
													fontWeight: 600,
													fontSize: '13px'
												}}>
													{this.calcularEdad(this.state.paciente.fecha_nacimiento)} años
												</span>
											</td>
											<td style={{ padding: '15px 20px', verticalAlign: 'middle' }}>{this.state.paciente.telefono}</td>
											<td style={{ padding: '15px 20px', verticalAlign: 'middle' }}>{this.state.paciente.correo_electronico || '-'}</td>
											<td style={{ padding: '15px 20px', verticalAlign: 'middle' }}>
												<span style={{ color: '#667eea', fontWeight: 600 }}>
													{this.state.paciente.fecha_de_ingreso}
												</span>
											</td>
											<td style={{ padding: '15px 20px', verticalAlign: 'middle' }}>
												{this.state.doctor.nombre} {this.state.doctor.apellido}
											</td>
											<td style={{ padding: '15px 20px', verticalAlign: 'middle', textAlign: 'right' }}>
												<span className="badge" style={{
													background: this.state.deuda_total > 0 
														? 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)'
														: 'linear-gradient(135deg, #51d18a 0%, #3db870 100%)',
													color: 'white',
													padding: '8px 16px',
													borderRadius: '8px',
													fontWeight: 600,
													fontSize: '14px',
													boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
												}}>
													${new Intl.NumberFormat().format(this.state.deuda_total || 0)}
												</span>
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>

						{/* Ficha Médica */}
						<div className="card border-0 shadow-sm mb-4" style={{ 
							borderRadius: '16px',
							overflow: 'hidden',
							animation: 'slideUp 0.9s ease'
						}}>
							<div className="card-body p-4">
								<h5 className="mb-3" style={{ fontWeight: 600, color: '#495057' }}>
									<i className="fas fa-file-medical me-2" style={{ color: '#1c1c1e' }}></i>
									Ficha Médica
								</h5>
								<div className="table-responsive">
									<table className="table table-hover mb-0">
										<thead style={{
											background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
											borderBottom: '2px solid #e0e0e0'
										}}>
											<tr>
												<th style={{ 
													fontWeight: 600, 
													fontSize: '13px',
													textTransform: 'uppercase',
													letterSpacing: '0.5px',
													color: '#495057',
													padding: '15px 20px',
													border: 'none'
												}}>{Verficar.lenguaje.perfil_paciente.ficha_medica.nombre}</th>
												<th style={{ 
													fontWeight: 600, 
													fontSize: '13px',
													textTransform: 'uppercase',
													letterSpacing: '0.5px',
													color: '#495057',
													padding: '15px 20px',
													border: 'none'
												}}>{Verficar.lenguaje.perfil_paciente.ficha_medica.direccion}</th>
												<th style={{ 
													fontWeight: 600, 
													fontSize: '13px',
													textTransform: 'uppercase',
													letterSpacing: '0.5px',
													color: '#495057',
													padding: '15px 20px',
													border: 'none'
												}}>{Verficar.lenguaje.perfil_paciente.ficha_medica.alergias}</th>
												<th style={{ 
													fontWeight: 600, 
													fontSize: '13px',
													textTransform: 'uppercase',
													letterSpacing: '0.5px',
													color: '#495057',
													padding: '15px 20px',
													border: 'none'
												}}>{Verficar.lenguaje.perfil_paciente.ficha_medica.enfermedades}</th>
											</tr>
										</thead>
										<tbody>
											<tr style={{
												transition: 'all 0.2s ease',
												borderBottom: '1px solid #f0f0f0'
											}}
											onMouseEnter={(e) => {
												e.currentTarget.style.background = '#f8f9fa';
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.background = 'white';
											}}
											>
												<td style={{ padding: '15px 20px', verticalAlign: 'middle' }}>
													{this.state.created_at || '-'}
												</td>
												<td style={{ padding: '15px 20px', verticalAlign: 'middle' }}>
													{this.state.direccion || '-'}
												</td>
												<td style={{ padding: '15px 20px', verticalAlign: 'middle' }}>
													{this.state.alergias && this.state.alergias.length > 0 
														? this.state.alergias.join(', ') 
														: (this.state.alergias_detalle || 'No especificadas')}
												</td>
												<td style={{ padding: '15px 20px', verticalAlign: 'middle' }}>
													{this.state.enfermedades && this.state.enfermedades.length > 0
														? this.state.enfermedades.map((enfermedad, index) => (
															<span key={index} className="badge" style={{
																background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
																color: '#495057',
																padding: '4px 10px',
																borderRadius: '6px',
																marginRight: '5px',
																fontSize: '12px',
																fontWeight: 500
															}}>
																{enfermedad}
															</span>
														))
														: '-'}
												</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>
						</div>

						{/* Lista de Citas */}
						<div className="card border-0 shadow-sm mb-4" style={{ 
							borderRadius: '16px',
							overflow: 'hidden',
							animation: 'slideUp 1s ease'
						}}>
							<div className="card-body p-4">
								<h5 className="mb-3" style={{ fontWeight: 600, color: '#495057' }}>
									<i className="fas fa-calendar-alt me-2" style={{ color: '#1c1c1e' }}></i>
									{Verficar.lenguaje.perfil_paciente.lista_de_citas.nombre}
								</h5>
								<div className="table-responsive">
									<table className="table table-hover mb-0">
										<thead style={{
											background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
											borderBottom: '2px solid #e0e0e0'
										}}>
											<tr>
												<th style={{ 
													fontWeight: 600, 
													fontSize: '13px',
													textTransform: 'uppercase',
													letterSpacing: '0.5px',
													color: '#495057',
													padding: '15px 20px',
													border: 'none'
												}}>{Verficar.lenguaje.perfil_paciente.lista_de_citas.inicio}</th>
												<th style={{ 
													fontWeight: 600, 
													fontSize: '13px',
													textTransform: 'uppercase',
													letterSpacing: '0.5px',
													color: '#495057',
													padding: '15px 20px',
													border: 'none'
												}}>{Verficar.lenguaje.perfil_paciente.lista_de_citas.fin}</th>
												<th style={{ 
													fontWeight: 600, 
													fontSize: '13px',
													textTransform: 'uppercase',
													letterSpacing: '0.5px',
													color: '#495057',
													padding: '15px 20px',
													border: 'none'
												}}>{Verficar.lenguaje.perfil_paciente.lista_de_citas.motivo}</th>
												<th style={{ 
													fontWeight: 600, 
													fontSize: '13px',
													textTransform: 'uppercase',
													letterSpacing: '0.5px',
													color: '#495057',
													padding: '15px 20px',
													border: 'none'
												}}>{Verficar.lenguaje.perfil_paciente.lista_de_citas.doctor}</th>
											</tr>
										</thead>
										<tbody>
											{this.state.lista_citas.length > 0 ? (
												this.state.lista_citas.map((data) => (
													<tr 
														key={data.id}
														style={{
															transition: 'all 0.2s ease',
															borderBottom: '1px solid #f0f0f0'
														}}
														onMouseEnter={(e) => {
															e.currentTarget.style.background = '#f8f9fa';
														}}
														onMouseLeave={(e) => {
															e.currentTarget.style.background = 'white';
														}}
													>
														<td style={{ padding: '15px 20px', verticalAlign: 'middle' }}>{data.inicio}</td>
														<td style={{ padding: '15px 20px', verticalAlign: 'middle' }}>{data.fin}</td>
														<td style={{ padding: '15px 20px', verticalAlign: 'middle' }}>{data.motivo || '-'}</td>
														<td style={{ padding: '15px 20px', verticalAlign: 'middle' }}>
															{data.doctor ? `${data.doctor.nombre} ${data.doctor.apellido}` : '-'}
														</td>
													</tr>
												))
											) : (
												<tr>
													<td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: '#6c757d' }}>
														<i className="fas fa-calendar-times me-2"></i>
														No hay citas registradas
													</td>
												</tr>
											)}
										</tbody>
									</table>
								</div>
							</div>
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

								{/* OBSERVACIONES */}
								<fieldset className="mb-4">
								<legend className="fw-semibold mb-3">Observaciones</legend>
								<div className="row g-3">
									<div className="col-12">
									<label className="form-label">Observaciones generales</label>
									<textarea
										disabled={this.state.desactivar_campos_ficha}
										name="observaciones"
										className="form-control"
										rows="4"
										placeholder="Ingrese cualquier observación adicional sobre el paciente..."
										value={this.state.observaciones || ""}
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
			{this.state.modal_nota_visible && (
				<div
					className="modal d-block"
					style={{
					backgroundColor: 'rgba(0,0,0,0.3)',
					zIndex: 1050,
					position: 'fixed',
					top: 0,
					left: 0,
					width: '100%',
					height: '100%',
					overflow: 'auto',
					pointerEvents: 'auto',
					}}>
					<div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 600 }}>
					<div
						className="mac-box p-4 rounded-3 shadow-lg bg-white"
						style={{
						width: '100%',
						zIndex: 1060,
						pointerEvents: 'auto',
						}}>
						<div className="d-flex justify-content-between align-items-center mb-3">
						<h5 className="fw-bold">📝 Escribir Nota del Paciente</h5>
						<button type="button" className="btn-close" onClick={() => this.setState({ modal_nota_visible: false })}></button>
						</div>

						<textarea
						className="mac-input w-100"
						placeholder="Escribe aquí la nota..."
						rows={6}
						value={this.state.nota_texto}
						onChange={(e) => this.setState({ nota_texto: e.target.value })}
						style={{ resize: 'vertical' }}
						></textarea>

						<div className="d-flex justify-content-end gap-2 mt-4">
						<button
							className="mac-btn mac-btn-green"
							onClick={() => {
							this.guardarNota();
							this.setState({ modal_nota_visible: false });
							}}>
							💾 Guardar
						</button>
						<button className="mac-btn mac-btn-gray" onClick={() => this.setState({ modal_nota_visible: false })}>
							❌ Cancelar
						</button>
						</div>
					</div>
					</div>
				</div>
				)}
	
			{this.state.modal_documento_visible && (
				<div
					className="modal d-block"
					style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
					<div
					className="modal-dialog modal-xxl modal-dialog-centered"
					style={{ maxWidth: "95%", width: "95%" }}
					>
					<div className="modal-content mac-box">
						<div className="modal-header border-0 d-flex justify-content-between align-items-center" style={{ padding: '15px 20px' }}>
						<h4 className="modal-title flex items-center gap-2 mb-0">
							<i className="fa-solid fa-folder"></i>
							<span>&nbsp;Documentos del paciente</span>
						</h4>
						<div className="d-flex align-items-center">
							{/* Botón de subir en el header */}
							<button 
								className="btn btn-primary btn-sm" 
								style={{ 
									padding: '8px 16px',
									marginRight: '15px',
									borderRadius: '6px',
									fontWeight: '600'
								}}
								onClick={() => {
									// Si hay un archivo seleccionado, subirlo directamente
									if (this.state.nuevoArchivo) {
										this.subirDocumento();
									} else {
										// Si no hay archivo, abrir el selector
										const fileInput = document.getElementById('fileInput');
										if (fileInput) {
											fileInput.click();
										}
									}
								}}
								disabled={this.state.subiendoArchivo}
								title={this.state.nuevoArchivo ? "Subir documento seleccionado" : "Seleccionar archivo para subir"}
							>
								{this.state.subiendoArchivo ? (
									<>
										<span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
										Subiendo...
									</>
								) : (
									<>
										<i className="fas fa-upload me-1"></i>
										{this.state.nuevoArchivo ? 'Subir' : 'Subir Documento'}
									</>
								)}
							</button>
							<button
								className="btn-close"
								onClick={() => this.setState({ modal_documento_visible: false })}
							></button>
						</div>
						</div>

						<div className="modal-body bg-gray-50 rounded-xl p-3" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
						{/* Selector de vista */}
						{this.state.documentos.length > 0 && (
							<div className="d-flex justify-content-end mb-3">
								<div className="btn-group" role="group">
									<button
										type="button"
										className={`btn btn-sm ${this.state.vistaDocumentos === 'tabla' ? 'btn-primary' : 'btn-outline-primary'}`}
										onClick={() => this.setState({ vistaDocumentos: 'tabla' })}
									>
										<i className="fas fa-list"></i> Tabla
									</button>
									<button
										type="button"
										className={`btn btn-sm ${this.state.vistaDocumentos === 'tarjetas' ? 'btn-primary' : 'btn-outline-primary'}`}
										onClick={() => this.setState({ vistaDocumentos: 'tarjetas' })}
									>
										<i className="fas fa-th"></i> Tarjetas
									</button>
								</div>
							</div>
						)}

						{/* Vista en modo lista */}
						{this.state.documentos.length === 0 ? (
							<div className="text-center text-gray-500 py-5">
							<i className="fas fa-folder-open fa-3x mb-3 text-gray-400"></i>
							<p className="mb-0">No hay documentos registrados aún.</p>
							<small className="text-muted">Arrastra archivos o haz clic en el área de abajo para agregar documentos</small>
							</div>
						) : this.state.vistaDocumentos === 'tabla' ? (
							<div className="table-responsive">
								<table className="table table-hover align-middle bg-white rounded">
								<thead className="bg-primary text-white">
									<tr>
									<th style={{ width: "80px" }}>Vista</th>
									<th>Comentarios</th>
									<th>Tipo</th>
									<th>Fecha</th>
									<th style={{ width: "150px" }}>Acciones</th>
									</tr>
								</thead>
								<tbody>
									{this.state.documentos.map((doc) => {
									const url = `${Verficar.url_base}/storage/${doc.ruta_radiografia}`;
									const esImagen = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(
										doc.ruta_radiografia
									);
									const esPdf = /\.pdf$/i.test(doc.ruta_radiografia);
									const tipo = esImagen ? "Imagen" : esPdf ? "PDF" : "Archivo";
									const nombreArchivo = doc.ruta_radiografia.split('/').pop() || doc.ruta_radiografia;

									return (
										<tr key={doc.id} className="hover:bg-gray-50 transition">
										<td>
											{esImagen ? (
											<a
												href={url}
												target="_blank"
												rel="noopener noreferrer"
												className="d-inline-block"
											>
												<img
												src={url}
												alt="Documento"
												width={60}
												height={60}
												className="rounded border shadow-sm object-cover"
												style={{ objectFit: 'cover' }}
												/>
											</a>
											) : esPdf ? (
											<div className="text-center">
												<i className="fas fa-file-pdf fa-3x text-danger"></i>
											</div>
											) : (
											<div className="text-center">
												<i className="fas fa-file fa-3x text-primary"></i>
											</div>
											)}
										</td>

										<td>
											<div className="fw-bold">{doc.comentarios || "Sin comentarios"}</div>
											<small className="text-muted">{nombreArchivo}</small>
										</td>
										<td>
											<span className={`badge ${esImagen ? 'bg-success' : esPdf ? 'bg-danger' : 'bg-info'}`}>
												{tipo}
											</span>
										</td>
										<td>{new Date(doc.updated_at).toLocaleDateString('es-ES', { 
											year: 'numeric', 
											month: 'short', 
											day: 'numeric',
											hour: '2-digit',
											minute: '2-digit'
										})}</td>
										<td>
											<div className="btn-group btn-group-sm" role="group">
												<a
													href={url}
													target="_blank"
													rel="noopener noreferrer"
													className="btn btn-outline-primary"
													title="Ver documento"
												>
													<i className="fas fa-eye"></i>
												</a>
												<button
													className="btn btn-outline-success"
													onClick={() => this.descargarDocumento(url, nombreArchivo)}
													title="Descargar"
												>
													<i className="fas fa-download"></i>
												</button>
												<button
													className="btn btn-outline-danger"
													onClick={() => {
														alertify.confirm(
														"Confirmar eliminación",
														`¿Deseas eliminar el documento "${doc.comentarios || "sin nombre"}"?`,
														() => {
															this.eliminarDocumento(doc.id);
															alertify.success("Documento eliminado");
														},
														() => {
															alertify.message("Cancelado");
														}
														);
													}}
													title="Eliminar"
												>
													<i className="fas fa-trash"></i>
												</button>
											</div>
										</td>
										</tr>
									);
									})}
								</tbody>
								</table>
							</div>
						) : (
							<div className="row g-3">
								{this.state.documentos.map((doc) => {
								const url = `${Verficar.url_base}/storage/${doc.ruta_radiografia}`;
								const esImagen = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(
									doc.ruta_radiografia
								);
								const esPdf = /\.pdf$/i.test(doc.ruta_radiografia);
								const tipo = esImagen ? "Imagen" : esPdf ? "PDF" : "Archivo";
								const nombreArchivo = doc.ruta_radiografia.split('/').pop() || doc.ruta_radiografia;

								return (
									<div key={doc.id} className="col-md-4 col-sm-6">
									<div className="card h-100 shadow-sm border-0">
										<div className="card-body p-2">
											{esImagen ? (
											<a
												href={url}
												target="_blank"
												rel="noopener noreferrer"
												className="d-block"
											>
												<img
												src={url}
												alt="Documento"
												className="card-img-top rounded"
												style={{ height: '150px', objectFit: 'cover', width: '100%' }}
												/>
											</a>
											) : (
											<div className="text-center py-4 bg-light rounded">
												{esPdf ? (
													<i className="fas fa-file-pdf fa-4x text-danger"></i>
												) : (
													<i className="fas fa-file fa-4x text-primary"></i>
												)}
											</div>
											)}
											<div className="card-body p-2">
												<h6 className="card-title text-truncate mb-1" title={doc.comentarios || "Sin comentarios"}>
													{doc.comentarios || "Sin comentarios"}
												</h6>
												<small className="text-muted d-block text-truncate mb-2">{nombreArchivo}</small>
												<div className="d-flex justify-content-between align-items-center">
													<span className={`badge ${esImagen ? 'bg-success' : esPdf ? 'bg-danger' : 'bg-info'}`}>
														{tipo}
													</span>
													<small className="text-muted">
														{new Date(doc.updated_at).toLocaleDateString('es-ES', { 
															month: 'short', 
															day: 'numeric'
														})}
													</small>
												</div>
											</div>
										</div>
										<div className="card-footer bg-white border-top p-2">
											<div className="btn-group w-100" role="group">
												<a
													href={url}
													target="_blank"
													rel="noopener noreferrer"
													className="btn btn-sm btn-outline-primary"
													title="Ver"
												>
													<i className="fas fa-eye"></i>
												</a>
												<button
													className="btn btn-sm btn-outline-success"
													onClick={() => this.descargarDocumento(url, nombreArchivo)}
													title="Descargar"
												>
													<i className="fas fa-download"></i>
												</button>
												<button
													className="btn btn-sm btn-outline-danger"
													onClick={() => {
														alertify.confirm(
														"Confirmar eliminación",
														`¿Deseas eliminar el documento "${doc.comentarios || "sin nombre"}"?`,
														() => {
															this.eliminarDocumento(doc.id);
															alertify.success("Documento eliminado");
														},
														() => {
															alertify.message("Cancelado");
														}
														);
													}}
													title="Eliminar"
												>
													<i className="fas fa-trash"></i>
												</button>
											</div>
										</div>
									</div>
									</div>
								);
								})}
							</div>
						)}

						{/* Subir nuevo documento */}
						<hr className="my-2" />
						<h6 className="text-lg font-semibold mb-2" style={{ fontSize: '16px' }}>
							<i className="fas fa-cloud-upload-alt me-2"></i>
							Agregar nuevo documento
						</h6>

						<div className="bg-white p-3 rounded-2xl shadow-sm">
							{/* Área de drag & drop */}
							<div
								className={`border-2 border-dashed rounded-lg p-3 text-center mb-2 transition-all ${
									this.state.dragActive 
										? 'border-primary bg-primary bg-opacity-10' 
										: 'border-gray-300 hover:border-primary hover:bg-gray-50'
								}`}
								onDragOver={this.handleDragOver}
								onDragLeave={this.handleDragLeave}
								onDrop={this.handleDrop}
								style={{ cursor: 'pointer', minHeight: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
								onClick={() => {
									const fileInput = document.getElementById('fileInput');
									if (fileInput) {
										fileInput.click();
									}
								}}
							>
								{this.state.previewArchivo ? (
									<div className="w-100">
										<img 
											src={this.state.previewArchivo} 
											alt="Preview" 
											className="img-thumbnail mb-2"
											style={{ maxHeight: '150px', maxWidth: '100%' }}
										/>
										<p className="text-muted mb-0" style={{ fontSize: '13px' }}>
											<i className="fas fa-check-circle text-success me-2"></i>
											{this.state.nuevoArchivo?.name}
										</p>
										<small className="text-muted" style={{ fontSize: '12px' }}>
											{(this.state.nuevoArchivo?.size / 1024 / 1024).toFixed(2)} MB
										</small>
									</div>
								) : this.state.nuevoArchivo ? (
									<div>
										<i className={`fas fa-file fa-3x mb-2 ${
											this.state.nuevoArchivo.type.startsWith('image/') ? 'text-success' :
											this.state.nuevoArchivo.type === 'application/pdf' ? 'text-danger' :
											'text-primary'
										}`}></i>
										<p className="mb-1 fw-bold" style={{ fontSize: '13px' }}>{this.state.nuevoArchivo.name}</p>
										<small className="text-muted" style={{ fontSize: '12px' }}>
											{(this.state.nuevoArchivo.size / 1024 / 1024).toFixed(2)} MB
										</small>
									</div>
								) : (
									<div>
										<i className="fas fa-cloud-upload-alt fa-3x text-primary mb-2"></i>
										<p className="mb-1 fw-bold" style={{ fontSize: '14px' }}>Arrastra y suelta archivos aquí</p>
										<p className="text-muted mb-0" style={{ fontSize: '13px' }}>o haz clic para seleccionar</p>
										<small className="text-muted d-block mt-1" style={{ fontSize: '11px' }}>
											Formatos: JPG, PNG, PDF, DOC, DOCX (Máx. 10MB)
										</small>
									</div>
								)}
								<input
									type="file"
									id="fileInput"
									className="d-none"
									accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.stl,.obj,.fbx,.glb,.gltf"
									onChange={this.handleFileSelect}
								/>
							</div>

							{/* Botón para seleccionar archivo si no hay preview */}
							{!this.state.nuevoArchivo && (
								<button
									type="button"
									className="btn btn-outline-primary w-100 mb-2"
									style={{ fontSize: '13px', padding: '6px 12px' }}
									onClick={() => {
										const fileInput = document.getElementById('fileInput');
										if (fileInput) {
											fileInput.click();
										}
									}}
								>
									<i className="fas fa-folder-open me-2"></i>
									Seleccionar archivo
								</button>
							)}

							{/* Botón para cambiar archivo si ya hay uno seleccionado */}
							{this.state.nuevoArchivo && (
								<button
									type="button"
									className="btn btn-outline-secondary w-100 mb-2"
									onClick={() => {
										this.setState({ nuevoArchivo: null, previewArchivo: null });
										const fileInput = document.getElementById('fileInput');
										if (fileInput) fileInput.value = '';
									}}
								>
									<i className="fas fa-times me-2"></i>
									Cambiar archivo
								</button>
							)}

							{/* Comentarios */}
							<div className="mb-2">
								<label className="form-label fw-bold mb-1" style={{ fontSize: '13px', color: '#495057' }}>
									<i className="fas fa-comment-alt me-1"></i>
									Comentarios
								</label>
								<textarea
									className="form-control"
									placeholder="Agregar comentarios o descripción del documento (opcional)"
									rows="2"
									value={this.state.nuevoComentario}
									onChange={(e) => this.setState({ nuevoComentario: e.target.value })}
									style={{ 
										resize: 'none',
										borderRadius: '6px',
										border: '1px solid #dee2e6',
										padding: '8px 12px',
										fontSize: '13px',
										marginBottom: '10px'
									}}
								/>
							</div>

							{/* Información adicional */}
							<div className="mt-2 text-center">
								<small className="text-muted" style={{ fontSize: '11px' }}>
									<i className="fas fa-info-circle me-1"></i>
									Los archivos se guardan de forma segura
								</small>
							</div>
						</div>
						</div>

						<div className="modal-footer border-0">
						<button
							className="btn btn-secondary"
							onClick={() => this.setState({ modal_documento_visible: false })}
						>
							Cerrar
						</button>
						</div>
					</div>
					</div>
				</div>
				)}
				{this.state.modal_ver_notas_visible && (
					<div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
					<div className="modal-dialog modal-lg modal-dialog-centered">
					<div className="modal-content" style={{ borderRadius: '12px' }}>
						<div className="modal-header">
						<h5 className="modal-title">Notas del Paciente 🗒️</h5>
						<button className="btn-close" onClick={() => this.setState({ modal_ver_notas_visable: false })}></button>
						</div>
						<div className="modal-body">
						<table className="table">
							<thead>
							<tr>
								<th>Contenido</th>
								<th>Fecha</th>
								<th colSpan="2">Eliminar</th>
							</tr>
							</thead>
							<tbody>
							{this.state.notasPaciente.map((nota) => (
								<tr key={nota.id}>
								<td style={{ maxWidth: '300px', whiteSpace: 'pre-wrap' }}>
									<p style={{ margin: 0 }}>{nota.descripcion}</p>
								</td>
								<td>{nota.updated_at}</td>
						
								<td>
									<button
									className="btn btn-outline-danger btn-sm"
									onClick={() => this.eliminarNota(nota.id)}
									title="Eliminar nota"
									>
									<i className="icon icon-trash" />
									</button>
								</td>
								</tr>
							))}
							</tbody>
						</table>
						</div>
						<div className="modal-footer">
						<button className="btn btn-secondary" onClick={() => this.setState({ modal_ver_notas_visible: false })}>
							Cerrar
						</button>
						</div>
					</div>
					</div>
				</div>
				)}

				{/* Modal de Recetas */}
				{this.state.modal_recetas_visible && (
					<div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
						<div className="modal-dialog modal-xl modal-dialog-centered" style={{ maxWidth: '95%' }}>
							<div className="modal-content">
								<div className="modal-header">
									<h5 className="modal-title">
										<i className="fas fa-prescription"></i> Recetas Médicas
									</h5>
									<button 
										className="btn-close" 
										onClick={() => this.setState({ modal_recetas_visible: false })}
									></button>
								</div>
								<div className="modal-body" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
									<Recetas 
										idPaciente={this.props.match.params.id}
										idDoctor={this.props.match.params.id_doc}
									/>
								</div>
								<div className="modal-footer">
									<button 
										className="btn btn-secondary" 
										onClick={() => this.setState({ modal_recetas_visible: false })}
									>
										Cerrar
									</button>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Modal de Presupuestos */}
				{this.state.modal_presupuestos_visible && (
					<div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
						<div className="modal-dialog modal-xl modal-dialog-centered" style={{ maxWidth: '95%' }}>
							<div className="modal-content">
								<div className="modal-header" style={{
									background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
									color: 'white',
									border: 'none'
								}}>
									<h5 className="modal-title" style={{ fontWeight: 700, fontSize: '20px' }}>
										<i className="fas fa-file-invoice-dollar me-2"></i> Presupuestos
									</h5>
									<button 
										className="btn-close btn-close-white" 
										onClick={() => this.setState({ modal_presupuestos_visible: false })}
									></button>
								</div>
								<div className="modal-body" style={{ maxHeight: '80vh', overflowY: 'auto', padding: 0, backgroundColor: '#f5f5f7' }}>
									<div style={{ padding: '20px' }}>
										<VerPresupuesto match={{ params: { id: this.props.match.params.id, id_doc: this.props.match.params.id_doc } }} enModal={true} onCerrar={() => this.setState({ modal_presupuestos_visible: false })} />
									</div>
								</div>
								<div className="modal-footer" style={{ border: 'none' }}>
									<Link to={`/crear_prepuestos/${this.props.match.params.id}/${this.props.match.params.id_doc}`}>
										<button 
											className="btn" 
											style={{
												background: 'linear-gradient(135deg, #2d2d2f 0%, #1c1c1e 100%)',
												color: 'white',
												border: 'none',
												borderRadius: '12px',
												padding: '10px 24px',
												fontWeight: 600,
												fontSize: '15px',
												marginRight: '10px',
												transition: 'all 0.3s ease',
												boxShadow: '0 4px 12px rgba(28, 28, 30, 0.3)'
											}}
											onClick={() => this.setState({ modal_presupuestos_visible: false })}
											onMouseEnter={(e) => {
												e.target.style.transform = 'translateY(-2px)';
												e.target.style.boxShadow = '0 6px 16px rgba(28, 28, 30, 0.4)';
											}}
											onMouseLeave={(e) => {
												e.target.style.transform = 'translateY(0)';
												e.target.style.boxShadow = '0 4px 12px rgba(28, 28, 30, 0.3)';
											}}
										>
											<i className="fas fa-plus me-2"></i>Crear Presupuesto
										</button>
									</Link>
									<button 
										className="btn" 
										onClick={() => this.setState({ modal_presupuestos_visible: false })}
										style={{
											background: 'linear-gradient(135deg, #8e8e93 0%, #a8a8a8 100%)',
											color: 'white',
											border: 'none',
											borderRadius: '12px',
											padding: '10px 24px',
											fontWeight: 600,
											fontSize: '15px',
											transition: 'all 0.3s ease',
											boxShadow: '0 4px 12px rgba(142, 142, 147, 0.3)'
										}}
										onMouseEnter={(e) => {
											e.target.style.transform = 'translateY(-2px)';
											e.target.style.boxShadow = '0 6px 16px rgba(142, 142, 147, 0.4)';
										}}
										onMouseLeave={(e) => {
											e.target.style.transform = 'translateY(0)';
											e.target.style.boxShadow = '0 4px 12px rgba(142, 142, 147, 0.3)';
										}}
									>
										Cerrar
									</button>
								</div>
							</div>
						</div>
					</div>
				)}
				</>
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