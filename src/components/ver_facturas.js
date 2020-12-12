import React from 'react';
import Axios from 'axios';
import Alertify from 'alertifyjs';
import IconInvoice from '../expediente.png';
import FacturaInterface from './factura_interfaz';
import FuncionesExtras from './funciones_extras';
import PerfilPaciente from './perfil_paciente';
class VerFacturas extends React.Component{


    constructor(props){
            super(props);  
            this.state= {data:null,facturas:[],id_factura:null,paciente:{}};
            FuncionesExtras.cargar_paciente(this,this.props.id_paciente);
    }


    componentDidMount(){

        this.cargar_facturas(this.props.id_paciente);
    }

    cargar_facturas=(id_paciente)=>{
        Axios.get(`${FuncionesExtras.url_base}/api/cargar_facturas_paciente/${id_paciente}`).then(data=>{
            
            this.setState({facturas:data.data});
            Alertify.message("Facturas listas");
    
        }).catch(error=>{
            Alertify.error("Error al cargar facturas");
        });
    }

    eliminar_factura(id_factura){
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
        
            return (<div className="col-md-10">
                    <hr/>
                    <button className='btn btn-primary' style={{float:'right'}} onClick={this.retroceder}>Retroceder</button><br/>
                    <br/><div className="card"><br/><br/>
                    <h2>Facturas de paciente {this.state.paciente.nombre} {this.state.paciente.apellido}</h2><hr/>
                    {
                        this.state.facturas.map((data=>(

                            <div className="card-body" id={data.id}>
                                <img width="30" src={IconInvoice}/> <button className="btn-primary" onClick={()=>this.ver_factura(data.id)}>Ver Factura</button> <button className="btn-info" onClick={()=>this.eliminar_factura(data.id)}>Eliminar</button><strong> Total a pagar:</strong> RD$ {new Intl.NumberFormat().format(data.precio_estatus)}<hr/>
                            </div>
                        )))
                        
                    
                    }
                    </div>


                </div>);
            }
    }



}

export default VerFacturas;