import React from 'react';
import Axios from 'axios';
import Alertify from 'alertifyjs';
import Cadena from '../cadena.png';
import Money from '../cash.png';
import Products from '../products.png';
import Gastos from './gastos';
import Suplidor from './suplidores';
import Nomina from '../cartera.png'
import Nominas from './nomina';
import { Router, Route, Switch } from "react-router";

class Contabilidad extends React.Component{

    
    constructor(props){
        super(props);
        this.state={opciones:'suplidor'}
        
    }


    componentDidMount(){

    }


    selectMenu=(opcion)=>{

        this.setState(
            {opciones:opcion}            
        );
    

    }


    


    render(){

                    /*<Gastos/>
                    <Suplidor imagen={Cadena} />*/
        let ver2; 
        if(this.state.opciones=='suplidor'){
            ver2 =  <Suplidor/>;
        }else if(this.state.opciones=='gastos'){
            ver2 =  <Gastos/>; 
        
        }else{

            Alertify.message("Este complemento esta desactivado");
        }

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
                                    <i className="fas fa-calculator"></i>
                                </div>
                                <div>
                                    <h2 className="mb-0" style={{ fontWeight: 700, fontSize: '32px' }}>
                                        Administración Financiera
                                    </h2>
                                    <p className="mb-0" style={{ opacity: 0.9, fontSize: '15px' }}>
                                        Gestiona suplidores, gastos y productos del sistema
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Menú de opciones */}
                    <div className="card border-0 shadow-sm mb-4" style={{ 
                        borderRadius: '16px',
                        overflow: 'hidden',
                        animation: 'slideUp 0.6s ease'
                    }}>
                        <div className="card-body p-4">
                            <h5 className="mb-3" style={{ fontWeight: 600, color: '#495057' }}>
                                <i className="fas fa-th-large me-2" style={{ color: '#1c1c1e' }}></i>
                                Módulos Disponibles
                            </h5>
                            <div className="row">
                                <div className="col-6 col-md-4 col-lg-3 mb-3">
                                    <div
                                        onClick={(e) => this.selectMenu('suplidor')}
                                        style={{
                                            background: this.state.opciones === 'suplidor' 
                                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                                : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                                            color: this.state.opciones === 'suplidor' ? 'white' : '#495057',
                                            border: '2px solid',
                                            borderColor: this.state.opciones === 'suplidor' ? 'transparent' : '#e0e0e0',
                                            borderRadius: '16px',
                                            padding: '25px 20px',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            boxShadow: this.state.opciones === 'suplidor' 
                                                ? '0 4px 12px rgba(102, 126, 234, 0.3)'
                                                : '0 2px 8px rgba(0,0,0,0.08)'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (this.state.opciones !== 'suplidor') {
                                                e.currentTarget.style.transform = 'translateY(-5px)';
                                                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.12)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (this.state.opciones !== 'suplidor') {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                                            }
                                        }}
                                    >
                                        <i className="fas fa-link fa-3x mb-3"></i>
                                        <h6 className="mb-0" style={{ fontWeight: 600, fontSize: '15px' }}>Suplidores</h6>
                                    </div>
                                </div>
                                <div className="col-6 col-md-4 col-lg-3 mb-3">
                                    <div
                                        onClick={(e) => this.selectMenu('gastos')}
                                        style={{
                                            background: this.state.opciones === 'gastos' 
                                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                                : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                                            color: this.state.opciones === 'gastos' ? 'white' : '#495057',
                                            border: '2px solid',
                                            borderColor: this.state.opciones === 'gastos' ? 'transparent' : '#e0e0e0',
                                            borderRadius: '16px',
                                            padding: '25px 20px',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            boxShadow: this.state.opciones === 'gastos' 
                                                ? '0 4px 12px rgba(102, 126, 234, 0.3)'
                                                : '0 2px 8px rgba(0,0,0,0.08)'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (this.state.opciones !== 'gastos') {
                                                e.currentTarget.style.transform = 'translateY(-5px)';
                                                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.12)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (this.state.opciones !== 'gastos') {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                                            }
                                        }}
                                    >
                                        <i className="fas fa-coins fa-3x mb-3"></i>
                                        <h6 className="mb-0" style={{ fontWeight: 600, fontSize: '15px' }}>Gastos</h6>
                                    </div>
                                </div>
                                <div className="col-6 col-md-4 col-lg-3 mb-3">
                                    <div
                                        onClick={(e) => this.selectMenu('')}
                                        style={{
                                            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                                            color: '#495057',
                                            border: '2px solid #e0e0e0',
                                            borderRadius: '16px',
                                            padding: '25px 20px',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                            opacity: 0.6
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-5px)';
                                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.12)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                                        }}
                                    >
                                        <i className="fas fa-box-open fa-3x mb-3"></i>
                                        <h6 className="mb-0" style={{ fontWeight: 600, fontSize: '15px' }}>Registrar Productos</h6>
                                        <small style={{ fontSize: '11px', opacity: 0.7 }}>Próximamente</small>
                                    </div>
                                </div>
                                <div className="col-6 col-md-4 col-lg-3 mb-3">
                                    <div
                                        onClick={(e) => this.selectMenu('')}
                                        style={{
                                            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                                            color: '#495057',
                                            border: '2px solid #e0e0e0',
                                            borderRadius: '16px',
                                            padding: '25px 20px',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                            opacity: 0.6
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-5px)';
                                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.12)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                                        }}
                                    >
                                        <i className="fas fa-user-plus fa-3x mb-3"></i>
                                        <h6 className="mb-0" style={{ fontWeight: 600, fontSize: '15px' }}>Registrar Empleado</h6>
                                        <small style={{ fontSize: '11px', opacity: 0.7 }}>Próximamente</small>
                                    </div>
                                </div>
                                <div className="col-6 col-md-4 col-lg-3 mb-3">
                                    <div
                                        onClick={(e) => this.selectMenu('ver_productos')}
                                        style={{
                                            background: this.state.opciones === 'ver_productos' 
                                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                                : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                                            color: this.state.opciones === 'ver_productos' ? 'white' : '#495057',
                                            border: '2px solid',
                                            borderColor: this.state.opciones === 'ver_productos' ? 'transparent' : '#e0e0e0',
                                            borderRadius: '16px',
                                            padding: '25px 20px',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            boxShadow: this.state.opciones === 'ver_productos' 
                                                ? '0 4px 12px rgba(102, 126, 234, 0.3)'
                                                : '0 2px 8px rgba(0,0,0,0.08)'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (this.state.opciones !== 'ver_productos') {
                                                e.currentTarget.style.transform = 'translateY(-5px)';
                                                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.12)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (this.state.opciones !== 'ver_productos') {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                                            }
                                        }}
                                    >
                                        <i className="fas fa-warehouse fa-3x mb-3"></i>
                                        <h6 className="mb-0" style={{ fontWeight: 600, fontSize: '15px' }}>Ver Productos</h6>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contenido del módulo seleccionado */}
                    <div style={{ animation: 'slideUp 0.7s ease' }}>
                        {ver2}
                    </div>
                </div>
            </>
        );
    }






}

export default Contabilidad;