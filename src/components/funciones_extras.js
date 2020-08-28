import Axios from 'axios';
import Alertify from 'alertifyjs';

var password= "kadosh2019";
var url_base =  "https://service.clinickadosh.com";
//var url_base =  "http://localhost:8000";
var login_status = false;
var clave_secreta ="kadoshor2020";


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
function cargar_factura(el,id_factura){

              
    Axios.get(`${url_base}/api/cargar_factura/${id_factura}`).then(data=>{
        el.setState({factura:data.data[0]});
    }).catch(error=>{
            Alertify.message("No se pudo cargar la factura");
    });

}

function cargar_procedimientos_de_factura(el,id_factura,config=null){
    
        if(config==null){
            let total_de_factura=0;
            Axios.get(`${url_base}/api/cargar_procedimientos_de_factura/${id_factura}`).then(data=>{

            //  el.setState({monto_total:data.data});
            // console.log(data.data);
                data.data.forEach(data=>{
                        
                    total_de_factura+= data.total;

                });
                el.setState({monto_total:total_de_factura});

            }).catch(error=>{
                    console.log(error);
            });
        
        }else{
            Axios.get(`${url_base}/api/cargar_procedimientos_de_factura/${id_factura}`).then(data=>{

                //  el.setState({monto_total:data.data});
                // console.log(data.data);
                   el.setState({procedimientos_factura:data.data});
    
                }).catch(error=>{
                        console.log(error);
                });
            

        }
}


export default {clave_secreta,login_status,cargar_procedimientos_de_factura,cargar_factura,cargar_paciente,cargar_doctores,cargar_procedimientos,password,url_base,notificar_cumple,cargar_doctor};

