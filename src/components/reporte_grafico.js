import React from 'react';
import Axios from 'axios';
import Core  from './funciones_extras';
import { Doughnut,Bar} from 'react-chartjs-2';



class Reporte_Grafico extends React.Component{



        constructor(props){
            super(props);
            this.state={
                valor:null
            }


        }



        render(){

            const data = {
                labels: ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'],
                datasets: [
                  {
                    label: 'Detalles de ingreso de la semana',
                    fill: false,
                    lineTension: 0.1,
                    backgroundColor: 'rgba(75,192,192,0.4)',
                    borderColor: 'rgba(75,192,192,1)',
                    borderCapStyle: 'butt',
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    pointBorderColor: 'rgba(75,192,192,1)',
                    pointBackgroundColor: '#fff',
                    pointBorderWidth: 1,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: 'rgba(75,192,192,1)',
                    pointHoverBorderColor: 'rgba(220,220,220,1)',
                    pointHoverBorderWidth: 2,
                    pointRadius: 1,
                    pointHitRadius: 10,
                    data: [this.props.Lunes, this.props.Martes, this.props.Miercoles, this.props.Jueves, this.props.Viernes,this.props.Sabado]
                  }
                ]
              };



            return <Bar  data={data} id="graficos"/>;



        }


}




export default Reporte_Grafico;