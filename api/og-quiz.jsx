import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

const FAM_COLORS = {
  citrus: '#9A6800', green: '#1A6030', floral: '#902050', woody: '#6E3210',
  amber: '#984000', chypre: '#285438', aquatic: '#0A4880', leather: '#42200E',
  gourmand: '#7C4C00', oud: '#4A1850',
};

const QUIZ_DISPLAY = {
  'find-your-scent': { title: 'Find Your Perfect Fragrance', questions: '5 questions' },
  'best-perfume-to-gift-2026': { title: 'Best Perfume to Gift in 2026', questions: '4 questions' },
  'best-perfume-for-men-2026': { title: 'Best Perfume for Men 2026', questions: '4 questions' },
  'best-perfume-for-women-2026': { title: 'Best Perfume for Women 2026', questions: '4 questions' },
  'find-your-byredo': { title: 'Find Your Byredo', questions: '3 questions' },
};

let _scentsCache = null;

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const quizSlug = searchParams.get('quiz');
  const resultsParam = searchParams.get('results');

  const quizInfo = QUIZ_DISPLAY[quizSlug] || { title: 'Fragrance Quiz', questions: 'Quick quiz' };

  // If results are provided, show result card
  let resultFrags = [];
  if (resultsParam) {
    if (!_scentsCache) {
      const origin = new URL(req.url).origin;
      const res = await fetch(new URL('/data/scents-flat.json', origin));
      _scentsCache = await res.json();
    }
    resultFrags = resultsParam.split(',').map(id => _scentsCache[id]).filter(Boolean).slice(0, 3);
  }

  if (resultFrags.length > 0) {
    // Results OG image
    return new ImageResponse(
      (
        <div style={{
          width: '1200px', height: '630px', display: 'flex', flexDirection: 'column',
          backgroundColor: '#F5F2EC', fontFamily: 'system-ui, sans-serif', position: 'relative',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '32px 48px 0' }}>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#0E0C09', letterSpacing: '-0.02em' }}>Scentmap</div>
            <div style={{ fontSize: '16px', color: '#8C8070' }}>{quizInfo.title}</div>
          </div>

          {/* Results */}
          <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', gap: '40px', padding: '0 48px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#8C8070', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
                Your matches
              </div>
              <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
                {resultFrags.map((frag) => (
                  <div key={frag.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '280px' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: FAM_COLORS[frag.family] || '#8C5E30', marginBottom: '12px' }} />
                    <div style={{ fontSize: '32px', fontWeight: 900, color: '#0E0C09', textAlign: 'center', lineHeight: 1.1, letterSpacing: '-0.02em' }}>{frag.name}</div>
                    <div style={{ fontSize: '16px', color: '#8C8070', marginTop: '8px' }}>{frag.brand}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 48px', borderTop: '1px solid #DDD8D0', backgroundColor: '#EDEAE4' }}>
            <span style={{ fontSize: '14px', color: '#8C8070' }}>scentmap.vercel.app/quiz/{quizSlug}</span>
          </div>
        </div>
      ),
      { width: 1200, height: 630, headers: { 'Cache-Control': 'public, s-maxage=604800, stale-while-revalidate=2592000' } }
    );
  }

  // Promo OG image (no results)
  return new ImageResponse(
    (
      <div style={{
        width: '1200px', height: '630px', display: 'flex', flexDirection: 'column',
        backgroundColor: '#F5F2EC', fontFamily: 'system-ui, sans-serif', position: 'relative',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '32px 48px 0' }}>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#0E0C09', letterSpacing: '-0.02em' }}>Scentmap</div>
          <div style={{ fontSize: '16px', color: '#8C8070' }}>The Mathematical Fragrance Engine</div>
        </div>

        {/* Main */}
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 48px' }}>
          <div style={{ fontSize: '56px', fontWeight: 900, color: '#0E0C09', textAlign: 'center', lineHeight: 1.1, letterSpacing: '-0.02em', maxWidth: '800px' }}>
            {quizInfo.title}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '32px' }}>
            <div style={{ fontSize: '20px', color: '#8C8070' }}>{quizInfo.questions} &middot; 180+ fragrances &middot; Your match</div>
          </div>
          <div style={{
            marginTop: '40px', padding: '16px 48px', backgroundColor: '#0E0C09', color: '#F5F2EC',
            borderRadius: '12px', fontSize: '20px', fontWeight: 700,
          }}>
            Take the Quiz
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 48px', borderTop: '1px solid #DDD8D0', backgroundColor: '#EDEAE4' }}>
          <span style={{ fontSize: '14px', color: '#8C8070' }}>scentmap.vercel.app/quiz/{quizSlug}</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630, headers: { 'Cache-Control': 'public, s-maxage=604800, stale-while-revalidate=2592000' } }
  );
}
