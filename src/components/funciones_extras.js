import Axios from 'axios';
import Alertify from 'alertifyjs';
import alertify from 'alertifyjs';
import Cargar_generos from './funciones_extras.js';


var password= "kadosh2019";
var url_base =  "https://service.clinickadosh.com";
//var url_base =  "http://127.0.0.1:8000";
//var url_base = "https://dc05-152-167-237-144.ngrok-free.app"; 
var login_status = false;
var clave_secreta ="kadoshor2020";


function cargar_doctores(el){

    
    Axios.get(`${url_base}/api/doctores`).then(data=>{

         el.setState({doctores:data.data});


    }).catch(error=>{

        console.log(error);
        cargar_doctores(el);

    });
}


function eliminar_nota(id_nota){


    Axios.post(`${url_base}/api/eliminar_nota`,{nota_id:id_nota}).then(data=>{

        console.log(data);
        alertify.message('Nota eliminada con exito!');	


    }).catch(error=>{

        alertify.message('No se pudo eliminar la nota');

    });

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
                    console.log(data.data);
                    el.setState({paciente:data.data});
        }).catch(error=>{
            Alertify.error("No se pudo cargar la informacion del paciente");
            Alertify.message("Conectando...");
           // cargar_paciente(el,id_paciente);
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



function cargar_suplidores(contexto){

    Axios.get(url_base+"/api/cargar_suplidores").then(data=>{

        contexto.setState({suplidores:data.data});

    }).catch(error=>{

            Alertify.message(error);
    });

}

function cargar_generos_paciente(contexto){
    
    
    Axios.get(url_base+"/api/cargar_generos_pacientes").then(data=>{
        contexto.setState({generos:"riiooo"});
        console.log(data.data);
       
    }).catch(error=>{

            Alertify.message(error);
    });



}





export default {eliminar_nota,cargar_generos_paciente,cargar_suplidores,Consultar_deuda_de_paciente,clave_secreta,login_status,cargar_procedimientos_de_factura,cargar_factura,cargar_paciente,cargar_doctores,cargar_procedimientos,password,url_base,notificar_cumple,cargar_doctor};

