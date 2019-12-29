import Axios from 'axios';
import Alertify from 'alertifyjs';

var password= "kadosh2019";

function cargar_doctores(el){

    Axios.get("http://localhost:8000/api/doctores").then(data=>{

         el.setState({doctores:data.data});

    }).catch(error=>{

        console.log(error);

    })
}

function cargar_procedimientos(el){

    Axios.get("http://localhost:8000/api/cargar_procedimientos").then(data=>{
            el.setState({procedimientos:data.data});

          //  Alertify.success(data);
    }).catch(error=>{
        Alertify.alert("Problema al cargar procedimientos");
    });

}


export default {cargar_doctores,cargar_procedimientos,password};

