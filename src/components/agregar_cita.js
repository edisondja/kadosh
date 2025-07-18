import React from 'react';
import { ReactAgenda, guid } from 'react-agenda';
import 'react-agenda/build/styles.css';
import 'react-datetime/css/react-datetime.css';

require('moment/locale/es'); // idioma en español

const colors = {
  'color-1': "rgba(102, 195, 131 , 1)",
  'color-2': "rgba(242, 177, 52, 1)",
  'color-3': "rgba(235, 85, 59, 1)"
};

// Simulando base de datos
const fetchAppointmentsFromDB = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilWednesday = (3 - dayOfWeek + 7) % 7;
  const wednesday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + daysUntilWednesday);

  return [
    {
      _id: guid(),
      name: 'Reunión con equipo de desarrollo',
      startDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0),
      endDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0),
      classes: 'color-1'
    },
    {
      _id: guid(),
      name: 'Almuerzo de trabajo con Holly',
      startDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 11, 0),
      endDateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 13, 0),
      classes: 'color-2'
    },
    {
      _id: guid(),
      name: 'Evaristo',
      startDateTime: new Date(wednesday.getFullYear(), wednesday.getMonth(), wednesday.getDate(), 11, 0),
      endDateTime: new Date(wednesday.getFullYear(), wednesday.getMonth(), wednesday.getDate(), 13, 0),
      classes: 'color-3'
    }
  ];
};

export default class Agenda extends React.Component {
  constructor(props) {
    super(props);

    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // lunes
    const monday = new Date(today.setDate(diff));

    this.state = {
      items: fetchAppointmentsFromDB(),
      selected: [],
      cellHeight: 30,
      showModal: false,
      locale: 'es',
      rowsPerHour: 2,
      numberOfDays: 7,
      startDate: monday,
      // campos para el formulario
      newName: '',
      newDate: '',
      newStartTime: '',
      newEndTime: '',
      newColor: 'color-1',
    };

    this.handleCellSelection = this.handleCellSelection.bind(this);
    this.handleItemEdit = this.handleItemEdit.bind(this);
    this.handleRangeSelection = this.handleRangeSelection.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.addAppointment = this.addAppointment.bind(this);
  }

  addAppointment(nombre, fecha, horaInicio, horaFin, color = 'color-1') {
    const [hIni, mIni] = horaInicio.split(':').map(Number);
    const [hFin, mFin] = horaFin.split(':').map(Number);

    const startDate = new Date(fecha);
    startDate.setHours(hIni, mIni);

    const endDate = new Date(fecha);
    endDate.setHours(hFin, mFin);

    const nuevaCita = {
      _id: guid(),
      name: nombre,
      startDateTime: startDate,
      endDateTime: endDate,
      classes: color
    };

    this.setState(prev => ({
      items: [...prev.items, nuevaCita],
      // limpiar formulario después de agregar
      newName: '',
      newDate: '',
      newStartTime: '',
      newEndTime: '',
      newColor: 'color-1',
    }));
  }

  handleCellSelection(cellData) {
    // Opcional: agregar cita al hacer click en celda vacía
    const fecha = cellData.startDateTime.toISOString().split('T')[0];
    console.log('Agregar cita en:', fecha);
  }

  handleItemEdit(item) {
    console.log('Editar cita:', item);
  }

  handleRangeSelection(range) {
    console.log('Rango seleccionado:', range);
  }

  handleInputChange(e) {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  handleSubmit(e) {
    e.preventDefault();
    const { newName, newDate, newStartTime, newEndTime, newColor } = this.state;
    if (!newName || !newDate || !newStartTime || !newEndTime) {
      alert('Por favor, completa todos los campos');
      return;
    }
    this.addAppointment(newName, newDate, newStartTime, newEndTime, newColor);
  }

render() {
  const { newName, newDate, newStartTime, newEndTime, newColor } = this.state;

  const fieldStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '14px',
    gap: '12px',
  };

  const labelStyle = {
    minWidth: '110px',
    fontWeight: '600',
    fontSize: '15px',
    color: '#1c1c1e',
  };

  const inputStyle = {
    flex: 1,
    padding: '10px 14px',
    fontSize: '15px',
    borderRadius: '12px',
    border: '1px solid #d1d1d6',
    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)',
    transition: 'border-color 0.2s ease',
  };

  const inputFocusStyle = {
    borderColor: '#007aff',
    boxShadow: '0 0 0 3px rgba(0, 122, 255, 0.3)',
    outline: 'none',
  };

  // Para manejar focus, puedes implementar estado o usar CSS, aquí lo hacemos simple con CSS

  return (
    <>
      <style>{`
        .mac-input {
          padding: 10px 14px;
          font-size: 15px;
          border-radius: 12px;
          border: 1px solid #d1d1d6;
          box-shadow: inset 0 1px 2px rgba(0,0,0,0.06);
          transition: border-color 0.2s ease;
          width: 100%;
          font-family: -apple-system, BlinkMacSystemFont, "San Francisco", "Helvetica Neue", Helvetica, Arial, sans-serif;
          color: #1c1c1e;
        }
        .mac-input:focus {
          outline: none;
          border-color: #007aff;
          box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.3);
        }
        .mac-label {
          min-width: 110px;
          font-weight: 600;
          font-size: 15px;
          color: #1c1c1e;
          font-family: -apple-system, BlinkMacSystemFont, "San Francisco", "Helvetica Neue", Helvetica, Arial, sans-serif;
        }
        .mac-button {
          background: linear-gradient(180deg, #007aff 0%, #0051a8 100%);
          border: none;
          border-radius: 14px;
          color: white;
          font-weight: 600;
          font-size: 16px;
          padding: 12px 0;
          cursor: pointer;
          width: 100%;
          transition: background-color 0.3s ease;
          font-family: -apple-system, BlinkMacSystemFont, "San Francisco", "Helvetica Neue", Helvetica, Arial, sans-serif;
        }
        .mac-button:hover {
          background: linear-gradient(180deg, #0051a8 0%, #003f7f 100%);
        }
        .mac-button:active {
          background: #004080;
        }
        .mac-form-container {
          background: white;
          padding: 30px;
          border-radius: 20px;
          box-shadow: 0 5px 20px rgba(0,0,0,0.1);
          margin: auto;
        }
        h3 {
          font-family: -apple-system, BlinkMacSystemFont, "San Francisco", "Helvetica Neue", Helvetica, Arial, sans-serif;
          color: #1c1c1e;
          font-weight: 700;
          margin-bottom: 20px;
        }
      `}</style>

      <div className="col-md-7 mac-form-container">
        <h3>Agregar nueva cita</h3>
        <form onSubmit={this.handleSubmit} style={{ marginBottom: '30px' }}>
          <div style={fieldStyle}>
            <label htmlFor="newName" className="mac-label">Nombre:</label>
            <input
              id="newName"
              type="text"
              name="newName"
              value={newName}
              onChange={this.handleInputChange}
              required
              placeholder="Nombre de la cita"
              className="mac-input"
            />
          </div>

          <div style={fieldStyle}>
            <label htmlFor="newDate" className="mac-label">Fecha:</label>
            <input
              id="newDate"
              type="date"
              name="newDate"
              value={newDate}
              onChange={this.handleInputChange}
              required
              className="mac-input"
            />
          </div>

          <div style={fieldStyle}>
            <label htmlFor="newStartTime" className="mac-label">Hora inicio:</label>
            <input
              id="newStartTime"
              type="time"
              name="newStartTime"
              value={newStartTime}
              onChange={this.handleInputChange}
              required
              className="mac-input"
            />
          </div>

          <div style={fieldStyle}>
            <label htmlFor="newEndTime" className="mac-label">Hora fin:</label>
            <input
              id="newEndTime"
              type="time"
              name="newEndTime"
              value={newEndTime}
              onChange={this.handleInputChange}
              required
              className="mac-input"
            />
          </div>

          <div style={fieldStyle}>
            <label htmlFor="newColor" className="mac-label">Color:</label>
            <select
              id="newColor"
              name="newColor"
              value={newColor}
              onChange={this.handleInputChange}
              className="mac-input"
            >
              <option value="color-1">Verde</option>
              <option value="color-2">Amarillo</option>
              <option value="color-3">Rojo</option>
            </select>
          </div>

          <button type="submit" className="mac-button">Agregar cita</button>
        </form>

        <h3>Agenda Semanal (Lunes a Domingo)</h3>
        <ReactAgenda
          minDate={new Date()}
          maxDate={new Date(new Date().getFullYear(), new Date().getMonth() + 3)}
          disablePrevButton={false}
          startDate={this.state.startDate}
          cellHeight={this.state.cellHeight}
          locale={this.state.locale}
          items={this.state.items}
          numberOfDays={this.state.numberOfDays}
          rowsPerHour={this.state.rowsPerHour}
          itemColors={colors}
          autoScale={false}
          fixedHeader={true}
          onItemEdit={this.handleItemEdit}
          onCellSelect={this.handleCellSelection}
          onRangeSelection={this.handleRangeSelection}
        />
      </div>
    </>
  );
}


  

}
