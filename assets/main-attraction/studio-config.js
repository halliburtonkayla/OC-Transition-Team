/* Fictional classroom consumables and editable practice service prices. */
(function(g){'use strict';const shop=g.TTShopCatalog['main-attraction'];
const supplies={
 'nail-tips':['Practice nail-tip sets',18,12,8], 'nail-adhesive':['Virtual nail adhesive',12,12,8], 'acrylic':['Virtual acrylic portions',24,12,8], 'polish':['Polish portions',15,15,10], 'top-coat':['Top-coat portions',12,12,8], 'soak':['Pedicure soak portions',10,10,6], 'lash-tray':['Practice lash sets',24,12,8], 'lash-adhesive':['Virtual lash adhesive',18,12,8], 'eye-pads':['Eye-pad pairs',12,12,8], 'shampoo':['Shampoo portions',12,12,8], 'hair-color':['Virtual hair-color kits',30,10,6], 'styling-product':['Styling portions',15,15,8]
};
for(const[k,[name,cost,pack,start]]of Object.entries(supplies))shop.stock[k]={name,cost,pack,start,unit:'client uses',consumable:true};
const names={cape:'Clean cape',towel:'Clean towel',comb:'Clean comb',gloves:'Training gloves',bowl:'Training bowl',brush:'Application brush',kit:'Matched virtual service kit',rods:'Practice rods',shampoo:'Shampoo picture card',applicators:'Single-use makeup applicators',palette:'Training makeup palette'};
for(const[k,name]of Object.entries(names))shop.stock['salon-tool-'+k]={name,cost:10,pack:10,start:20,unit:'practice uses',consumable:true};
g.MAStudioSupplies=supplies;
})(globalThis);
