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
				eliminar: 0
				};
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

		agregar_nota_paciente=(id_paciente)=>{


			//Alertify.message("Este es el ID que tenemos de la nota"+);

			let agregar_nota =`<table>
				<tr>
					<td><img src='${ImagenNota}' style='padding:10px'/></td>
					<td><textarea class='form-control' cols='50' rows='5' id='nota'></textarea></td>
				</tr>
			</table>`;


			Alertify.confirm("<br/>Escriba la nota que desea para este paciente",agregar_nota,()=>{

				let nota = {
							id_paciente:this.props.id_paciente,
							nota:document.getElementById('nota').value
						   };

				Axios.post(`${Verficar.url_base}/api/crear_nota`,nota).then(data=>{

					console.log(data);
					alertify.message('Nota creada con exito');


				}).catch(error=>{

					alertify.message('No se pudo crear la nota');
				});



			},function(){}).resizeTo(500,500);

			

		}


		cargar_notas=(controlador)=>{

			Alertify.confirm().destroy(); 

		
			let notas =`<div class='card estilo_notas' id='panel'><table class='table' >
			<tr><td></td><td>Nota</td><td>Fecha de nota</td></td><td>Actualizar</td><td>Eliminar</td></tr>
			`;
			
			Axios.get(`${Verficar.url_base}/api/cargar_notas/${this.props.id_paciente}`).then(data=>{

				
					data.data.forEach(element => {
						
						notas+=`<tr id='fila${element.id}'>
								<td><img src='${ImagenNota}' width="50"/></td>
								<td id='texto${element.id}'><p>${element.descripcion}</p></td>
								<td>${element.updated_at}</td>
								<td><button class='btn-primary' id="${element.id}">Actualizar</button></td>
								<td><button class='btn-warning' id="${element.id}">Eliminar</button></td>
							</tr>`;
					});

				

					notas+=`</table></div>`;


					Alertify.confirm('Notas',`${notas}`,function(){},function(){}).set('resizable',true).resizeTo(1024,500);


					let panel = document.getElementById('panel');
					let botones = panel.querySelectorAll('.btn-warning');
	
					botones.forEach((botones)=>{
	
						botones.addEventListener('click',function(e){

								let nota = {nota_id:e.target.id};

								/*Eliminar fila creada con su propio id*/
								document.getElementById(`fila${e.target.id}`).remove();
								
								Axios.post(`${Verficar.url_base}/api/eliminar_nota`,nota).then(data=>{

									console.log(data);
									alertify.message('Nota eliminada con exito!');	
	
								}).catch(error=>{
	
									alertify.message('No se pudo eliminar la nota');
	
								});
	
						});
	
					});
	
	
	
					let panel_a = document.getElementById('panel');
					let botones_actualizar_A = panel_a.querySelectorAll('.btn-primary');
	
					
					botones_actualizar_A.forEach((botones_actualizar)=>{
	
							let contador = 0;
	
							botones_actualizar.addEventListener('click',function(e){

								botones_actualizar.disabled=true;
								let text = document.getElementById(`texto${e.target.id}`);
								let id =e.target.id;
								let texto = text.innerText;

									text.innerHTML=`<textarea id="textos${e.target.id}">${texto}</textarea>`;


									
									 document.getElementById('panel').addEventListener('keyup',(e)=>{
										
									

										

										if(e.which==13){
											botones_actualizar.disabled=false;

												let id_record = e.target.id.substr(6,10);

												let nota_actualizar = {
													id_nota:id_record,
													descripcion:document.getElementById(`textos${id}`).value
												};

													//alert(nota_actualizar.descripcion);
													Axios.post(`${Verficar.url_base}/api/actualizar_nota`,nota_actualizar).then(data=>{
															console.log(data);
														   // this.forceUpdate();
															//text.innerHTML=`<textarea id="textos${e.target.id}">${texto}</textarea>`;
															text.innerHTML=`<td id="texto${e.target.id}">${nota_actualizar.descripcion}</td>`;
															Alertify.message("nota actualizada con exito");
										
													}).catch(error=>{


													});


										}




									});


									 



							});
	
	
	
					});
	
	


			}).catch(error=>{

				console.log(error);


			});



		}



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


		cargar_documentos=()=>{


			let Redirects;
			
			Axios.get(`${Verficar.url_base}/api/cargar_documentos/${this.props.id_paciente}`).then(data=>{

				let interface_documento = `
				<div id="panel_radio" class='estilo_notas'>
				<table class='table'>
				<tr>
					<td>Radiografia</td>
					<td>Comentarios</td>
					<td>Fecha</td>
					<td><img src='${ImagenMas}' style='margin-top: 17%;position:fixed;cursor:pointer;' id="agregar_nota"/>&nbsp;</td>
				</tr>
				`;
				



		
				data.data.forEach(data=>{
				    Redirects=`${Verficar.url_base}/storage/${data.ruta_radiografia}`;
					//<embed src="${Redirects}" width="250x" height="250x" />
					interface_documento+=`<tr id='fila_radiografia${data.id}'> 
							<td><a target='_blank' href='${Redirects}'>Ver documento</a></td>
							<td>${data.comentarios}</td>
							<td>${data.updated_at}</td>
							<td><button class='btn-warning' id='${data.id}'>Eliminar</button></td>
					</tr>`;	
				});

				//Alertify.confirm('Documentos adjuntados')
				interface_documento+=`</table>
				`;

				Alertify.confirm('Documentos adjuntados',interface_documento,function(){},function(){}).set('resizable',true).resizeTo(1024,500);


				let boton = document.getElementById('panel_radio');
				let botones_radiografia_e  = boton.querySelectorAll('.btn-warning');
				let agregar_nota = document.getElementById("agregar_nota");

				agregar_nota.addEventListener('click',function(){

					let interface_documento = `<div class='card'>
						<input type='file' id='archivo_doc' class='form-control' /><br/>
						<textarea rows='12' id='descripcion_doc' class='form-control' placeholder='descripcion de documento'></textarea>
					</div>`;

					

				
					Alertify.confirm("Subir documento",`${interface_documento}`,function(){

						var formData = new FormData();
						var imagefile = document.querySelector('#archivo_doc');
						formData.append("image", imagefile.files[0]);
						formData.append("usuario_id",document.getElementById('paciente_id').value);
						formData.append("comentarios",document.getElementById('descripcion_doc').value);
			
						Axios.post(`${Verficar.url_base}/api/subir_radiografia`, formData, {
							headers: {
							  'Content-Type': 'multipart/form-data'
							}
						}).then(data=>{
			
			
							console.log(data);
							Alertify.message("archivo subido con exito");
							//var imagefile = document.querySelector('#documento').files="";
			
			
						}).catch(error=>{
			
							console.log(error);
			
						});
			
			

					},function(){}).set('resizable',true).resizeTo(500,500);

				});
			
				botones_radiografia_e.forEach((btn_eliminar)=>{


							btn_eliminar.addEventListener('click',function(e){


									Axios.post(`${Verficar.url_base}/api/eliminar_radiografia`,{id_radiografia:e.target.id}).then(data=>{
										
										  console.log(data);
										  Alertify.message("Eliminando documento");	
										  setTimeout(function(){

												document.getElementById(`fila_radiografia${e.target.id}`).remove();
												Alertify.message("Completado");	

										  },2000);

									}).catch(error=>{
										
											Alertify.message("Error no se pudo eliminar el documento lo sentimos, pongase en contacto con el desarrollador.")
									});


							});

				});


				let botones_ver = boton.querySelectorAll('.btn-primary');
					botones_ver.forEach(boton=>{
						boton.addEventListener('click',(e)=>{

								//alert(e.target.value);
								let contendero_documento =`<div'>
									<embed src="${Redirects}" style='height:1024px;width:1024px'/>
								</div>`;


								Alertify.confirm(`Viendo documento`,`${contendero_documento}`,function(){},function(){}).set('resizable',true).resizeTo(1024,700); 


						});
					});

				}).catch(error=>{


				Alertify.message('Problema cargando los documentos');

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


		ver_presupuesto=()=>{


			this.setState({select:'ver_presupuestos'});

		}

		

	render() {
			if (this.state.select === 'agregando_factura') {
				return '';
			} else if (this.state.select === 'editando_cita') {
				return <AgregarCita config="actualizar" id_cita={this.state.id_cita} />;
			} else if (this.state.select === "ver_facturas") {
				return <VerFacturas id_paciente={this.props.id_paciente} paciente={this.state.paciente.nombre} />;
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
						<Link to={`/agregar_factura/${this.props.match.params.id}`}>
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
							onClick={this.cargar_notas}
							title="Notas"
							aria-label="Notas"
						>
							<i className="fas fa-sticky-note"></i>
							<span>Notas</span>
						</button>

						<button
							className="icon-btn"
							onClick={this.agregar_nota_paciente}
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

					<Link to={`/presupuestos/${this.props.match.params.id}/${this.props.match.params.id_doc}`}>
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

					<strong className="mb-3 d-block">Lista de citas</strong>
					{this.state.lista_citas.map((data) => (
					<div className="card shadow-sm mb-3" key={data.id}>
						<div className="card-body d-flex justify-content-between align-items-center">
						<strong>
							Hora: {data.hora} | Día: {data.dia}
						</strong>
						<div>
							<button
							className="btn btn-outline-info me-2"
							onClick={() => this.cargar_cita(data.id)}
							>
							Editar
							</button>
							<button
							className="btn btn-outline-danger"
							onClick={() => this.eliminar_cita(data.id)}
							>
							Eliminar
							</button>
						</div>
						</div>
					</div>
					))}
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