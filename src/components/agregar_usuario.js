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



        }


        cargar_usuarios(){

            Axios.get(`${Core.url_base}/api/cargar_usuarios`).then(data=>{

                this.setState({usuarios:data.data});
                console.log(data.data);

            }).catch(error=>{

                alertify.message("Error cargando usuarios "+error);

            });


        }


        actualizar_usuario=(id_usuario)=>{
            
            let usuario;

            Axios.get(`${Core.url_base}/api/cargar_usuario/${id_usuario}`).then(data=>{

                    console.log(data.data);
                    usuario = data.data;

                    let usuario_interface =`
                    <div id='usuarios'>
                        <table class="table">
                           <tr>
                                <td>Usuario</td>
                                <td><input type='text' class='form-control' id="usuario_a" value="${usuario.nombre}"></td>
                           </tr>
                           <tr>
                                 <td>Nombre</td>
                                 <td><input type='text' class='form-control' id="nombre_a" value="${usuario.nombre}"></td>
                            </tr>
                            <tr>
                                <td>Apellido</td>
                                <td><input type='text' class='form-control' id="apellido_a" value="${usuario.apellido}"></td>
                            </tr>
                            <tr>
                                <td>Roll</td>
                                <td>
                                    <select class='form-control' id='roll_a'>
                                            <option value='Administrador'>Administrador</option>
                                            <option value='Contable'>Contable</option>
                                            <option value='Secretaria'>Secretaria</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td>Clave</td>
                                <td><input type='text' class='form-control' id="clave_a" value="${usuario.clave}"></td>
                            </tr>
                        </table>
                    <div>
                    `;

                         
                    
                
                    Alertify.confirm('Actualizar usuario',usuario_interface,function(){


                            // let id_usuario =  e.target.id.substr(5,10);
                                 var usuario ={
                                     id_usuario:id_usuario,
                                     usuario:document.getElementById("usuario_a").value,
                                     clave:document.getElementById("clave_a").value,
                                     nombre:document.getElementById("nombre_a").value,
                                     apellido:document.getElementById("apellido_a").value,
                                     roll:document.getElementById("roll_a").value
                                 };
                                     
                                 Axios.post(`${Core.url_base}/api/actualizar_usuario`,usuario).then((data)=>{
                                     
                                     console.log(data);
                                     Alertify.message("Usuario actualizado con exito");
                                     //this.cargar_usuarios();
 
                                 }).catch(error=>{
 
                                     Alertify.message("Error al registrar usuario");
                                 
                                 });
 


                    },function(){});
                    
                    
                   
                    }).catch(error=>{   

                            console.log(error);

                             Alertify.message("No se pudo cargar el usuario");

                    });

                
            //Alertify.confirm()


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

               return (
                    <div className="mac-container col-md-10">
                        <div className="mac-box">
                        <h2 className="mac-title">Registrar Usuario</h2>
                        <p className="text-muted">Registro de usuarios y asignación de roles</p>

                        <div className="mac-form-group">
                            <input
                            type="text"
                            id="usuario"
                            className="mac-input"
                            placeholder="Usuario"
                            />
                        </div><br/>

                        <div className="mac-form-group">
                            <input
                            type="password"
                            id="clave"
                            className="mac-input"
                            placeholder="Clave"
                            />
                        </div><br/>

                        <div className="mac-form-group">
                            <input
                            type="text"
                            id="nombre"
                            className="mac-input"
                            placeholder="Nombre"
                            />
                        </div><br/>

                        <div className="mac-form-group">
                            <input
                            type="text"
                            id="apellido"
                            className="mac-input"
                            placeholder="Apellido"
                            />
                        </div><br/>

                        <div className="mac-form-group">
                            <label>Rol del Usuario</label>
                            <select id="roll_usuario" className="mac-input">
                            <option>Administrador</option>
                            <option>Secretaria</option>
                            <option>Contable</option>
                            </select>
                        </div><br/>

                        <div className="text-end mb-4" style={{textAlign:'center'}}>
                            <button
                            className="mac-btn mac-btn-dark"
                            onClick={this.agregar_usuario}
                            >
                            ➕ Agregar Usuario
                            </button>
                        </div><br/>

                        <hr />
                        <strong className="d-block mb-3">Usuarios registrados</strong>

                        <div className="mac-form-group">
                            <input
                            type="search"
                            className="mac-input"
                            onChange={(e) => this.buscar_usuario(e.target.value)}
                            placeholder="🔍 Buscar usuario"
                            />
                        </div>

                        <div className="table-responsive">
                            <table className="table table-striped table-bordered">
                            <thead className="table-light">
                                <tr>
                                <th>Usuario</th>
                                <th>Nombre</th>
                                <th>Apellido</th>
                                <th>Rol</th>
                                <th>Actualizar</th>
                                <th>Eliminar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.usuarios.map((data) => (
                                <tr key={data.id}>
                                    <td>{data.usuario}</td>
                                    <td>{data.nombre}</td>
                                    <td>{data.apellido}</td>
                                    <td>{data.roll}</td>
                                    <td>
                                    <button
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={() => this.actualizar_usuario(data.id)}
                                    >
                                        ✏️ Actualizar
                                    </button>
                                    </td>
                                    <td>
                                    <button
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={() => this.eliminar_usuario(data.id)}
                                    >
                                        🗑️ Eliminar
                                    </button>
                                    </td>
                                </tr>
                                ))}
                            </tbody>
                            </table>
                        </div>
                        </div>
                    </div>
                    );

                   





         }
    

}


export default Usuario;