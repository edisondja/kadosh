import React from 'react';
import ReactDOM from 'react-dom';
import Axios from 'axios';
import ReactToast from 'react-toasts';
import Alertify from 'alertifyjs';
import Core from './funciones_extras';
import { BrowserRouter, Route} from "react-router-dom";


class ActualizarDoctor extends React.Component{

    constructor(props){
            super(props);
            this.state = {doctor:{nombre:"Edison",apellido:"De Jesus Abreu"}};
            this.editando_campo = this.editando_campo.bind(this);
    }
            
    componentDidMount(){

        this.cargar_doctor(this.props.id_doctor);
    }
0
    cargar_doctor=(id)=>{


        Axios.get(`${Core.url_base}/api/cargar_doctor/${id}`).then(data=>{

            this.setState({doctor:data.data});

        }).catch(error=>{

            Alertify.message(error);

        });

    }

    editando_campo(e){

        if(e.target.id=="nombre"){
            let doctor  = this.state.doctor;
            doctor.nombre =e.target.value;
            this.setState({doctor:doctor});

        }else if(e.target.id=="apellido"){

            let doctor  = this.state.doctor;
            doctor.apellido =e.target.value;
            this.setState({doctor:doctor});

        }else if(e.target.id=="telefono"){  

            let doctor  = this.state.doctor;
            doctor.numero_telefono =e.target.value;
            this.setState({doctor:doctor});

        }else if(e.target.id=="dni"){
            let doctor  = this.state.doctor;
            doctor.dni =e.target.value;
            this.setState({doctor:doctor});
        }

    }

    actualizar_doctor=()=>{

  

        Axios.get(`${Core.url_base}/api/actualizar_doctor/${this.state.doctor.nombre}/${this.state.doctor.apellido}
        /${this.state.doctor.telefono}/${this.state.doctor.dni}/${this.props.id_doctor}`).then(data=>{

            Alertify.message("Se actualizo correctamente")

        }).catch(error=>{

            console.log(error);

        });

    }

    render(){

        return(
            <div className="col-md-8">
                <div> <br/><br/>
                    <h2>Actualizar doctor</h2>
                    <strong>Nombre</strong><br/>
                    <input type="text" id="nombre" onChange={this.editando_campo}  value={this.state.doctor.nombre}  defaultValue={this.state.doctor.nombre} className="form-control"/><br/>
                    <strong>Apellido</strong><br/>
                    <input type="text" id="apellido"  onChange={this.editando_campo}  value={this.state.doctor.apellido}  defaultValue={this.state.doctor.apellido} className="form-control" /><br/> 
                    <strong>TELEFONO</strong><br/>
                    <input type="text"  id="telefono"  onChange={this.editando_campo}  value={this.state.doctor.numero_telefono}  defaultValue={this.state.doctor.numero_telefono} className="form-control" /><br/> 
                    <strong>DNI</strong><br/>
                    <input type="text" id="dni"  onChange={this.editando_campo} className="form-control" value={this.state.doctor.dni}/><br/> 
                    <button className="btn btn-success" onClick={this.actualizar_doctor}>Actualizar</button>
                </div>
            </div>  
        );      

    }



}

export default ActualizarDoctor;