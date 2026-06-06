import React from 'react';
import { render } from '@testing-library/react-native';

import PosterMarquee from '@/components/auth/poster-marquee';

describe('PosterMarquee', () => {
  it('rend des posters de films (titres dupliqués pour la boucle)', () => {
    const { getAllByText } = render(<PosterMarquee />);
    // Le marquee est décoratif (masqué aux lecteurs d'écran) → on inclut les nœuds cachés.
    // Chaque colonne duplique sa liste → un même titre apparaît plusieurs fois.
    const opts = { includeHiddenElements: true };
    expect(getAllByText('Parasite', opts).length).toBeGreaterThanOrEqual(2);
    expect(getAllByText('Joker', opts).length).toBeGreaterThanOrEqual(2);
  });
});
