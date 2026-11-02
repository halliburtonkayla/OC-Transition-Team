// Keep the original shelves in place so saved games still open the same puzzle.
export const LEVEL_TITLES = [
 'The first pour','Sweet symmetry','Liquid daydream','A brighter kind of blue','Pocket of sunshine',
 'A violet moment','Golden hour','A fresh perspective','Perfectly in place','Find your rhythm',
 'Another little wonder','The color garden','All in good time','Beyond the rainbow','One more splash',
 'The quiet collection','Follow the color','A softer kind of magic','A lovely little puzzle','Beautiful balance',
 'Mint condition','Seven shades of calm','Ripple effect','The secret shelf','Through the looking glass',
 'Layers of possibility','Color me curious','A satisfying twist','Almost a masterpiece','Your true colors',
 'A new chapter','Morning dew','Petal by petal','The hidden garden','Sunshine on the shelf',
 'A little wildflower','Freshly picked','The butterfly path','Bloom in color','Garden party',
 'A splash of spring','Under the willow','The secret orchard','Lavender lane','Dancing leaves',
 'A golden afternoon','The wishing well','A minty breeze','The rose collection','Full bloom',
 'Above the clouds','A sky full of color','Sunrise sparkle','The floating shelf','A gentle rainbow',
 'Cloud nine','A silver lining','Blue horizon','Painted skies','The sunlit path',
 'Twilight glow','A starry little puzzle','Moonbeam magic','The evening collection','Violet skies',
 'Northern lights','A comet of color','The midnight garden','A wish upon a star','Sky of possibilities',
 'Crystal clear','The mirror shelf','A colorful reflection','A ripple of light','Prism perfect',
 'The glass garden','A sparkling discovery','A kaleidoscope moment','Shimmer and shine','The jewel collection',
 'A little treasure','The emerald shelf','A golden reflection','The sapphire secret','A violet gem',
 'The opal hour','Diamond daydream','A polished puzzle','The rainbow room','Brilliant balance',
 'The final collection','A masterful mix','The color constellation','A beautiful challenge','Every shade belongs',
 'The grand gallery','One lovely pour','The finishing touch','A hundred little wonders','A colorful celebration'
];
export const TOTAL_LEVELS = LEVEL_TITLES.length;
export const nextLevel = level => level >= TOTAL_LEVELS ? 1 : level + 1;

// These students practice the sorting task without a question checkpoint.
export const sortingOnlyStudent = name => /^(?:noah|clark)\b/i.test(String(name || '').trim());
