
import ReactDOM from 'react-dom';
import React from 'react';
import '../css/dashboard.css';
import Axios from 'axios';
import Alertify from 'alertifyjs';
import Core from './funciones_extras';
import PerfilPaciente from './perfil_paciente';

class  AgregarCita extends React.Component{

    constructor(props){
          super(props);
          this.state={data:null,mensaje:"",control:false,citas:[]};    
    }

    captura_fecha_hora(){

        return {
            hora:document.querySelector("#hora").value,
            dia:document.querySelector("#dia").value
        }
    }

    guardar_cita=()=>{

        let data = this.captura_fecha_hora();
    
        Axios.get(`${Core.url_base}/api/guardar_cita/${this.props.id_paciente}/${data.hora}/${data.dia}`).then(data=>{

            Alertify.success("Cita registrada correctamente");
            this.setState({control:'cargar_paciente'});

        }).catch(error=>{
             console.log(error);
             Alertify.success("Error al registrar cita");

        })

    }

    cargar_citas(id_paciente){
            Axios.get(`${Core.url_base}/api/cargar_citas_de_paciente/${id_paciente}`).then(data=>{
                    this.setState({citas:data.data});
            }).catch(error=>{
            
            });

    }

    actualizar_cita(id){
        let data =this.captura_fecha_hora();
        Alertify.message(id);

        Axios.get(`${Core.url_base}/api/actualizar_cita/${this.props.id_cita}/${data.hora}/${data.dia}`).then(data=>{
                Alertify.success(data.data);
        }).catch(error=>{
            Alertify.error(error);
        });

    }

    eliminar_cita(id){

        Axios.get("").then(

        ).catch(error=>{

        });


    }

    buscar_citas(){

        Axios.get("").then(

        ).catch(error=>{

        });


    }


    render(){
        let boton = <button onClick={this.guardar_cita} className="btn btn-primary" >Guardar</button>;


        if(this.state.control=="actualizar" || this.props.config=="actualizar"){

            boton = <button onClick={()=>this.actualizar_cita(this.props.id_cita)} className="btn btn-primary">Actualizar</button>;
        }else if(this.state.control=="cargar_paciente"){

            return <PerfilPaciente id_paciente={this.props.id_paciente}/>
        }   

        return (<div className="card">
                <div className="card-body"><hr/>
                <h3>Asignando Horario para cita del paciente ({this.props.paciente})</h3>
                    <strong>Hora</strong>
                    <input type="time" className="form-control" id="hora" /><br/>
                    <strong>Dia</strong>
                    <input type="date" id="dia"  className="form-control"/><br/>
                    {boton}                    
                </div>
            </div>);


    }




}

export default AgregarCita;