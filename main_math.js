// Math helpers
function getRandomFloat(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}
function getExperienceToNext(){
    return Math.round( ((Level*100)/4) * Level );
}
function getMaxHealth(){
    return Math.round( 50+((100*Level)*Level/5)/10 );
}
function getCurrencyAmounts(){
    if(Bronze > 99){
        Silver++;
        Bronze -= 100;
    }
    if(Silver > 99){
        Gold++;
        Silver -= 100;
    }
}
function getCurrencyAmountString(amt){
	let amtstr = ``;
	let b = 0;
	let s = 0;
	let g = 0;

	for(var i = 0; i < amt; i++){
		b++;
		if(b > 99){
            s++;
            b -= 100;
		}
        if(s > 99){
            g++;
            s -= 100;
        }
	}

	amtstr = `${b}b`;
    if(amt > 9999){
        amtstr = `${g}g ${s}s ${b}b`;
    } else if (amt > 99){
        amtstr = `${s}s ${b}b`;
    }
	return amtstr;
}
function setCurrencyToTotal(total){
    let val = getCurrencyAmountString(total);
    let g = val.split(/(\d+)g .+s .+b/gmi)[1];
    let s = val.split(/(\d+)s .+b/gmi)[1];
    let b = val.split(/(\d+)b/gmi)[1];

    if(g != undefined){
        Gold = Number(g);
    } else if (g == undefined || g == 0){
        Gold = 0;
    }
    if(s != undefined){
        Silver = Number(s);
    } else if (s == undefined || s == 0){
        Silver = 0;
    }
    if(b != undefined){
        Bronze = Number(b);
    } else if (b == undefined || b == 0){
        Bronze = 0;
    }
}

function lerp(a,  b,  c) {
    return a + c * (b - a);
}

function generateWeighedList(list, weight) {
    var weighed_list = [];

    // Loop over weights
    for (var i = 0; i < weight.length; i++) {
        var multiples = weight[i] * 100;

        // Loop over the list of items
        for (var j = 0; j < multiples; j++) {
            weighed_list.push(list[i]);
        }
    }

    return weighed_list;
}

function getItemValue(item){
    let base_rarity = Math.round((100/item.baseItem.p)/10);
    let type_rarity = Math.round((100/item.baseMaterial.p)/10);
    let enchant_rarity = 0;
    let attribute_val = 0;
    let range = Math.round((Math.pow(item.level,2)/item.level/4)+3);

    if(item.minDamage != undefined && item.maxDamage != undefined){
        attribute_val = attribute_val + item.minDamage + item.maxDamage;
    }
    if(item.minHeal != undefined && item.maxHeal != undefined){
        attribute_val = attribute_val + item.minHeal + item.maxHeal;
    }
    if(item.enchant != undefined){
        //attribute_val = attribute_val + Math.round(10 / item.enchant.p);
        enchant_rarity = Math.round((100/item.enchant.p)/10);
        if(item.enchant.minDamage != undefined && item.enchant.maxDamage != undefined){
            attribute_val = attribute_val + item.enchant.minDamage + item.enchant.maxDamage;
        }
        if(item.enchant.minHeal != undefined && item.enchant.maxHeal != undefined){
            attribute_val = attribute_val + item.enchant.minHeal + item.enchant.maxHeal;
        }
        if(item.enchant.armorRating != undefined){
            attribute_val = attribute_val + item.enchant.armorRating;
        }
    }
    if(item.armorRating != undefined){
        attribute_val = attribute_val + Math.round(item.armorRating * (item.armorRating/Level));
    }

    //console.log(`attribute value: ${attribute_val+1}`);
    //console.log(`item level multiplier: x${(item.level/Level).toFixed(2)}, type multiplier: x${(item.baseMaterial.m).toFixed(2)}`);
    //console.log(`base item rarity: +${base_rarity}, type rarity: +${type_rarity}, enchant rarity: +${enchant_rarity}`);
    //console.log(`our level: ${Level}, item level range: ${Math.max(item.level-range,1)}-${item.level+range}, in range: ${Level >= item.level-range && Level <= item.level+range}`);

    //let val = Math.round((attribute_val+1) * ((item.level/(Level/10)) - (Level * 2)) );
    let val = Math.round( (((attribute_val+1) + base_rarity + enchant_rarity) * item.baseMaterial.m) * (item.level/Level) );

    if(item.itemType == `Junk`){
        val = Math.round(val/base_rarity);
    } else if(item.itemType == `Inventory`){
        val = Math.round((val/30) * item.baseItem.slots);
    }

    return Math.max( val, 0);
}

function updateAttributeValues(){
    let maxhealth_base = getMaxHealth();
    let maxhealth_total = 0;
    let invslots_base = 10;
    let invslots_total = 0;
    for (var i = 0; i < Equipped.length; i++) {
        let item = Equipped[i];
        if(item == null){
            continue;
        }
        if(item.armorRating != null){
            maxhealth_total += item.armorRating;
        }
        if(item.slots != null){
            invslots_total += item.slots;
        }
    }
    MaxHealth = maxhealth_base + maxhealth_total;
    Health = maxhealth_base + maxhealth_total;
    inventorySlots = invslots_base + invslots_total;
}
