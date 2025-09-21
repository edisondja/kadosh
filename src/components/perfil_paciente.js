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


	
		constructor(props){

			
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
				modal_nota_visable:false,
				modal_documento_visible: false,
		
				nota_texto: '',
				modal_ver_notas_visable:false,
				documentos: [],
				notasPaciente: []
				};
		}


		ver_notas = () => {
				this.cargarNotas();
				this.setState({ modal_ver_notas_visable: true });
				
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


			this.consultarPaciente(id);
			this.cargar_citas_paciente(id);
			this.cargar_doctor(id_doc);
			//this.setState({doctor:});
			//alert(this.props.IdDoctor);
			this.consultar_deuda_paciente(id);
			//this.cargar_notas();


		}

		crear_presupuesto =()=>{

			this.setState({select:'crear_presupuesto'});

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
							<th>Curso</th>
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
				{this.state.modal_nota_visable && (
				<div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
					<div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 600 }}>
					<div className="mac-box p-4 rounded-3 shadow-lg" style={{ width: '100%' }}>
						<div className="d-flex justify-content-between align-items-center mb-3">
						<h5 className="fw-bold">📝 Escribir Nota del Paciente</h5>
						<button
							type="button"
							className="btn-close"
							onClick={this.closeModalNota}
						></button>
						</div>

						<textarea
						className="mac-input w-100"
						placeholder="Escribe aquí la nota..."
						rows={6}
						value={this.state.nota_texto}
						onChange={(e) => this.setNotaTexto(e.target.value)}
						style={{ resize: 'vertical' }}
						></textarea>

						<div className="d-flex justify-content-end gap-2 mt-4">
						<button className="mac-btn mac-btn-green" onClick={this.guardarNota}>
							💾 Guardar
						</button>
						<button className="mac-btn mac-btn-gray" onClick={this.closeModalNota}>
							❌ Cancelar
						</button>
						</div>
					</div>
					</div>
				</div>
				)}
				{this.state.modal_ver_notas_visable && (
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
						<button className="btn btn-secondary" onClick={() => this.setState({ modal_ver_notas_visable: false })}>
							Cerrar
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
						<h5 className="modal-title">📁 Documentos del Alumno</h5>
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