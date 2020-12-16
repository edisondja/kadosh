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
        cargar_doctores(el);

    })
}

function cargar_doctor(u,id_doctor){

        Axios.get(`${url_base}/api/cargar_doctor/${id_doctor}`).then(data=>{

                u.setState({doctore:data.data});

        }).catch(error=>{

            console.log(error);
            cargar_doctor(u,id_doctor);

        })
}

function cargar_paciente(el,id_paciente){

        Axios.get(`${url_base}/api/paciente/${id_paciente}`).then(data=>{
                    el.setState({paciente:data.data});
        }).catch(error=>{
            Alertify.error("No se pudo cargar la informacion del paciente");
            Alertify.message("Conectando...");
            cargar_paciente(el,id_paciente);
        });

}

    function notificar_cumple(el){
    
        Axios.get(`${url_base}/api/notificar_cumple`).then(data=>{
                el.setState({notificaciones:data.data});
        }).catch(error=>{
                Alertify.message("No se pudieron cargar las notificaciones");
                Alertify.message("Volviendo a conectar las notificacioens");
                notificar_cumple(el);
        });

    }




function cargar_procedimientos(el){

    Axios.get(`${url_base}/api/cargar_procedimientos`).then(data=>{
            el.setState({procedimientos:data.data});

          //  Alertify.success(data);
    }).catch(error=>{
        Alertify.alert("Problema al cargar procedimientos");
        Alertify.message("Reconectando...");
        cargar_procedimientos(el);
    });

}
function cargar_factura(el,id_factura){

              
    Axios.get(`${url_base}/api/cargar_factura/${id_factura}`).then(data=>{
        el.setState({factura:data.data[0]});
    }).catch(error=>{
            Alertify.message("No se pudo cargar la factura");
            Alertify.message("Reconectando..");
            cargar_factura(el,id_factura);

    });

}

 function Consultar_deuda_de_paciente(id_paciente){
   
    Axios.get(`${url_base}/api/consultar_deuda/${id_paciente}`).then(data=>{
        if(parseInt(data.data.deuda_total)>0){
            document.getElementById(`interfaz${id_paciente}`).style.color="red";
        }else{
            document.getElementById(`interfaz${id_paciente}`).style.color="green";
        }
        document.getElementById(`interfaz${id_paciente}`).innerHTML="$"+data.data.deuda_total;

        
    }).catch(error=>{
        console.log("raios tenemos un error");
    })


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
                    Alertify.message("Reconectando...");
                    cargar_procedimientos_de_factura(el,id_factura,config=null);
            });
        
        }else{
            Axios.get(`${url_base}/api/cargar_procedimientos_de_factura/${id_factura}`).then(data=>{

                //  el.setState({monto_total:data.data});
                // console.log(data.data);
                   el.setState({procedimientos_factura:data.data});
    
                }).catch(error=>{
                        console.log(error);
                        cargar_procedimientos_de_factura(el,id_factura,config);
                });
            

        }
}


export default {Consultar_deuda_de_paciente,clave_secreta,login_status,cargar_procedimientos_de_factura,cargar_factura,cargar_paciente,cargar_doctores,cargar_procedimientos,password,url_base,notificar_cumple,cargar_doctor};

