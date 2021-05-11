import React from 'react';
import Axios from 'axios';
import Alertify from 'alertifyjs';
import Core from './funciones_extras';
import '../css/dashboard.css';


class Suplidores extends React.Component{


    constructor(props){
        super(props);
        this.state={suplidores:[{nombre:'El mejor'}],suplidor:''}
        
    }

    componentDidMount(){

        Core.cargar_suplidores(this);

    }

    
    buscar_suplidor=(buscar)=>{

        Axios.get(`${Core.url_base}/api/buscar_suplidor/${buscar}`).then(data=>{
                this.setState({suplidores:data.data});
        }).catch(error=>{
                Alertify.warning(error);
        });


    }

    registrar_suplidor=()=>{
        
        Alertify.confirm("Registrar Suplidor",`<hr/><b>Registrar Suplidor ahora</b><hr/>
        <input type="text" class="form-control" id="nombre_suplidor" placeholder="Nombre de suplidor"/><br/>
        <input type="text" class="form-control" id="rnc_suplidor" placeholder="RNC suplidor"/><br/>
        <textarea class="form-control" id="descripcion" placeholder="Descripcion del suplidor"></textarea>`,()=>{

            let registrar_suplidor = this.capturar_data_form();
            Axios.post(`${Core.url_base}/api/registrar_suplidor`,registrar_suplidor).then((data)=>{
                console.log(data.data);
                Alertify.message(data.data);
                this.cargar_suplidores();
            }).catch(error=>{
                Alertify.message(error);
            })

        },()=>{});

    }

    capturar_data_form(suplidor_id=null){
        let data_form;

        if(suplidor_id!==null){
            
            data_form = {
                id:suplidor_id.id,
                nombre:document.querySelector("#nombre_suplidor").value,
                descripcion:document.querySelector("#descripcion").value,
                rnc_suplidor:document.querySelector("#rnc_suplidor").value

            }

        }else{
            data_form = {
                nombre:document.querySelector("#nombre_suplidor").value,
                descripcion:document.querySelector("#descripcion").value,
                rnc_suplidor:document.querySelector("#rnc_suplidor").value

            }
        }

        return data_form;

    }

    actualizar_suplidor(data){
        
        Alertify.confirm("Registrar Suplidor",`
        <hr/><b>Registrar Suplidor ahora</b><hr/>
        <input type="text" class="form-control"  value="${data.nombre}" id="nombre_suplidor" placeholder="Nombre de suplidor"/><br/>
        <input type="text" class="form-control"  value="${data.rnc_suplidor}" id="rnc_suplidor" placeholder="RNC suplidor"/><br/>
        <textarea class="form-control" id="descripcion" value="${data.descripcion}" placeholder="Descripcion del suplidor">${data.descripcion}</textarea>
        `,
        ()=>{
            
            let actualizar_suplidor = this.capturar_data_form(data.id);

            Axios.post(`${Core.url_base}/api/actualizar_suplidor`,actualizar_suplidor).then((data)=>{
                    Alertify.message(data.data);
                    this.cargar_suplidores();
            }).catch(error=>{

            })

            
        },()=>{});


    }

    eliminar_suplidor(id_suplidor){

        Alertify.confirm("Deseas eliminar este suplidor?","",()=>{

                Axios.get(Core.url_base+`/api/eliminar_suplidor/${id_suplidor}`).then(data=>{
                        Alertify.message(data.data);
                }).catch(err=>{

                });

        },()=>{});

    }


    render(){

        return(
        <div>
            <hr/><input type='text' className='form-control' placeholder='Buscar Suplidor'  /><hr/><button onClick={this.registrar_suplidor} className="btn btn-primary">Agregar Suplidor</button>
            <hr/>
            <table className="table">
                <tr>
                    <td>Nombre suplidor</td>
                    <td>RNC suplidor</td>
                    <td>Descripcion</td>
                    <td>Actualizar</td>
                    <td>Eliminar</td>
                </tr>
                {
                    this.state.suplidores.map(data=>(
                        <tr>
                            <td>{data.nombre}</td>
                            <td>{data.rnc_suplidor}</td>
                            <td>{data.descripcion}</td>
                            <td><button className="btn btn-success" onClick={(e)=>this.actualizar_suplidor(data)}>Actualizar</button></td>
                            <td><button className="btn btn-primary" onClick={(e)=>this.eliminar_suplidor(data.id)} >Eliminar</button></td>
                        </tr>
                    ))


                }
            </table>
        </div>)


    }



}

export default Suplidores;