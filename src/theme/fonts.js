/**
 * The reference design uses three families (DM Sans, Bebas Neue, JetBrains Mono).
 * This app renders all of them with **Outfit**, mapped by weight:
 *
 *   DM Sans        -> Outfit Regular / Medium / SemiBold / Bold / ExtraBold
 *   Bebas Neue     -> Outfit Bold, uppercase + letter spacing  (see `display`)
 *   JetBrains Mono -> Outfit Medium / SemiBold + letter spacing (see `mono`)
 *
 * Swapping the whole app's typeface means changing only the five values below
 * (plus dropping the matching .ttf files into assets/fonts and re-linking).
 */
export const fonts = {
  regular: 'Outfit-Regular',
  medium: 'Outfit-Medium',
  semiBold: 'Outfit-SemiBold',
  bold: 'Outfit-Bold',
  extraBold: 'Outfit-ExtraBold',
};

/** Maps a numeric CSS weight onto the matching font file. */
export const weight = w => {
  switch (String(w)) {
    case '800':
    case '900':
      return fonts.extraBold;
    case '700':
      return fonts.bold;
    case '600':
      return fonts.semiBold;
    case '500':
      return fonts.medium;
    default:
      return fonts.regular;
  }
};

export default fonts;
