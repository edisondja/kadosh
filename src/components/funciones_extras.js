import Axios from 'axios';
import Alertify from 'alertifyjs';

var password= "kadosh2019";
var url_base =  "http://localhost:8000";

function cargar_doctores(el){

    Axios.get(`${url_base}/api/doctores`).then(data=>{

         el.setState({doctores:data.data});

    }).catch(error=>{

        console.log(error);

    })
}

function cargar_procedimientos(el){

    Axios.get(`${url_base}/api/cargar_procedimientos`).then(data=>{
            el.setState({procedimientos:data.data});

          //  Alertify.success(data);
    }).catch(error=>{
        Alertify.alert("Problema al cargar procedimientos");
    });

}


export default {cargar_doctores,cargar_procedimientos,password,url_base};

