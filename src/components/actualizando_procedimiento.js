import React from 'react';
import ReactDOM from 'react-dom';
import Axios from 'axios';
import alertify from 'alertifyjs';
import Core from './funciones_extras';
class ActualizandoProcedmiento extends React.Component{

    constructor(props){
        super(props);
        this.state= {procedimiento:false,procedimiento:[]};

    }

    componentDidMount(){

        this.cargar_procedimiento(this.props.id_procedimiento);
    }

    cargar_procedimiento=(id)=>{

        Axios.get(`${Core.url_base}/api/cargar_procedimiento/${id}`).then(data=>{
            
                this.setState({procedimiento:data.data})

        }).catch(error=>{
            alertify.error("No se puedo cargar este paciente");
        });
        

    }
    actualizar=()=>{
        var nombre = this.state.procedimiento.nombre;
        var precio = this.state.procedimiento.precio;
        var id = this.state.procedimiento.id;
        
        Axios.get(`${Core.url_base}/api/actualizar/${nombre}/${precio}/${id}`).then(data=>{
                alertify.message("Procedimiento actualizado con exito");
        }).catch(error=>{  
                alertify.error("no se pudo actualizar el procedimiento");
        });

    }

    render(){

        return (<div>
                <div className="card">
                    <div className="card-body">
                        <strong>Nombre</strong><br/>
                        <input type="text" className="form-control" value={this.state.procedimiento.nombre} id="nombre"/><br/>
                        <strong>Precio</strong><br/>
                        <input type="text" className="form-control" value={this.state.procedimiento.precio} id="precio"/><br/>
                        <button className="btn btn-dark" onClick={this.actualizar}>Actualizar</button>
                    </div>
                </div>
        </div>);


    }



}
 export default ActualizandoProcedmiento;