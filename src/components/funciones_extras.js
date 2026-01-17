import Axios from 'axios';
import Alertify from 'alertifyjs';
import alertify from 'alertifyjs';
import Cargar_generos from './funciones_extras.js';
import Config from './config_site.json';
import LogoApp from '../noe_logo.png';

//var password= "kadosh2019";
var password = Config.passowrd_admin;
//var url_base =  "https://service.clinickadosh.com";
//var url_base =  "http://clinica1.miapp.local:8000";
var url_base =  Config.api_url;
var lenguaje =  Config.app_lang.es;


//var url_base = "https://dc05-152-167-237-144.ngrok-free.app"; 
var login_status = false;
//var clave_secreta ="kadoshor2020";
var clave_secreta = Config.passowrd_admin;


function cargar_doctores(el){
    // Evitar múltiples llamadas simultáneas
    if (el._cargandoDoctores) {
        console.log("Ya se están cargando doctores, saltando...");
        return;
    }

    el._cargandoDoctores = true;

    console.log(`Cargando doctores desde: ${url_base}/api/doctores`);

    Axios.get(`${url_base}/api/doctores`).then(data=>{
        const doctores = Array.isArray(data.data) ? data.data : [];
        console.log(`Doctores cargados exitosamente: ${doctores.length}`);
        
        if (el && typeof el.setState === 'function') {
            el.setState({doctores: doctores});
        } else if (el && typeof el.setDoctors === 'function') {
            el.setDoctors(doctores);
        }
        
        el._cargandoDoctores = false;
    }).catch(error=>{
        console.error("Error al cargar doctores:", error);
        console.error("Detalles del error:", error.response?.data || error.message);
        
        if (el && typeof el.setState === 'function') {
            el.setState({doctores:[]});
        } else if (el && typeof el.setDoctors === 'function') {
            el.setDoctors([]);
        }
        
        el._cargandoDoctores = false;
        // NO hacer llamada recursiva para evitar loop infinito
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



function cargar_procedimientos(el, config = null) {
    return Axios.get(`${url_base}/api/cargar_procedimientos`)
        .then(response => {

            if (config === 'solo_data') {
                return response.data;
            }

            el.setState({ procedimientos: response.data });
            return response.data;

        })
        .catch(error => {
            Alertify.alert("Problema al cargar procedimientos");
            Alertify.message("Reconectando...");
            throw error;
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





function obtener_odontogramas(id_paciente = null) {
    if (id_paciente) {
        return Axios.get(`${url_base}/api/listar_odontogramas_paciente/${id_paciente}`)
            .then(response => response.data)
            .catch(error => {
                Alertify.error("No se pudieron cargar los odontogramas");
                throw error;
            });
    } else {
        return Axios.get(`${url_base}/api/listar_odontogramas`)
            .then(response => response.data)
            .catch(error => {
                Alertify.error("No se pudieron cargar los odontogramas");
                throw error;
            });
    }
}

function obtener_odontograma(id) {
    return Axios.get(`${url_base}/api/ver_odontograma/${id}`)
        .then(response => response.data)
        .catch(error => {
            Alertify.error("No se pudo cargar el odontograma");
            throw error;
        });
}

// Funciones para Pagos Mensuales
function obtener_alertas_pagos() {
    return Axios.get(`${url_base}/api/alertas_pagos`)
        .then(response => response.data)
        .catch(error => {
            console.error("Error al obtener alertas de pagos:", error);
            return [];
        });
}

function obtener_proximo_pago_usuario(usuario_id) {
    return Axios.get(`${url_base}/api/proximo_pago_usuario/${usuario_id}`)
        .then(response => response.data)
        .catch(error => {
            // 404 es esperado cuando no hay pagos pendientes, no es un error real
            if (error.response && error.response.status === 404) {
                return null;
            }
            console.error("Error al obtener próximo pago:", error);
            return null;
        });
}

function crear_pago_mensual(datos) {
    return Axios.post(`${url_base}/api/crear_pago_mensual`, datos)
        .then(response => response.data)
        .catch(error => {
            Alertify.error("Error al crear el pago mensual");
            throw error;
        });
}

function marcar_pago_pagado(id) {
    return Axios.get(`${url_base}/api/marcar_pago_pagado/${id}`)
        .then(response => response.data)
        .catch(error => {
            Alertify.error("Error al marcar el pago como pagado");
            throw error;
        });
}

// Funciones para Auditoría
function obtener_logs_usuario(usuario_id) {
    return Axios.get(`${url_base}/api/logs_usuario/${usuario_id}`)
        .then(response => response.data)
        .catch(error => {
            console.error("Error al obtener logs del usuario:", error);
            return [];
        });
}

function obtener_todos_logs(filtros = {}) {
    const params = new URLSearchParams(filtros);
    return Axios.get(`${url_base}/api/logs_todos?${params.toString()}`)
        .then(response => response.data.data || response.data)
        .catch(error => {
            console.error("Error al obtener todos los logs:", error);
            return [];
        });
}

function obtener_estadisticas_logs(usuario_id = null) {
    const url = usuario_id 
        ? `${url_base}/api/estadisticas_logs/${usuario_id}`
        : `${url_base}/api/estadisticas_logs`;
    return Axios.get(url)
        .then(response => response.data)
        .catch(error => {
            console.error("Error al obtener estadísticas:", error);
            return [];
        });
}

function crear_log(datos) {
    return Axios.post(`${url_base}/api/crear_log`, datos)
        .then(response => response.data)
        .catch(error => {
            console.error("Error al crear log:", error);
            throw error;
        });
}

// Funciones para Nómina
function calcular_nomina_doctores(fecha_i, fecha_f) {
    return Axios.get(`${url_base}/api/calcular_nomina_doctores/${fecha_i}/${fecha_f}`)
        .then(response => response.data)
        .catch(error => {
            Alertify.error("Error al calcular la nómina");
            throw error;
        });
}

function registrar_pago_nomina(datos) {
    return Axios.post(`${url_base}/api/registrar_pago_nomina`, datos)
        .then(response => response.data)
        .catch(error => {
            Alertify.error("Error al registrar el pago de nómina");
            throw error;
        });
}

function listar_pagos_nomina(filtros = {}) {
    return Axios.get(`${url_base}/api/listar_pagos_nomina`, { params: filtros })
        .then(response => response.data)
        .catch(error => {
            console.error("Error al listar pagos de nómina:", error);
            return [];
        });
}

function marcar_pago_nomina_pagado(id) {
    return Axios.put(`${url_base}/api/marcar_pago_nomina_pagado/${id}`)
        .then(response => response.data)
        .catch(error => {
            Alertify.error("Error al marcar el pago como pagado");
            throw error;
        });
}

function obtener_detalle_comisiones(doctor_id, fecha_i, fecha_f) {
    return Axios.get(`${url_base}/api/detalle_comisiones/${doctor_id}/${fecha_i}/${fecha_f}`)
        .then(response => response.data)
        .catch(error => {
            console.error("Error al obtener detalle de comisiones:", error);
            return [];
        });
}

// Funciones para Punto de Venta
function listar_productos() {
    return Axios.get(`${url_base}/api/listar_productos`)
        .then(response => response.data)
        .catch(error => {
            Alertify.error("Error al listar productos");
            return [];
        });
}

function guardar_producto(datos) {
    return Axios.post(`${url_base}/api/guardar_producto`, datos)
        .then(response => response.data)
        .catch(error => {
            Alertify.error("Error al guardar producto");
            throw error;
        });
}

function realizar_venta(datos) {
    return Axios.post(`${url_base}/api/realizar_venta`, datos)
        .then(response => response.data)
        .catch(error => {
            Alertify.error("Error al realizar la venta");
            throw error;
        });
}

function productos_stock_bajo() {
    return Axios.get(`${url_base}/api/productos_stock_bajo`)
        .then(response => response.data)
        .catch(error => {
            console.error("Error al obtener productos con stock bajo:", error);
            return [];
        });
}

// Funciones para Salarios de Doctores
function listar_salarios_doctores() {
    return Axios.get(`${url_base}/api/listar_salarios_doctores`)
        .then(response => response.data)
        .catch(error => {
            console.error("Error al listar salarios:", error);
            return [];
        });
}

function obtener_salario_doctor(doctor_id) {
    return Axios.get(`${url_base}/api/salario_doctor/${doctor_id}`)
        .then(response => response.data)
        .catch(error => {
            console.error("Error al obtener salario:", error);
            return null;
        });
}

function guardar_salario_doctor(datos) {
    return Axios.post(`${url_base}/api/guardar_salario_doctor`, datos)
        .then(response => response.data)
        .catch(error => {
            Alertify.error("Error al guardar salario");
            throw error;
        });
}

function doctores_con_salarios() {
    return Axios.get(`${url_base}/api/doctores_con_salarios`)
        .then(response => response.data)
        .catch(error => {
            console.error("Error al listar doctores:", error);
            return [];
        });
}

function eliminar_salario_doctor(id) {
    return Axios.delete(`${url_base}/api/eliminar_salario_doctor/${id}`)
        .then(response => response.data)
        .catch(error => {
            Alertify.error("Error al eliminar salario");
            throw error;
        });
}

// Funciones para Recetas Médicas
function listar_recetas_paciente(id_paciente) {
    return Axios.get(`${url_base}/api/listar_recetas_paciente/${id_paciente}`)
        .then(response => response.data)
        .catch(error => {
            console.error("Error al listar recetas:", error);
            return [];
        });
}

function obtener_receta(id) {
    return Axios.get(`${url_base}/api/obtener_receta/${id}`)
        .then(response => response.data)
        .catch(error => {
            Alertify.error("Error al obtener receta");
            throw error;
        });
}

function crear_receta(datos) {
    return Axios.post(`${url_base}/api/crear_receta`, datos)
        .then(response => {
            if (response.data.success) {
                return response.data;
            } else {
                throw new Error(response.data.message || 'Error al crear receta');
            }
        })
        .catch(error => {
            const errorMessage = error.response?.data?.message || 
                                error.response?.data?.error || 
                                error.message || 
                                'Error al crear receta';
            
            if (error.response?.data?.errors) {
                // Mostrar errores de validación
                const validationErrors = Object.values(error.response.data.errors).flat();
                Alertify.error(validationErrors.join(', '));
            } else {
                Alertify.error(errorMessage);
            }
            
            console.error('Error al crear receta:', error.response?.data || error);
            throw error;
        });
}

function actualizar_receta(id, datos) {
    return Axios.put(`${url_base}/api/actualizar_receta/${id}`, datos)
        .then(response => response.data)
        .catch(error => {
            Alertify.error("Error al actualizar receta");
            throw error;
        });
}

function eliminar_receta(id) {
    return Axios.delete(`${url_base}/api/eliminar_receta/${id}`)
        .then(response => response.data)
        .catch(error => {
            Alertify.error("Error al eliminar receta");
            throw error;
        });
}

function imprimir_receta(id) {
    return `${url_base}/api/imprimir_receta/${id}`;
}

function ver_receta_pdf(id) {
    return `${url_base}/api/ver_receta_pdf/${id}`;
}

function enviar_receta_email(id, email) {
    return Axios.post(`${url_base}/api/enviar_receta_email/${id}`, { email: email })
        .then(response => response.data)
        .catch(error => {
            Alertify.error("Error al enviar receta");
            throw error;
        });
}

// Funciones para Especialidades
function listar_especialidades() {
    return Axios.get(`${url_base}/api/listar_especialidades`)
        .then(response => response.data)
        .catch(error => {
            Alertify.error("Error al cargar especialidades");
            throw error;
        });
}

function listar_todas_especialidades() {
    return Axios.get(`${url_base}/api/listar_todas_especialidades`)
        .then(response => response.data)
        .catch(error => {
            Alertify.error("Error al cargar especialidades");
            throw error;
        });
}

function obtener_especialidad(id) {
    return Axios.get(`${url_base}/api/obtener_especialidad/${id}`)
        .then(response => response.data)
        .catch(error => {
            Alertify.error("Error al obtener especialidad");
            throw error;
        });
}

function crear_especialidad(datos) {
    return Axios.post(`${url_base}/api/crear_especialidad`, datos)
        .then(response => {
            if (response.data.success) {
                return response.data;
            } else {
                throw new Error(response.data.message || 'Error al crear especialidad');
            }
        })
        .catch(error => {
            const errorMessage = error.response?.data?.message || 
                                error.response?.data?.error || 
                                error.message || 
                                'Error al crear especialidad';
            
            if (error.response?.data?.errors) {
                const validationErrors = Object.values(error.response.data.errors).flat();
                Alertify.error(validationErrors.join(', '));
            } else {
                Alertify.error(errorMessage);
            }
            throw error;
        });
}

function actualizar_especialidad(id, datos) {
    return Axios.put(`${url_base}/api/actualizar_especialidad/${id}`, datos)
        .then(response => {
            if (response.data.success) {
                return response.data;
            } else {
                throw new Error(response.data.message || 'Error al actualizar especialidad');
            }
        })
        .catch(error => {
            const errorMessage = error.response?.data?.message || 
                                error.response?.data?.error || 
                                error.message || 
                                'Error al actualizar especialidad';
            
            if (error.response?.data?.errors) {
                const validationErrors = Object.values(error.response.data.errors).flat();
                Alertify.error(validationErrors.join(', '));
            } else {
                Alertify.error(errorMessage);
            }
            throw error;
        });
}

function eliminar_especialidad(id) {
    return Axios.delete(`${url_base}/api/eliminar_especialidad/${id}`)
        .then(response => response.data)
        .catch(error => {
            Alertify.error("Error al eliminar especialidad");
            throw error;
        });
}

function activar_especialidad(id) {
    return Axios.post(`${url_base}/api/activar_especialidad/${id}`)
        .then(response => response.data)
        .catch(error => {
            Alertify.error("Error al activar especialidad");
            throw error;
        });
}

function eliminar_odontograma(id) {
    return Axios.get(`${url_base}/api/eliminar_odontograma/${id}`)
        .then(response => response.data)
        .catch(error => {
            Alertify.error("No se pudo eliminar el odontograma");
            throw error;
        });
}

// Funciones para Exportar/Importar Pacientes
function exportar_pacientes() {
    return Axios.get(`${url_base}/api/exportar_pacientes`)
        .then(response => {
            if (response.data.success) {
                return response.data;
            } else {
                throw new Error(response.data.message || 'Error al exportar pacientes');
            }
        })
        .catch(error => {
            Alertify.error("Error al exportar pacientes");
            throw error;
        });
}

function importar_pacientes(datos) {
    return Axios.post(`${url_base}/api/importar_pacientes`, { datos })
        .then(response => {
            if (response.data.success) {
                return response.data;
            } else {
                throw new Error(response.data.message || 'Error al importar pacientes');
            }
        })
        .catch(error => {
            const errorMessage = error.response?.data?.message || 
                                error.response?.data?.error || 
                                error.message || 
                                'Error al importar pacientes';
            Alertify.error(errorMessage);
            throw error;
        });
}

// Funciones para Exportar/Importar Usuarios
function exportar_usuarios() {
    return Axios.get(`${url_base}/api/exportar_usuarios`)
        .then(response => {
            if (response.data.success) {
                return response.data;
            } else {
                throw new Error(response.data.message || 'Error al exportar usuarios');
            }
        })
        .catch(error => {
            Alertify.error("Error al exportar usuarios");
            throw error;
        });
}

function importar_usuarios(datos) {
    return Axios.post(`${url_base}/api/importar_usuarios`, { datos })
        .then(response => {
            if (response.data.success) {
                return response.data;
            } else {
                throw new Error(response.data.message || 'Error al importar usuarios');
            }
        })
        .catch(error => {
            const errorMessage = error.response?.data?.message || 
                                error.response?.data?.error || 
                                error.message || 
                                'Error al importar usuarios';
            Alertify.error(errorMessage);
            throw error;
        });
}

export default {eliminar_nota,
                cargar_generos_paciente,
                cargar_suplidores,
                Consultar_deuda_de_paciente,
                clave_secreta,login_status,
                cargar_procedimientos_de_factura,
                cargar_factura,
                cargar_paciente,
                cargar_doctores,cargar_procedimientos,
                password,
                url_base,
                notificar_cumple,
                cargar_doctor,
                Config,
                LogoApp,
                lenguaje,
                obtener_odontogramas,
                obtener_odontograma,
                eliminar_odontograma,
                obtener_alertas_pagos,
                obtener_proximo_pago_usuario,
                crear_pago_mensual,
                marcar_pago_pagado,
                obtener_logs_usuario,
                obtener_todos_logs,
                obtener_estadisticas_logs,
                crear_log,
                calcular_nomina_doctores,
                registrar_pago_nomina,
                listar_pagos_nomina,
                marcar_pago_nomina_pagado,
                obtener_detalle_comisiones,
                listar_productos,
                guardar_producto,
                realizar_venta,
                productos_stock_bajo,
                listar_salarios_doctores,
                obtener_salario_doctor,
                guardar_salario_doctor,
                doctores_con_salarios,
                eliminar_salario_doctor,
                listar_recetas_paciente,
                obtener_receta,
                crear_receta,
                actualizar_receta,
                eliminar_receta,
                imprimir_receta,
                ver_receta_pdf,
                enviar_receta_email,
                listar_especialidades,
                listar_todas_especialidades,
                obtener_especialidad,
                crear_especialidad,
                actualizar_especialidad,
                eliminar_especialidad,
                    activar_especialidad,
                    exportar_pacientes,
                    importar_pacientes,
                    exportar_usuarios,
                    importar_usuarios
            };

