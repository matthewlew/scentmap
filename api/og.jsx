import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

const FAM_COMPAT = {
  woody:   {woody:.7,floral:.8,amber:.9,citrus:.6,leather:.8,oud:.9,green:.6,chypre:.7,gourmand:.5},
  floral:  {woody:.8,floral:.5,amber:.7,citrus:.7,leather:.5,oud:.6,green:.8,chypre:.8,gourmand:.5},
  amber:   {woody:.9,floral:.7,amber:.5,citrus:.4,leather:.8,oud:.9,green:.4,chypre:.6,gourmand:.8},
  citrus:  {woody:.6,floral:.7,amber:.4,citrus:.4,leather:.4,oud:.3,green:.9,chypre:.7,gourmand:.3},
  leather: {woody:.8,floral:.5,amber:.8,citrus:.4,leather:.4,oud:.9,green:.5,chypre:.7,gourmand:.4},
  oud:     {woody:.9,floral:.6,amber:.9,citrus:.3,leather:.9,oud:.3,green:.3,chypre:.5,gourmand:.6},
  green:   {woody:.6,floral:.8,amber:.4,citrus:.9,leather:.5,oud:.3,green:.4,chypre:.9,gourmand:.3},
  chypre:  {woody:.7,floral:.8,amber:.6,citrus:.7,leather:.7,oud:.5,green:.9,chypre:.4,gourmand:.4},
  gourmand:{woody:.5,floral:.5,amber:.8,citrus:.3,leather:.4,oud:.6,green:.3,chypre:.4,gourmand:.4},
};

const FAM_COLORS = {
  citrus: '#9A6800', green: '#1A6030', floral: '#902050', woody: '#6E3210',
  amber: '#984000', chypre: '#285438', aquatic: '#0A4880', leather: '#42200E',
  gourmand: '#7C4C00', oud: '#4A1850',
};

function scoreSimilarity(a, b) {
  const famScore = (FAM_COMPAT[a.family]?.[b.family] ?? 0.5) * 40;
  const shBase = a.base.filter(n => b.base.includes(n)).length;
  const shMid = a.mid.filter(n => b.mid.includes(n)).length;
  const shTop = a.top.filter(n => b.top.includes(n)).length;
  const noteScore = Math.min(30, shBase * 5 + shMid * 3 + shTop * 2);
  const sillDiff = Math.abs(a.sillage - b.sillage);
  const sillScore = sillDiff <= 2 ? 10 : sillDiff <= 4 ? 5 : 0;
  const shRoles = a.roles.filter(r => b.roles.includes(r)).length;
  const roleScore = Math.min(20, shRoles * 7);
  return Math.round(famScore + noteScore + sillScore + roleScore);
}

function getSharedNotes(a, b) {
  const all_a = [...a.top, ...a.mid, ...a.base];
  const all_b = [...b.top, ...b.mid, ...b.base];
  return all_a.filter(n => all_b.includes(n));
}

let _scentsCache = null;

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const idA = searchParams.get('a');
  const idB = searchParams.get('b');

  if (!idA || !idB) {
    return new Response('Missing a or b query params', { status: 400 });
  }

  if (!_scentsCache) {
    const origin = new URL(req.url).origin;
    const res = await fetch(new URL('/data/scents-flat.json', origin));
    _scentsCache = await res.json();
  }

  const fa = _scentsCache[idA], fb = _scentsCache[idB];

  if (!fa || !fb) {
    return new Response('Fragrance not found', { status: 404 });
  }

  const matchPct = scoreSimilarity(fa, fb);
  const shared = getSharedNotes(fa, fb);
  const colorA = FAM_COLORS[fa.family] || '#8C5E30';
  const colorB = FAM_COLORS[fb.family] || '#8C5E30';

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#F5F2EC',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '32px 48px 0',
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: 900,
            color: '#0E0C09',
            letterSpacing: '-0.02em',
          }}>
            Scentmap
          </div>
          <div style={{
            fontSize: '16px',
            color: '#8C8070',
          }}>
            The Mathematical Fragrance Engine
          </div>
        </div>

        {/* Main content */}
        <div style={{
          display: 'flex',
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: '48px',
          padding: '0 48px',
        }}>
          {/* Fragrance A */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: 1,
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: colorA,
              marginBottom: '12px',
            }} />
            <div style={{
              fontSize: '36px',
              fontWeight: 900,
              color: '#0E0C09',
              textAlign: 'center',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}>
              {fa.name}
            </div>
            <div style={{
              fontSize: '18px',
              color: '#8C8070',
              marginTop: '8px',
            }}>
              {fa.brand}
            </div>
          </div>

          {/* Match score circle */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flexShrink: 0,
          }}>
            <div style={{
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              border: '4px solid #0E0C09',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div style={{
                fontSize: '48px',
                fontWeight: 900,
                color: '#0E0C09',
                lineHeight: 1,
              }}>
                {matchPct}%
              </div>
            </div>
            <div style={{
              fontSize: '14px',
              fontWeight: 700,
              color: '#8C8070',
              marginTop: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}>
              Match
            </div>
          </div>

          {/* Fragrance B */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: 1,
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: colorB,
              marginBottom: '12px',
            }} />
            <div style={{
              fontSize: '36px',
              fontWeight: 900,
              color: '#0E0C09',
              textAlign: 'center',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}>
              {fb.name}
            </div>
            <div style={{
              fontSize: '18px',
              color: '#8C8070',
              marginTop: '8px',
            }}>
              {fb.brand}
            </div>
          </div>
        </div>

        {/* Shared notes strip */}
        {shared.length > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            padding: '0 48px 32px',
            flexWrap: 'wrap',
          }}>
            <span style={{
              fontSize: '13px',
              color: '#8C8070',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontWeight: 700,
              marginRight: '4px',
            }}>
              Shared notes:
            </span>
            {shared.slice(0, 5).map((note) => (
              <span
                key={note}
                style={{
                  fontSize: '14px',
                  color: '#0E0C09',
                  backgroundColor: '#EAE6DE',
                  padding: '4px 12px',
                  borderRadius: '12px',
                }}
              >
                {note}
              </span>
            ))}
          </div>
        )}

        {/* Bottom bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '16px 48px',
          borderTop: '1px solid #DDD8D0',
          backgroundColor: '#EDEAE4',
        }}>
          <span style={{ fontSize: '14px', color: '#8C8070' }}>
            scentmap.vercel.app/compare/{[idA, idB].sort().join('/')}
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, s-maxage=604800, stale-while-revalidate=2592000',
      },
    }
  );
}
