import React from  'react';
import ReactDOM from 'react-dom';
import Axios from 'axios';
import alertify from 'alertifyjs';
import '../css/dashboard.css';
import Actualizar from './actualizando_procedimiento';

class BuscandoProcedimiento extends  React.Component{

    constructor(props){
        super(props);
        this.state = {procedimientos:[],actualizar:false,id_procedimiento:0};
    }

    componentDidMount(){

        this.cargar_procedimientos();
    }



    cargar_procedimientos(){

        Axios.get("http://localhost:8000/api/cargar_procedimientos").then(data=>{
                this.setState({procedimientos:data.data});
        }).catch(error=>{
            alertify.alert("Problema al cargar procedimientos");
        });

    }

    actualizar=(id)=>{
        this.setState({actualizar:true,id_procedimiento:id});
    }

    eliminar(id){

        alertify.confirm("Deseas eliminar este procedimiento",function(){

            Axios.get(`http://localhost:8000/api/eliminar_procedimiento/${id}`).then(data=>{
                
                    alertify.message("Procedimiento borrado correctamente!");
                    this.cargar_procedimientos();

            }).catch(error=>{
                    alertify.error("no se pudo eliminar el procedimiento");
            });
                
        },function(){

        });

    }

    buscar_p=()=>{ 
            
        var buscar = document.getElementById("buscando").value;
            Axios.get(`http://localhost:8000/api/buscar_procedimiento/${buscar}`).then(data=>{

                    this.setState({procedimientos:data.data});

            }).catch(error=>{

                console.log("error");
            })
    }

    render(){
        if(this.state.actualizar==true){

                return <Actualizar id_procedimiento={this.state.id_procedimiento}/>;
        }

        return (
            <div className="procedimiento"><br/>
                <input type="text" className="form-control" onKeyUp={this.buscar_p} id="buscando" placeholder="Escriba el nombre del procedimiento" /><br/>
                {this.state.procedimientos.map(data=>(                
                        <div className="card">
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