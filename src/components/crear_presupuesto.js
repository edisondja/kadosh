import React from 'react';
import ReactDOM from 'react-dom';
import Axios from 'axios';
import Alertify from 'alertifyjs';
import FacturaInterfaz from './factura_interfaz';
import cargar_doctores from './funciones_extras';
import VerFacturas from './ver_facturas';
import PerfilPaciente from './perfil_paciente';
import alertify from 'alertifyjs';
import core from './funciones_extras';
import { Redirect } from 'react-router-dom';

class  crear_presupuesto extends React.Component{

    constructor(props){
        super(props);
        this.state= {
            procedimientos:[],
            total:0,
            lista_procedimiento:[],
            doctores:[],
            factura:'',
            boton_estado:true,
            esEdicion: false,
            presupuestoId: null,
            nombrePresupuesto: ''
        };
        this.removeTodo = this.removeTodo.bind(this);

    }

    // Función para reproducir sonido al agregar procedimiento
    reproducirSonidoAgregar = () => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800; // Frecuencia más aguda
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (error) {
            console.log("Error al reproducir sonido:", error);
        }
    }

    // Función para reproducir sonido al guardar/generar
    reproducirSonidoGuardar = () => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Sonido más grave y largo
            oscillator.frequency.value = 600;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.4);
        } catch (error) {
            console.log("Error al reproducir sonido:", error);
        }
    }

    removeTodo(name,resta){
        this.setState({
            lista_procedimiento: this.state.lista_procedimiento.filter(el => el !== name),total:this.state.total-resta
        },()=>{
            console.log(this.state.lista_procedimiento);
        });
        
    }

    actualizarCantidadProcedimiento = (index, nuevaCantidad) => {
        // Validar que la cantidad sea un número positivo
        const cantidad = parseInt(nuevaCantidad) || 1;
        
        if (cantidad < 1) {
            Alertify.error("La cantidad debe ser mayor a 0");
            return;
        }

        const listaActualizada = [...this.state.lista_procedimiento];
        const procedimiento = listaActualizada[index];
        
        // Calcular precio unitario si no existe
        const precioUnitario = procedimiento.precio_unitario || (procedimiento.total / procedimiento.cantidad);
        
        // Actualizar cantidad y total del procedimiento
        procedimiento.cantidad = cantidad;
        procedimiento.total = precioUnitario * cantidad;
        procedimiento.precio_unitario = precioUnitario; // Guardar precio unitario para futuras ediciones
        
        listaActualizada[index] = procedimiento;
        
        // Recalcular el total general
        const nuevoTotal = listaActualizada.reduce((sum, proc) => sum + (parseFloat(proc.total) || 0), 0);
        
        this.setState({
            lista_procedimiento: listaActualizada,
            total: nuevoTotal
        });
    }


    componentDidMount(){
        cargar_doctores.cargar_procedimientos(this);
        cargar_doctores.cargar_doctores(this);
        
        // Verificar si es edición (si viene id_presupuesto en la URL)
        const idPresupuesto = this.props.match.params.id_presupuesto;
        if (idPresupuesto) {
            this.setState({ 
                esEdicion: true, 
                presupuestoId: idPresupuesto 
            });
            this.cargarPresupuestoParaEditar(idPresupuesto);
        }
    }

    cargarPresupuestoParaEditar = (idPresupuesto) => {
        Axios.get(`${cargar_doctores.url_base}/api/cargar_presupuesto/${idPresupuesto}`)
            .then(response => {
                try {
                    // Axios ya parsea la respuesta JSON automáticamente, response.data ya es un objeto
                    const datosPresupuesto = response.data;
                    
                    // Obtener procedimientos (pueden venir en procedimientos o lista_procedimiento)
                    let listaProcedimientos = datosPresupuesto.procedimientos || [];
                    
                    // Asegurar que cada procedimiento tenga precio_unitario calculado
                    listaProcedimientos = listaProcedimientos.map(proc => {
                        if (!proc.precio_unitario && proc.cantidad && proc.total) {
                            proc.precio_unitario = parseFloat(proc.total) / parseFloat(proc.cantidad);
                        }
                        return proc;
                    });
                    
                    // Calcular total sumando los totales de cada procedimiento
                    const total = listaProcedimientos.reduce((sum, proc) => {
                        return sum + (parseFloat(proc.total) || 0);
                    }, 0);
                    
                    console.log("Procedimientos cargados:", listaProcedimientos);
                    console.log("Total calculado:", total);
                    
                    this.setState({
                        lista_procedimiento: listaProcedimientos,
                        total: total,
                        nombrePresupuesto: datosPresupuesto.nombre || '',
                        esEdicion: true,
                        presupuestoId: idPresupuesto
                    });
                    
                    // Establecer el doctor seleccionado
                    if (datosPresupuesto.doctor_id) {
                        setTimeout(() => {
                            const selectDoctor = document.getElementById('doctor_i');
                            if (selectDoctor) {
                                selectDoctor.value = datosPresupuesto.doctor_id;
                                this.select_checked();
                            }
                        }, 500);
                    }
                    
                    // Establecer el nombre del presupuesto
                    const inputNombre = document.getElementById('presupuesto');
                    if (inputNombre) {
                        inputNombre.value = datosPresupuesto.nombre || '';
                    }
                    
                    Alertify.success("Presupuesto cargado para edición. Puede agregar o quitar procedimientos.");
                } catch (error) {
                    console.error("Error al procesar datos del presupuesto:", error);
                    Alertify.error("Error al cargar los datos del presupuesto");
                }
            })
            .catch(error => {
                console.error("Error al cargar presupuesto:", error);
                Alertify.error("Error al cargar el presupuesto para editar");
            });
    }

    agregarProcedimiento=(id,nombre,precio)=>{



       Alertify.prompt( 'Que cantidad de procedimientos quieres agregar?', 'Digite el numero de procedimientos de este tipo que quiere agregar', '1'
               ,(evt, value)=>{ 
                    
                    this.setState(state=>({
                        lista_procedimiento:state.lista_procedimiento.concat({
                            nombre_procedimiento:nombre,
                            total:precio*value,
                            id_procedimiento:id,
                            cantidad:value,
                            precio_unitario:precio // Guardar precio unitario para poder editar cantidad después
                        })
                    }));
                    this.setState({total:this.state.total+(value*precio)});
                    // Reproducir sonido al agregar procedimiento
                    this.reproducirSonidoAgregar();
                }
               ,()=> { Alertify.error('Cancel') }).set('type','text');

    }

    generar_factura=()=>{
            //accion a ejecutar cuando se haga click en generar factura
            var id_doctor = document.querySelector("#doctor_i").value;
            var prespuesto = document.querySelector('#presupuesto').value;

            if (!prespuesto || prespuesto.trim() === '') {
                Alertify.error("Debe ingresar un nombre para el presupuesto");
                return;
            }

            if (id_doctor === "seleccione_doctor") {
                Alertify.error("Debe seleccionar un doctor");
                return;
            }

            if (this.state.lista_procedimiento.length === 0) {
                Alertify.error("Debe agregar al menos un procedimiento");
                return;
            }
                                                
            if(this.state.boton_estado==false){
                const datosPresupuesto = {
                    nombre: prespuesto,
                    id_paciente: this.props.match.params.id,
                    id_doctor: id_doctor,
                    total: this.state.total,
                    procedimientos: this.state.lista_procedimiento
                };

                if (this.state.esEdicion && this.state.presupuestoId) {
                    // Actualizar presupuesto existente
                    Axios.post(`${cargar_doctores.url_base}/api/actualizar_presupuesto`, {
                        presupuesto_id: this.state.presupuestoId,
                        data: datosPresupuesto
                    }).then((data) => {
                        console.log(data.data);
                        // Reproducir sonido al actualizar presupuesto
                        this.reproducirSonidoGuardar();
                        Alertify.success("Presupuesto actualizado con éxito!");
                        this.setState({factura:'perfil_paciente'});
                    }).catch(error => {
                        console.error("Error al actualizar presupuesto:", error);
                        Alertify.error("Error al actualizar el presupuesto");
                    });
                } else {
                    // Crear nuevo presupuesto
                    Axios.post(`${cargar_doctores.url_base}/api/crear_presupuesto`, {
                        data: datosPresupuesto
                    }).then((data) => {
                        console.log(data.data);
                        // Reproducir sonido al generar presupuesto
                        this.reproducirSonidoGuardar();
                        Alertify.success("Presupuesto generado con éxito!");
                        this.setState({factura:'perfil_paciente'});
                    }).catch(error => {
                        console.error("Error al crear presupuesto:", error);
                        Alertify.error("Error al crear el presupuesto");
                    });
                }

                this.setState({boton_estado:true});
            } else {
                alertify.message("Debe seleccionar un doctor primero");
            }
    }
    
    eliminar_procedimiento=(indice)=>{
                    console.log("intentando eliminar procedimiento ..");
                    this.setState({})
                    
    }

    retroceder=()=>{

        this.setState({factura:'perfil_paciente'});
    }


    select_checked=()=>{

        let doctor_id =  document.getElementById('doctor_i').value;
        if(doctor_id!=="seleccione_doctor"){

            this.setState({boton_estado:false});
            
            
        }else{

            this.setState({boton_estado:true});
        }

    }


    buscar_procedimiento=()=>{ 
            
        var buscar = document.getElementById("buscando").value;
            Axios.get(`${cargar_doctores.url_base}/api/buscar_procedimiento/${buscar}`).then(data=>{

                    this.setState({procedimientos:data.data});

            }).catch(error=>{

                console.log("error");
            })
    }



    render(){
         var indice_procedimiento = 0;

         if(this.state.factura=='ready'){

            return <Redirect to={`/ver_facturas/${this.props.match.params.id}`} />

         }else if(this.state.factura=='perfil_paciente'){


            return <Redirect to={`/perfil_paciente/${this.props.match.params.id}/${this.props.match.params.id_doc}`} />;

         }else{

            
         }


        return (
            <>
                <style>{`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes slideUp {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}</style>
                <div className="col-12 col-md-10 col-lg-10" style={{ 
                    backgroundColor: '#f5f5f7',
                    minHeight: '100vh',
                    padding: '15px',
                    borderRadius: '16px'
                }}>
                    {/* Header principal */}
                    <div className="card border-0 shadow-lg mb-4" style={{ 
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        overflow: 'hidden',
                        animation: 'fadeIn 0.5s ease'
                    }}>
                        <div className="card-body text-white p-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center">
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '15px',
                                        background: 'rgba(255,255,255,0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: '20px',
                                        fontSize: '28px'
                                    }}>
                                        <i className="fas fa-file-invoice-dollar"></i>
                                    </div>
                                    <div>
                                        <h2 className="mb-0" style={{ fontWeight: 700, fontSize: '32px' }}>
                                            {this.state.esEdicion ? 'EDITAR PRESUPUESTO' : 'CREAR PRESUPUESTO'}
                                        </h2>
                                        <p className="mb-0" style={{ opacity: 0.9, fontSize: '15px' }}>
                                            Agrega procedimientos y genera el presupuesto para el paciente
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    className="btn"
                                    onClick={this.retroceder}
                                    style={{
                                        background: 'rgba(255,255,255,0.2)',
                                        border: '2px solid rgba(255,255,255,0.3)',
                                        color: 'white',
                                        borderRadius: '12px',
                                        padding: '12px 24px',
                                        fontWeight: 600,
                                        fontSize: '15px',
                                        transition: 'all 0.3s ease',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = 'rgba(255,255,255,0.3)';
                                        e.target.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'rgba(255,255,255,0.2)';
                                        e.target.style.transform = 'translateY(0)';
                                    }}
                                >
                                    <i className="fas fa-arrow-left me-2"></i>Retroceder
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Información del presupuesto */}
                    <div className="card border-0 shadow-sm mb-4" style={{ 
                        borderRadius: '16px',
                        overflow: 'hidden',
                        animation: 'slideUp 0.6s ease'
                    }}>
                        <div className="card-body p-4">
                            <div className="row">
                                <div className="col-12 col-md-6 mb-3">
                                    <label style={{ fontWeight: 600, color: '#495057', marginBottom: '8px', display: 'block' }}>
                                        <i className="fas fa-tag me-2"></i>Nombre del Presupuesto
                                    </label>
                                    <input 
                                        type='text' 
                                        id="presupuesto" 
                                        placeholder='Ej. Tratamiento completo - Periodo 2024' 
                                        className='form-control'
                                        style={{
                                            borderRadius: '12px',
                                            border: '2px solid #e0e0e0',
                                            padding: '12px 16px',
                                            fontSize: '15px',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#1c1c1e';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(28, 28, 30, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#e0e0e0';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                </div>
                                <div className="col-12 col-md-6 mb-3" style={{ display: 'flex', flexDirection: 'column' }}>
                                    <label style={{ fontWeight: 600, color: '#495057', marginBottom: '8px', display: 'block' }}>
                                        <i className="fas fa-user-md me-2"></i>Seleccione el Doctor
                                    </label>
                                    <div style={{ width: '100%' }}>
                                        <select 
                                            className="form-control" 
                                            id="doctor_i" 
                                            onChange={this.select_checked}
                                            style={{
                                                borderRadius: '12px',
                                                border: '2px solid #e0e0e0',
                                                padding: '14px 16px',
                                                fontSize: '15px',
                                                minHeight: '50px',
                                                height: 'auto',
                                                lineHeight: '1.5',
                                                transition: 'all 0.2s ease',
                                                width: '100%',
                                                minWidth: '100%',
                                                maxWidth: '100%',
                                                boxSizing: 'border-box',
                                                appearance: 'none',
                                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: 'right 16px center',
                                                paddingRight: '40px',
                                                whiteSpace: 'normal',
                                                wordWrap: 'break-word'
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = '#1c1c1e';
                                                e.target.style.boxShadow = '0 0 0 3px rgba(28, 28, 30, 0.1)';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = '#e0e0e0';
                                                e.target.style.boxShadow = 'none';
                                            }}
                                        >
                                            <option value="seleccione_doctor">Seleccione un doctor</option>
                                            {this.state.doctores.map(data=>(
                                                 <option key={data.id} value={data.id}>{data.nombre} {data.apellido}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Lista de procedimientos agregados */}
                    {this.state.lista_procedimiento.length > 0 && (
                        <div className="card border-0 shadow-sm mb-4" style={{ 
                            borderRadius: '16px',
                            overflow: 'hidden',
                            animation: 'slideUp 0.7s ease'
                        }}>
                            <div className="card-body p-4">
                                <h5 className="mb-3" style={{ fontWeight: 600, color: '#495057' }}>
                                    <i className="fas fa-list me-2" style={{ color: '#1c1c1e' }}></i>
                                    Procedimientos Agregados
                                </h5>
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead style={{ 
                                            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                                            borderBottom: '2px solid #dee2e6'
                                        }}>
                                            <tr>
                                                <th style={{ 
                                                    fontWeight: 600, 
                                                    fontSize: '13px',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    color: '#495057',
                                                    padding: '15px 20px',
                                                    border: 'none'
                                                }}>Procedimiento</th>
                                                <th style={{ 
                                                    fontWeight: 600, 
                                                    fontSize: '13px',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    color: '#495057',
                                                    padding: '15px 20px',
                                                    border: 'none'
                                                }}>Cantidad</th>
                                                <th style={{ 
                                                    fontWeight: 600, 
                                                    fontSize: '13px',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    color: '#495057',
                                                    padding: '15px 20px',
                                                    border: 'none'
                                                }}>Monto</th>
                                                <th style={{ 
                                                    fontWeight: 600, 
                                                    fontSize: '13px',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    color: '#495057',
                                                    padding: '15px 20px',
                                                    border: 'none',
                                                    textAlign: 'center'
                                                }}>Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {this.state.lista_procedimiento.map((data, index) => (
                                                <tr 
                                                    key={index}
                                                    style={{ 
                                                        transition: 'all 0.2s ease',
                                                        borderBottom: '1px solid #f0f0f0'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'white';
                                                    }}
                                                >
                                                    <td style={{ padding: '15px 20px', verticalAlign: 'middle', fontWeight: 600, color: '#495057' }}>
                                                        {data.nombre_procedimiento}
                                                    </td>
                                                    <td style={{ padding: '15px 20px', verticalAlign: 'middle' }}>
                                                        <input 
                                                            type="number" 
                                                            min="1" 
                                                            className="form-control" 
                                                            style={{
                                                                width: '100px', 
                                                                display: 'inline-block',
                                                                borderRadius: '8px',
                                                                border: '2px solid #e0e0e0',
                                                                padding: '8px 12px',
                                                                fontSize: '14px',
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                            value={data.cantidad || 1}
                                                            onChange={(e) => this.actualizarCantidadProcedimiento(index, e.target.value)}
                                                            onFocus={(e) => {
                                                                e.target.style.borderColor = '#1c1c1e';
                                                                e.target.style.boxShadow = '0 0 0 3px rgba(28, 28, 30, 0.1)';
                                                            }}
                                                            onBlur={(e) => {
                                                                e.target.style.borderColor = '#e0e0e0';
                                                                e.target.style.boxShadow = 'none';
                                                            }}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '15px 20px', verticalAlign: 'middle', fontWeight: 600, color: '#28a745', fontSize: '16px' }}>
                                                        ${parseFloat(data.total || 0).toFixed(2)}
                                                    </td>
                                                    <td style={{ padding: '15px 20px', verticalAlign: 'middle', textAlign: 'center' }}>
                                                        <button 
                                                            className="btn btn-sm" 
                                                            onClick={()=>this.removeTodo(data,data.total)}
                                                            style={{
                                                                background: 'linear-gradient(135deg, #8e8e93 0%, #a8a8a8 100%)',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '8px',
                                                                padding: '6px 12px',
                                                                fontWeight: 600,
                                                                fontSize: '13px',
                                                                transition: 'all 0.2s ease',
                                                                boxShadow: '0 2px 8px rgba(142, 142, 147, 0.3)'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.target.style.transform = 'scale(1.1)';
                                                                e.target.style.boxShadow = '0 4px 12px rgba(142, 142, 147, 0.4)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.target.style.transform = 'scale(1)';
                                                                e.target.style.boxShadow = '0 2px 8px rgba(142, 142, 147, 0.3)';
                                                            }}
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                
                                {/* Resumen total */}
                                <div className="card border-0 mt-4" style={{ 
                                    background: 'linear-gradient(135deg, #2d2d2f 0%, #1c1c1e 100%)',
                                    borderRadius: '12px',
                                    overflow: 'hidden'
                                }}>
                                    <div className="card-body text-white p-4">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h4 className="mb-0" style={{ fontWeight: 700, fontSize: '20px' }}>
                                                    Total del Presupuesto
                                                </h4>
                                                <p className="mb-0" style={{ opacity: 0.9, fontSize: '14px' }}>
                                                    Suma total de todos los procedimientos
                                                </p>
                                            </div>
                                            <div style={{
                                                fontSize: '32px',
                                                fontWeight: 700
                                            }}>
                                                RD$ {new Intl.NumberFormat().format(this.state.total)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Botón generar/actualizar */}
                                <div className="text-center mt-4">
                                    <button 
                                        className="btn"
                                        onClick={this.generar_factura} 
                                        disabled={this.state.boton_estado}
                                        style={{
                                            background: this.state.boton_estado 
                                                ? 'linear-gradient(135deg, #8e8e93 0%, #a8a8a8 100%)'
                                                : 'linear-gradient(135deg, #2d2d2f 0%, #1c1c1e 100%)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '12px',
                                            padding: '14px 48px',
                                            fontWeight: 600,
                                            fontSize: '16px',
                                            transition: 'all 0.3s ease',
                                            boxShadow: this.state.boton_estado 
                                                ? '0 4px 12px rgba(142, 142, 147, 0.3)'
                                                : '0 4px 12px rgba(28, 28, 30, 0.3)',
                                            minWidth: '250px',
                                            cursor: this.state.boton_estado ? 'not-allowed' : 'pointer'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!this.state.boton_estado) {
                                                e.target.style.transform = 'translateY(-2px)';
                                                e.target.style.boxShadow = '0 6px 16px rgba(28, 28, 30, 0.4)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!this.state.boton_estado) {
                                                e.target.style.transform = 'translateY(0)';
                                                e.target.style.boxShadow = '0 4px 12px rgba(28, 28, 30, 0.3)';
                                            }
                                        }}
                                    >
                                        <i className={`fas ${this.state.esEdicion ? 'fa-save' : 'fa-file-invoice-dollar'} me-2`}></i>
                                        {this.state.esEdicion ? 'Actualizar Presupuesto' : 'Generar Presupuesto'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Buscador de procedimientos */}
                    <div className="card border-0 shadow-sm mb-4" style={{ 
                        borderRadius: '16px',
                        overflow: 'hidden',
                        animation: 'slideUp 0.8s ease'
                    }}>
                        <div className="card-body p-4">
                            <div className="input-group mb-3">
                                <span className="input-group-text" style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px 0 0 12px'
                                }}>
                                    <i className="fas fa-search"></i>
                                </span>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    id="buscando" 
                                    onKeyUp={this.buscar_procedimiento} 
                                    placeholder="Escriba el nombre del procedimiento para buscar..." 
                                    style={{
                                        border: '2px solid #e0e0e0',
                                        borderRadius: '0 12px 12px 0',
                                        padding: '12px 16px',
                                        fontSize: '15px',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#1c1c1e';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(28, 28, 30, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e0e0e0';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>

                            {/* Lista de procedimientos disponibles */}
                            {this.state.procedimientos.length === 0 ? (
                                <div className="text-center py-4">
                                    <i className="fas fa-stethoscope fa-3x text-muted mb-3" style={{ opacity: 0.3 }}></i>
                                    <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                                        Escriba en el buscador para encontrar procedimientos disponibles
                                    </p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead style={{ 
                                            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                                            borderBottom: '2px solid #dee2e6'
                                        }}>
                                            <tr>
                                                <th style={{ 
                                                    fontWeight: 600, 
                                                    fontSize: '13px',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    color: '#495057',
                                                    padding: '15px 20px',
                                                    border: 'none'
                                                }}>Nombre</th>
                                                <th style={{ 
                                                    fontWeight: 600, 
                                                    fontSize: '13px',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    color: '#495057',
                                                    padding: '15px 20px',
                                                    border: 'none'
                                                }}>Precio</th>
                                                <th style={{ 
                                                    fontWeight: 600, 
                                                    fontSize: '13px',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    color: '#495057',
                                                    padding: '15px 20px',
                                                    border: 'none',
                                                    textAlign: 'center'
                                                }}>Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {this.state.procedimientos.map((data, index) => (
                                                <tr 
                                                    key={index}
                                                    style={{ 
                                                        transition: 'all 0.2s ease',
                                                        borderBottom: '1px solid #f0f0f0'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'white';
                                                    }}
                                                >
                                                    <td style={{ padding: '15px 20px', verticalAlign: 'middle', fontWeight: 600, color: '#495057' }}>
                                                        {data.nombre}
                                                    </td>
                                                    <td style={{ padding: '15px 20px', verticalAlign: 'middle', fontWeight: 600, color: '#28a745', fontSize: '16px' }}>
                                                        RD$ {new Intl.NumberFormat().format(data.precio)}
                                                    </td>
                                                    <td style={{ padding: '15px 20px', verticalAlign: 'middle', textAlign: 'center' }}>
                                                        <button 
                                                            className="btn btn-sm"
                                                            onClick={()=>this.agregarProcedimiento(data.id,data.nombre,data.precio)}
                                                            style={{
                                                                background: 'linear-gradient(135deg, #2d2d2f 0%, #1c1c1e 100%)',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '8px',
                                                                padding: '8px 16px',
                                                                fontWeight: 600,
                                                                fontSize: '14px',
                                                                transition: 'all 0.2s ease',
                                                                boxShadow: '0 2px 8px rgba(28, 28, 30, 0.3)'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.target.style.transform = 'scale(1.1)';
                                                                e.target.style.boxShadow = '0 4px 12px rgba(28, 28, 30, 0.4)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.target.style.transform = 'scale(1)';
                                                                e.target.style.boxShadow = '0 2px 8px rgba(28, 28, 30, 0.3)';
                                                            }}
                                                        >
                                                            <i className="fas fa-plus me-1"></i>Agregar
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </>
        )
    }


}

export default crear_presupuesto;