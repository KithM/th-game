// Math helpers
function getRandomFloat(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}
function getExperienceToNext(){
    if(Level > 99){
        return Infinity;
    }
    return Math.round( ((Level*100)/4) * Level );
}
function getMaxHealth(){
    return Math.round( 50+((100*Level)*Level/5)/10 );
}
function getRandomCurrency(min, max){
    let currency = [];
    let val = Math.max(getRandomFloat(min, max), min);
    let b = val;
    let s = 0;
    let g = 0;

    for (var i = 0; i < val; i++) {
        val--;
        if(b > 99){
            b -= 100;
            s++;
        }
        if(s > 99){
            s -= 100;
            g++;
        }
    }

    if(b > 0){ currency.push({ displayName:`Bronze`, itemType:`Bronze`, count: b }); }
    if(s > 0){ currency.push({ displayName:`Silver`, itemType:`Silver`, count: s }); }
    if(g > 0){ currency.push({ displayName:`Gold`, itemType:`Gold`, count: g }); }

    //console.log(currency);
    return currency;
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

    if(g != null){
        Gold = Number(g);
    } else if (g == null || g == 0){
        Gold = 0;
    }
    if(s != null){
        Silver = Number(s);
    } else if (s == null || s == 0){
        Silver = 0;
    }
    if(b != null){
        Bronze = Number(b);
    } else if (b == null || b == 0){
        Bronze = 0;
    }
}

function getSmallNumberString(num, k_d, m_d, b_d){
    k_d = k_d || 1;
    m_d = m_d || 2;
    b_d = b_d || 2;
	let isNegative = false;

    let small = `${num}`;
    if(num < 0){
        num = -num;
		isNegative = true;
    }

    if(num == Infinity){
        return `???`;
    }

    if(num > 999999999){
        small = `${(num/1000000000).toFixed(b_d)}b`;
    } else if(num > 999999){
        small = `${(num/1000000).toFixed(m_d)}m`;
    } else if(num > 999){
        small = `${(num/1000).toFixed(k_d)}k`;
    }
	if(isNegative){
		return `-${small}`;
	}
    return small;
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

    if(item.minDamage != null && item.maxDamage != null){
        attribute_val += item.minDamage + item.maxDamage;
    }
    if(item.minHeal != null && item.maxHeal != null){
        attribute_val += item.minHeal + item.maxHeal;
    }
    if(item.enchant != null){
        //attribute_val = attribute_val + Math.round(10 / item.enchant.p);
        enchant_rarity = Math.round((100/item.enchant.p)/10);
        if(item.enchant.minDamage != null && item.enchant.maxDamage != null){
            attribute_val += item.enchant.minDamage + item.enchant.maxDamage;
        }
        if(item.enchant.minHeal != null && item.enchant.maxHeal != null){
            attribute_val += item.enchant.minHeal + item.enchant.maxHeal;
        }
        if(item.enchant.armorRating != null){
            attribute_val += item.enchant.armorRating;
        }
    }
    if(item.armorRating != null){
        attribute_val += Math.round(item.armorRating * (item.armorRating/Level));
    }
    if(item.slots != null){
        attribute_val += Math.round(item.slots * 10);
    }

    //console.log(`attribute value: ${attribute_val+1}`);
    //console.log(`item level multiplier: x${(item.level/Level).toFixed(2)}, type multiplier: x${(item.baseMaterial.m).toFixed(2)}`);
    //console.log(`base item rarity: +${base_rarity}, type rarity: +${type_rarity}, enchant rarity: +${enchant_rarity}`);
    //console.log(`our level: ${Level}, item level range: ${Math.max(item.level-range,1)}-${Math.min(item.level+range,100)}, in range: ${Level >= item.level-range && Level <= item.level+range}`);

    //let val = Math.round((attribute_val+1) * ((item.level/(Level/10)) - (Level * 2)) );
    let val = Math.round( (((attribute_val+1) + base_rarity + enchant_rarity) * item.baseMaterial.m) * (item.level/Level) );

    if(item.itemType == `Junk`){
        val = Math.round((val/base_rarity) + base_rarity);
    } else if(item.itemType == `Inventory`){
        val = Math.round((val/4) * (item.slots/4));
    } else if(item.itemType == `Material`){
        val = Math.round((val/20) * (base_rarity * item.level)/50);
    }

    return Math.max(val, 0);
}

function getItemDifference(attr_a,attr_b){
    let diff = 0;

    if(attr_a != null && attr_b != null){
        diff = attr_a - attr_b;
    }

    return getItemDifferenceString(diff);
}
function getItemDifferenceNoString(attr_a,attr_b){
    let diff = 0;

    if(attr_a != null && attr_b != null){
        diff = attr_a - attr_b;
    }

    return diff;
}
function getItemDifferenceString(diff){
    if(-diff > 0){
        diff = `+${getSmallNumberString(-diff)}`;
    } else if(diff > 0){
        diff = `${getSmallNumberString(-diff)}`;
    } else if(diff == 0){
        return ``;
    }
    return `(${diff})`;
}
function getItemDifferenceRange(attr_a_min,attr_a_max,attr_b_min,attr_b_max){
    let mindiff = getItemDifferenceNoString(attr_a_min,attr_b_min);
    let maxdiff = getItemDifferenceNoString(attr_a_max,attr_b_max);

    return getItemDifferenceRangeString(mindiff,maxdiff);
}
function getItemDifferenceRangeString(mindiff,maxdiff){
    let min = ``;
    let max = ``;

    if(mindiff < 0){
        min = `+${getSmallNumberString(-mindiff)}`;
    } else if(mindiff > 0){
        min = `${getSmallNumberString(-mindiff)}`;
    } else if(mindiff == 0){
        min = ``;
    }
    if(maxdiff < 0){
        max = `+${getSmallNumberString(-maxdiff)}`;
    } else if(maxdiff > 0){
        max = `${getSmallNumberString(-maxdiff)}`;
    } else if(maxdiff == 0){
        max = ``;
    }
    if(min == `` && max == ``){
        return ``;
    } else if(min == ``){
        return `(${max} max)`;
    } else if(max == ``){
        return `(${min} min)`;
    }
    return `(${min} min, ${max} max)`;
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
    inventorySlots = invslots_base + invslots_total;
}

function getTravelPrice(loc){
    let price = 0;

    for (var i = 0; i < travelPrices.length; i++) {
        if(travelPrices[i].to == Room.name && travelPrices[i].from == loc.name){
            price = travelPrices[i].price;
        }
    }
    return price;
}

function getUniqueArrayItems(array){
    return array.filter(onlyUnique);
}
function onlyUnique(value, index, self){
    return self.indexOf(value) === index;
}

function removeDuplicates(myArr, prop){
    // Returns a new array based on myArr, if two of the same (named) items exist in the Array,
    // the first one's count is increased and the next one(s) are removed from the array
    return myArr.filter((obj, pos, arr) => {
        obj.count = countItems(arr, obj);
        for (var i = 0; i < arr.length; i++) {
            if(i == pos){
                continue;
            }
            if(arr[i].displayName == obj.displayName){
                arr.splice(i,1);
            }
        }
        return arr.map( (mapObj) => mapObj[prop] ).indexOf(obj[prop]) === pos;
    });
}

function countItems(chest, item){
    let count = 0;
    for (var i = 0; i < chest.length; i++){
        if (chest[i].displayName == item.displayName){
            count += chest[i].count;
        }
    }
    return count;
}
function getFreeInventorySlots(){
	let freeSlots = 0;
	for (var i = 0; i < Inventory.length; i++) {
		if(Inventory[i] == null){
			freeSlots++;
		}
	}
	return freeSlots;
}

// Time and Date
function getDaysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
}
function getDaysElapsed(date){
    // Returns the number of days since a given date,
    // compared to the current date (today)
    // The number of milliseconds in one day
    var day_ms = 1000 * 60 * 60 * 24;

    // Convert both dates to milliseconds
    var date1_ms = date.getTime();
    var date2_ms = today.getTime();

    // Calculate the difference in milliseconds
    var difference_ms = Math.abs(date1_ms - date2_ms);

    // Convert back to days and return
    return Math.round(difference_ms/day_ms);
}
