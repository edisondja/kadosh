import React, { Component } from 'react';

/*
export default function  BotonesControl(props){

return(
    <div><td><button className="btn btn-success" onClick={(e)=>props.actualizar(props.data)}>Actualizar</button></td>
    <td><button className="btn btn-primary" onClick={(e)=>props.eliminar(props.data)}>Eliminar</button></td></div>
 )
}*/


class BotonesGastos extends React.Component{


    constructor(props){
        super(props)
    }



    render(){

        return(
            <div><td><button className="btn btn-success" onClick={(e)=>this.props.actualizar(this.props.data)}>Actualizar</button></td>
            <td><button className="btn btn-primary" onClick={(e)=>this.props.eliminar(this.props.data)}>Eliminar</button></td></div>
         )

    }




}

export default BotonesGastos;