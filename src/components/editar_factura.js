import React from 'react';
import Alertify from 'alertifyjs';
import Axios from 'axios';
import Core from './funciones_extras';
import '../css/dashboard.css';
import FacturaInterfaz from './factura_interfaz';
import {Link} from 'react-router-dom';

class FacturaEd extends React.Component{

        constructor(props){
            super(props);
            this.state = {data:[],factura:{},procedimientos_factura:[],total:0,procedimientos:[],opcion:false};
        }

        componentDidMount(){
                Core.cargar_factura(this,this.props.match.params.id_factura);
                Core.cargar_procedimientos_de_factura(this,this.props.match.params.id_factura,"");
                Core.cargar_procedimientos(this,this.props.match.params.id_factura);
        }

        buscar_procedimiento=()=>{ 
            
            var buscar = document.getElementById("buscando").value;
                Axios.get(`${Core.url_base}/api/buscar_procedimiento/${buscar}`).then(data=>{
    
                        this.setState({procedimientos:data.data});
    
                }).catch(error=>{
    
                    console.log("error");
                })
        }
        
        agregar_procedimiento=(id_procedimiento,valor_procedimiento)=>{

            Alertify.prompt("Agregar procedimiento",
            "Ingrese la cantidad de procedimineto que deseas agregar a esta factura","0",(event,value)=>{
                let total =  (valor_procedimiento * value);
                let cantidad = value;
                let id_factura = this.props.match.params.id_factura;
                Axios.get(`${Core.url_base}/api/agregar_procedimiento_lista/${id_factura}/${id_procedimiento}/${total}/${cantidad}`).then(data=>{
                    Alertify.success("Procedimiento agregado con exito..");
                    this.componentDidMount();
                }).catch(error=>{
                    Alertify.error("Error no se pudo agregar el procedimiento a la factura");
                });

            },()=>{
                Alertify.message("Bye");
            })


        }
        eliminar_procedimiento=(id_procedimiento,id_factura,totalidad)=>{

            Alertify.confirm("Eliminar procedimiento","Seguro que deseas eliminar este procedimiento de esta factura?",()=>{

              //  Alertify.success(`procedimiento borrado con  exito ${totalidad}`);
                    
                Axios.get(`${Core.url_base}/api/eliminar_procedimiento/lista/${id_procedimiento}/${id_factura}/${totalidad}`).then(data=>{
                            Alertify.message("Procedimiento borrado con exito!");
                            this.componentDidMount();
                        }).catch(error=>{
                        Alertify.error("Error al borrar procedimiento");
                    })
            },()=>{

                Alertify.message("Bye");

            });
           
        }

        retroceder=()=>{

            this.setState({
                opcion:'ver_factura'
            });
        }


        render(){

            if(this.state.opcion=='ver_factura'){
                return <FacturaInterfaz id_factura={this.props.match.params.id_factura} />
            }

            return(<div className="col-md-10">
                        <br/><br/><h5>Editar Factura</h5>
                        <strong>Lista de procedimientos</strong>


                        <Link to={`/ver_factura/${this.props.match.params.id}/${this.props.match.params.id_factura}`}>
                                 <button style={{float:'right'}} className='btn btn-primary'>Retroceder</button>
                        </Link>
                   

                        <table className="table">
                            <tr>
                                <td>Procedimiento</td>
                                <td>Cantidad</td>
                                <td>Total</td>
                                <td>Eliminar</td>
                            </tr>
                            {  this.state.procedimientos_factura.map((data=>(

                                <tr id={data.id}>
                                    <td>{data.nombre}</td>
                                    <td>{data.cantidad}</td>
                                    <td>$RD {new Intl.NumberFormat().format(data.total)}</td>
                                    <td><button onClick={()=>this.eliminar_procedimiento(data.id_historial,data.id_factura,data.total)} className="btn btn-danger">X</button></td>
                                </tr>
                                )))     
                                }
                                <tr>
                                    <td></td>
                                    <td></td>
                                </tr>
                        </table>
                        <strong>Agregar Procedimiento</strong><br/>
                        <input type='text' id="buscando"  onChange={this.buscar_procedimiento} className="form-control"/><br/>
                        <table className="table"> 
                        <tr>
                            <th>Procedimiento</th>
                        </tr>
                        <div className="interfaz_cliente">
                                {
                                    this.state.procedimientos.map((data=>(

                                       <tr>
                                            <td><strong>{data.nombre}</strong></td>
                                            <td><strong>{data.precio}</strong></td>
                                            <td><button onClick={()=>this.agregar_procedimiento(data.id,data.precio)} className="btn btn-primary">Agregar</button></td>
                                        </tr>
                                    )))

                                }
                         </div>
                      </table>
                  </div>);  


        }


}

export default FacturaEd;