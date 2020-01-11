import React from 'react';
import ReactDOM from 'react-dom';
import Axios from 'axios';
import alertify from 'alertifyjs';
import Core from './funciones_extras';
import BuscarProcedimiento from './buscando_procedimiento';
class ActualizandoProcedmiento extends React.Component{

    constructor(props){
        super(props);
        this.state= {procedimiento:false,nombre:"",precio:0,id:0,config:0};
        this.cambiar = this.cambiar.bind(this);

    }

    componentDidMount(){

        this.cargar_procedimiento(this.props.id_procedimiento);
    }

    cargar_procedimiento=(id)=>{

        Axios.get(`${Core.url_base}/api/cargar_procedimiento/${id}`).then(data=>{
            
                this.setState({nombre:data.data.nombre,precio:data.data.precio,id:data.data.id});

        }).catch(error=>{
            alertify.error("No se puedo cargar este paciente");
        });
        

    }
    actualizar=()=>{

        
        Axios.get(`${Core.url_base}/api/actualizar_procedimiento/${this.state.nombre}/${this.state.precio}/${this.state.id}`).then(data=>{
                alertify.message("Procedimiento actualizado con exito");
                this.setState({config:'perfil_procedimientos'});
        }).catch(error=>{  
                alertify.error("no se pudo actualizar el procedimiento");
        });

    }
    
    cambiar=(e)=>{
        if(e.target.id=="nombre"){
            this.setState({nombre:e.target.value});
        }else{
            this.setState({precio:e.target.value});
        }

    }

    render(){

        if(this.state.config=='perfil_procedimientos'){

            return <BuscarProcedimiento/>;
        }
        return (<div><hr/>
                <div className="card">
                    <div className="card-body">
                        <strong>Nombre</strong><br/>
                        <input type="text" className="form-control" onChange={this.cambiar} value={this.state.nombre} id="nombre"/><br/>
                        <strong>Precio</strong><br/>
                        <input type="text" className="form-control" onChange={this.cambiar} value={this.state.precio} id="precio"/><br/>
                        <button className="btn btn-dark" onClick={this.actualizar}>Actualizar</button>
                    </div>
                </div>
        </div>);


    }



}
 export default ActualizandoProcedmiento;