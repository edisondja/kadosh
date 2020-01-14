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
            <div className="tableflow"><br/>
                <input type="text" className="form-control" onKeyUp={this.buscar_p} id="buscando" placeholder="Escriba el nombre del procedimiento" /><br/>
                {this.state.procedimientos.map(data=>(                
                        <div className="card" id={data.id}>
                            <div className="card-body">
                                Nombre: {data.nombre}<br/>
                                 Precio: {data.precio}<br/>
                                <button className="btn-primary"onClick={()=>this.actualizar(data.id)}>Actualizar</button>
                                <button className="btn-danger" onClick={()=>this.eliminar(data.id)}>Eliminar</button>

                            </div>
                        </div>

                ))}
            </div>
        );    

    }


}


export default BuscandoProcedimiento;