import React from 'react';
import ReactDOM from 'react-dom';
import Axios from 'axios';
import Alertify from 'alertifyjs';
import FacturaInterfaz from './factura_interfaz';
import cargar_doctores from './funciones_extras';
import VerFacturas from './ver_facturas';
import PerfilPaciente from './perfil_paciente';
import alertify from 'alertifyjs';
import { Link,Redirect } from 'react-router-dom';


class  AgregarFactura extends React.Component{

    constructor(props){
        super(props);
        this.state= {procedimientos:[],total:0,lista_procedimiento:[],doctores:[],factura:'',boton_estado:true};
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


    componentDidMount(){



        cargar_doctores.cargar_procedimientos(this);
        cargar_doctores.cargar_doctores(this);
    }

    agregarProcedimiento=(id,nombre,precio)=>{



       Alertify.prompt( 'Que cantidad de procedimientos quieres agregar?', 'Digite el numero de procedimientos de este tipo que quiere agregar', '1'
               ,(evt, value)=>{ 
                    
                    this.setState(state=>({
                        lista_procedimiento:state.lista_procedimiento.concat({nombre_procedimiento:nombre,total:precio*value,id_procedimiento:id,cantidad:value})
                    }));
                    this.setState({total:this.state.total+(value*precio)});
                    // Reproducir sonido al agregar procedimiento
                    this.reproducirSonidoAgregar();
                }
               ,()=> { Alertify.error('Cancel') }).set('type','text');

    }

    generar_factura=()=>{
            //accion a ajecutar cuando se haga click en generar factura
            var id_doctor = document.querySelector("#doctor_i").value;
            const usuarioId = localStorage.getItem("id_usuario");
            if(this.state.boton_estado==false){  
            Axios.post(`${cargar_doctores.url_base}/api/crear_factura`,{
                id_paciente:this.props.match.params.id,
                id_doctor:id_doctor,
                total:this.state.total,
                procedimientos:[this.state.lista_procedimiento],
                usuario_id: usuarioId
            }).then((data)=>{

                    console.log(data.data);
                    this.setState({total:0,lista_procedimiento:[],factura:'ready'});
                    // Reproducir sonido al generar factura
                    this.reproducirSonidoGuardar();
                    Alertify.success("Factura generada correctamente, puede ir al perfil del paciente y verla");
                    // document.getElementById("agregar_paciente").click();
                    //Redireciona a la factura de pacientes cuando se cargue la factura


                }).catch(error=>{
                    const errorMessage = error.response?.data?.message || error.response?.data?.error || "Error al crear factura";
                    Alertify.error(errorMessage);
                    console.error("Error al crear factura:", error.response?.data || error.message);
            });

            this.state.boton_estado=true;
        }else{
        
            alertify.message("ya generaste una factura!!!!");
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

            return <Redirect to={`/ver_facturas/${this.props.match.params.id}`} />;

         }else if(this.state.factura=='perfil_paciente'){

            return <Redirect to={`/perfil_paciente/${this.props.match.params.id}/${this.props.params.id_doc}`}/>
            
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
                <div className="col-12 col-md-10" style={{ 
                    backgroundColor: '#f5f5f7',
                    minHeight: '100vh',
                    padding: '30px',
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
                            <div className="d-flex justify-content-between align-items-center flex-wrap">
                                <div className="d-flex align-items-center mb-3 mb-md-0">
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
                                        <i className="fas fa-file-invoice"></i>
                                    </div>
                                    <div>
                                        <h2 className="mb-0" style={{ fontWeight: 700, fontSize: '32px' }}>
                                            Creación de Factura
                                        </h2>
                                        <p className="mb-0" style={{ opacity: 0.9, fontSize: '15px' }}>
                                            Agregue procedimientos y genere la factura
                                        </p>
                                    </div>
                                </div>
                                <Link to={`/perfil_paciente/${this.props.match.params.id}/${this.props.match.params.id_doc}`}>
                                    <button className="btn" style={{
                                        background: 'rgba(255,255,255,0.2)',
                                        border: '2px solid rgba(255,255,255,0.3)',
                                        color: 'white',
                                        borderRadius: '12px',
                                        padding: '10px 20px',
                                        fontWeight: 600,
                                        fontSize: '14px',
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
                                    }}>
                                        <i className="fas fa-arrow-left me-2"></i>Retroceder
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Resumen de factura */}
                    <div className="row g-3 mb-4">
                        <div className="col-12 col-md-8">
                            <div className="card border-0 shadow-sm mb-4" style={{ 
                                borderRadius: '16px',
                                animation: 'slideUp 0.6s ease'
                            }}>
                                <div className="card-header border-0" style={{
                                    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                                    borderRadius: '16px 16px 0 0',
                                    padding: '20px'
                                }}>
                                    <h5 className="mb-0" style={{ 
                                        fontWeight: 600, 
                                        fontSize: '18px',
                                        color: '#2d2d2f',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        <i className="fas fa-list me-2" style={{ color: '#667eea' }}></i>
                                        Lista de Procedimientos
                                    </h5>
                                </div>
                                <div className="card-body p-0">
                                    {this.state.lista_procedimiento.length > 0 ? (
                                        <div className="table-responsive">
                                            <table className="table table-hover mb-0">
                                                <thead style={{
                                                    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
                                                }}>
                                                    <tr>
                                                        <th style={{ 
                                                            fontWeight: 600, 
                                                            fontSize: '13px',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px',
                                                            color: '#6c757d',
                                                            padding: '15px 20px',
                                                            border: 'none'
                                                        }}>Procedimiento</th>
                                                        <th style={{ 
                                                            fontWeight: 600, 
                                                            fontSize: '13px',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px',
                                                            color: '#6c757d',
                                                            padding: '15px 20px',
                                                            border: 'none'
                                                        }}>Cantidad</th>
                                                        <th style={{ 
                                                            fontWeight: 600, 
                                                            fontSize: '13px',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px',
                                                            color: '#6c757d',
                                                            padding: '15px 20px',
                                                            border: 'none'
                                                        }}>Monto</th>
                                                        <th style={{ 
                                                            fontWeight: 600, 
                                                            fontSize: '13px',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px',
                                                            color: '#6c757d',
                                                            padding: '15px 20px',
                                                            border: 'none',
                                                            textAlign: 'center'
                                                        }}>Acción</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {this.state.lista_procedimiento.map((data, index) => (
                                                        <tr key={index} style={{
                                                            transition: 'all 0.2s ease',
                                                            borderBottom: '1px solid #f0f0f0'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.backgroundColor = '#f8f9fa';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.backgroundColor = 'transparent';
                                                        }}>
                                                            <td style={{ padding: '15px 20px', fontWeight: 500, color: '#2d2d2f' }}>
                                                                {data.nombre_procedimiento}
                                                            </td>
                                                            <td style={{ padding: '15px 20px', color: '#6c757d' }}>
                                                                <span className="badge" style={{
                                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                                    color: 'white',
                                                                    padding: '6px 12px',
                                                                    borderRadius: '8px',
                                                                    fontSize: '13px',
                                                                    fontWeight: 600
                                                                }}>
                                                                    {data.cantidad}
                                                                </span>
                                                            </td>
                                                            <td style={{ padding: '15px 20px', fontWeight: 600, color: '#28a745', fontSize: '16px' }}>
                                                                ${new Intl.NumberFormat().format(data.total)}
                                                            </td>
                                                            <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                                                                <button 
                                                                    className="btn"
                                                                    onClick={() => this.removeTodo(data, data.total)}
                                                                    style={{
                                                                        background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                                                                        color: 'white',
                                                                        border: 'none',
                                                                        borderRadius: '8px',
                                                                        padding: '6px 12px',
                                                                        fontSize: '13px',
                                                                        fontWeight: 600,
                                                                        transition: 'all 0.2s ease',
                                                                        minWidth: '80px'
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.target.style.transform = 'translateY(-2px)';
                                                                        e.target.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.4)';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.target.style.transform = 'translateY(0)';
                                                                        e.target.style.boxShadow = 'none';
                                                                    }}
                                                                >
                                                                    <i className="fas fa-trash me-1"></i>Eliminar
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center p-5" style={{ color: '#6c757d' }}>
                                            <i className="fas fa-inbox" style={{ fontSize: '48px', marginBottom: '15px', opacity: 0.5 }}></i>
                                            <p style={{ fontSize: '16px', margin: 0 }}>No hay procedimientos agregados</p>
                                            <p style={{ fontSize: '14px', opacity: 0.7 }}>Busque y agregue procedimientos a continuación</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Panel lateral - Total y Doctor */}
                        <div className="col-12 col-md-4">
                            <div className="card border-0 shadow-sm mb-4" style={{ 
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #2d2d2f 0%, #1c1c1e 100%)',
                                animation: 'slideUp 0.7s ease'
                            }}>
                                <div className="card-body text-white p-4">
                                    <h5 className="mb-3" style={{ 
                                        fontWeight: 600, 
                                        fontSize: '16px',
                                        opacity: 0.9,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        <i className="fas fa-calculator me-2"></i>
                                        Monto Total
                                    </h5>
                                    <div style={{
                                        fontSize: '42px',
                                        fontWeight: 700,
                                        marginBottom: '25px',
                                        textAlign: 'center',
                                        padding: '20px',
                                        background: 'rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                        backdropFilter: 'blur(10px)'
                                    }}>
                                        ${new Intl.NumberFormat().format(this.state.total)}
                                    </div>

                                    <div className="mb-3">
                                        <label style={{ 
                                            fontSize: '14px', 
                                            fontWeight: 600,
                                            marginBottom: '10px',
                                            display: 'block',
                                            opacity: 0.9,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            <i className="fas fa-user-md me-2"></i>
                                            Seleccione el Doctor
                                        </label>
                                        <select 
                                            className="form-control" 
                                            style={{
                                                borderRadius: '12px',
                                                border: '2px solid rgba(255,255,255,0.2)',
                                                padding: '14px 16px',
                                                fontSize: '15px',
                                                minHeight: '50px',
                                                height: 'auto',
                                                lineHeight: '1.5',
                                                transition: 'all 0.2s ease',
                                                appearance: 'none',
                                                background: 'rgba(255,255,255,0.1)',
                                                color: 'white',
                                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='white' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: 'right 16px center',
                                                paddingRight: '40px',
                                                whiteSpace: 'normal',
                                                wordWrap: 'break-word'
                                            }}
                                            id="doctor_i" 
                                            onChange={this.select_checked}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = 'rgba(255,255,255,0.5)';
                                                e.target.style.boxShadow = '0 0 0 3px rgba(255,255,255,0.1)';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                                                e.target.style.boxShadow = 'none';
                                            }}
                                        >
                                            <option value="seleccione_doctor" style={{ color: '#333' }}>Seleccione un doctor</option>
                                            {this.state.doctores.map(data => (
                                                <option key={data.id} value={data.id} style={{ color: '#333' }}>
                                                    {data.nombre} {data.apellido}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <button 
                                        className="btn w-100"
                                        onClick={this.generar_factura} 
                                        disabled={this.state.boton_estado}
                                        style={{
                                            background: this.state.boton_estado 
                                                ? 'rgba(255,255,255,0.1)' 
                                                : 'linear-gradient(135deg, #28a745 0%, #218838 100%)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '12px',
                                            padding: '14px 20px',
                                            fontSize: '16px',
                                            fontWeight: 600,
                                            transition: 'all 0.3s ease',
                                            cursor: this.state.boton_estado ? 'not-allowed' : 'pointer',
                                            opacity: this.state.boton_estado ? 0.5 : 1
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!this.state.boton_estado) {
                                                e.target.style.transform = 'translateY(-2px)';
                                                e.target.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.4)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!this.state.boton_estado) {
                                                e.target.style.transform = 'translateY(0)';
                                                e.target.style.boxShadow = 'none';
                                            }
                                        }}
                                    >
                                        <i className="fas fa-file-invoice me-2"></i>
                                        Generar Factura
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Búsqueda de procedimientos */}
                    <div className="card border-0 shadow-sm mb-4" style={{ 
                        borderRadius: '16px',
                        animation: 'slideUp 0.8s ease'
                    }}>
                        <div className="card-body p-4">
                            <div className="input-group">
                                <span className="input-group-text" style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px 0 0 12px',
                                    padding: '14px 20px',
                                    fontSize: '18px'
                                }}>
                                    <i className="fas fa-search"></i>
                                </span>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    id="buscando" 
                                    onKeyUp={this.buscar_procedimiento} 
                                    placeholder="Escriba el procedimiento que desea buscar..."
                                    style={{
                                        borderRadius: '0 12px 12px 0',
                                        border: '2px solid #e0e0e0',
                                        borderLeft: 'none',
                                        padding: '14px 16px',
                                        fontSize: '15px',
                                        minHeight: '50px',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#667eea';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e0e0e0';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Lista de procedimientos */}
                    <div className="card border-0 shadow-sm" style={{ 
                        borderRadius: '16px',
                        animation: 'slideUp 0.9s ease'
                    }}>
                        <div className="card-header border-0" style={{
                            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                            borderRadius: '16px 16px 0 0',
                            padding: '20px'
                        }}>
                            <h5 className="mb-0" style={{ 
                                fontWeight: 600, 
                                fontSize: '18px',
                                color: '#2d2d2f',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                <i className="fas fa-procedures me-2" style={{ color: '#667eea' }}></i>
                                Procedimientos Disponibles
                            </h5>
                        </div>
                        <div className="card-body p-4">
                            <div className="row g-3">
                                {this.state.procedimientos.length > 0 ? (
                                    this.state.procedimientos.map((data, index) => (
                                        <div key={index} className="col-12 col-md-6 col-lg-4">
                                            <div className="card border-0 shadow-sm h-100" style={{
                                                borderRadius: '16px',
                                                transition: 'all 0.3s ease',
                                                border: '2px solid #e0e0e0'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-5px)';
                                                e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.2)';
                                                e.currentTarget.style.borderColor = '#667eea';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                                                e.currentTarget.style.borderColor = '#e0e0e0';
                                            }}>
                                                <div className="card-body p-4">
                                                    <h6 style={{ 
                                                        fontWeight: 600, 
                                                        fontSize: '16px',
                                                        color: '#2d2d2f',
                                                        marginBottom: '15px',
                                                        minHeight: '48px'
                                                    }}>
                                                        {data.nombre}
                                                    </h6>
                                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                                        <span style={{ 
                                                            fontSize: '14px', 
                                                            color: '#6c757d',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px'
                                                        }}>
                                                            Precio:
                                                        </span>
                                                        <span style={{ 
                                                            fontSize: '24px', 
                                                            fontWeight: 700,
                                                            color: '#28a745'
                                                        }}>
                                                            ${new Intl.NumberFormat().format(data.precio)}
                                                        </span>
                                                    </div>
                                                    <button 
                                                        className="btn w-100"
                                                        onClick={() => this.agregarProcedimiento(data.id, data.nombre, data.precio)}
                                                        style={{
                                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '12px',
                                                            padding: '12px 20px',
                                                            fontSize: '14px',
                                                            fontWeight: 600,
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.target.style.transform = 'translateY(-2px)';
                                                            e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.target.style.transform = 'translateY(0)';
                                                            e.target.style.boxShadow = 'none';
                                                        }}
                                                    >
                                                        <i className="fas fa-plus me-2"></i>Agregar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-12 text-center p-5" style={{ color: '#6c757d' }}>
                                        <i className="fas fa-search" style={{ fontSize: '48px', marginBottom: '15px', opacity: 0.5 }}></i>
                                        <p style={{ fontSize: '16px', margin: 0 }}>Busque un procedimiento para comenzar</p>
                                        <p style={{ fontSize: '14px', opacity: 0.7 }}>Escriba en el campo de búsqueda arriba</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }


}

export default AgregarFactura;