import React from 'react';
import Axios from 'axios';
// Importamos los componentes de React Bootstrap
import { Container, Row, Col, Card, Table, Modal, Button, Form } from 'react-bootstrap';
import Alertify from 'alertifyjs';
import { Redirect } from 'react-router-dom'; 


// Importa estilos adicionales si son necesarios (ej. para el SVG si necesitas más control)
// import '../css/dashboard.css'; 

class Odontograma extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dientes: {
                // Estado inicial de las 32 piezas
                '18': 'sano', '17': 'sano', '16': 'sano', '15': 'sano', '14': 'sano', '13': 'sano', '12': 'sano', '11': 'sano',
                '21': 'sano', '22': 'sano', '23': 'sano', '24': 'sano', '25': 'sano', '26': 'sano', '27': 'sano', '28': 'sano',
                '48': 'sano', '47': 'sano', '46': 'sano', '45': 'sano', '44': 'sano', '43': 'sano', '42': 'sano', '41': 'sano',
                '31': 'sano', '32': 'sano', '33': 'sano', '34': 'sano', '35': 'sano', '36': 'sano', '37': 'sano', '38': 'sano',
            },
            procedimientos_aplicados: [], 
            
            diente_seleccionado: null,
            procedimiento_seleccionado: '',
            mostrar_modal: false,
            redirectPerfil: false,
            paciente: { nombre: 'Edison De Jesus Abreu', apellido: 'Pérez' },
        };
        
        this.handleToothClick = this.handleToothClick.bind(this);
        this.handleAplicarProcedimiento = this.handleAplicarProcedimiento.bind(this);
        this.handleCloseModal = this.handleCloseModal.bind(this);
    }

    componentDidMount() {
        // Lógica para obtener el ID del paciente y cargar datos
    };

    handleToothClick(num) {
        this.setState({ diente_seleccionado: num, mostrar_modal: true });
    }

    handleCloseModal() {
        this.setState({ mostrar_modal: false, procedimiento_seleccionado: '', diente_seleccionado: null });
    }

    handleAplicarProcedimiento = () => {
        const { diente_seleccionado, procedimiento_seleccionado } = this.state;



        if (!procedimiento_seleccionado) {
            Alertify.error("Debe seleccionar un procedimiento.");
            return;
        }

        let nuevoEstadoVisual; 
        let colorLapizDisplay; 

        if (procedimiento_seleccionado === 'Diagnostico Caries' || procedimiento_seleccionado === 'Extraccion') {
            nuevoEstadoVisual = 'rojo'; 
            colorLapizDisplay = 'Rojo';
        } else if (procedimiento_seleccionado === 'Empaste' || procedimiento_seleccionado === 'Endodoncia') {
            nuevoEstadoVisual = 'azul'; 
            colorLapizDisplay = 'Azul';
        } else { 
            nuevoEstadoVisual = 'sano';
            colorLapizDisplay = 'Ninguno';
        }

        this.setState(prevState => ({
            dientes: {
                ...prevState.dientes,
                [diente_seleccionado]: nuevoEstadoVisual,
            },
            procedimientos_aplicados: [
                ...prevState.procedimientos_aplicados,
                {
                    pieza: diente_seleccionado,
                    procedimiento: procedimiento_seleccionado,
                    fecha: new Date().toLocaleDateString(),
                    color: colorLapizDisplay,
                }
            ],
            mostrar_modal: false,
            procedimiento_seleccionado: '',
            diente_seleccionado: null
        }));

        console.log('Procedimiento aplicado '+JSON.stringify(this.state.procedimientos_aplicados));

        Alertify.success(`Procedimiento aplicado a la pieza ${diente_seleccionado}.`);
    };

    getColorRelleno(estado) {
        switch (estado) {
            case 'rojo': 
                return '#FFCCCC'; // Fondo rosa claro para "dibujo rojo"
            case 'azul': 
                return '#CCE5FF'; // Fondo azul claro para "dibujo azul"
            case 'sano':
            default:
                return '#F8F8F8'; 
        }
    }

    getColorBorde(estado) {
        switch (estado) {
            case 'rojo':
                return '#CC0000'; // Borde rojo intenso
            case 'azul':
                return '#0000CC'; // Borde azul intenso
            case 'sano':
            default:
                return '#666666'; // Borde gris oscuro
        }
    }

    // Función para renderizar un solo diente SVG
    renderDienteSVG = (num, x, y) => {
        const estado = this.state.dientes[num] || 'sano';
        const fill = this.getColorRelleno(estado); 
        const strokeColor = this.getColorBorde(estado); 
        
        // Path genérico para simular un diente
        const dientePath = "M 25 0 C 10 15, 40 15, 25 0 L 25 100 C 30 110, 20 110, 25 100 Z";
        
        return (
            <g 
                key={num} 
                transform={`translate(${x}, ${y})`} 
                onClick={() => this.handleToothClick(num)} 
                style={{ cursor: 'pointer' }}
                title={`Pieza ${num} | Estado: ${estado}`}
            >
                {/* 1. Dibujo del diente y raíz */}
                <path
                    d={dientePath}
                    fill={fill} 
                    stroke={strokeColor} 
                    strokeWidth="2" 
                    // Clases CSS opcionales si necesitas más estilos con el SVG
                />

                {/* 2. El número de la pieza */}
                <text x="25" y="-5" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#333">
                    {num}
                </text>
            </g>
        );
    };

    render() {
        if (this.state.redirectPerfil) {
            return <Redirect to="/perfil" />;
        }
        
        const piezasData = [
            { num: '18', x: 50, y: 30 }, { num: '17', x: 80, y: 30 }, { num: '16', x: 110, y: 30 }, { num: '15', x: 140, y: 30 }, 
            { num: '14', x: 170, y: 30 }, { num: '13', x: 200, y: 30 }, { num: '12', x: 230, y: 30 }, { num: '11', x: 260, y: 30 },
            { num: '21', x: 340, y: 30 }, { num: '22', x: 370, y: 30 }, { num: '23', x: 400, y: 30 }, { num: '24', x: 430, y: 30 },
            { num: '25', x: 460, y: 30 }, { num: '26', x: 490, y: 30 }, { num: '27', x: 520, y: 30 }, { num: '28', x: 550, y: 30 },
            { num: '48', x: 50, y: 200 }, { num: '47', x: 80, y: 200 }, { num: '46', x: 110, y: 200 }, { num: '45', x: 140, y: 200 },
            { num: '44', x: 170, y: 200 }, { num: '43', x: 200, y: 200 }, { num: '42', x: 230, y: 200 }, { num: '41', x: 260, y: 200 },
            { num: '31', x: 340, y: 200 }, { num: '32', x: 370, y: 200 }, { num: '33', x: 400, y: 200 }, { num: '34', x: 430, y: 200 },
            { num: '35', x: 460, y: 200 }, { num: '36', x: 490, y: 200 }, { num: '37', x: 520, y: 200 }, { num: '38', x: 550, y: 200 },
        ];

        return (
            <Container className="my-5"><hr/>
                <h2 className="mb-4">🦷 Odontograma de **{this.state.paciente.nombre} {this.state.paciente.apellido}**</h2>
                <Row>
                    {/* COLUMNA IZQUIERDA: ODONTOGRAMA VISUAL */}
                    <Col md={8} className="mb-4">
                        <Card className="shadow-sm">
                            <Card.Header as="h5" className="text-center bg-primary text-white">
                                Mapa Dental Interactivo
                            </Card.Header>
                            <Card.Body className="d-flex justify-content-center">
                                <svg width="1500" height="350" viewBox="0 0 650 350" style={{ border: '1px solid #ccc', borderRadius: '5px' }}>
                                    {/* Líneas divisorias de cuadrantes */}
                                    <line x1="320" y1="0" x2="320" y2="350" stroke="#E0E0E0" strokeWidth="1" />
                                    <line x1="0" y1="175" x2="650" y2="175" stroke="#E0E0E0" strokeWidth="1" />
                                    {/* Renderizar dientes */}
                                    {piezasData.map(diente => this.renderDienteSVG(diente.num, diente.x, diente.y))}
                                </svg>
                            </Card.Body>
                            <Card.Footer className="text-muted text-center">
                                Haz click en una pieza dental para registrar un procedimiento.
                            </Card.Footer>
                        </Card>
                    </Col>

                    {/* COLUMNA DERECHA: LISTA DE PROCEDIMIENTOS */}
                    <Col md={4} className="mb-4">
                        <Card className="shadow-sm">
                            <Card.Header as="h5" className="bg-info text-white">
                                📝 Historial de Tratamientos
                            </Card.Header>
                            <Card.Body style={{ maxHeight: '430px', overflowY: 'auto', padding: '0' }}>
                                {this.state.procedimientos_aplicados.length > 0 ? (
                                    <Table striped bordered hover className="mb-0">
                                        <thead>
                                            <tr>
                                                <th>Pieza</th>
                                                <th>Procedimiento</th>
                                                <th>Lápiz</th>
                                                <th>Fecha</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {this.state.procedimientos_aplicados.map((p, index) => (
                                                <tr key={index}>
                                                    <td>
                                                        <span className="fw-bold" style={{ color: p.color === 'Rojo' ? '#CC0000' : '#0000CC' }}>
                                                            {p.pieza}
                                                        </span>
                                                    </td>
                                                    <td>{p.procedimiento}</td>
                                                    <td>{p.color}</td>
                                                    <td>{p.fecha}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                ) : (
                                    <p className="text-center text-muted p-3">
                                        Aún no hay procedimientos registrados para este paciente.
                                    </p>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* MODAL PARA PROCEDIMIENTOS (React Bootstrap Modal) */}
                <Modal 
                    show={this.state.mostrar_modal} 
                    onHide={this.handleCloseModal} 
                    centered
                >
                    <Modal.Header closeButton className="bg-warning text-dark">
                        <Modal.Title>Aplicar Procedimiento a la Pieza **{this.state.diente_seleccionado}**</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group controlId="selectProcedimiento">
                            <Form.Label>Seleccione el procedimiento:</Form.Label>
                            <Form.Control
                                as="select"
                                value={this.state.procedimiento_seleccionado}
                                onChange={(e) => this.setState({ procedimiento_seleccionado: e.target.value })}
                            >
                                <option value="">-- Seleccionar procedimiento --</option>
                                <option value="Diagnostico Caries">Diagnóstico Caries (Lápiz Rojo - Planificado)</option>
                                <option value="Extraccion">Extracción (Lápiz Rojo - A realizar)</option>
                                <option value="Empaste">Empaste/Restauración (Lápiz Azul - Realizado)</option>
                                <option value="Endodoncia">Endodoncia/Tratamiento (Lápiz Azul - Realizado)</option>
                                <option value="Limpieza">Limpieza (Sin marca visual)</option>
                            </Form.Control>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.handleCloseModal}>
                            Cancelar
                        </Button>
                        <Button variant="primary" onClick={this.handleAplicarProcedimiento}>
                            Guardar y Aplicar
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        );
    }
}

export default Odontograma;