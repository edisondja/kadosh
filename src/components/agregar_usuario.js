import React from 'react';
import Axios from 'axios';
import Alertify from  'alertifyjs';
import Core from './funciones_extras';
import alertify from 'alertifyjs';


class Usuario extends React.Component{




    constructor(props){
            super(props)

                this.state = {usuarios:[{
                    id:0,
                    nombre:"test",
                    apellido:"De Jesus",
                    usuario:"Edison",
                    roll:"Desarrollador",
                    clave:""
                }]}
            }
    

        componentDidMount(){

            this.cargar_usuarios();

        }

        agregar_usuario(){


        

            var usuario ={
                usuario:document.getElementById("usuario").value,
                clave:document.getElementById("clave").value,
                nombre:document.getElementById("nombre").value,
                apellido:document.getElementById("apellido").value,
                roll:document.getElementById("roll_usuario").value
            };


            //  console.log(usuario);

        
            Axios.post(`${Core.url_base}/api/agregar_usuario`,usuario).then(data=>{

                Alertify.message("Usuario guardado con exito");
                this.cargar_usuarios();

            }).catch(error=>{

                Alertify.message("Error al registrar usuario");
            
            });



        }

        buscar_usuario(e){


            Axios.get(`${Core.url_base}/api/buscar_usuario/${e}`).then(data=>{

                this.setState({usuarios:data.data});

            }).catch(error=>{

                alertify.message("error buscando el usuario");
            });



            
        }

        actualizar_usuario(id_usuario){


            var usuario ={
                id_usuario:id_usuario,
                usuario:document.getElementById("usuario").value,
                clave:document.getElementById("clave").value,
                nombre:document.getElementById("nombre").value,
                apellido:document.getElementById("apellido").value,
                roll:document.getElementById("roll_usuario").value
            };
                
            Axios.post(`${Core.url_base}/api/actualizar_usuario`,usuario).then(data=>{

                Alertify.message("Usuario guardado con exito");
                this.cargar_usuarios();

            }).catch(error=>{

                Alertify.message("Error al registrar usuario");
            
            });


        }


        cargar_usuarios(){

            Axios.get(`${Core.url_base}/api/cargar_usuarios`).then(data=>{

                this.setState({usuarios:data.data});
                console.log(data.data);

            }).catch(error=>{

                alertify.message("Error cargando usuarios "+error);

            });


        }



        eliminar_usuario(id){


            Alertify.confirm("Eliminar usuario","Estas seguro que deseas eliminar este usuario",function(e)
            {

                //Alertify.message("usuario eliminado con exito "+id);
                
                Axios.post(`${Core.url_base}/api/eliminar_usuario`,{id_usuario:id}).then(data=>{

                    Alertify.message("El usuario fue eliminado con exito");
                    this.cargar_usuarios();
                
                }).catch(error=>{
    
                    Alertify.message("No se pudo eliminar este usuario");
    
    
                });
    
            },function(){


            });

         

        }



        render(){

                return(
                   <div className="col-md-8"><br/><hr/><hr/><br/><h4>Registrar Usuario</h4>
                   <p>Registro de usuarios y roles</p>
                    <input type="text" id="usuario" className="form-control" placeholder="Usuario"/><br/>
                    <input type="password" id="clave"className="form-control" placeholder="Clave"/><br/>
                    <input type="text" id="nombre" className="form-control" placeholder="Nombre"/><br/>
                    <input type="text" id="apellido" className="form-control" placeholder="Apellido"/><br/>
                    <p>Seleccione el roll de usuario</p>
                    <select id="roll_usuario" className="form-control">
                        <option>Administrador</option>
                        <option>Secretaria</option>
                        <option>Contable</option>
                    </select><br/>
                    <button className="btn btn-primary" onClick={this.agregar_usuario}>+ Agregar usuario</button><hr/>
                    <strong>Usuarios registrados</strong><hr/>
                    <input type="search" className="form-control" onChange={(e)=>this.buscar_usuario(e.target.value)} placeholder="Buscar usuario" /><br/>
                    <table className="table">
                        <tr>
                            <td>Usuario</td>
                            <td>Nombre</td>
                            <td>Apellido</td>
                            <td>Roll</td>
                            <td>actualizar</td>
                            <td>Eliminar</td>
                        </tr>
                        {this.state.usuarios.map(data=>(

                            <tr>
                                <td>{data.usuario}</td>
                                <td>{data.nombre}</td>
                                <td>{data.apellido}</td>
                                <td>{data.roll}</td>
                                <td><button className="btn btn-primary">Actualizar</button></td>
                                <td><button className="btn btn-warning" onClick={()=>this.eliminar_usuario(data.id)}>Eliminar</button></td>
                            </tr>

                        ))}



                     
                    </table>
                 </div>);

                   





         }
    

}


export default Usuario;