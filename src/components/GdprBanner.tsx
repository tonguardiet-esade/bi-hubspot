'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';

export function GdprBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = sessionStorage.getItem('gdpr_accepted');
    if (!accepted) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    sessionStorage.setItem('gdpr_accepted', '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
      style={{ background: 'rgba(3,4,6,0.85)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="relative max-w-lg w-full rounded-3xl border border-card-border p-8 space-y-6 shadow-2xl"
        style={{ background: 'linear-gradient(135deg, #0d0e14 0%, #12141f 100%)' }}
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-7 h-7 text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">Protecció de Dades</h2>
            <p className="text-xs text-text-dim uppercase tracking-widest font-bold mt-0.5">RGPD · Avís important</p>
          </div>
        </div>

        <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
          <p>
            Benvingut/da a la plataforma <span className="text-white font-semibold">BI TOP AI Ventures</span>.
            Aquesta eina conté dades empresarials i de contacte de caràcter professional.
          </p>
          <p>
            Et demanem que siguis <span className="text-accent font-semibold">respectuós/a amb la protecció de dades</span>:
          </p>
          <ul className="space-y-2 pl-4">
            {[
              'No comparteixis informació confidencial fora de l\'organització sense autorització.',
              'Utilitza les dades únicament per als fins autoritzats per TOP AI Ventures.',
              'Les exportacions de dades han de tractar-se amb la màxima confidencialitat.',
              'L\'accés no autoritzat o ús indegut de les dades pot tenir conseqüències legals.',
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-accent mt-0.5">•</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-text-dim">
            Tractament de dades conforme al{' '}
            <span className="font-semibold">Reglament General de Protecció de Dades (RGPD)</span> i la{' '}
            <span className="font-semibold">LOPDGDD</span>.
          </p>
        </div>

        <button
          id="gdpr-accept-btn"
          onClick={handleAccept}
          className="btn btn-primary w-full text-sm font-bold py-3"
        >
          He llegit i accepto les condicions d&apos;ús responsable
        </button>
      </div>
    </div>
  );
}
