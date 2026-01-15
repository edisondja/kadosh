import React from  'react';
import ReactDOM from 'react-dom';
import Axios from 'axios';
import alertify from 'alertifyjs';
import '../css/dashboard.css';
import Core from './funciones_extras';
import cargar_doctores from './funciones_extras';
import Loading from '../loading2.gif';


class BuscandoProcedimiento extends  React.Component{

    constructor(props){
        super(props);
        this.state = {procedimientos:[],
                     actualizar:false,
                     id_procedimiento:0,
                     modal_update:false,
                     id:0,
                     nombre:'',
                     precio:'',
                     color:'',
                     change:false};
    }


    actualizar_valor=(event)=>{

        this.setState({[event.target.name]:event.target.value});

    }




    componentDidMount(){

        cargar_doctores.cargar_procedimientos(this)
    }


        cargar_procedimiento=(id)=>{

        Axios.get(`${Core.url_base}/api/cargar_procedimiento/${id}`).then(data=>{
            
                this.setState({nombre:data.data.nombre,precio:data.data.precio,id:data.data.id,color:data.data.color});

        }).catch(error=>{
            alertify.error("No se puedo cargar este paciente");
        });
        

    }
    actualizar=(id)=>{

        this.setState({modal_update:true})
 
           Axios.get(`${Core.url_base}/api/cargar_procedimiento/${id}`).then(data=>{
            
                this.setState({nombre:data.data.nombre,precio:data.data.precio,id:data.data.id});

        }).catch(error=>{
            alertify.error("No se puedo cargar este paciente");
        });

    }

    actualizar_procedimiento=()=>{

        Axios.post(`${Core.url_base}/api/actualizar_procedimiento`,
                    {nombre:this.state.nombre,
                     precio:this.state.precio,
                     color:this.state.color,
                     id:this.state.id }
        ).then(data=>{
                alertify.message("Procedimiento actualizado con exito");
        
        }).catch(error=>{ 
            console.log(error);
                alertify.error("no se pudo actualizar el procedimiento");
        });

    }

  
    eliminar=(id)=>{

        alertify.confirm("Deseas eliminar este procedimiento",()=>{

            Axios.get(`${cargar_doctores.url_base}/api/eliminar_procedimiento/${id}`).then(data=>{
                
                    alertify.message("Procedimiento borrado correctamente!");
                    document.getElementById(id).remove();
                    if(this.state.change==false){
                         this.setState({change:true});
                    }else{
                        this.setState({change:false});
                    }
                   // this.cargar_procedimientos();

            }).catch(error=>{
                    alertify.error("no se pudo eliminar el procedimiento");
            });
                
        });

    }

    buscar_p=()=>{ 
            
        var buscar = document.getElementById("buscando").value;
            Axios.get(`${cargar_doctores.url_base}/api/buscar_procedimiento/${buscar}`).then(data=>{

                    this.setState({procedimientos:data.data});

            }).catch(error=>{

                console.log("error");
            })
    }

    actualizar_color=(event)=>{

        this.setState({color:event.target.value});

    }

    render(){
      

        return (
            <div className="col-md-10"><hr/>
                <input 
                type="text" 
                className="form-control mb-4 shadow-sm" 
                onKeyUp={this.buscar_p} 
                id="buscando" 
                placeholder="🔍 Escriba el nombre del procedimiento" 
                />

            {this.state.procedimientos.map(data => (
                    <div className="card mb-3 shadow-sm rounded border-0 procedimiento-card .procedimiento-nombre" key={data.id}>
                        <div className="card-body">
                        <h5 className="card-title text-primary">
                            {data.nombre}
                        </h5>
                        <p className="card-text">
                            <strong>Precio:</strong> RD$ {new Intl.NumberFormat().format(data.precio)}
                        </p>

                        <div className="d-flex gap-2">
                            <button 
                            className="btn btn-outline-primary btn-sm" 
                            onClick={() => this.actualizar(data.id)}
                            >
                            <i className="fas fa-pen"></i> Actualizar
                            </button>

                            <button 
                            className="btn btn-outline-danger btn-sm" 
                            onClick={() => this.eliminar(data.id)}
                            >
                            <i className="fas fa-trash"></i> Eliminar
                            </button>
                        </div>
                        </div>
                    </div>
                    ))}
                    {this.state.modal_update && (
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
                                <h5 className="fw-bold">📝Actualizar procedimiento</h5>
                                <button type="button" className="btn-close" onClick={() => this.setState({ modal_update: false })}></button>
                                </div>
                                <strong>Nombre</strong><hr/>
                                <input className='form-control' name="nombre" value={this.state.nombre} onChange={this.actualizar_valor}/><hr/>                               
                                <strong>Precio</strong>
                                <input className='form-control' name="precio" value={this.state.precio} onChange={this.actualizar_valor}/>
                                <select id="color" onChange={this.actualizar_color}  className="form-control mt-3">
                                    <option value={this.state.color} >{this.state.color}</option>
                                    <option value="red">Rojo</option>
                                    <option value="blue">Azul</option>
                                    <option value="green">Verde</option>
                                    <option value="yellow">Amarillo</option>
                                </select>
                                <div className="d-flex justify-content-end gap-2 mt-4">
                                <button
                                    className="mac-btn mac-btn-green"
                                    onClick={() => {
                                    this.actualizar_procedimiento();
                                    this.setState({ modal_update: false });
                                    }}>
                                    Actualizar
                                </button>
                             
                                </div>
                            </div>
                            </div>
                        </div>
				    )}

                </div>
            

        );    

    }


}


export default BuscandoProcedimiento;