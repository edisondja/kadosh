import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import ODONTOGRAMA_IMAGE_URL from "../odontograma.png";

const CANVAS_HEIGHT  =500;
const PIEZAS_DENTALES = [
  "18", "17", "16", "15", "14", "13", "12", "11",
  "21", "22", "23", "24", "25", "26", "27", "28",
  "48", "47", "46", "45", "44", "43", "42", "41",
  "31", "32", "33", "34", "35", "36", "37", "38"
];

const UPPER_ARCH = PIEZAS_DENTALES.slice(0, 16);
const LOWER_ARCH = PIEZAS_DENTALES.slice(16);

const PROCEDIMIENTOS_LISTA = [
  { id: 1, nombre: "Caries", color: "red" },
  { id: 2, nombre: "Resina", color: "blue" },
  { id: 3, nombre: "Extracción", color: "red" },
  { id: 4, nombre: "Limpieza", color: "blue" },
  { id: 5, nombre: "Endodoncia", color: "red" },
];

class OdontogramaClinicoProcedimientos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      color: "red",
      isDrawing: false,
      procedimientos: [],
      selectedTooth: null,
    };
    this.canvasRef = React.createRef();
    this.ctx = null;
    this.imageRef = null;
    this.modalInstance = null;
  }

  componentDidMount() {
    const canvas = this.canvasRef.current;
    const ctx = canvas.getContext("2d");
    this.ctx = ctx;

    canvas.width = canvas.clientWidth;
    canvas.height = CANVAS_HEIGHT;

    const img = new Image();
    img.src = ODONTOGRAMA_IMAGE_URL;
    img.onload = () => {
      this.imageRef = img;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };

    // Inicializar el modal de Bootstrap
    const modalElement = document.getElementById("modalProcedimiento");
    if (window.bootstrap) {
      this.modalInstance = new window.bootstrap.Modal(modalElement);
    } else if (window.jQuery) {
      this.modalInstance = {
        show: () => window.jQuery(modalElement).modal("show"),
        hide: () => window.jQuery(modalElement).modal("hide"),
      };
    }
  }

  iniciar = (e) => {
    e.preventDefault();
    const pos = this.getCoords(e);
    this.setState({ isDrawing: true });
    this.ctx.beginPath();
    this.ctx.moveTo(pos.x, pos.y);
  };

  dibujar = (e) => {
    if (!this.state.isDrawing) return;
    const pos = this.getCoords(e);
    this.ctx.strokeStyle = this.state.color;
    this.ctx.lineWidth = 4;
    this.ctx.lineCap = "round";
    this.ctx.lineTo(pos.x, pos.y);
    this.ctx.stroke();
  };

  terminar = () => {
    this.setState({ isDrawing: false });
    this.ctx.closePath();
  };

  getCoords = (e) => {
    const rect = this.canvasRef.current.getBoundingClientRect();
    if (e.touches?.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
  };

  limpiar = () => {
    const canvas = this.canvasRef.current;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (this.imageRef) {
      this.ctx.drawImage(this.imageRef, 0, 0, canvas.width, canvas.height);
    }
  };

  guardar = () => {
    const url = this.canvasRef.current.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `odontograma_${new Date().toISOString()}.png`;
    link.href = url;
    link.click();
  };

  handleToothClick = (num) => {
    this.setState({ selectedTooth: num });
    if (this.modalInstance) {
      this.modalInstance.show();
    }
  };

  seleccionarProcedimiento = (p) => {
    const nuevo = {
      tooth: this.state.selectedTooth,
      procedure: p.nombre,
      color: p.color,
      timestamp: Date.now(),
    };
    this.setState((prev) => ({
      procedimientos: [...prev.procedimientos, nuevo],
      selectedTooth: null,
    }));
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
  };

  eliminarProcedimiento = (timestamp) => {
    this.setState((prevState) => ({
      procedimientos: prevState.procedimientos.filter(
        (p) => p.timestamp !== timestamp
      ),
    }));
  };

  renderToothButtons = (toothArray) => {
    return toothArray.map((num) => {
      const tiene = this.state.procedimientos.some((p) => p.tooth === num);
      return (
        <button
          key={num}
          className={`btn btn-sm ${
            tiene ? "btn-success" : "btn-outline-secondary"
          }`}
          style={{
            width: "40px",
            height: "40px",
            fontWeight: "bold",
            borderWidth: "2px",
            borderRadius: "6px", // CUADRADOS suaves
          }}
          onClick={() => this.handleToothClick(num)}
        >
          {num}
        </button>
      );
    });
  };

  render() {
    const { procedimientos } = this.state;

    return (
      <div className="container my-4">
        <h3 className="text-center mb-4 font-weight-bold text-primary">
          🦷 Odontograma Clínico con Procedimientos
        </h3>

        {/* ====== Odontograma Layout ====== */}
        <div className="odontograma-container text-center p-3 rounded shadow-sm bg-light mb-4">
          <p className="text-muted mb-1 font-weight-bold">
            Arcada Superior (Upper Arch)
          </p>

          <div className="d-flex justify-content-between mb-3 px-2" style={{ width: "100%" }}>
            <div
              className="d-flex flex-row-reverse justify-content-between"
              style={{ width: "48%", gap: "2px" }}
            >
              {this.renderToothButtons(UPPER_ARCH.slice(0, 8).reverse())}
            </div>
            <div
              className="d-flex flex-row justify-content-between"
              style={{ width: "48%", gap: "2px" }}
            >
              {this.renderToothButtons(UPPER_ARCH.slice(8))}
            </div>
          </div>

          <canvas
            ref={this.canvasRef}
            className="border rounded shadow-sm"
            style={{
              cursor: "crosshair",
              maxWidth: "100%",
              width: "100%",
              height: `${CANVAS_HEIGHT}px`,
              backgroundColor: "#ffffff",
            }}
            onMouseDown={this.iniciar}
            onMouseMove={this.dibujar}
            onMouseUp={this.terminar}
            onMouseLeave={this.terminar}
            onTouchStart={this.iniciar}
            onTouchMove={this.dibujar}
            onTouchEnd={this.terminar}
          />

          <p className="text-muted mt-3 mb-1 font-weight-bold">
            Arcada Inferior (Lower Arch)
          </p>

          <div className="d-flex justify-content-between mt-3 px-2" style={{ width: "100%" }}>
            <div
              className="d-flex flex-row-reverse justify-content-between"
              style={{ width: "48%", gap: "2px" }}
            >
              {this.renderToothButtons(LOWER_ARCH.slice(0, 8).reverse())}
            </div>
            <div
              className="d-flex flex-row justify-content-between"
              style={{ width: "48%", gap: "2px" }}
            >
              {this.renderToothButtons(LOWER_ARCH.slice(8))}
            </div>
          </div>
        </div>

        {/* ====== Controles ====== */}
        <div className="d-flex justify-content-center flex-wrap gap-2 mb-4">
          <button
            className={`btn ${
              this.state.color === "blue" ? "btn-primary" : "btn-outline-primary"
            } btn-sm`}
            onClick={() => this.setState({ color: "blue" })}
          >
            🔵 Restauración
          </button>&nbsp;
          <button
            className={`btn ${
              this.state.color === "red" ? "btn-danger" : "btn-outline-danger"
            } btn-sm`}
            onClick={() => this.setState({ color: "red" })}
          >
            🔴 Diagnóstico
          </button>&nbsp;
          <button className="btn btn-secondary btn-sm" onClick={this.limpiar}>
            🧹 Limpiar Dibujo
          </button>&nbsp;
          <button className="btn btn-success btn-sm" onClick={this.guardar}>
            💾 Guardar Imagen
          </button>
        </div>

        {/* ====== Historial ====== */}
        <div className="card shadow-sm border-0">
          <div className="card-header bg-primary text-white font-weight-bold">
            📝 Historial de Procedimientos ({procedimientos.length})
          </div>
          <ul className="list-group list-group-flush">
            {procedimientos.length === 0 ? (
              <li className="list-group-item text-center text-muted py-3">
                No hay registros de procedimientos.
              </li>
            ) : (
              procedimientos.map((p) => (
                <li
                  key={p.timestamp}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <div className="d-flex align-items-center">
                    <strong className="mr-3">Diente {p.tooth}</strong>
                    <span
                      className={`badge badge-${
                        p.color === "red" ? "danger" : "primary"
                      } p-2`}
                    >
                      {p.procedure}
                    </span>
                  </div>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => this.eliminarProcedimiento(p.timestamp)}
                    title="Eliminar Procedimiento"
                  >
                    ×
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* ====== MODAL ====== */}
        <div
          className="modal fade"
          id="modalProcedimiento"
          tabIndex="-1"
          role="dialog"
          aria-labelledby="modalProcedimientoTitle"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-info text-white">
                <h5 className="modal-title" id="modalProcedimientoTitle">
                  Seleccionar Procedimiento para Diente{" "}
                  <span className="font-weight-bold">
                    {this.state.selectedTooth}
                  </span>
                </h5>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <div className="list-group">
                  {PROCEDIMIENTOS_LISTA.map((p) => (
                    <button
                      key={p.id}
                      className="list-group-item list-group-item-action d-flex justify-content-between align-items-center mb-2"
                      onClick={() => this.seleccionarProcedimiento(p)}
                    >
                      <span>{p.nombre}</span>
                      <span
                        className={`badge badge-${
                          p.color === "red" ? "danger" : "primary"
                        } p-2`}
                      >
                        {p.color === "red" ? "DIAGNÓSTICO" : "RESTAURACIÓN"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default OdontogramaClinicoProcedimientos;
