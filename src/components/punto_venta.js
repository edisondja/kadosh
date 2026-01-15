import React from 'react';
import Axios from 'axios';
import Alertify from 'alertifyjs';
import Core from './funciones_extras.js';

class PuntoVenta extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            productos: [],
            productosSeleccionados: [],
            productoActual: null,
            mostrarFormularioProducto: false,
            modoEdicion: false,
            totalVenta: 0,
            tipoPago: 'efectivo',
            doctores: [],
            doctorSeleccionado: null
        };
    }

    componentDidMount() {
        this.cargarProductos();
        this.cargarDoctores();
    }

    cargarProductos = () => {
        Core.listar_productos().then(data => {
            this.setState({ productos: data });
        }).catch(error => {
            Alertify.error("Error al cargar productos");
            console.error(error);
        });
    }

    cargarDoctores = () => {
        Axios.get(`${Core.url_base}/api/doctores`).then(response => {
            this.setState({ doctores: response.data });
        }).catch(error => {
            console.error("Error al cargar doctores:", error);
        });
    }

    agregarProductoACarrito = (producto) => {
        const existe = this.state.productosSeleccionados.find(p => p.id === producto.id);
        
        if (existe) {
            existe.cantidad += 1;
            this.setState({ productosSeleccionados: [...this.state.productosSeleccionados] });
        } else {
            this.setState({
                productosSeleccionados: [...this.state.productosSeleccionados, {
                    ...producto,
                    cantidad: 1
                }]
            });
        }
        
        this.calcularTotal();
    }

    eliminarProductoDelCarrito = (id) => {
        const nuevos = this.state.productosSeleccionados.filter(p => p.id !== id);
        this.setState({ productosSeleccionados: nuevos });
        this.calcularTotal();
    }

    actualizarCantidad = (id, cantidad) => {
        if (cantidad <= 0) {
            this.eliminarProductoDelCarrito(id);
            return;
        }

        const producto = this.state.productosSeleccionados.find(p => p.id === id);
        const productoOriginal = this.state.productos.find(p => p.id === id);
        
        if (producto && productoOriginal) {
            if (cantidad > productoOriginal.cantidad) {
                Alertify.warning(`Stock disponible: ${productoOriginal.cantidad}`);
                return;
            }
            producto.cantidad = cantidad;
            this.setState({ productosSeleccionados: [...this.state.productosSeleccionados] });
            this.calcularTotal();
        }
    }

    calcularTotal = () => {
        const total = this.state.productosSeleccionados.reduce((sum, p) => {
            return sum + (p.precio * p.cantidad);
        }, 0);
        this.setState({ totalVenta: total });
    }

    realizarVenta = () => {
        if (this.state.productosSeleccionados.length === 0) {
            Alertify.warning("Debe seleccionar al menos un producto");
            return;
        }

        const datosVenta = {
            productos: this.state.productosSeleccionados.map(p => ({
                id: p.id,
                cantidad: p.cantidad
            })),
            id_doctor: this.state.doctorSeleccionado || 1,
            id_paciente: 1, // Paciente genérico para ventas
            tipo_pago: this.state.tipoPago,
            monto_total: this.state.totalVenta
        };

        Core.realizar_venta(datosVenta).then(response => {
            Alertify.success("Venta realizada correctamente");
            this.limpiarCarrito();
            this.cargarProductos();
        }).catch(error => {
            Alertify.error("Error al realizar la venta");
            console.error(error);
        });
    }

    limpiarCarrito = () => {
        this.setState({
            productosSeleccionados: [],
            totalVenta: 0
        });
    }

    abrirFormularioProducto = (producto = null) => {
        this.setState({
            productoActual: producto || {
                nombre: '',
                codigo: '',
                descripcion: '',
                precio: 0,
                categoria: '',
                cantidad: 0,
                stock_minimo: 0
            },
            mostrarFormularioProducto: true,
            modoEdicion: producto !== null
        });
    }

    cerrarFormularioProducto = () => {
        this.setState({
            mostrarFormularioProducto: false,
            productoActual: null,
            modoEdicion: false
        });
    }

    guardarProducto = () => {
        const producto = this.state.productoActual;
        const usuarioId = localStorage.getItem("id_usuario");

        if (!producto.nombre || !producto.precio || producto.cantidad === undefined) {
            Alertify.error("Complete todos los campos requeridos");
            return;
        }

        const datos = {
            ...producto,
            usuario_id: usuarioId
        };

        if (this.state.modoEdicion) {
            datos.id = producto.id;
        }

        Core.guardar_producto(datos).then(response => {
            Alertify.success(this.state.modoEdicion ? "Producto actualizado" : "Producto creado");
            this.cerrarFormularioProducto();
            this.cargarProductos();
        }).catch(error => {
            Alertify.error("Error al guardar producto");
            console.error(error);
        });
    }

    render() {
        const { productos, productosSeleccionados, totalVenta, mostrarFormularioProducto, productoActual, modoEdicion } = this.state;

        return (
            <div className="container-fluid mt-4">
                <div className="row">
                    <div className="col-md-8">
                        <div className="card shadow">
                            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                                <h4 className="mb-0">
                                    <i className="fas fa-shopping-cart"></i> Punto de Venta
                                </h4>
                                <button 
                                    className="btn btn-light btn-sm"
                                    onClick={() => this.abrirFormularioProducto()}
                                >
                                    <i className="fas fa-plus"></i> Nuevo Producto
                                </button>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    {productos.map(producto => (
                                        <div key={producto.id} className="col-md-3 mb-3">
                                            <div className="card h-100" style={{ cursor: 'pointer' }} onClick={() => this.agregarProductoACarrito(producto)}>
                                                <div className="card-body text-center">
                                                    <h6 className="card-title">{producto.nombre}</h6>
                                                    <p className="text-muted small mb-2">{producto.codigo || 'Sin código'}</p>
                                                    <p className="font-weight-bold text-primary">
                                                        RD$ {new Intl.NumberFormat('es-DO').format(producto.precio)}
                                                    </p>
                                                    <small className="text-muted">
                                                        Stock: {producto.cantidad}
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card shadow">
                            <div className="card-header bg-success text-white">
                                <h5 className="mb-0">
                                    <i className="fas fa-cart"></i> Carrito de Venta
                                </h5>
                            </div>
                            <div className="card-body">
                                {productosSeleccionados.length === 0 ? (
                                    <p className="text-muted text-center">El carrito está vacío</p>
                                ) : (
                                    <>
                                        <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                            <table className="table table-sm">
                                                <thead>
                                                    <tr>
                                                        <th>Producto</th>
                                                        <th>Cant.</th>
                                                        <th>Total</th>
                                                        <th></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {productosSeleccionados.map(item => (
                                                        <tr key={item.id}>
                                                            <td>{item.nombre}</td>
                                                            <td>
                                                                <input
                                                                    type="number"
                                                                    className="form-control form-control-sm"
                                                                    style={{ width: '60px' }}
                                                                    value={item.cantidad}
                                                                    min="1"
                                                                    max={item.cantidad}
                                                                    onChange={(e) => this.actualizarCantidad(item.id, parseInt(e.target.value))}
                                                                />
                                                            </td>
                                                            <td>RD$ {new Intl.NumberFormat('es-DO').format(item.precio * item.cantidad)}</td>
                                                            <td>
                                                                <button
                                                                    className="btn btn-sm btn-danger"
                                                                    onClick={() => this.eliminarProductoDelCarrito(item.id)}
                                                                >
                                                                    <i className="fas fa-trash"></i>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <hr />
                                        <div className="d-flex justify-content-between mb-3">
                                            <strong>Total:</strong>
                                            <strong className="text-success">
                                                RD$ {new Intl.NumberFormat('es-DO').format(totalVenta)}
                                            </strong>
                                        </div>
                                        <div className="mb-3">
                                            <label>Tipo de Pago:</label>
                                            <select
                                                className="form-control"
                                                value={this.state.tipoPago}
                                                onChange={(e) => this.setState({ tipoPago: e.target.value })}
                                            >
                                                <option value="efectivo">Efectivo</option>
                                                <option value="tarjeta">Tarjeta</option>
                                                <option value="transferencia">Transferencia</option>
                                            </select>
                                        </div>
                                        <div className="mb-3">
                                            <label>Doctor (Opcional):</label>
                                            <select
                                                className="form-control"
                                                value={this.state.doctorSeleccionado || ''}
                                                onChange={(e) => this.setState({ doctorSeleccionado: e.target.value || null })}
                                            >
                                            <option value="">Seleccionar doctor...</option>
                                            {this.state.doctores && this.state.doctores.map(doctor => (
                                                <option key={doctor.id} value={doctor.id}>
                                                    {doctor.nombre} {doctor.apellido}
                                                </option>
                                            ))}
                                            </select>
                                        </div>
                                        <button
                                            className="btn btn-success btn-block"
                                            onClick={this.realizarVenta}
                                        >
                                            <i className="fas fa-check"></i> Realizar Venta
                                        </button>
                                        <button
                                            className="btn btn-secondary btn-block mt-2"
                                            onClick={this.limpiarCarrito}
                                        >
                                            <i className="fas fa-times"></i> Limpiar
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal para agregar/editar producto */}
                {mostrarFormularioProducto && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            padding: '30px',
                            borderRadius: '10px',
                            width: '500px',
                            maxHeight: '90vh',
                            overflowY: 'auto'
                        }}>
                            <h4>{modoEdicion ? 'Editar Producto' : 'Nuevo Producto'}</h4>
                            <div className="form-group">
                                <label>Nombre *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={productoActual.nombre}
                                    onChange={(e) => this.setState({
                                        productoActual: { ...productoActual, nombre: e.target.value }
                                    })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Código</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={productoActual.codigo || ''}
                                    onChange={(e) => this.setState({
                                        productoActual: { ...productoActual, codigo: e.target.value }
                                    })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Precio *</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={productoActual.precio}
                                    onChange={(e) => this.setState({
                                        productoActual: { ...productoActual, precio: parseFloat(e.target.value) || 0 }
                                    })}
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            <div className="form-group">
                                <label>Cantidad/Stock *</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={productoActual.cantidad}
                                    onChange={(e) => this.setState({
                                        productoActual: { ...productoActual, cantidad: parseInt(e.target.value) || 0 }
                                    })}
                                    min="0"
                                />
                            </div>
                            <div className="form-group">
                                <label>Stock Mínimo</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={productoActual.stock_minimo || 0}
                                    onChange={(e) => this.setState({
                                        productoActual: { ...productoActual, stock_minimo: parseInt(e.target.value) || 0 }
                                    })}
                                    min="0"
                                />
                            </div>
                            <div className="form-group">
                                <label>Categoría</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={productoActual.categoria || ''}
                                    onChange={(e) => this.setState({
                                        productoActual: { ...productoActual, categoria: e.target.value }
                                    })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Descripción</label>
                                <textarea
                                    className="form-control"
                                    value={productoActual.descripcion || ''}
                                    onChange={(e) => this.setState({
                                        productoActual: { ...productoActual, descripcion: e.target.value }
                                    })}
                                    rows="3"
                                />
                            </div>
                            <div className="d-flex justify-content-end">
                                <button
                                    className="btn btn-secondary mr-2"
                                    onClick={this.cerrarFormularioProducto}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={this.guardarProducto}
                                >
                                    Guardar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export default PuntoVenta;
