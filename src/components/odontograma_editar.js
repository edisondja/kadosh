import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Core from './funciones_extras';
import Alertify from 'alertifyjs';
import Odontograma from './odontograma';

/**
 * Carga un odontograma por ID y lo abre en modo edición.
 * Pasa paciente, doctor, dibujo y detalles al componente Odontograma.
 */
const OdontogramaEditar = () => {
  const { id } = useParams();
  const [odontograma, setOdontograma] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Core.obtener_odontograma(id)
      .then((data) => {
        setOdontograma(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        Alertify.error('No se pudo cargar el odontograma');
        setError(true);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Cargando odontograma...</span>
          </div>
          <p className="mt-2 text-muted">Cargando odontograma para edición</p>
        </div>
      </div>
    );
  }

  if (error || !odontograma) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          <h4>No se pudo cargar el odontograma</h4>
          <Link to="/" className="btn btn-primary">Volver al inicio</Link>
        </div>
      </div>
    );
  }

  const idDoctor = odontograma.doctor_id ?? odontograma.id_doctor;
  // Normalizar detalles de BD: diente como número para que coincida con las piezas del odontograma
  const initialPresupuesto = (odontograma.detalles || []).map((d) => ({
    diente: Number(d.diente) || d.diente,
    cara: d.cara != null ? String(d.cara) : '',
    tipo: d.tipo || 'procedimiento',
    descripcion: d.descripcion || '',
    nombre: d.descripcion || '',
    precio: parseFloat(d.precio) || 0,
    color: d.color || null
  }));

  return (
    <Odontograma
      id_paciente={String(odontograma.paciente_id)}
      id_doctor={String(idDoctor)}
      id_odontograma={odontograma.id}
      initialDibujo={odontograma.dibujo_odontograma || null}
      initialPresupuesto={initialPresupuesto}
    />
  );
};

export default OdontogramaEditar;
