// Photographic assets generated for this classroom activity; quantities remain real DOM objects.
export const ART_FILES={'dum-dum':'wrapped-sucker.webp','rice-treat':'rice-treat.webp',cocoa:'cocoa.webp'};
export const candy=(art='dum-dum')=>`<img class="product-picture ${art==='dum-dum'?'real-sucker':''}" src="assets/candy-counter/${ART_FILES[art]||ART_FILES['dum-dum']}" alt="" aria-hidden="true">`;
export const pictures=(n,art='dum-dum')=>`<span class="candy-pictures" aria-hidden="true">${Array.from({length:n},()=>candy(art)).join('')}</span>`;
export const tableArt=()=>`<img class="table-art" src="assets/candy-counter/real-counter.webp" alt="Wrapped suckers in a glass bowl, an order tray and a cash register on a real library table">`;
