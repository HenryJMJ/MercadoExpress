import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiFetch } from '../api';
import { Truck, MapPin, PackageCheck, CheckCircle2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const Tracking = () => {
  const [searchParams] = useSearchParams();
  const initialOrder = searchParams.get('order') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialOrder);
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialOrder) {
      handleSearch(null, initialOrder);
    }
  }, [initialOrder]);

  const handleSearch = async (e, queryOverride = null) => {
    if (e) e.preventDefault();
    const query = queryOverride || searchQuery;
    if (!query) return;

    setLoading(true);
    try {
      const data = await apiFetch(`/tracking/${query}`);
      setTrackingData(data);
    } catch (err) {
      toast.error('No se encontró información de rastreo para este pedido.');
      setTrackingData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 1.5rem', maxWidth: '800px' }}>
      <h1 style={{ marginBottom: '2rem', textAlign: 'center' }}>Rastreo de Envíos</h1>
      
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '3rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Ingresa tu número de pedido (Ej: 1, 2...)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '3rem', fontSize: '1.125rem' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Buscando...' : 'Rastrear'}
          </button>
        </form>
      </div>

      {trackingData && (
        <div className="glass-panel" style={{ padding: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1.5rem' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Número de Rastreo</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-light)' }}>{trackingData.tracking_number}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Entrega Estimada</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{new Date(trackingData.estimated_delivery).toLocaleDateString()}</div>
            </div>
          </div>

          <div style={{ position: 'relative', paddingLeft: '2rem' }}>
            {/* Timeline Line */}
            <div style={{ position: 'absolute', left: '11px', top: '0', bottom: '0', width: '2px', backgroundColor: 'var(--border-color)' }}></div>
            
            {trackingData.events.length === 0 ? (
              <p>No hay eventos registrados aún.</p>
            ) : (
              trackingData.events.map((event, index) => (
                <div key={event.id} style={{ position: 'relative', marginBottom: index === trackingData.events.length - 1 ? '0' : '2.5rem' }}>
                  {/* Icon Node */}
                  <div style={{ 
                    position: 'absolute', left: '-2rem', top: '0', 
                    width: '24px', height: '24px', borderRadius: '50%', 
                    backgroundColor: index === 0 ? 'var(--primary-color)' : 'var(--bg-secondary)',
                    border: `2px solid ${index === 0 ? 'var(--primary-color)' : 'var(--border-color)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transform: 'translateX(-50%)'
                  }}>
                    {index === 0 && <CheckCircle2 size={14} color="white" />}
                  </div>
                  
                  {/* Content */}
                  <div>
                    <h4 style={{ color: index === 0 ? 'var(--text-main)' : 'var(--text-muted)', marginBottom: '0.25rem' }}>{event.status}</h4>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                      <span>{new Date(event.event_at).toLocaleString()}</span>
                      {event.location && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={14} /> {event.location}</span>}
                    </div>
                    {event.description && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>{event.description}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Tracking;
