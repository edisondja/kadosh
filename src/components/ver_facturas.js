import React from 'react';
import Axios from 'axios';
import Alertify from 'alertifyjs';
import IconInvoice from '../expediente.png';
import FacturaInterface from './factura_interfaz';
import FuncionesExtras from './funciones_extras';
import PerfilPaciente from './perfil_paciente';
import { Link } from 'react-router-dom/cjs/react-router-dom.min';
class VerFacturas extends React.Component{


    constructor(props){
            super(props);  
            this.state= {data:null,facturas:[],id_factura:null,paciente:{}};
            FuncionesExtras.cargar_paciente(this,this.props.match.params.id);
    }


    componentDidMount(){

        console.log(this.state.facturas);

        this.cargar_facturas(this.props.match.params.id);
    }

    validar_para_borrar=(id_factura)=>{

     Axios.get(`${FuncionesExtras.url_base}/api/cargar_recibos/${id_factura}`)
        .then(data=>{

            if(data.data.length>0){

                Alertify.error(`Estimado usuario no puedes eliminar esta factura, 
                    ya que recibos generados dependen de esta, si desea eliminarla borre todos los recibos, 
                    correspondientes`);

            }else{
                Alertify.prompt("Eliminar Factura","Digite la contraseña admin para eliminar esta factura","",
                    function(event,value){
                            if(FuncionesExtras.password==value){
                                
                                Axios.get(`${FuncionesExtras.url_base}/api/eliminar_factura/${id_factura}`).then(data=>{
                                        Alertify.success("Factura eliminada con exito");
                                        document.getElementById(id_factura).remove();
                                }).catch(error=>{
                                        Alertify.error("No se pudo eliminar la factura");
                                });
                                Alertify.success("contraseña correcta");
                            }
                    },function(error){

                    }).set('type','password');
                }
   
        }).catch(error=>{

            Alertify.message(error);
        });
        
    }


   cargar_facturas=(id_paciente)=>{
         Axios.get(`${FuncionesExtras.url_base}/api/cargar_facturas_paciente/${id_paciente}`).then(data=>{
            
            this.setState({facturas:data.data});
            Alertify.message("Facturas listas");
    
        }).catch(error=>{
            Alertify.error("Error al cargar facturas");
            this.Alertify.message("Reconectando ..");
            this.cargar_facturas=(id_paciente);
        });
    }

     eliminar_factura(id_factura){


         this.validar_para_borrar(id_factura);

    }

    actualizar_factura(id_factura){
    
    }
    
    retroceder=()=>{

        this.setState({option:'perfil_paciente'});
    }

    ver_factura=(id_factura)=>{

            this.setState({id_factura:id_factura,option:"ver_factura"});
    
    }

    imprimir_factura(id_factura){

    }
    

    render(){
    
        if(this.state.option=="ver_factura"){

                return <FacturaInterface id_factura={this.state.id_factura} id_paciente={this.props.id_paciente} />


        }else if(this.state.option=="editar_factura"){

        }else if(this.state.option=="imprimir_factura"){

        }else if(this.state.option=="perfil_paciente"){

            return <PerfilPaciente id_paciente={this.props.id_paciente}/>;

        }else{
        
          return (
               <div className="col-md-10 mx-auto my-4">
                    <div className="d-flex justify-content-end mb-3">

                        <Link to={`/perfil_paciente/${this.props.match.params.id}/${this.props.match.params.id_doc}`}>   
                            <button className="btn btn-dark" onClick={this.retroceder} style={{marginRight: '10px',cursor: 'pointer' }} >
                            <i className="fas fa-arrow-left me-2"></i> Retroceder
                            </button>
                        </Link>
                     
                    </div>

                    <div className="card shadow-sm p-4">
                        <h3 className="mb-4 fw-semibold text-dark">
                        Facturas de {this.state.paciente.nombre} {this.state.paciente.apellido}
                        </h3>
                        <hr />

                        {this.state.facturas.length === 0 ? (
                        <p className="text-muted">No hay facturas registradas.</p>
                        ) : (
                        this.state.facturas.map((data) => (
                            <div
                            className="factura-item d-flex align-items-center justify-content-between px-3 py-2 border rounded mb-3"
                            key={data.id}
                            >
                            <div className="d-flex align-items-center gap-3">
                                <img width="30" src={IconInvoice} alt="Factura" />
                                <div>
                                <div className="text-muted small">Total a pagar</div>
                                <strong className="text-dark fs-5">&nbsp;
                                    RD$ {new Intl.NumberFormat().format(data.precio_estatus)}
                                </strong>
                                </div>
                            </div>

                            <div className="d-flex gap-2">
                                <Link to={`/ver_factura/${this.props.match.params.id}/${data.id}`}>
                                    <button className="btn btn-outline-primary btn-sm">
                                    <i className="fas fa-eye"></i>
                                    </button>
                                </Link>
                               
                                <button className="btn btn-outline-danger btn-sm" onClick={() => this.eliminar_factura(data.id)}>
                                <i className="fas fa-trash-alt"></i>
                                </button>
                            </div>
                            </div>
                        ))
                        )}
                    </div>
                    </div>

                );
            }
    }



}

export default VerFacturas;