import React from  'react';
import ReactDOM from 'react-dom';
import Axios from 'axios';
import alertify from 'alertifyjs';
import '../css/dashboard.css';
import Actualizar from './actualizando_procedimiento';
import cargar_doctores from './funciones_extras';
import Loading from '../loading2.gif';


class BuscandoProcedimiento extends  React.Component{

    constructor(props){
        super(props);
        this.state = {procedimientos:[],actualizar:false,id_procedimiento:0,change:false};
    }

    componentDidMount(){

        cargar_doctores.cargar_procedimientos(this)
    }




    actualizar=(id)=>{
        this.setState({actualizar:true,id_procedimiento:id});
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

    render(){
        if(this.state.actualizar==true){

                return <Actualizar id_procedimiento={this.state.id_procedimiento}/>;
        
        }else if(this.state.procedimientos==""){

        return (<div><br/><input type="text" className="form-control" onKeyUp={this.buscar_p} id="buscando" placeholder="Escriba el nombre del procedimiento" /><br/>
                <img src={Loading}/></div>);
        }

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
                </div>
            

        );    

    }


}


export default BuscandoProcedimiento;