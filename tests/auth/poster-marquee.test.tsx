import React from 'react';
import { render } from '@testing-library/react-native';

import PosterMarquee from '@/components/auth/poster-marquee';

describe('PosterMarquee', () => {
  it('rend des posters de films (titres dupliqués pour la boucle)', () => {
    const { getAllByText } = render(<PosterMarquee />);
    // Chaque colonne duplique sa liste → un même titre apparaît plusieurs fois.
    expect(getAllByText('Parasite').length).toBeGreaterThanOrEqual(2);
    expect(getAllByText('Joker').length).toBeGreaterThanOrEqual(2);
  });
});
