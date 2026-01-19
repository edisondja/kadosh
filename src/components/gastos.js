import React from 'react';
import Axios from 'axios';
import Alertify from 'alertifyjs';
import Buscar from '../buscar.png';
import Core from './funciones_extras';
import '../css/dashboard.css';
import Suplidores from './funciones_extras';
import alertify from 'alertifyjs';
import { CSVLink, CSVDownload } from "react-csv";

class Gasto extends React.Component{


    constructor(props){
        super(props);
        this.state={
            registros:[],
            cambio:'',
            suplidores:[],
            gastos:null,
            monto_gasto:0,
            id_suplidor:0,
            roll_estado:0,
            no_permiso:'Usted no tiene los permisos suficientes para raelizar esta acción',
            modalGastoVisible: false,
            formGasto: {
                tipo_de_gasto: 'Materiales Gastable',
                tipo_de_pago: 'Efectivo',
                suplidor_id: '',
                itebis: '',
                total: '',
                descripcion: '',
                comprobante_fiscal: ''
            }
        }
        this.abrirModalGasto = this.abrirModalGasto.bind(this);
        this.cerrarModalGasto = this.cerrarModalGasto.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.guardarGasto = this.guardarGasto.bind(this);
    }

    eliminar_gasto(id_gasto){

        if(this.state.roll_estado=="Administrador"){

        Alertify.confirm("Eliminar gasto","Estas seguro que deseas eliminar este gasto?",()=>{

            Axios.get(`${Core.url_base}/api/eliminar_gasto/${id_gasto}`).then(data=>{

                Alertify.message(data.data);
                this.cargar_gastos();
            
            }).catch(error=>{

                Alertify.warning(error);
            });

        },function(){})
      }else{


            Alertify.message(this.state.no_permiso);

      }
    

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
        this.setState({roll_estado:localStorage.getItem("roll")});

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
       Forma de pago: ${data.tipo_de_pago}<br/>
       Forma de pago: ${data.tipo_de_gasto}<br/>
       Comprobante Fiscal: ${data.comprobante_fiscal}<br/>
       RNC SUPLIDOR: ${data.rnc_suplidor}<br/>
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
            
            option_suplidores+=`<option  value=${data.id}>${data.nombre} | RNC:${data.rnc_suplidor}</option>`;
            
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
        <select class="form-control" id="suplidor" onClick=${this.capturar_rnc}>
            <option value="${data.suplidor_id}">${data.nombre}</option>
            ${this.listar_suplidores()}
        <select/><br/>
        <p>Bruto</p>
        <input type="number" class="form-control" value="${data.total}" id="total">
        <p>Itebis</p><br/>
        <input type="number" class="form-control" value="${data.itebis}" id="itebis" plaholder="Itebis" /><br/>
        <input type="hidden" class="form-control" value="${data.rnc_suplidor}" id="rnc" plaholder="RNC Suplidor" /><br/>
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
        if(this.state.roll_estado=="Administrador"){
        
            Axios.post(`${Core.url_base}/api/actualizar_gasto`,gasto).then(data=>{

                Alertify.message(data.data);
                console.log(data.data);
                this.cargar_gastos();
                
            
            }).catch(error=>{
                Alertify.message(error);

            });
       
        }else{

            Alertify.message(this.state.no_permiso);

       }

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


    abrirModalGasto(){
        this.setState({ 
            modalGastoVisible: true,
            formGasto: {
                tipo_de_gasto: 'Materiales Gastable',
                tipo_de_pago: 'Efectivo',
                suplidor_id: '',
                itebis: '',
                total: '',
                descripcion: '',
                comprobante_fiscal: ''
            }
        });
    }

    cerrarModalGasto(){
        this.setState({ modalGastoVisible: false });
    }

    handleInputChange(e){
        const { name, value } = e.target;
        this.setState(prevState => ({
            formGasto: {
                ...prevState.formGasto,
                [name]: value
            }
        }));
    }

    guardarGasto(){
        const { formGasto } = this.state;
        
        // Validaciones básicas
        if (!formGasto.suplidor_id || formGasto.suplidor_id === '') {
            Alertify.error("Debe seleccionar un suplidor");
            return;
        }
        if (!formGasto.total || formGasto.total === '') {
            Alertify.error("Debe ingresar el monto bruto");
            return;
        }

        Axios.post(`${Core.url_base}/api/registrar_gastos`, formGasto).then(data=>{
            Alertify.success("Gasto registrado correctamente");
            this.cargar_gastos();
            this.Cargar_monto_gasto("s","s");
            this.cerrarModalGasto();
        }).catch(error=>{
            Alertify.error("Error al registrar el gasto");
            console.error(error);
        });
    }

    agregar_gastos=()=>{
        this.abrirModalGasto();
    }

    render(){


        var csvData = this.state.registros;
        csvData.push({TOTAL:new Intl.NumberFormat({ maximumSignificantDigits: 2},{ style: 'currency', currency: 'DOP' }, ).format(this.state.monto_gasto)});
    
       return(
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
                                    <i className="fas fa-receipt"></i>
                                </div>
                                <div>
                                    <h2 className="mb-0" style={{ fontWeight: 700, fontSize: '32px' }}>
                                        Gestión de Gastos
                                    </h2>
                                    <p className="mb-0" style={{ opacity: 0.9, fontSize: '15px' }}>
                                        Administra y registra todos los gastos del sistema
                                    </p>
                                </div>
                            </div>
                            <div className="d-flex gap-3 flex-wrap">
                                <button 
                                    className="btn"
                                    onClick={(e)=>this.agregar_gastos()}
                                    style={{
                                        background: 'rgba(255,255,255,0.2)',
                                        border: '2px solid rgba(255,255,255,0.3)',
                                        color: 'white',
                                        borderRadius: '12px',
                                        padding: '12px 24px',
                                        fontWeight: 600,
                                        fontSize: '15px',
                                        transition: 'all 0.3s ease',
                                        backdropFilter: 'blur(10px)',
                                        marginRight: '8px'
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
                                    <i className="fas fa-plus me-2"></i>Registrar Gasto
                                </button>
                                <button 
                                    className="btn"
                                    onClick={this.Imprimir}
                                    style={{
                                        background: 'rgba(255,255,255,0.2)',
                                        border: '2px solid rgba(255,255,255,0.3)',
                                        color: 'white',
                                        borderRadius: '12px',
                                        padding: '12px 24px',
                                        fontWeight: 600,
                                        fontSize: '15px',
                                        transition: 'all 0.3s ease',
                                        backdropFilter: 'blur(10px)',
                                        marginRight: '8px'
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
                                    <i className="fas fa-print me-2"></i>Imprimir
                                </button>
                                <CSVLink 
                                    data={csvData}
                                    className="btn"
                                    style={{
                                        background: 'rgba(255,255,255,0.2)',
                                        border: '2px solid rgba(255,255,255,0.3)',
                                        color: 'white',
                                        borderRadius: '12px',
                                        padding: '12px 24px',
                                        fontWeight: 600,
                                        fontSize: '15px',
                                        transition: 'all 0.3s ease',
                                        backdropFilter: 'blur(10px)',
                                        textDecoration: 'none'
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
                                    <i className="fas fa-file-csv me-2"></i>Exportar CSV
                                </CSVLink>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filtros de búsqueda */}
                <div className="card border-0 shadow-sm mb-4" style={{ 
                    borderRadius: '16px',
                    overflow: 'hidden',
                    animation: 'slideUp 0.6s ease'
                }}>
                    <div className="card-body p-4">
                        <h5 className="mb-3" style={{ fontWeight: 600, color: '#495057' }}>
                            <i className="fas fa-filter me-2" style={{ color: '#1c1c1e' }}></i>
                            Filtros de Búsqueda
                        </h5>
                        <div className="row">
                            <div className="col-12 col-md-3 mb-3">
                                <label style={{ fontWeight: 600, color: '#495057', marginBottom: '8px', display: 'block', fontSize: '14px' }}>
                                    <i className="fas fa-calendar-alt me-2"></i>Fecha Inicial
                                </label>
                                <input 
                                    type="date" 
                                    id="fecha_inicial" 
                                    className="form-control"
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
                            <div className="col-12 col-md-3 mb-3">
                                <label style={{ fontWeight: 600, color: '#495057', marginBottom: '8px', display: 'block', fontSize: '14px' }}>
                                    <i className="fas fa-calendar-check me-2"></i>Fecha Final
                                </label>
                                <input 
                                    type="date" 
                                    id="fecha_final" 
                                    className="form-control"
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
                            <div className="col-12 col-md-3 mb-3">
                                <label style={{ fontWeight: 600, color: '#495057', marginBottom: '8px', display: 'block', fontSize: '14px' }}>
                                    <i className="fas fa-search me-2"></i>ID de Factura
                                </label>
                                <input 
                                    type='text' 
                                    id="gasto_id" 
                                    className='form-control'
                                    onChange={this.buscar_gasto} 
                                    placeholder='Buscar por ID...'
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
                            <div className="col-12 col-md-3 mb-3 d-flex align-items-end">
                                <button 
                                    className="btn w-100"
                                    onClick={this.buscar_gasto_fecha}
                                    style={{
                                        background: 'linear-gradient(135deg, #2d2d2f 0%, #1c1c1e 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        padding: '12px 24px',
                                        fontWeight: 600,
                                        fontSize: '15px',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 4px 12px rgba(28, 28, 30, 0.3)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.transform = 'translateY(-2px)';
                                        e.target.style.boxShadow = '0 6px 16px rgba(28, 28, 30, 0.4)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = '0 4px 12px rgba(28, 28, 30, 0.3)';
                                    }}
                                >
                                    <i className="fas fa-search me-2"></i>Buscar
                                </button>
                            </div>
                        </div>
                        
                        {/* Total de gastos */}
                        <div className="card border-0 mt-3" style={{ 
                            background: 'linear-gradient(135deg, #2d2d2f 0%, #1c1c1e 100%)',
                            borderRadius: '12px',
                            overflow: 'hidden'
                        }}>
                            <div className="card-body text-white p-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h5 className="mb-0" style={{ fontWeight: 600, fontSize: '16px' }}>
                                            Total en Gastos
                                        </h5>
                                        <p className="mb-0" style={{ opacity: 0.9, fontSize: '13px' }}>
                                            Suma total del período seleccionado
                                        </p>
                                    </div>
                                    <div style={{
                                        fontSize: '28px',
                                        fontWeight: 700
                                    }}>
                                        {new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(this.state.monto_gasto)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabla de gastos */}
                <div className="card border-0 shadow-sm mb-4" style={{ 
                    borderRadius: '16px',
                    overflow: 'hidden',
                    animation: 'slideUp 0.7s ease'
                }} id="reportes">
                    <div className="card-body p-0">
                        {this.state.registros.length === 0 ? (
                            <div className="text-center py-5">
                                <i className="fas fa-receipt fa-4x text-muted mb-3" style={{ opacity: 0.3 }}></i>
                                <h5 className="text-muted mb-2">No se encontraron gastos</h5>
                                <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                                    Registra un nuevo gasto o ajusta los filtros de búsqueda
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
                                            }}>Factura</th>
                                            <th style={{ 
                                                fontWeight: 600, 
                                                fontSize: '13px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                color: '#495057',
                                                padding: '15px 20px',
                                                border: 'none'
                                            }}>Suplidor</th>
                                            <th style={{ 
                                                fontWeight: 600, 
                                                fontSize: '13px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                color: '#495057',
                                                padding: '15px 20px',
                                                border: 'none'
                                            }}>Forma de Pago</th>
                                            <th style={{ 
                                                fontWeight: 600, 
                                                fontSize: '13px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                color: '#495057',
                                                padding: '15px 20px',
                                                border: 'none'
                                            }}>Tipo de Gasto</th>
                                            <th style={{ 
                                                fontWeight: 600, 
                                                fontSize: '13px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                color: '#495057',
                                                padding: '15px 20px',
                                                border: 'none'
                                            }}>Comprobante</th>
                                            <th style={{ 
                                                fontWeight: 600, 
                                                fontSize: '13px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                color: '#495057',
                                                padding: '15px 20px',
                                                border: 'none',
                                                textAlign: 'right'
                                            }}>ITEBIS</th>
                                            <th style={{ 
                                                fontWeight: 600, 
                                                fontSize: '13px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                color: '#495057',
                                                padding: '15px 20px',
                                                border: 'none',
                                                textAlign: 'right'
                                            }}>Bruto</th>
                                            <th style={{ 
                                                fontWeight: 600, 
                                                fontSize: '13px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                color: '#495057',
                                                padding: '15px 20px',
                                                border: 'none',
                                                textAlign: 'right'
                                            }}>Total</th>
                                            <th style={{ 
                                                fontWeight: 600, 
                                                fontSize: '13px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                color: '#495057',
                                                padding: '15px 20px',
                                                border: 'none'
                                            }}>Fecha</th>
                                            <th style={{ 
                                                fontWeight: 600, 
                                                fontSize: '13px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                color: '#495057',
                                                padding: '15px 20px',
                                                border: 'none',
                                                textAlign: 'center'
                                            }}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.state.registros.map((data, index) => (
                                            <tr 
                                                key={data.id || index}
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
                                                    #{data.id}
                                                </td>
                                                <td style={{ padding: '15px 20px', verticalAlign: 'middle', color: '#495057' }}>
                                                    {data.nombre || 'N/A'}
                                                </td>
                                                <td style={{ padding: '15px 20px', verticalAlign: 'middle' }}>
                                                    <span className="badge" style={{
                                                        background: data.tipo_de_pago === 'Efectivo' 
                                                            ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'
                                                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                        color: 'white',
                                                        padding: '6px 12px',
                                                        borderRadius: '8px',
                                                        fontSize: '12px',
                                                        fontWeight: 600
                                                    }}>
                                                        {data.tipo_de_pago || 'N/A'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '15px 20px', verticalAlign: 'middle', color: '#495057' }}>
                                                    {data.tipo_de_gasto || 'N/A'}
                                                </td>
                                                <td style={{ padding: '15px 20px', verticalAlign: 'middle', color: '#495057', fontSize: '13px' }}>
                                                    {data.comprobante_fiscal || 'N/A'}
                                                </td>
                                                <td style={{ padding: '15px 20px', verticalAlign: 'middle', textAlign: 'right', color: '#495057', fontWeight: 500 }}>
                                                    {new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(data.itebis || 0)}
                                                </td>
                                                <td style={{ padding: '15px 20px', verticalAlign: 'middle', textAlign: 'right', color: '#495057', fontWeight: 500 }}>
                                                    {new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(data.total || 0)}
                                                </td>
                                                <td style={{ padding: '15px 20px', verticalAlign: 'middle', textAlign: 'right', color: '#28a745', fontWeight: 600, fontSize: '15px' }}>
                                                    {new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format((data.total || 0) + (data.itebis || 0))}
                                                </td>
                                                <td style={{ padding: '15px 20px', verticalAlign: 'middle', color: '#495057', fontSize: '13px' }}>
                                                    {data.fecha_registro ? new Date(data.fecha_registro).toLocaleDateString('es-DO') : 'N/A'}
                                                </td>
                                                <td style={{ padding: '15px 20px', verticalAlign: 'middle', textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                                        <button
                                                            className="btn btn-sm"
                                                            onClick={(e)=>this.ver_detalles_gasto(data)}
                                                            style={{
                                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '8px',
                                                                padding: '8px 16px',
                                                                fontWeight: 600,
                                                                fontSize: '13px',
                                                                transition: 'all 0.2s ease',
                                                                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                                                                minWidth: '90px'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.target.style.transform = 'translateY(-2px)';
                                                                e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.target.style.transform = 'translateY(0)';
                                                                e.target.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
                                                            }}
                                                        >
                                                            <i className="fas fa-eye me-1"></i>Ver
                                                        </button>
                                                        <button
                                                            className="btn btn-sm"
                                                            onClick={(e)=>this.actualizando_gasto(data)}
                                                            style={{
                                                                background: 'linear-gradient(135deg, #2d2d2f 0%, #1c1c1e 100%)',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '8px',
                                                                padding: '8px 16px',
                                                                fontWeight: 600,
                                                                fontSize: '13px',
                                                                transition: 'all 0.2s ease',
                                                                boxShadow: '0 2px 8px rgba(28, 28, 30, 0.3)',
                                                                minWidth: '90px'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.target.style.transform = 'translateY(-2px)';
                                                                e.target.style.boxShadow = '0 4px 12px rgba(28, 28, 30, 0.4)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.target.style.transform = 'translateY(0)';
                                                                e.target.style.boxShadow = '0 2px 8px rgba(28, 28, 30, 0.3)';
                                                            }}
                                                        >
                                                            <i className="fas fa-edit me-1"></i>Editar
                                                        </button>
                                                        <button
                                                            className="btn btn-sm"
                                                            onClick={(e)=>this.eliminar_gasto(data.id)}
                                                            style={{
                                                                background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '8px',
                                                                padding: '8px 16px',
                                                                fontWeight: 600,
                                                                fontSize: '13px',
                                                                transition: 'all 0.2s ease',
                                                                boxShadow: '0 2px 8px rgba(220, 53, 69, 0.3)',
                                                                minWidth: '90px'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.target.style.transform = 'translateY(-2px)';
                                                                e.target.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.4)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.target.style.transform = 'translateY(0)';
                                                                e.target.style.boxShadow = '0 2px 8px rgba(220, 53, 69, 0.3)';
                                                            }}
                                                        >
                                                            <i className="fas fa-trash me-1"></i>Eliminar
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot style={{ 
                                        background: 'linear-gradient(135deg, #2d2d2f 0%, #1c1c1e 100%)',
                                        color: 'white'
                                    }}>
                                        <tr>
                                            <td colSpan="8" style={{ 
                                                padding: '20px',
                                                textAlign: 'right',
                                                fontWeight: 700,
                                                fontSize: '18px',
                                                border: 'none'
                                            }}>
                                                TOTAL GENERAL
                                            </td>
                                            <td colSpan="2" style={{ 
                                                padding: '20px',
                                                textAlign: 'right',
                                                fontWeight: 700,
                                                fontSize: '20px',
                                                border: 'none'
                                            }}>
                                                {new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(this.state.monto_gasto)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal para Registrar Gasto */}
                {this.state.modalGastoVisible && (
                    <div 
                        className="modal fade show" 
                        style={{ 
                            display: 'block', 
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            zIndex: 1050
                        }}
                        onClick={this.cerrarModalGasto}
                    >
                        <div 
                            className="modal-dialog modal-lg modal-dialog-centered"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                maxWidth: '700px'
                            }}
                        >
                            <div className="modal-content" style={{
                                borderRadius: '20px',
                                border: 'none',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                                overflow: 'hidden'
                            }}>
                                {/* Header del Modal */}
                                <div style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    padding: '25px 30px',
                                    borderBottom: 'none'
                                }}>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center">
                                            <div style={{
                                                width: '50px',
                                                height: '50px',
                                                borderRadius: '12px',
                                                background: 'rgba(255,255,255,0.2)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginRight: '15px',
                                                fontSize: '24px'
                                            }}>
                                                <i className="fas fa-receipt"></i>
                                            </div>
                                            <div>
                                                <h4 className="mb-0" style={{ fontWeight: 700, fontSize: '24px' }}>
                                                    Registrar Nuevo Gasto
                                                </h4>
                                                <p className="mb-0" style={{ opacity: 0.9, fontSize: '14px' }}>
                                                    Complete el formulario para registrar el gasto
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            className="btn-close btn-close-white"
                                            onClick={this.cerrarModalGasto}
                                            style={{
                                                background: 'rgba(255,255,255,0.2)',
                                                borderRadius: '8px',
                                                padding: '8px',
                                                opacity: 1
                                            }}
                                        ></button>
                                    </div>
                                </div>

                                {/* Body del Modal */}
                                <div className="modal-body" style={{ padding: '30px' }}>
                                    <div className="row">
                                        <div className="col-12 col-md-6 mb-3">
                                            <label style={{ fontWeight: 600, color: '#495057', marginBottom: '8px', display: 'block', fontSize: '14px' }}>
                                                <i className="fas fa-tag me-2"></i>Tipo de Gasto
                                            </label>
                                            <select
                                                name="tipo_de_gasto"
                                                value={this.state.formGasto.tipo_de_gasto}
                                                onChange={this.handleInputChange}
                                                className="form-control"
                                                style={{
                                                    borderRadius: '12px',
                                                    border: '2px solid #e0e0e0',
                                                    padding: '14px 16px',
                                                    fontSize: '15px',
                                                    minHeight: '50px',
                                                    height: 'auto',
                                                    lineHeight: '1.5',
                                                    transition: 'all 0.2s ease',
                                                    appearance: 'none',
                                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                                                    backgroundRepeat: 'no-repeat',
                                                    backgroundPosition: 'right 16px center',
                                                    paddingRight: '40px'
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
                                                <option>Materiales Gastable</option>
                                                <option>Instrumentos de Odontologia</option>
                                                <option>Varios</option>
                                            </select>
                                        </div>
                                        <div className="col-12 col-md-6 mb-3">
                                            <label style={{ fontWeight: 600, color: '#495057', marginBottom: '8px', display: 'block', fontSize: '14px' }}>
                                                <i className="fas fa-money-bill-wave me-2"></i>Tipo de Pago
                                            </label>
                                            <select
                                                name="tipo_de_pago"
                                                value={this.state.formGasto.tipo_de_pago}
                                                onChange={this.handleInputChange}
                                                className="form-control"
                                                style={{
                                                    borderRadius: '12px',
                                                    border: '2px solid #e0e0e0',
                                                    padding: '14px 16px',
                                                    fontSize: '15px',
                                                    minHeight: '50px',
                                                    height: 'auto',
                                                    lineHeight: '1.5',
                                                    transition: 'all 0.2s ease',
                                                    appearance: 'none',
                                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                                                    backgroundRepeat: 'no-repeat',
                                                    backgroundPosition: 'right 16px center',
                                                    paddingRight: '40px'
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
                                                <option>Efectivo</option>
                                                <option>Tarjeta</option>
                                            </select>
                                        </div>
                                        <div className="col-12 mb-3">
                                            <label style={{ fontWeight: 600, color: '#495057', marginBottom: '8px', display: 'block', fontSize: '14px' }}>
                                                <i className="fas fa-truck me-2"></i>Seleccione el Suplidor
                                            </label>
                                            <select
                                                name="suplidor_id"
                                                value={this.state.formGasto.suplidor_id}
                                                onChange={this.handleInputChange}
                                                className="form-control"
                                                style={{
                                                    borderRadius: '12px',
                                                    border: '2px solid #e0e0e0',
                                                    padding: '14px 16px',
                                                    fontSize: '15px',
                                                    minHeight: '50px',
                                                    height: 'auto',
                                                    lineHeight: '1.5',
                                                    transition: 'all 0.2s ease',
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
                                                <option value="">Seleccione un suplidor</option>
                                                {this.state.suplidores.map(suplidor => (
                                                    <option key={suplidor.id} value={suplidor.id}>
                                                        {suplidor.nombre} | RNC: {suplidor.rnc_suplidor}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-12 col-md-6 mb-3">
                                            <label style={{ fontWeight: 600, color: '#495057', marginBottom: '8px', display: 'block', fontSize: '14px' }}>
                                                <i className="fas fa-dollar-sign me-2"></i>Monto Bruto
                                            </label>
                                            <input
                                                type="number"
                                                name="total"
                                                value={this.state.formGasto.total}
                                                onChange={this.handleInputChange}
                                                className="form-control"
                                                placeholder="0.00"
                                                step="0.01"
                                                style={{
                                                    borderRadius: '12px',
                                                    border: '2px solid #e0e0e0',
                                                    padding: '14px 16px',
                                                    fontSize: '15px',
                                                    minHeight: '50px',
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
                                        <div className="col-12 col-md-6 mb-3">
                                            <label style={{ fontWeight: 600, color: '#495057', marginBottom: '8px', display: 'block', fontSize: '14px' }}>
                                                <i className="fas fa-percent me-2"></i>ITEBIS
                                            </label>
                                            <input
                                                type="number"
                                                name="itebis"
                                                value={this.state.formGasto.itebis}
                                                onChange={this.handleInputChange}
                                                className="form-control"
                                                placeholder="0.00"
                                                step="0.01"
                                                style={{
                                                    borderRadius: '12px',
                                                    border: '2px solid #e0e0e0',
                                                    padding: '14px 16px',
                                                    fontSize: '15px',
                                                    minHeight: '50px',
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
                                        <div className="col-12 mb-3">
                                            <label style={{ fontWeight: 600, color: '#495057', marginBottom: '8px', display: 'block', fontSize: '14px' }}>
                                                <i className="fas fa-file-invoice me-2"></i>Comprobante Fiscal
                                            </label>
                                            <input
                                                type="text"
                                                name="comprobante_fiscal"
                                                value={this.state.formGasto.comprobante_fiscal}
                                                onChange={this.handleInputChange}
                                                className="form-control"
                                                placeholder="Número de comprobante fiscal"
                                                style={{
                                                    borderRadius: '12px',
                                                    border: '2px solid #e0e0e0',
                                                    padding: '14px 16px',
                                                    fontSize: '15px',
                                                    minHeight: '50px',
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
                                        <div className="col-12 mb-3">
                                            <label style={{ fontWeight: 600, color: '#495057', marginBottom: '8px', display: 'block', fontSize: '14px' }}>
                                                <i className="fas fa-align-left me-2"></i>Descripción
                                            </label>
                                            <textarea
                                                name="descripcion"
                                                value={this.state.formGasto.descripcion}
                                                onChange={this.handleInputChange}
                                                className="form-control"
                                                rows="4"
                                                placeholder="Descripción detallada del gasto..."
                                                style={{
                                                    borderRadius: '12px',
                                                    border: '2px solid #e0e0e0',
                                                    padding: '14px 16px',
                                                    fontSize: '15px',
                                                    minHeight: '120px',
                                                    transition: 'all 0.2s ease',
                                                    resize: 'vertical',
                                                    lineHeight: '1.5'
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
                                    </div>
                                </div>

                                {/* Footer del Modal */}
                                <div className="modal-footer" style={{
                                    padding: '25px 30px',
                                    borderTop: '1px solid #f0f0f0',
                                    background: '#f8f9fa'
                                }}>
                                    <div className="d-flex w-100 justify-content-end" style={{ gap: '16px' }}>
                                        <button
                                            type="button"
                                            className="btn"
                                            onClick={this.cerrarModalGasto}
                                            style={{
                                                background: 'linear-gradient(135deg, #8e8e93 0%, #a8a8a8 100%)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '12px',
                                                padding: '12px 28px',
                                                fontWeight: 600,
                                                fontSize: '15px',
                                                transition: 'all 0.3s ease',
                                                boxShadow: '0 4px 12px rgba(142, 142, 147, 0.3)',
                                                minWidth: '140px'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.transform = 'translateY(-2px)';
                                                e.target.style.boxShadow = '0 6px 16px rgba(142, 142, 147, 0.4)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.transform = 'translateY(0)';
                                                e.target.style.boxShadow = '0 4px 12px rgba(142, 142, 147, 0.3)';
                                            }}
                                        >
                                            <i className="fas fa-times me-2"></i>Cancelar
                                        </button>
                                        <button
                                            type="button"
                                            className="btn"
                                            onClick={this.guardarGasto}
                                            style={{
                                                background: 'linear-gradient(135deg, #2d2d2f 0%, #1c1c1e 100%)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '12px',
                                                padding: '12px 28px',
                                                fontWeight: 600,
                                                fontSize: '15px',
                                                transition: 'all 0.3s ease',
                                                boxShadow: '0 4px 12px rgba(28, 28, 30, 0.3)',
                                                minWidth: '160px'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.transform = 'translateY(-2px)';
                                                e.target.style.boxShadow = '0 6px 16px rgba(28, 28, 30, 0.4)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.transform = 'translateY(0)';
                                                e.target.style.boxShadow = '0 4px 12px rgba(28, 28, 30, 0.3)';
                                            }}
                                        >
                                            <i className="fas fa-save me-2"></i>Registrar Gasto
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
       );


    }




}

export default Gasto;



