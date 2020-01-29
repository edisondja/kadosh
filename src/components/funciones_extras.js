import Axios from 'axios';
import Alertify from 'alertifyjs';

var password= "kadosh2019";
//var url_base =  "https://service.clinickadosh.com";
var url_base =  "http://localhost:8000";


function cargar_doctores(el){

    Axios.get(`${url_base}/api/doctores`).then(data=>{

         el.setState({doctores:data.data});

    }).catch(error=>{

        console.log(error);

    })
}

function cargar_doctor(u,id_doctor){

        Axios.get(`${url_base}/api/cargar_doctor/${id_doctor}`).then(data=>{

                u.setState({doctore:data.data});

        }).catch(error=>{

            console.log(error);

        })
}

function cargar_paciente(el,id_paciente){

        Axios.get(`${url_base}/api/paciente/${id_paciente}`).then(data=>{
                    el.setState({paciente:data.data});
        }).catch(error=>{
            Alertify.error("No se pudo cargar la informacion del paciente");
        });

}

    function notificar_cumple(el){
    
        Axios.get(`${url_base}/api/notificar_cumple`).then(data=>{
                el.setState({notificaciones:data.data});
        }).catch(error=>{
                Alertify.message("No se pudieron cargar las notificaciones");
        });

    }




function cargar_procedimientos(el){

    Axios.get(`${url_base}/api/cargar_procedimientos`).then(data=>{
            el.setState({procedimientos:data.data});

          //  Alertify.success(data);
    }).catch(error=>{
        Alertify.alert("Problema al cargar procedimientos");
    });

}


export default {cargar_paciente,cargar_doctores,cargar_procedimientos,password,url_base,notificar_cumple,cargar_doctor};

