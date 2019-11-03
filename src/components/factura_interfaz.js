import React from 'react';
import ReactDOM from 'react-dom';
import Axios from 'axios';
import Alertify from 'alertifyjs';

class FacturaInterfaz extends React.Component{

    constructor(props){
        super(props);
        this.state= {valor:true};
    }



    render(){
        return (<div className="col-md-4"> 
                <h2>Factura</h2>

        </div>);
    }


}

export default FacturaInterfaz;