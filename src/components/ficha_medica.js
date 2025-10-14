import React, { useState } from "react";
import axios from "axios";

const FormPaciente = () => {
  const [formData, setFormData] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => {
        const current = prev[name] || [];
        if (checked) {
          return { ...prev, [name]: [...current, value] };
        } else {
          return { ...prev, [name]: current.filter((v) => v !== value) };
        }
      });
    } else if (type === "radio") {
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    try {
      await axios.post("/api/pacientes", formData);
      alert("✅ Datos guardados correctamente");
      setFormData({});
      document.getElementById("form-paciente").reset();
    } catch (error) {
      console.error(error);
      alert("❌ Error al guardar los datos");
    }
  };

  return (
    <div className="container my-4">
      <div className="row justify-content-center">
        <div className="col-10">
          <div className="card shadow rounded-4 p-4" style={{ background: "#f8f8f8" }}>
            <h4 className="text-center mb-4">🦷 Formulario del Paciente</h4>
            <form id="form-paciente" autoComplete="off">
              {/* DATOS PERSONALES */}
              <fieldset className="mb-4">
                <legend className="fw-semibold">Datos Personales</legend>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Nombre completo</label>
                    <input
                      name="nombre"
                      type="text"
                      className="form-control"
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Edad</label>
                    <input
                      name="edad"
                      type="text"
                      className="form-control"
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Sexo</label>
                    <select name="sexo" className="form-control" onChange={handleChange}>
                      <option value="">--</option>
                      <option>M</option>
                      <option>F</option>
                      <option>Otro</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Teléfono</label>
                    <input
                      name="telefono"
                      type="tel"
                      className="form-control"
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Dirección</label>
                    <input
                      name="direccion"
                      type="text"
                      className="form-control"
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Ocupación</label>
                    <input
                      name="ocupacion"
                      type="text"
                      className="form-control"
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </fieldset>

              {/* ANTECEDENTES MÉDICOS */}
              <fieldset className="mb-4">
                <legend className="fw-semibold">Antecedentes Médicos</legend>

                <div className="mb-3">
                  <label className="form-label">¿Está bajo tratamiento médico actualmente?</label><br />
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="tratamiento_actual"
                      value="Si"
                      onChange={handleChange}
                    />
                    <label className="form-check-label">Sí</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="tratamiento_actual"
                      value="No"
                      defaultChecked
                      onChange={handleChange}
                    />
                    <label className="form-check-label">No</label>
                  </div>
                  <input
                    type="text"
                    name="tratamiento_detalle"
                    placeholder="Especifique"
                    className="form-control mt-2"
                    onChange={handleChange}
                  />
                </div>

                {/* Alergias */}
                <div className="mb-3">
                  <label className="form-label">Alergias</label>
                  <div className="row">
                    {["Medicamentos", "Anestesia", "Alimentos", "Otros"].map((a) => (
                      <div className="col-md-3" key={a}>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            name="alergia"
                            value={a}
                            onChange={handleChange}
                          />
                          <label className="form-check-label">{a}</label>
                        </div>
                      </div>
                    ))}
                  </div>
                  <input
                    type="text"
                    name="alergias_detalle"
                    placeholder="Especifique (ej. Penicilina)"
                    className="form-control mt-2"
                    onChange={handleChange}
                  />
                </div>
              </fieldset>

              {/* HÁBITOS */}
              <fieldset className="mb-4">
                <legend className="fw-semibold">Hábitos</legend>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">Tabaquismo</label>
                    <select name="tabaquismo" className="form-control" onChange={handleChange}>
                      <option value="">--</option>
                      <option>Nunca</option>
                      <option>Actual</option>
                      <option>Ex-fumador</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Consumo de alcohol</label>
                    <select name="alcohol" className="form-control" onChange={handleChange}>
                      <option value="">--</option>
                      <option>Nunca</option>
                      <option>Ocasional</option>
                      <option>Frecuente</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Otros hábitos</label>
                    <input
                      type="text"
                      name="otros_habitos"
                      className="form-control"
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </fieldset>

              {/* BOTONES */}
              <div className="d-flex justify-content-between mt-4">
                <button type="button" className="btn btn-secondary" onClick={() => window.print()}>
                  🖨️ Imprimir / PDF
                </button>
                <button type="button" className="btn btn-primary" onClick={handleSubmit}>
                  💾 Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormPaciente;
