import React from 'react';
import Axios from 'axios';
import Alertify from 'alertifyjs';
import FuncionesExtras from './funciones_extras';
import FacturaInterfaz from './factura_interfaz';
import { getPrintStyles, getPrintHeader } from './plantilla_impresion';
import '../css/dashboard.css';
import Nomina from './nomina';
import { Doughnut,Bar} from 'react-chartjs-2';
import Reporte_grafic from './reporte_grafico';

class Reporte extends React.Component{


        constructor(props){
            super(props);
            this.state={
                data:[],contador:false,recibos:[],monto_total:0,valor:89,semena:[],
                Lunes:200,Martes:0,Miercoles:0,
                Jueves:0,Viernes:0,Sabado:0,menu_select:"reportes_graficos",
                fecha_inicial_reporte:'',fecha_final_reporte:''
           }
        }

        chartReference = {};
    
        componentDidMount(){
                console.log(this.chartReference);
                this.consultarDataSemana();
                this.reportes('normal');
               // this.setState({Lunes:this.state.semana[0].monto});
            
               // this.calcular_ingreso_semanal(this.state.recibos_semana);

               // console.log(this.state.recibos_semana);
        }

        ver_reportes=()=>{

            this.setState({menu_select:"reportes"})

        }

        ver_nominas=()=>{

            this.setState({menu_select:"nominas"})

        }

        ver_reportes_graficos=()=>{

            this.setState({menu_select:"reportes_graficos"})
        }


        consultarDataSemana=(config='hoy')=>{
            let url= "";
                if(config=='hoy'){
                        
                    url =  `${FuncionesExtras.url_base}/api/ingresos_de_semana/hoy`;
                
                }else{
                    let fecha_semana = document.getElementById("fecha_semana").value;
                    url =  `${FuncionesExtras.url_base}/api/ingresos_de_semana/${fecha_semana}`;

                }

                Axios.get(`${url}`).then(data=>{  
                 //  this.setState({Lunes:data.data.Monday[0].monto});
                 this.setState({
                    Lunes:data.data.lunes,
                    Martes:data.data.martes,
                    Miercoles:data.data.miercoles,
                    Jueves:data.data.jueves,
                    Viernes:data.data.viernes,
                    Sabado:data.data.sabado
                  });


                }).catch(error=>{
                        Alertify.error("No se pudo cargar la data del mes");
                });
        }
        
        formatearFechaPerfil = (s) => {
            if (!s) return '';
            const [y, m, d] = String(s).split('-');
            return d && m && y ? `${d}/${m}/${y}` : s;
        }

        Imprimir = () => {
            try {
                const contenedor = document.getElementById("reportes");
                if (!contenedor) {
                    Alertify.warning("No hay contenido para imprimir. Busque un reporte primero.");
                    return;
                }
                const config = FuncionesExtras.Config || {};
                const fi = this.state.fecha_inicial_reporte;
                const ff = this.state.fecha_final_reporte;
                const periodoTexto = (fi && ff) ? ('Período: ' + this.formatearFechaPerfil(fi) + ' al ' + this.formatearFechaPerfil(ff)) : 'Resumen de facturación por período';
                const header = getPrintHeader(
                    config.app_logo || '',
                    config.name_company || '',
                    'Reporte de Ingresos (Recibos)',
                    periodoTexto
                );
                const ventimp = window.open('', 'popimpr', 'width=800,height=600');
                if (!ventimp) {
                    Alertify.error("Permita ventanas emergentes para poder imprimir.");
                    return;
                }
                const titulo = (config.name_company || 'Reporte').substring(0, 40).replace(/</g, '');
                ventimp.document.write(
                    '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Reporte de Ingresos - ' + titulo + '</title>' + getPrintStyles() + '</head><body>' + header + '<div class="print-body">' + contenedor.innerHTML + '</div></body></html>'
                );
                ventimp.document.close();
                setTimeout(function() { ventimp.focus(); ventimp.print(); ventimp.close(); }, 500);
            } catch (e) {
                Alertify.error("Error al imprimir: " + (e.message || String(e)));
            }
        }

        reportes=(config='normal')=>{
            var fecha_inicial;
            var fecha_final;

            if(config==='normal'){
                var f = new Date();
                fecha_inicial = f.getFullYear() + "-" + String(f.getMonth() + 1).padStart(2, '0') + "-" + String(f.getDate()).padStart(2, '0');
                fecha_final = fecha_inicial;
            }else if(config==='consultar_fechas'){
                fecha_inicial = document.getElementById('fecha_inicial').value;
                fecha_final = document.getElementById('fecha_final').value;  
            }
            if (!fecha_inicial || !fecha_final) return;
            Axios.get(`${FuncionesExtras.url_base}/api/facturas_reportes/${fecha_inicial}/${fecha_final}`).then(data=>{
                this.setState({
                    recibos: data.data.recibos,
                    monto_total: data.data.monto_total,
                    fecha_inicial_reporte: fecha_inicial,
                    fecha_final_reporte: fecha_final
                });
           }).catch(error=>{
                Alertify.error(error);
           })
        }
        
        render(){

            
            let ver="";
            if(this.state.menu_select=="reportes")
            
            {

                ver = (
                    <>
                        <style>{`
                            @keyframes fadeIn {
                                from { opacity: 0; transform: translateY(10px); }
                                to { opacity: 1; transform: translateY(0); }
                            }
                        `}</style>
                        <div style={{ 
                            animation: 'fadeIn 0.5s ease',
                            backgroundColor: '#f5f5f7',
                            minHeight: '100vh',
                            padding: '30px',
                            borderRadius: '16px'
                        }}>
                            <div className="card border-0 shadow-lg mb-4" style={{ 
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                overflow: 'hidden'
                            }}>
                                <div className="card-body text-white p-4">
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
                                            <i className="fas fa-file-alt"></i>
                                        </div>
                                        <div>
                                            <h3 className="mb-0" style={{ fontWeight: 700, fontSize: '28px' }}>
                                                Reportes de Facturación
                                            </h3>
                                            <p className="mb-0" style={{ opacity: 0.9, fontSize: '14px' }}>
                                                Consulta los reportes por rango de fechas
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                                <div className="card-body p-4">
                                    <div className="row align-items-end">
                                        <div className="col-md-3 mb-3">
                                            <label style={{ fontWeight: 600, color: '#495057', marginBottom: '8px', display: 'block' }}>
                                                Fecha Inicial
                                            </label>
                                            <input 
                                                id="fecha_inicial" 
                                                type="date" 
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
                                        <div className="col-md-3 mb-3">
                                            <label style={{ fontWeight: 600, color: '#495057', marginBottom: '8px', display: 'block' }}>
                                                Fecha Final
                                            </label>
                                            <input 
                                                id="fecha_final" 
                                                type="date" 
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
                                        <div className="col-md-6 mb-3 text-end">
                                            <button 
                                                className="btn" 
                                                onClick={()=>this.reportes('consultar_fechas')}
                                                style={{
                                                    background: 'linear-gradient(135deg, #2d2d2f 0%, #1c1c1e 100%)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '12px',
                                                    padding: '12px 28px',
                                                    fontWeight: 600,
                                                    fontSize: '15px',
                                                    marginRight: '10px',
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
                                            <button 
                                                className="btn" 
                                                onClick={this.Imprimir}
                                                style={{
                                                    background: 'linear-gradient(135deg, #8e8e93 0%, #a8a8a8 100%)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '12px',
                                                    padding: '12px 28px',
                                                    fontWeight: 600,
                                                    fontSize: '15px',
                                                    transition: 'all 0.3s ease',
                                                    boxShadow: '0 4px 12px rgba(142, 142, 147, 0.3)'
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
                                                <i className="fas fa-print me-2"></i>Imprimir
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div id="reportes">
                                <div className="reporte-print-header">
                                    <h1>Reporte de Recibos</h1>
                                    <p>Resumen de facturación por período</p>
                                    {this.state.fecha_inicial_reporte && this.state.fecha_final_reporte && (
                                        <p style={{ marginTop: '6px', fontWeight: 600, color: '#495057', fontSize: '14px' }}>
                                            Período: {this.formatearFechaPerfil(this.state.fecha_inicial_reporte)} al {this.formatearFechaPerfil(this.state.fecha_final_reporte)}
                                        </p>
                                    )}
                                </div>
                                <div className="card border-0 shadow-sm" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                                    <div className="card-body p-0">
                                        {this.state.recibos.length === 0 ? (
                                            <div className="text-center py-5">
                                                <i className="fas fa-file-alt fa-4x text-muted mb-3" style={{ opacity: 0.3 }}></i>
                                                <h5 className="text-muted mb-2">No hay reportes para mostrar</h5>
                                                <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                                                    Seleccione un rango de fechas y haga clic en Buscar
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
                                                            }}>Código</th>
                                                            <th style={{ 
                                                                fontWeight: 600, 
                                                                fontSize: '13px',
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.5px',
                                                                color: '#495057',
                                                                padding: '15px 20px',
                                                                border: 'none'
                                                            }}>Doctor</th>
                                                            <th style={{ 
                                                                fontWeight: 600, 
                                                                fontSize: '13px',
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.5px',
                                                                color: '#495057',
                                                                padding: '15px 20px',
                                                                border: 'none'
                                                            }}>Paciente</th>
                                                            <th style={{ 
                                                                fontWeight: 600, 
                                                                fontSize: '13px',
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.5px',
                                                                color: '#495057',
                                                                padding: '15px 20px',
                                                                border: 'none'
                                                            }}>Concepto</th>
                                                            <th style={{ 
                                                                fontWeight: 600, 
                                                                fontSize: '13px',
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.5px',
                                                                color: '#495057',
                                                                padding: '15px 20px',
                                                                border: 'none'
                                                            }}>Tipo de Pago</th>
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
                                                                border: 'none'
                                                            }}>Fecha</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {this.state.recibos.map((data, index) => (
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
                                                                    {data.codigo_recibo}
                                                                </td>
                                                                <td style={{ padding: '15px 20px', verticalAlign: 'middle', color: '#495057' }}>
                                                                    {data?.factura?.doctor
                                                                        ? `${data.factura.doctor.nombre} ${data.factura.doctor.apellido}`
                                                                        : "Sin doctor"}
                                                                </td>
                                                                <td style={{ padding: '15px 20px', verticalAlign: 'middle', color: '#495057' }}>
                                                                    {data?.factura?.paciente
                                                                        ? `${data.factura.paciente.nombre} ${data.factura.paciente.apellido}`
                                                                        : "Sin paciente"}
                                                                </td>
                                                                <td style={{ padding: '15px 20px', verticalAlign: 'middle', color: '#6c757d', fontSize: '14px' }}>
                                                                    {data.concepto_pago}
                                                                </td>
                                                                <td style={{ padding: '15px 20px', verticalAlign: 'middle', color: '#6c757d', fontSize: '14px' }}>
                                                                    {(data.tipo_de_pago || '').replace(/tarjeto/i, 'tarjeta')}
                                                                </td>
                                                                <td style={{ padding: '15px 20px', verticalAlign: 'middle', fontWeight: 600, color: '#28a745', fontSize: '15px' }}>
                                                                    ${new Intl.NumberFormat().format(data.monto)}
                                                                </td>
                                                                <td style={{ padding: '15px 20px', verticalAlign: 'middle', color: '#6c757d', fontSize: '14px' }}>
                                                                    {data.fecha_pago}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                    <tfoot style={{ background: '#f1f3f5', borderTop: '2px solid #1a1a2e' }}>
                                                        <tr>
                                                            <td colSpan="6" style={{ padding: '12px 20px', fontWeight: 700, fontSize: '14px', color: '#1a1a2e' }}>
                                                                Ingresos Totales (Recibos)
                                                            </td>
                                                            <td style={{ padding: '12px 20px', fontWeight: 700, fontSize: '16px', color: '#1a1a2e', textAlign: 'right' }}>
                                                                $RD {new Intl.NumberFormat().format(this.state.monto_total)}
                                                            </td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="reporte-print-total print-total-page card border-0 shadow-sm mt-4 no-en-impresion" style={{ 
                                    borderRadius: '16px',
                                    background: 'linear-gradient(135deg, #2d2d2f 0%, #1c1c1e 100%)',
                                    overflow: 'hidden'
                                }}>
                                    <div className="card-body text-white p-4 d-flex justify-content-between align-items-center">
                                        <div>
                                            <h4 className="mb-0 label fw-bold" style={{ fontWeight: 700, fontSize: '24px' }}>
                                                Ingresos Totales (Recibos)
                                            </h4>
                                            <p className="mb-0 fw-bold" style={{ opacity: 0.9, fontSize: '14px', fontWeight: 700 }}>
                                                Suma total del período seleccionado
                                            </p>
                                        </div>
                                        <div className="monto fw-bold" style={{ fontSize: '32px', fontWeight: 700 }}>
                                            $RD {new Intl.NumberFormat().format(this.state.monto_total)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                );

            }else if(this.state.menu_select=="reportes_graficos"){

                ver =<Reporte_grafic lunes={this.state.Lunes} Martes={this.state.Martes} Miercoles={this.state.Miercoles} Jueves={this.state.jueves} Viernes={this.state.Viernes} Sabado={this.state.Sabado}/>

            }else if(this.state.menu_select=="nominas"){

                ver = <Nomina/>;

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
                    <div className="col-md-10" style={{ 
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
                                            <i className="fas fa-chart-line"></i>
                                        </div>
                                        <div>
                                            <h2 className="mb-0" style={{ fontWeight: 700, fontSize: '32px' }}>
                                                Reportes y Estadísticas
                                            </h2>
                                            <p className="mb-0" style={{ opacity: 0.9, fontSize: '15px' }}>
                                                Analiza los ingresos y rendimientos de la clínica
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{
                                        background: 'rgba(255,255,255,0.2)',
                                        padding: '12px 24px',
                                        borderRadius: '12px',
                                        backdropFilter: 'blur(10px)'
                                    }}>
                                        <div style={{ fontSize: '14px', opacity: 0.9, fontWeight: 700 }}>Ingresos de Hoy</div>
                                        <div style={{ fontSize: '24px', fontWeight: 700 }}>
                                            $RD {new Intl.NumberFormat().format(this.state.monto_total)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Controles de semana */}
                        <div className="card border-0 shadow-sm mb-4" style={{ 
                            borderRadius: '16px', 
                            overflow: 'hidden',
                            animation: 'slideUp 0.6s ease'
                        }}>
                            <div className="card-body p-4">
                                <div className="row align-items-end">
                                    <div className="col-md-4 mb-3">
                                        <label style={{ fontWeight: 600, color: '#495057', marginBottom: '8px', display: 'block' }}>
                                            <i className="fas fa-calendar-alt me-2"></i>
                                            Seleccione la semana
                                        </label>
                                        <input 
                                            type="date" 
                                            className="form-control" 
                                            id="fecha_semana"
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
                                    <div className="col-md-8 mb-3 text-end">
                                        <button 
                                            className="btn" 
                                            onClick={()=>this.consultarDataSemana(true)}
                                            style={{
                                                background: 'linear-gradient(135deg, #2d2d2f 0%, #1c1c1e 100%)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '12px',
                                                padding: '12px 28px',
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
                                            <i className="fas fa-search me-2"></i>Buscar Semana
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navegación de módulos */}
                        <div className="card border-0 shadow-sm mb-4" style={{ 
                            borderRadius: '16px', 
                            overflow: 'hidden',
                            animation: 'slideUp 0.7s ease'
                        }}>
                            <div className="card-body p-4">
                                <div className="d-flex justify-content-center flex-wrap" style={{ gap: '12px' }}>
                                    <button 
                                        className={`btn ${this.state.menu_select === 'reportes_graficos' ? '' : ''}`}
                                        onClick={this.ver_reportes_graficos}
                                        style={{
                                            background: this.state.menu_select === 'reportes_graficos' 
                                                ? 'linear-gradient(135deg, #2d2d2f 0%, #1c1c1e 100%)'
                                                : 'linear-gradient(135deg, #8e8e93 0%, #a8a8a8 100%)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '12px',
                                            padding: '14px 32px',
                                            fontWeight: 600,
                                            fontSize: '15px',
                                            transition: 'all 0.3s ease',
                                            boxShadow: this.state.menu_select === 'reportes_graficos'
                                                ? '0 4px 12px rgba(28, 28, 30, 0.3)'
                                                : '0 4px 12px rgba(142, 142, 147, 0.3)'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (this.state.menu_select !== 'reportes_graficos') {
                                                e.target.style.background = 'linear-gradient(135deg, #a0a0a5 0%, #b8b8b8 100%)';
                                                e.target.style.transform = 'translateY(-2px)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (this.state.menu_select !== 'reportes_graficos') {
                                                e.target.style.background = 'linear-gradient(135deg, #8e8e93 0%, #a8a8a8 100%)';
                                                e.target.style.transform = 'translateY(0)';
                                            }
                                        }}
                                    >
                                        <i className="fas fa-chart-pie me-2"></i>Gráficos
                                    </button>
                                    <button 
                                        className="btn"
                                        onClick={this.ver_reportes}
                                        style={{
                                            background: this.state.menu_select === 'reportes'
                                                ? 'linear-gradient(135deg, #2d2d2f 0%, #1c1c1e 100%)'
                                                : 'linear-gradient(135deg, #8e8e93 0%, #a8a8a8 100%)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '12px',
                                            padding: '14px 32px',
                                            fontWeight: 600,
                                            fontSize: '15px',
                                            transition: 'all 0.3s ease',
                                            boxShadow: this.state.menu_select === 'reportes'
                                                ? '0 4px 12px rgba(28, 28, 30, 0.3)'
                                                : '0 4px 12px rgba(142, 142, 147, 0.3)'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (this.state.menu_select !== 'reportes') {
                                                e.target.style.background = 'linear-gradient(135deg, #a0a0a5 0%, #b8b8b8 100%)';
                                                e.target.style.transform = 'translateY(-2px)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (this.state.menu_select !== 'reportes') {
                                                e.target.style.background = 'linear-gradient(135deg, #8e8e93 0%, #a8a8a8 100%)';
                                                e.target.style.transform = 'translateY(0)';
                                            }
                                        }}
                                    >
                                        <i className="fas fa-file-alt me-2"></i>Reportes
                                    </button>
                                    <button 
                                        className="btn"
                                        onClick={this.ver_nominas}
                                        style={{
                                            background: this.state.menu_select === 'nominas'
                                                ? 'linear-gradient(135deg, #2d2d2f 0%, #1c1c1e 100%)'
                                                : 'linear-gradient(135deg, #8e8e93 0%, #a8a8a8 100%)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '12px',
                                            padding: '14px 32px',
                                            fontWeight: 600,
                                            fontSize: '15px',
                                            transition: 'all 0.3s ease',
                                            boxShadow: this.state.menu_select === 'nominas'
                                                ? '0 4px 12px rgba(28, 28, 30, 0.3)'
                                                : '0 4px 12px rgba(142, 142, 147, 0.3)'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (this.state.menu_select !== 'nominas') {
                                                e.target.style.background = 'linear-gradient(135deg, #a0a0a5 0%, #b8b8b8 100%)';
                                                e.target.style.transform = 'translateY(-2px)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (this.state.menu_select !== 'nominas') {
                                                e.target.style.background = 'linear-gradient(135deg, #8e8e93 0%, #a8a8a8 100%)';
                                                e.target.style.transform = 'translateY(0)';
                                            }
                                        }}
                                    >
                                        <i className="fas fa-users me-2"></i>Nóminas
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Contenido dinámico */}
                        <div style={{ animation: 'fadeIn 0.8s ease' }}>
                            {ver}
                        </div>
                    </div>
                </>
            )

        }

}

export default Reporte;