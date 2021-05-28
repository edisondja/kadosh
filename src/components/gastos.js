import React from 'react';
import Axios from 'axios';
import Alertify from 'alertifyjs';
import Buscar from '../buscar.png';
import Core from './funciones_extras';
import '../css/dashboard.css';
import Suplidores from './funciones_extras';
import alertify from 'alertifyjs';

class Gasto extends React.Component{


    constructor(props){
        super(props);
        this.state={registros:[],cambio:'',suplidores:[],gastos:null,monto_gasto:0,id_suplidor:0}

    }

    eliminar_gasto(id_gasto){


        Alertify.confirm("Eliminar gasto","Estas seguro que deseas eliminar este gasto?",()=>{

            Axios.get(`${Core.url_base}/api/eliminar_gasto/${id_gasto}`).then(data=>{

                Alertify.message(data.data);
                this.cargar_gastos();
            
            }).catch(error=>{

                Alertify.warning(error);
            });

        },function(){})

    

    }

    capturar_rnc=()=>{

          let s = document.querySelector("#suplidor").value;
          alert(s);

    }


    buscar_gasto=()=>{

        let id_gasto = document.querySelector("#gasto_id").value;
        
        Axios.get(`${Core.url_base}/api/buscar_gasto/${id_gasto}`).then(data=>{

            this.setState({registros:data.data});

        }).catch(error=>{

        });


    }


    componentDidMount(){
        
        this.cargar_gastos();
        Suplidores.cargar_suplidores(this);
        this.Cargar_monto_gasto("s","s");//pasando  s y s por parametro es para que cargue los gastos del dia actual
        

    }

    cargar_gasto=(id,detalles)=>{

        Axios.get(`${Core.url_base}/api/cargar_gasto/${id}`).then(data=>{

            this.setState({gasto:data.data[0]});
            detalles();

        }).catch(error=>{

        });
    
    }

    ver_detalles_gasto(data){

        Alertify.confirm("Dettalles",`
       ID Factura: ${data.id}<br/>
       Forma de pago: ${data.tipo_de_pago}<br/>11
       Forma de pago: ${data.tipo_de_gasto}<br/>
       Comprobante Fiscal: ${data.comprobante_fiscal}<br/>
       RNC SUPLIDOR: ${data.rnc}<br/>
       ITEBIS: ${data.itebis}<br/>
       TOTAL: ${data.total}<br/>
        <hr/>
       Descripción ${data.descripcion}<br/>

        `,function(){},function(){});
        
    }


    listar_suplidores(){


        let option_suplidores="";

        function hola(){

            alert("sd");
        }

        this.state.suplidores.forEach(data => {
            
            option_suplidores+=`<option onclick="hola()" value=${data.id}>${data.nombre}</option>`;
            
        });



        return option_suplidores;
    }


    actualizando_gasto=(data)=>{

    

        Alertify.confirm("Actualizando",`<p>Tipo de gasto<p/><br/>
        <select class="form-control" id="materiales">
            <option>${data.tipo_de_gasto}</option>
            <option>Materiales Gastable</option>
            <option>Instrumentos de Odontologia</option>
            <option>Varios</option>
        <select/><br/>
        <p>Tipo de pago<p/><br/>
        <select class="form-control" id="tipo_de_pago">
            <option>${data.tipo_de_pago}<option>
            <option>Efectivo</option>
            <option>Tarjeta</option>
        <select/><br/>
        <p>Seleccione el suplidor<p/><br/>
        <select class="form-control" id="suplidor" onChange=${this.capturar_rnc}>
            <option value="${data.suplidor_id}">${data.nombre}</option>
            ${this.listar_suplidores()}
        <select/><br/>
        <p>Bruto</p>
        <input type="number" class="form-control" value="${data.total}" id="total">
        <p>Itebis</p><br/>
        <input type="number" class="form-control" value="${data.itebis}" id="itebis" plaholder="Itebis" /><br/>
        <p>RNC SUPLIDOR</p>
        <input type="text" class="form-control" value="${data.rnc_suplidor}" id="rnc" plaholder="RNC Suplidor" /><br/>
        <p>Comprobante Fiscal</p>
        <input type="text" class="form-control" value="${data.comprobante_fiscal}" id="comprobante_fiscal" plaholder="comprobante_fiscal" /><br/>
        <p>Descripción</p>
        <textarea class='form-control' id="descripcion">${data.descripcion}</textarea>`,()=>{



            var data_new = {
                id:data.id,
                tipo_de_gasto:document.querySelector('#materiales').value,
                tipo_de_pago:document.querySelector('#tipo_de_pago').value,
                suplidor_id:document.querySelector('#suplidor').value,
                itebis:document.querySelector('#itebis').value,
                total:document.querySelector('#total').value,
                descripcion:document.querySelector('#descripcion').value,
                comprobante_fiscal:document.querySelector("#comprobante_fiscal").value

            };

            this.actualizar_gasto(data_new);

        },function(){});




    }


    buscar_gasto_fecha=()=>{
    
        let fecha_inicial = document.querySelector("#fecha_inicial").value;
        let fecha_final = document.querySelector("#fecha_final").value;

        //Alertify.message(`Inicial <-----> ${fecha_inicial} Final <------> ${fecha_final}`);
        //alert(`${Core.url_base}/api/fecha_gastos`);

        this.Cargar_monto_gasto(fecha_inicial,fecha_final);

        Axios.get(`${Core.url_base}/api/fecha_gastos/${fecha_inicial}/${fecha_final}`).then(data=>{
      
            this.setState({registros:data.data});
            console.log(data.data);
        }).catch(error=>{

            Alertify.message(error);

        });

    }


    Cargar_monto_gasto(fecha_i=" ",fecha_f=" "){
     
        Axios.get(`${Core.url_base}/api/cargar_gastos_fecha/${fecha_i}/${fecha_f}`).then(data=>{
            
           // alert(data.data);
            this.setState({monto_gasto:data.data});
            //alert(data.data);

        }).catch(error=>{

            alertify.message("error cargando monto de gastos");

        });


    }

    actualizar_gasto(gasto){
        
        Axios.post(`${Core.url_base}/api/actualizar_gasto`,gasto).then(data=>{

            Alertify.message(data.data);
            console.log(data.data);
            this.cargar_gastos();
            
        
        }).catch(error=>{
            Alertify.message(error);

        });

    }

    buscar_suplidor(name){


    }


    cargar_gastos(){

        Axios.get(`${Core.url_base}/api/cargar_gastos`).then(data=>{
            
            this.setState({registros:data.data});
            //console.log(data.data);

        }).catch(error=>{
            console.log(error);
        })

    }

    
    ver_suplidor=()=>{


        alert("sss");
    }
       

    Imprimir(){

        var ficha = document.getElementById("reportes");
        var ventimp = window.open(' ', 'popimpr');
        ventimp.document.write(ficha.innerHTML);
        ventimp.document.close();
        ventimp.print();
        ventimp.close();

    }


    agregar_gastos=()=>{


       

        Alertify.confirm("Registra el gasto",
        `
        <p>Tipo de gasto<p/><br/>
        <select class="form-control" id="materiales">
            <option>Materiales Gastable</option>
            <option>Instrumentos de Odontologia</option>
            <option>Varios</option>
        <select/><br/>
        <p>Tipo de pago<p/><br/>
        <select class="form-control" id="tipo_de_pago">
            <option>Efectivo</option>
            <option>Tarjeta</option>
        <select/><br/>
        <p>Seleccione el suplidor<p/><br/>
        <select class="form-control" id="suplidor">
            ${this.listar_suplidores()}
        <select/><br/>
        <p>Bruto</p>
        <input type="number" class="form-control" id="total" plaholder="Bruto" /><br/>
        <p>Itebis</p>
        <input type="number" class="form-control" id="itebis" plaholder="Itebis" /><br/>
        <p>RNC</p>
        <input type="text" class="form-control" id="rnc" plaholder="RNC Suplidor" /><br/>
        <p>Comprobante Fiscal</p>
        <input type="text" class="form-control" id="comprobante_fiscal" plaholder="Comprobante Fiscal" /><br/>
        <p>Descripción</p>
        <textarea class='form-control' id="descripcion"></textarea>  

        
        `,
        ()=>{
                let gastos = {
                    tipo_de_gasto:document.querySelector('#materiales').value,
                    tipo_de_pago:document.querySelector('#tipo_de_pago').value,
                    suplidor_id:document.querySelector('#suplidor').value,
                    itebis:document.querySelector('#itebis').value,
                    total:document.querySelector('#total').value,
                    descripcion:document.querySelector('#descripcion').value,
                    comprobante_fiscal:document.querySelector("#comprobante_fiscal").value
                };

               // console.log("OBJECTO "+JSON.stringify(gastos));
                Axios.post(`${Core.url_base}/api/registrar_gastos`,gastos).then(data=>{
                            
                    console.log(data.data);
                    this.cargar_gastos();


                }).catch(error=>{

                    console.log(error);

                });



        },function(){});


    }

    render(){

        return(<div><hr/>
        <button className='btn btn-primary' onClick={(e)=>this.agregar_gastos()}>Registrar Gasto</button>
        &nbsp;<button className="btn btn-success" onClick={this.Imprimir}>Imprimir</button>

        <hr/>
            <table>
                <tr className="table" border="1">
                    <td><strong>Fecha Inicial</strong></td>
                    <td><input type="date"  id="fecha_inicial" className="form-control"/></td>
                    <td><strong>Fecha Final</strong></td>
                    <td><input type="date"  id="fecha_final" className="form-control"/></td>
                    <td><button className="btn btn-primary" onClick={this.buscar_gasto_fecha}>Buscar</button></td>
                    <td><h5>Total en gastos:&nbsp;{new Intl.NumberFormat().format(this.state.monto_gasto)}</h5></td>
                </tr>
            </table><hr/>
        <input type='text' id="gasto_id" className='form-control col-md-2' onChange={this.buscar_gasto} placeholder='ID de factura'/>
        <hr/>
        <div className="interfaz_cliente" id="reportes">
        <table className="table" >
        <tr>
            <th>Factura</th>
            <th>Suplidor</th>
            <th>Forma de pago</th>
            <th>Tipo de gasto</th>
            <th>Comprobante Fiscal</th>
            <th>Itebis</th>
            <th>Bruto</th>
            <th>Total</th>
            <th>Fecha de pago</th>
            <th>Ver</th>
            <th>Actualizar</th>
            <th>Eliminar</th>
         </tr>
            {this.state.registros.map(data=>(

            <tr>
                <td>{data.id}</td>
                <td>{data.nombre}</td>
                <td>{data.tipo_de_pago}</td>
                <td>{data.tipo_de_gasto}</td>
                <td>{data.comprobante_fiscal}</td>
                <td>{data.itebis}</td>
                <td>{data.total}</td>
                <td>{new Intl.NumberFormat().format(data.total + data.itebis)}</td>
                <td>{data.fecha_registro}</td>
                <td><img src={Buscar}  style={{cursor:'pointer'}} width='40' onClick={(e)=>this.ver_detalles_gasto(data)}/></td>
                <td><button className="btn btn-success" onClick={(e)=>this.actualizando_gasto(data)}>Actualizar</button></td>
                <td><button className="btn btn-primary" onClick={(e)=>this.eliminar_gasto(data.id)}>Eliminar</button></td>
            </tr>
            ))


           }

           <tr> 
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td><strong style={{fontSize:'22px'}}>TOTAL</strong></td>
                <td><strong style={{fontSize:'22px'}}> {new Intl.NumberFormat().format(this.state.monto_gasto)}</strong></td>
           </tr>
        </table>
        </div>
        </div>);


    }




}

export default Gasto;



