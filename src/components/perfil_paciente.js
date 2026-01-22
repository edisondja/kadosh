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
				modal_facturas_visible: false,
				modal_odontogramas_visible: false,
				desactivar_campos_ficha: false, 

				// Notas y Documentos
				nota_texto: '',
				documentos: [],
				notasPaciente: [],
				
				// Facturas
				facturas: [],
				// Odontogramas
				odontogramas: [],
				tiene_ficha_medica:false,
				nuevosArchivos: [],
				nuevoComentario: '',
				previewArchivos: [],
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
			if (!this.state.nota_texto || this.state.nota_texto.trim() === '') {
				alertify.error('Por favor escriba una nota antes de guardar');
				return;
			}

			let nota = {
				id_paciente: this.props.match.params.id,
				descripcion: this.state.nota_texto
			};

			Axios.post(`${Verficar.url_base}/api/crear_nota`, nota)
				.then((data) => {
					alertify.success('Nota creada con éxito');
					this.cargarNotas(); // Recargar las notas
					this.setState({ nota_texto: '' }); // Limpiar el campo de texto
				})
				.catch((error) => {
					alertify.error('No se pudo crear la nota');
					console.error(error);
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

		cargarOdontogramas = () => {
			Verficar.obtener_odontogramas(this.props.match.params.id)
				.then((data) => {
					this.setState({ odontogramas: data || [] });
				})
				.catch((error) => {
					alertify.error('No se pudieron cargar los odontogramas');
					console.error(error);
					this.setState({ odontogramas: [] });
				});
		};

		cargarFacturas = () => {
			Axios.get(`${Verficar.url_base}/api/cargar_facturas_paciente/${this.props.match.params.id}`)
				.then((res) => {
					this.setState({ facturas: res.data || [] });
				})
				.catch((error) => {
					alertify.error('No se pudieron cargar las facturas');
					console.error(error);
				});
		}

		eliminarFactura = (id_factura) => {
			Axios.get(`${Verficar.url_base}/api/cargar_recibos/${id_factura}`)
				.then(data => {
					if (data.data.length > 0) {
						alertify.error('No puedes eliminar esta factura, ya que hay recibos generados que dependen de ella. Si deseas eliminarla, borra todos los recibos correspondientes primero.');
					} else {
						Axios.get(`${Verficar.url_base}/api/configs`).then(configResponse => {
							const config = configResponse.data && configResponse.data.length > 0 ? configResponse.data[0] : null;
							const claveSecreta = config ? config.clave_secreta : null;

							if (!claveSecreta) {
								alertify.error("No se ha configurado una clave secreta. Por favor configúrela primero en Configuración.");
								return;
							}

							alertify.prompt("Eliminar Factura", "Digite la clave secreta para eliminar esta factura", "",
								(event, value) => {
									if (value === claveSecreta) {
										const usuarioId = localStorage.getItem("id_usuario");
										Axios.delete(`${Verficar.url_base}/api/eliminar_factura/${id_factura}`, {
											data: {
												clave_secreta: value,
												usuario_id: usuarioId
											}
										}).then(data => {
											alertify.success("Factura eliminada con éxito");
											this.cargarFacturas(); // Recargar facturas
										}).catch(error => {
											const errorMsg = error.response?.data?.message || "No se pudo eliminar la factura";
											alertify.error(errorMsg);
										});
									} else {
										alertify.error("Clave secreta incorrecta");
									}
								}, function(error) {
									// Cancelar
								}).set('type', 'password');
						}).catch(error => {
							alertify.error("Error al cargar la configuración");
						});
					}
				}).catch(error => {
					alertify.error("Error al validar factura");
				});
		}


		eliminarNota = (notaId) => {
		Axios.post(`${Verficar.url_base}/api/eliminar_nota`, { nota_id: notaId })
			.then(() => {
			alertify.success('Nota eliminada con éxito');
			this.cargarNotas(); // Recargar las notas desde el servidor
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
			if (!id_paciente) {
				console.error('ID de paciente no válido');
				return;
			}
			
			Axios.get(`${Verficar.url_base}/api/consultar_deuda/${id_paciente}`)
				.then(response => {
					const deuda = response.data?.deuda_total || 0;
					this.setState({ deuda_total: parseFloat(deuda) || 0 });
				})
				.catch(error => {
					console.error('Error al cargar la deuda:', error);
					// Si hay un error, establecer deuda en 0 en lugar de reintentar infinitamente
					this.setState({ deuda_total: 0 });
					// Solo mostrar error si no es un error de red común
					if (error.response && error.response.status !== 404) {
						Alertify.error("No se pudo cargar la deuda del paciente");
					}
				});
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

			subirDocumento = async () => {
				if (!this.state.nuevosArchivos || this.state.nuevosArchivos.length === 0) {
					Alertify.warning("Por favor seleccione al menos un archivo");
					return;
				}

				// Validar tamaño de todos los archivos (10MB máximo cada uno)
				for (const file of this.state.nuevosArchivos) {
					if (file.size > 10 * 1024 * 1024) {
						Alertify.error(`El archivo "${file.name}" es demasiado grande. Máximo 10MB por archivo`);
						return;
					}
				}

				this.setState({ subiendoArchivo: true });

				// Subir archivos uno por uno
				let subidos = 0;
				let errores = 0;

				for (const file of this.state.nuevosArchivos) {
					try {
						const formData = new FormData();
						formData.append("image", file);
						formData.append("usuario_id", this.props.match.params.id);
						formData.append("comentarios", this.state.nuevoComentario || "Sin comentarios");

						await Axios.post(`${Verficar.url_base}/api/subir_radiografia`, formData, {
							headers: { 'Content-Type': 'multipart/form-data' }
						});
						subidos++;
					} catch (error) {
						errores++;
						console.error(`Error al subir ${file.name}:`, error);
					}
				}

				// Mostrar resultado
				if (subidos > 0 && errores === 0) {
					Alertify.success(`${subidos} archivo${subidos > 1 ? 's' : ''} subido${subidos > 1 ? 's' : ''} con éxito`);
				} else if (subidos > 0 && errores > 0) {
					Alertify.warning(`${subidos} archivo${subidos > 1 ? 's' : ''} subido${subidos > 1 ? 's' : ''}, ${errores} error${errores > 1 ? 'es' : ''}`);
				} else {
					Alertify.error("Error al subir los archivos");
				}

				this.setState({ 
					nuevosArchivos: [], 
					nuevoComentario: "",
					previewArchivos: [],
					subiendoArchivo: false
				});
				
				// Limpiar input file
				const fileInput = document.getElementById('fileInput');
				if (fileInput) fileInput.value = '';
				this.cargar_documentos(); // refrescar lista
			};

			handleFileSelect = (e) => {
				const files = Array.from(e.target.files || []);
				if (files.length === 0) return;

				// Validar tamaño de todos los archivos
				const archivosValidos = [];
				const previews = [];

				files.forEach((file) => {
					if (file.size > 10 * 1024 * 1024) {
						Alertify.error(`El archivo "${file.name}" es demasiado grande. Máximo 10MB`);
						return;
					}
					archivosValidos.push(file);
					
					// Crear preview para imágenes
					if (file.type.startsWith('image/')) {
						const reader = new FileReader();
						reader.onloadend = () => {
							previews.push({ file: file.name, preview: reader.result });
							if (previews.length === archivosValidos.filter(f => f.type.startsWith('image/')).length) {
								this.setState({ previewArchivos: previews });
							}
						};
						reader.readAsDataURL(file);
					}
				});

				if (archivosValidos.length > 0) {
					this.setState({ nuevosArchivos: archivosValidos });
					// Si no hay imágenes, limpiar previews
					if (archivosValidos.filter(f => f.type.startsWith('image/')).length === 0) {
						this.setState({ previewArchivos: [] });
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

				const files = Array.from(e.dataTransfer.files || []);
				if (files.length === 0) return;

				// Validar tamaño de todos los archivos
				const archivosValidos = [];
				const previews = [];

				files.forEach((file) => {
					if (file.size > 10 * 1024 * 1024) {
						Alertify.error(`El archivo "${file.name}" es demasiado grande. Máximo 10MB`);
						return;
					}
					archivosValidos.push(file);
					
					// Crear preview para imágenes
					if (file.type.startsWith('image/')) {
						const reader = new FileReader();
						reader.onloadend = () => {
							previews.push({ file: file.name, preview: reader.result });
							if (previews.length === archivosValidos.filter(f => f.type.startsWith('image/')).length) {
								this.setState({ previewArchivos: previews });
							}
						};
						reader.readAsDataURL(file);
					}
				});

				if (archivosValidos.length > 0) {
					this.setState({ nuevosArchivos: archivosValidos });
					// Si no hay imágenes, limpiar previews
					if (archivosValidos.filter(f => f.type.startsWith('image/')).length === 0) {
						this.setState({ previewArchivos: [] });
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
						<div className="card border-0 shadow-lg mb-3" style={{ 
							borderRadius: '12px',
							background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
							overflow: 'hidden',
							animation: 'fadeIn 0.5s ease'
						}}>
							<div className="card-body text-white p-3">
								<div className="d-flex justify-content-between align-items-center flex-wrap">
									<div className="d-flex align-items-center">
										<img
											id="foto_paciente"
											src={Verficar.url_base + "/storage/" + this.state.paciente.foto_paciente}
											alt="Foto Paciente"
											style={{
												width: '70px',
												height: '70px',
												objectFit: 'cover',
												borderRadius: '50%',
												border: '3px solid rgba(255,255,255,0.3)',
												boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
												marginRight: '15px'
											}}
										/>
										<div>
											<h2 className="mb-0" style={{ fontWeight: 700, fontSize: '24px' }}>
												{this.state.paciente.nombre} {this.state.paciente.apellido}
											</h2>
										</div>
									</div>
									<div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
										<Link to={`/actualizar_paciente/${this.state.paciente.id}/${this.props.match.params.id_doc}`}>
											<button 
												className="btn"
												style={{
													background: 'rgba(102, 126, 234, 0.3)',
													border: '2px solid rgba(102, 126, 234, 0.5)',
													color: 'white',
													borderRadius: '6px',
													padding: '5px 10px',
													fontWeight: 600,
													fontSize: '11px',
													transition: 'all 0.3s ease',
													backdropFilter: 'blur(10px)',
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
													minWidth: 'auto'
												}}
												onMouseEnter={(e) => {
													e.target.style.background = 'rgba(102, 126, 234, 0.5)';
													e.target.style.transform = 'translateY(-2px)';
													e.target.style.boxShadow = '0 4px 8px rgba(102, 126, 234, 0.4)';
												}}
												onMouseLeave={(e) => {
													e.target.style.background = 'rgba(102, 126, 234, 0.3)';
													e.target.style.transform = 'translateY(0)';
													e.target.style.boxShadow = 'none';
												}}
												title="Editar paciente"
											>
												<i className="fas fa-edit"></i>
											</button>
										</Link>
										<button 
											className="btn"
											onClick={() => this.eliminar_paciente(this.state.paciente.id)}
											style={{
												background: 'rgba(220, 53, 69, 0.3)',
												border: '2px solid rgba(220, 53, 69, 0.5)',
												color: 'white',
												borderRadius: '6px',
												padding: '5px 10px',
												fontWeight: 600,
												fontSize: '11px',
												transition: 'all 0.3s ease',
												backdropFilter: 'blur(10px)',
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												minWidth: 'auto'
											}}
											onMouseEnter={(e) => {
												e.target.style.background = 'rgba(220, 53, 69, 0.5)';
												e.target.style.transform = 'translateY(-2px)';
												e.target.style.boxShadow = '0 4px 8px rgba(220, 53, 69, 0.4)';
											}}
											onMouseLeave={(e) => {
												e.target.style.background = 'rgba(220, 53, 69, 0.3)';
												e.target.style.transform = 'translateY(0)';
												e.target.style.boxShadow = 'none';
											}}
											title="Eliminar paciente"
										>
											<i className="fas fa-trash-alt"></i>
										</button>
										<button 
											className="btn"
											onClick={this.detras}
											style={{
												background: 'rgba(255,255,255,0.2)',
												border: '2px solid rgba(255,255,255,0.3)',
												color: 'white',
												borderRadius: '8px',
												padding: '6px 14px',
												fontWeight: 600,
												fontSize: '13px',
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
											<i className="fas fa-arrow-left me-2"></i>{Verficar.lenguaje.perfil_paciente.atras}
										</button>
									</div>
								</div>
								
								{/* Datos del paciente separados */}
								<div className="row g-2 mt-2">
									<div className="col-12 col-md-6 col-lg-3">
										<div style={{
											background: 'rgba(255,255,255,0.15)',
											backdropFilter: 'blur(10px)',
											borderRadius: '10px',
											padding: '10px 12px',
											border: '1px solid rgba(255,255,255,0.2)'
										}}>
											<div style={{ fontSize: '11px', opacity: 0.9, marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
												<i className="fas fa-id-card me-2"></i>
												{Verficar.lenguaje.paciente_admin.cedula}
											</div>
											<div style={{ fontSize: '15px', fontWeight: 600 }}>
												{this.state.paciente.cedula || 'N/A'}
											</div>
										</div>
									</div>
									<div className="col-12 col-md-6 col-lg-3">
										<div style={{
											background: 'rgba(255,255,255,0.15)',
											backdropFilter: 'blur(10px)',
											borderRadius: '10px',
											padding: '10px 12px',
											border: '1px solid rgba(255,255,255,0.2)'
										}}>
											<div style={{ fontSize: '11px', opacity: 0.9, marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
												<i className="fas fa-birthday-cake me-2"></i>
												Edad
											</div>
											<div style={{ fontSize: '15px', fontWeight: 600 }}>
												{this.calcularEdad(this.state.paciente.fecha_nacimiento)} años
											</div>
										</div>
									</div>
									<div className="col-12 col-md-6 col-lg-3">
										<div style={{
											background: 'rgba(255,255,255,0.15)',
											backdropFilter: 'blur(10px)',
											borderRadius: '10px',
											padding: '10px 12px',
											border: '1px solid rgba(255,255,255,0.2)'
										}}>
											<div style={{ fontSize: '11px', opacity: 0.9, marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
												<i className="fas fa-phone me-2"></i>
												{Verficar.lenguaje.paciente_admin.telefono}
											</div>
											<div style={{ fontSize: '15px', fontWeight: 600 }}>
												{this.state.paciente.telefono || 'N/A'}
											</div>
										</div>
									</div>
									<div className="col-12 col-md-6 col-lg-3">
										<div style={{
											background: this.state.deuda_total > 0 ? 'rgba(220, 53, 69, 0.3)' : 'rgba(40, 167, 69, 0.3)',
											backdropFilter: 'blur(10px)',
											borderRadius: '10px',
											padding: '10px 12px',
											border: '1px solid rgba(255,255,255,0.2)'
										}}>
											<div style={{ fontSize: '11px', opacity: 0.9, marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
												<i className={this.state.deuda_total > 0 ? "fas fa-exclamation-triangle me-2" : "fas fa-check-circle me-2"}></i>
												Estado de Deuda
											</div>
											<div style={{ fontSize: '15px', fontWeight: 600 }}>
											{this.state.deuda_total > 0 ? (
												<>{
													Number(this.state.deuda_total || 0).toLocaleString('es-DO', {
													style: 'currency',
													currency: 'DOP',
													minimumFractionDigits: 2
													})
												}</>
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
								<div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
									<div style={{ flex: '1 1 auto', minWidth: '120px' }}>
										<div 
											onClick={() => {
												this.cargarFacturas();
												this.setState({ modal_facturas_visible: true });
											}}
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
												{Verficar.lenguaje.perfil_paciente.factura}
											</h6>
										</div>
									</div>
									<div style={{ flex: '1 1 auto', minWidth: '120px' }}>
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
									<div style={{ flex: '1 1 auto', minWidth: '120px' }}>
										<div 
											onClick={() => {
												this.cargarNotas();
												this.setState({ modal_ver_notas_visible: true });
											}}
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
									<div style={{ flex: '1 1 auto', minWidth: '120px' }}>
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
									<div style={{ flex: '1 1 auto', minWidth: '120px' }}>
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
									<div style={{ flex: '1 1 auto', minWidth: '120px' }}>
										<div 
											onClick={() => {
												this.cargarOdontogramas();
												this.setState({ modal_odontogramas_visible: true });
											}}
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
											<i className="fas fa-tooth" style={{ fontSize: '32px', color: '#667eea', marginBottom: '10px' }}></i>
											<h6 className="mb-0" style={{ fontWeight: 600, fontSize: '13px', color: '#2d2d2f' }}>
												Odontogramas
											</h6>
										</div>
									</div>
									<div style={{ flex: '1 1 auto', minWidth: '120px' }}>
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
														{this.state.deuda_total > 0 ? (
												<>{
													Number(this.state.deuda_total || 0).toLocaleString('es-DO', {
													style: 'currency',
													currency: 'DOP',
													minimumFractionDigits: 2
													})
												}</>
												) : (
												<>Sin deuda</>
												)}
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
	
			{this.state.modal_documento_visible && (
				<div
					className="modal d-block"
					style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
					<div
					className="modal-dialog modal-xl modal-dialog-centered"
					style={{ maxWidth: '95%' }}
					>
					<div className="modal-content">
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
									// Si hay archivos seleccionados, subirlos directamente
									if (this.state.nuevosArchivos && this.state.nuevosArchivos.length > 0) {
										this.subirDocumento();
									} else {
										// Si no hay archivos, abrir el selector
										const fileInput = document.getElementById('fileInput');
										if (fileInput) {
											fileInput.click();
										}
									}
								}}
								disabled={this.state.subiendoArchivo}
								title={this.state.nuevosArchivos && this.state.nuevosArchivos.length > 0 ? `Subir ${this.state.nuevosArchivos.length} archivo(s) seleccionado(s)` : "Seleccionar archivos para subir"}
							>
								{this.state.subiendoArchivo ? (
									<>
										<span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
										Subiendo...
									</>
								) : (
									<>
										<i className="fas fa-upload me-1"></i>
										{this.state.nuevosArchivos && this.state.nuevosArchivos.length > 0 
											? `Subir ${this.state.nuevosArchivos.length} archivo(s)` 
											: 'Subir Documentos'}
									</>
								)}
							</button>
							<button
								className="btn-close"
								onClick={() => this.setState({ modal_documento_visible: false })}
							></button>
						</div>
						</div>

						<div className="modal-body bg-gray-50 rounded-xl p-3" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
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
							Agregar nuevo(s) documento(s)
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
								{this.state.nuevosArchivos && this.state.nuevosArchivos.length > 0 ? (
									<div className="w-100">
										<div className="row g-2">
											{this.state.nuevosArchivos.map((file, index) => {
												const preview = this.state.previewArchivos.find(p => p.file === file.name);
												return (
													<div key={index} className="col-6 col-md-4">
														<div className="border rounded p-2 bg-light">
															{preview && preview.preview ? (
																<img 
																	src={preview.preview} 
																	alt="Preview" 
																	className="img-thumbnail mb-1"
																	style={{ maxHeight: '80px', maxWidth: '100%', width: '100%', objectFit: 'cover' }}
																/>
															) : (
																<div className="text-center mb-1">
																	<i className={`fas fa-file fa-2x ${
																		file.type.startsWith('image/') ? 'text-success' :
																		file.type === 'application/pdf' ? 'text-danger' :
																		'text-primary'
																	}`}></i>
																</div>
															)}
															<p className="mb-0 text-truncate" style={{ fontSize: '11px', fontWeight: '600' }} title={file.name}>
																{file.name}
															</p>
															<small className="text-muted" style={{ fontSize: '10px' }}>
																{(file.size / 1024 / 1024).toFixed(2)} MB
															</small>
														</div>
													</div>
												);
											})}
										</div>
										<p className="text-center mt-2 mb-0" style={{ fontSize: '12px', color: '#28a745' }}>
											<i className="fas fa-check-circle me-1"></i>
											{this.state.nuevosArchivos.length} archivo{this.state.nuevosArchivos.length > 1 ? 's' : ''} seleccionado{this.state.nuevosArchivos.length > 1 ? 's' : ''}
										</p>
									</div>
								) : (
									<div>
										<i className="fas fa-cloud-upload-alt fa-3x text-primary mb-2"></i>
										<p className="mb-1 fw-bold" style={{ fontSize: '14px' }}>Arrastra y suelta archivos aquí</p>
										<p className="text-muted mb-0" style={{ fontSize: '13px' }}>o haz clic para seleccionar</p>
										<small className="text-muted d-block mt-1" style={{ fontSize: '11px' }}>
											Formatos: JPG, PNG, PDF, DOC, DOCX (Máx. 10MB por archivo)
										</small>
									</div>
								)}
								<input
									type="file"
									id="fileInput"
									className="d-none"
									accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.stl,.obj,.fbx,.glb,.gltf"
									multiple
									onChange={this.handleFileSelect}
								/>
							</div>

							{/* Botón para seleccionar archivos si no hay archivos seleccionados */}
							{(!this.state.nuevosArchivos || this.state.nuevosArchivos.length === 0) && (
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
									Seleccionar archivos
								</button>
							)}

							{/* Botón para cambiar archivos si ya hay archivos seleccionados */}
							{this.state.nuevosArchivos && this.state.nuevosArchivos.length > 0 && (
								<button
									type="button"
									className="btn btn-outline-secondary w-100 mb-2"
									onClick={() => {
										this.setState({ nuevosArchivos: [], previewArchivos: [] });
										const fileInput = document.getElementById('fileInput');
										if (fileInput) fileInput.value = '';
									}}
								>
									<i className="fas fa-times me-2"></i>
									Limpiar archivos seleccionados
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
					<div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
						<div className="modal-dialog modal-lg modal-dialog-centered">
							<div className="modal-content" style={{ borderRadius: '16px', overflow: 'hidden' }}>
								<div className="modal-header" style={{
									background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
									color: 'white',
									border: 'none',
									padding: '20px 25px'
								}}>
									<h5 className="modal-title mb-0" style={{ fontWeight: 700, fontSize: '20px' }}>
										<i className="fas fa-sticky-note me-2"></i>Notas del Paciente
									</h5>
									<button 
										className="btn-close btn-close-white" 
										onClick={() => this.setState({ modal_ver_notas_visible: false, nota_texto: '' })}
									></button>
								</div>
								<div className="modal-body" style={{ padding: '25px', maxHeight: '70vh', overflowY: 'auto' }}>
									{/* Formulario para agregar nueva nota */}
									<div className="card border-0 shadow-sm mb-4" style={{
										background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
										borderRadius: '12px',
										border: '2px solid rgba(102, 126, 234, 0.2)'
									}}>
										<div className="card-body p-4">
											<h6 style={{ fontWeight: 600, marginBottom: '15px', color: '#495057' }}>
												<i className="fas fa-plus-circle me-2" style={{ color: '#667eea' }}></i>
												Agregar Nueva Nota
											</h6>
											<textarea
												className="form-control"
												placeholder="Escribe aquí la nota..."
												value={this.state.nota_texto || ''}
												onChange={(e) => this.setNotaTexto(e.target.value)}
												rows="4"
												style={{
													borderRadius: '12px',
													border: '2px solid #e0e0e0',
													padding: '14px 16px',
													fontSize: '15px',
													resize: 'vertical',
													transition: 'all 0.2s ease'
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
											<button
												className="btn mt-3"
												onClick={this.guardarNota}
												disabled={!this.state.nota_texto || this.state.nota_texto.trim() === ''}
												style={{
													background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
													color: 'white',
													border: 'none',
													borderRadius: '12px',
													padding: '10px 20px',
													fontWeight: 600,
													transition: 'all 0.2s ease',
													opacity: (!this.state.nota_texto || this.state.nota_texto.trim() === '') ? 0.5 : 1,
													cursor: (!this.state.nota_texto || this.state.nota_texto.trim() === '') ? 'not-allowed' : 'pointer'
												}}
												onMouseEnter={(e) => {
													if (!e.target.disabled) {
														e.target.style.transform = 'translateY(-2px)';
														e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
													}
												}}
												onMouseLeave={(e) => {
													e.target.style.transform = 'translateY(0)';
													e.target.style.boxShadow = 'none';
												}}
											>
												<i className="fas fa-save me-2"></i>Guardar Nota
											</button>
										</div>
									</div>

									{/* Lista de notas existentes */}
									<div>
										<h6 style={{ fontWeight: 600, marginBottom: '15px', color: '#495057' }}>
											<i className="fas fa-list me-2" style={{ color: '#667eea' }}></i>
											Notas Existentes ({this.state.notasPaciente.length})
										</h6>
										{this.state.notasPaciente.length === 0 ? (
											<div className="text-center p-5" style={{ color: '#6c757d' }}>
												<i className="fas fa-inbox" style={{ fontSize: '48px', marginBottom: '15px', opacity: 0.5 }}></i>
												<p style={{ margin: 0, fontSize: '16px' }}>No hay notas registradas</p>
											</div>
										) : (
											<div className="row g-3">
												{this.state.notasPaciente.map((nota) => (
													<div key={nota.id} className="col-12">
														<div className="card border-0 shadow-sm" style={{
															borderRadius: '12px',
															border: '2px solid #e0e0e0',
															position: 'relative',
															transition: 'all 0.2s ease'
														}}
														onMouseEnter={(e) => {
															e.currentTarget.style.borderColor = '#667eea';
															e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.15)';
														}}
														onMouseLeave={(e) => {
															e.currentTarget.style.borderColor = '#e0e0e0';
															e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
														}}>
															{/* Botón X pequeño en esquina superior derecha */}
															<button
																onClick={() => {
																	alertify.confirm(
																		"Eliminar Nota",
																		"¿Está seguro que desea eliminar esta nota?",
																		() => {
																			this.eliminarNota(nota.id);
																			alertify.success("Nota eliminada");
																		},
																		() => {
																			alertify.message("Cancelado");
																		}
																	);
																}}
																style={{
																	position: 'absolute',
																	top: '8px',
																	right: '8px',
																	width: '24px',
																	height: '24px',
																	borderRadius: '50%',
																	background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
																	color: 'white',
																	border: 'none',
																	display: 'flex',
																	alignItems: 'center',
																	justifyContent: 'center',
																	fontSize: '12px',
																	fontWeight: 700,
																	cursor: 'pointer',
																	transition: 'all 0.2s ease',
																	zIndex: 10,
																	padding: 0,
																	lineHeight: 1
																}}
																onMouseEnter={(e) => {
																	e.target.style.transform = 'scale(1.15)';
																	e.target.style.boxShadow = '0 2px 8px rgba(220, 53, 69, 0.4)';
																}}
																onMouseLeave={(e) => {
																	e.target.style.transform = 'scale(1)';
																	e.target.style.boxShadow = 'none';
																}}
																title="Eliminar nota"
															>
																×
															</button>
															<div className="card-body p-4">
																<p style={{ 
																	margin: 0, 
																	marginBottom: '10px',
																	whiteSpace: 'pre-wrap',
																	wordWrap: 'break-word',
																	color: '#2d2d2f',
																	lineHeight: '1.6',
																	paddingRight: '30px'
																}}>
																	{nota.descripcion}
																</p>
																<small style={{ color: '#6c757d', fontSize: '12px' }}>
																	<i className="fas fa-clock me-1"></i>
																	{new Date(nota.updated_at).toLocaleString('es-ES', {
																		year: 'numeric',
																		month: 'short',
																		day: 'numeric',
																		hour: '2-digit',
																		minute: '2-digit'
																	})}
																</small>
															</div>
														</div>
													</div>
												))}
											</div>
										)}
									</div>
								</div>
								<div className="modal-footer" style={{ border: 'none', padding: '20px 25px' }}>
									<button 
										className="btn" 
										onClick={() => this.setState({ modal_ver_notas_visible: false, nota_texto: '' })}
										style={{
											background: 'linear-gradient(135deg, #6c757d 0%, #5a6268 100%)',
											color: 'white',
											border: 'none',
											borderRadius: '12px',
											padding: '10px 24px',
											fontWeight: 600,
											transition: 'all 0.2s ease'
										}}
										onMouseEnter={(e) => {
											e.target.style.transform = 'translateY(-2px)';
											e.target.style.boxShadow = '0 4px 12px rgba(108, 117, 125, 0.3)';
										}}
										onMouseLeave={(e) => {
											e.target.style.transform = 'translateY(0)';
											e.target.style.boxShadow = 'none';
										}}
									>
										<i className="fas fa-times me-2"></i>Cerrar
									</button>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Modal de Facturas */}
				{this.state.modal_facturas_visible && (
					<div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
						<div className="modal-dialog modal-lg modal-dialog-centered">
							<div className="modal-content" style={{ borderRadius: '16px', overflow: 'hidden' }}>
								<div className="modal-header" style={{
									background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
									color: 'white',
									border: 'none',
									padding: '20px 25px'
								}}>
									<h5 className="modal-title mb-0" style={{ fontWeight: 700, fontSize: '20px' }}>
										<i className="fas fa-file-invoice-dollar me-2"></i>Facturas del Paciente
									</h5>
									<button 
										className="btn-close btn-close-white" 
										onClick={() => this.setState({ modal_facturas_visible: false })}
									></button>
								</div>
								<div className="modal-body" style={{ padding: '25px', maxHeight: '70vh', overflowY: 'auto' }}>
									{/* Botón para crear nueva factura */}
									<div className="card border-0 shadow-sm mb-4" style={{
										background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
										borderRadius: '12px',
										border: '2px solid rgba(102, 126, 234, 0.2)'
									}}>
										<div className="card-body p-4 text-center">
											<Link 
												to={`/agregar_factura/${this.props.match.params.id}/${this.props.match.params.id_doc}`}
												onClick={() => this.setState({ modal_facturas_visible: false })}
												style={{ textDecoration: 'none' }}
											>
												<button
													className="btn w-100"
													style={{
														background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
														color: 'white',
														border: 'none',
														borderRadius: '12px',
														padding: '14px 24px',
														fontWeight: 600,
														fontSize: '16px',
														transition: 'all 0.2s ease',
														boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
													}}
													onMouseEnter={(e) => {
														e.target.style.transform = 'translateY(-2px)';
														e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
													}}
													onMouseLeave={(e) => {
														e.target.style.transform = 'translateY(0)';
														e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
													}}
												>
													<i className="fas fa-plus-circle me-2"></i>Crear Nueva Factura
												</button>
											</Link>
										</div>
									</div>

									{/* Lista de facturas existentes */}
									<div>
										<h6 style={{ fontWeight: 600, marginBottom: '15px', color: '#495057' }}>
											<i className="fas fa-list me-2" style={{ color: '#667eea' }}></i>
											Facturas Existentes ({this.state.facturas.length})
										</h6>
										{this.state.facturas.length === 0 ? (
											<div className="text-center p-5" style={{ color: '#6c757d' }}>
												<i className="fas fa-inbox" style={{ fontSize: '48px', marginBottom: '15px', opacity: 0.5 }}></i>
												<p style={{ margin: 0, fontSize: '16px' }}>No hay facturas registradas</p>
											</div>
										) : (
											<div className="row g-3">
												{this.state.facturas.map((factura) => (
													<div key={factura.id} className="col-12">
														<div className="card border-0 shadow-sm" style={{
															borderRadius: '12px',
															border: '2px solid #e0e0e0',
															position: 'relative',
															transition: 'all 0.2s ease'
														}}
														onMouseEnter={(e) => {
															e.currentTarget.style.borderColor = '#667eea';
															e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.15)';
														}}
														onMouseLeave={(e) => {
															e.currentTarget.style.borderColor = '#e0e0e0';
															e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
														}}>
															{/* Botón X pequeño en esquina superior derecha */}
															<button
																onClick={() => {
																	alertify.confirm(
																		"Eliminar Factura",
																		"¿Está seguro que desea eliminar esta factura?",
																		() => {
																			this.eliminarFactura(factura.id);
																		},
																		() => {
																			alertify.message("Cancelado");
																		}
																	);
																}}
																style={{
																	position: 'absolute',
																	top: '8px',
																	right: '8px',
																	width: '24px',
																	height: '24px',
																	borderRadius: '50%',
																	background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
																	color: 'white',
																	border: 'none',
																	display: 'flex',
																	alignItems: 'center',
																	justifyContent: 'center',
																	fontSize: '12px',
																	fontWeight: 700,
																	cursor: 'pointer',
																	transition: 'all 0.2s ease',
																	zIndex: 10,
																	padding: 0,
																	lineHeight: 1
																}}
																onMouseEnter={(e) => {
																	e.target.style.transform = 'scale(1.15)';
																	e.target.style.boxShadow = '0 2px 8px rgba(220, 53, 69, 0.4)';
																}}
																onMouseLeave={(e) => {
																	e.target.style.transform = 'scale(1)';
																	e.target.style.boxShadow = 'none';
																}}
																title="Eliminar factura"
															>
																×
															</button>
															<div className="card-body p-4">
																<div className="d-flex justify-content-between align-items-center mb-2">
																	<div>
																		<h6 style={{ 
																			margin: 0, 
																			marginBottom: '5px',
																			fontWeight: 600,
																			color: '#2d2d2f',
																			paddingRight: '30px'
																		}}>
																			<i className="fas fa-file-invoice-dollar me-2" style={{ color: '#667eea' }}></i>
																			Factura #{factura.id}
																		</h6>
																		<small style={{ color: '#6c757d', fontSize: '12px' }}>
																			<i className="fas fa-calendar me-1"></i>
																			{new Date(factura.created_at).toLocaleString('es-ES', {
																				year: 'numeric',
																				month: 'short',
																				day: 'numeric',
																				hour: '2-digit',
																				minute: '2-digit'
																			})}
																		</small>
																	</div>
																	<div style={{ textAlign: 'right' }}>
																		<small style={{ color: '#6c757d', fontSize: '12px', display: 'block', marginBottom: '5px' }}>
																			Total
																		</small>
																		<strong style={{ 
																			fontSize: '20px', 
																			fontWeight: 700,
																			color: '#28a745'
																		}}>
																			RD$ {new Intl.NumberFormat().format(factura.precio_estatus || 0)}
																		</strong>
																	</div>
																</div>
																<div className="mt-3">
																	<Link 
																		to={`/ver_factura/${this.props.match.params.id}/${factura.id}`}
																		onClick={() => this.setState({ modal_facturas_visible: false })}
																	>
																		<button
																			className="btn btn-sm w-100"
																			style={{
																				background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
																				color: 'white',
																				border: 'none',
																				borderRadius: '8px',
																				padding: '8px 16px',
																				fontWeight: 600,
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
																			<i className="fas fa-eye me-2"></i>Ver Detalles
																		</button>
																	</Link>
																</div>
															</div>
														</div>
													</div>
												))}
											</div>
										)}
									</div>
								</div>
								<div className="modal-footer" style={{ border: 'none', padding: '20px 25px' }}>
									<button 
										className="btn" 
										onClick={() => this.setState({ modal_facturas_visible: false })}
										style={{
											background: 'linear-gradient(135deg, #6c757d 0%, #5a6268 100%)',
											color: 'white',
											border: 'none',
											borderRadius: '12px',
											padding: '10px 24px',
											fontWeight: 600,
											transition: 'all 0.2s ease'
										}}
										onMouseEnter={(e) => {
											e.target.style.transform = 'translateY(-2px)';
											e.target.style.boxShadow = '0 4px 12px rgba(108, 117, 125, 0.3)';
										}}
										onMouseLeave={(e) => {
											e.target.style.transform = 'translateY(0)';
											e.target.style.boxShadow = 'none';
										}}
									>
										<i className="fas fa-times me-2"></i>Cerrar
									</button>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Modal de Odontogramas */}
				{this.state.modal_odontogramas_visible && (
					<div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
						<div className="modal-dialog modal-lg modal-dialog-centered">
							<div className="modal-content" style={{ borderRadius: '16px', overflow: 'hidden' }}>
								<div className="modal-header" style={{
									background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
									color: 'white',
									border: 'none',
									padding: '20px 25px'
								}}>
									<h5 className="modal-title mb-0" style={{ fontWeight: 700, fontSize: '20px' }}>
										<i className="fas fa-tooth me-2"></i>Odontogramas del Paciente
									</h5>
									<button 
										className="btn-close btn-close-white" 
										onClick={() => this.setState({ modal_odontogramas_visible: false })}
									></button>
								</div>
								<div className="modal-body" style={{ padding: '25px', maxHeight: '70vh', overflowY: 'auto' }}>
									{/* Botón para crear nuevo odontograma */}
									<div className="card border-0 shadow-sm mb-4" style={{
										background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
										borderRadius: '12px',
										border: '2px solid rgba(102, 126, 234, 0.2)'
									}}>
										<div className="card-body p-4 text-center">
											<Link 
												to={`/odontograma/${this.props.match.params.id}/${this.props.match.params.id_doc}`}
												onClick={() => this.setState({ modal_odontogramas_visible: false })}
												style={{ textDecoration: 'none' }}
											>
												<button
													className="btn w-100"
													style={{
														background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
														color: 'white',
														border: 'none',
														borderRadius: '12px',
														padding: '14px 24px',
														fontWeight: 600,
														fontSize: '16px',
														transition: 'all 0.2s ease',
														boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
													}}
													onMouseEnter={(e) => {
														e.target.style.transform = 'translateY(-2px)';
														e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
													}}
													onMouseLeave={(e) => {
														e.target.style.transform = 'translateY(0)';
														e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
													}}
												>
													<i className="fas fa-plus-circle me-2"></i>Crear Nuevo Odontograma
												</button>
											</Link>
										</div>
									</div>

									{/* Lista de odontogramas existentes */}
									<div>
										<h6 style={{ fontWeight: 600, marginBottom: '15px', color: '#495057' }}>
											<i className="fas fa-list me-2" style={{ color: '#667eea' }}></i>
											Odontogramas Existentes ({this.state.odontogramas.length})
										</h6>
										{this.state.odontogramas.length === 0 ? (
											<div className="text-center p-5" style={{ color: '#6c757d' }}>
												<i className="fas fa-inbox" style={{ fontSize: '48px', marginBottom: '15px', opacity: 0.5 }}></i>
												<p style={{ margin: 0, fontSize: '16px' }}>No hay odontogramas registrados</p>
											</div>
										) : (
											<div className="row g-3">
												{this.state.odontogramas.map((odontograma) => (
													<div key={odontograma.id} className="col-12">
														<div className="card border-0 shadow-sm" style={{
															borderRadius: '12px',
															border: '2px solid #e0e0e0',
															transition: 'all 0.2s ease'
														}}
														onMouseEnter={(e) => {
															e.currentTarget.style.borderColor = '#667eea';
															e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.15)';
														}}
														onMouseLeave={(e) => {
															e.currentTarget.style.borderColor = '#e0e0e0';
															e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
														}}>
															<div className="card-body p-4">
																<div className="d-flex justify-content-between align-items-center mb-2">
																	<div>
																		<h6 style={{ 
																			margin: 0, 
																			marginBottom: '5px',
																			fontWeight: 600,
																			color: '#2d2d2f'
																		}}>
																			<i className="fas fa-tooth me-2" style={{ color: '#667eea' }}></i>
																			Odontograma #{odontograma.id}
																		</h6>
																		<small style={{ color: '#6c757d', fontSize: '12px' }}>
																			<i className="fas fa-calendar me-1"></i>
																			{new Date(odontograma.created_at).toLocaleString('es-ES', {
																				year: 'numeric',
																				month: 'short',
																				day: 'numeric',
																				hour: '2-digit',
																				minute: '2-digit'
																			})}
																		</small>
																		{odontograma.detalles && odontograma.detalles.length > 0 && (
																			<div style={{ marginTop: '8px' }}>
																				<small style={{ color: '#28a745', fontSize: '12px' }}>
																					<i className="fas fa-check-circle me-1"></i>
																					{odontograma.detalles.length} procedimiento{odontograma.detalles.length !== 1 ? 's' : ''} registrado{odontograma.detalles.length !== 1 ? 's' : ''}
																				</small>
																			</div>
																		)}
																	</div>
																	<div style={{ textAlign: 'right' }}>
																		<span className="badge" style={{
																			background: odontograma.estado === 'activo' 
																				? 'linear-gradient(135deg, #28a745 0%, #218838 100%)'
																				: 'linear-gradient(135deg, #6c757d 0%, #5a6268 100%)',
																			color: 'white',
																			padding: '6px 12px',
																			borderRadius: '8px',
																			fontSize: '12px',
																			fontWeight: 600
																		}}>
																			{odontograma.estado || 'activo'}
																		</span>
																	</div>
																</div>
																<div className="mt-3">
																	<Link 
																		to={`/ver_odontograma/${odontograma.id}`}
																		onClick={() => this.setState({ modal_odontogramas_visible: false })}
																	>
																		<button
																			className="btn btn-sm w-100"
																			style={{
																				background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
																				color: 'white',
																				border: 'none',
																				borderRadius: '8px',
																				padding: '8px 16px',
																				fontWeight: 600,
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
																			<i className="fas fa-eye me-2"></i>Ver Detalles
																		</button>
																	</Link>
																</div>
															</div>
														</div>
													</div>
												))}
											</div>
										)}
									</div>
								</div>
								<div className="modal-footer" style={{ border: 'none', padding: '20px 25px' }}>
									<button 
										className="btn" 
										onClick={() => this.setState({ modal_odontogramas_visible: false })}
										style={{
											background: 'linear-gradient(135deg, #6c757d 0%, #5a6268 100%)',
											color: 'white',
											border: 'none',
											borderRadius: '12px',
											padding: '10px 24px',
											fontWeight: 600,
											transition: 'all 0.2s ease'
										}}
										onMouseEnter={(e) => {
											e.target.style.transform = 'translateY(-2px)';
											e.target.style.boxShadow = '0 4px 12px rgba(108, 117, 125, 0.3)';
										}}
										onMouseLeave={(e) => {
											e.target.style.transform = 'translateY(0)';
											e.target.style.boxShadow = 'none';
										}}
									>
										<i className="fas fa-times me-2"></i>Cerrar
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