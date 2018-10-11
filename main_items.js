var displayed;

function Item(displayName, baseMaterial, baseItem, enchant, level, count){
    // For non-unique items: new Item(null, lootType, loot)
    // For unique items: new Item(`Adam's Apple`, {}, {}, {}, 4, 2)
    this.count = count || 1;
    this.level = level || 1;

    if(displayName == `Bronze`){ this.itemType = `Bronze`; }
    if(displayName == `Silver`){ this.itemType = `Silver`; }
    if(displayName == `Gold`){ this.itemType = `Gold`; }

    this.enchant = enchant || enchantments[0];

    if(displayName){
        this.displayName = displayName;
    } else if(baseMaterial && baseItem){
        this.displayName = `${baseMaterial.name} ${baseItem.name}`;
    } else {
        this.displayName = `Item`;
    }
    if(displayName == null && enchant.name != null){
        this.displayName += ` of ${enchant.name}`;
    }

    if(baseMaterial){
        this.baseMaterial = baseMaterial;
        let t = baseMaterial;

        if(baseItem.minDamage == null){ baseItem.minDamage = 0; }
        if(baseItem.maxDamage == null){ baseItem.maxDamage = 0; }
        if(enchant.minDamage == null){ enchant.minDamage = 0; }
        if(enchant.maxDamage == null){ enchant.maxDamage = 0; }

        if(baseItem.minHeal == null){ baseItem.minHeal = 0; }
        if(baseItem.maxHeal == null){ baseItem.maxHeal = 0; }
        if(enchant.minHeal == null){ enchant.minHeal = 0; }
        if(enchant.maxHeal == null){ enchant.maxHeal = 0; }

        if(baseItem.armorRating == null){ baseItem.armorRating = 0; }
        if(enchant.armorRating == null){ enchant.armorRating = 0; }

        let mind = Math.round((baseItem.minDamage * t.m) * level/4);
        let maxd = Math.round((baseItem.maxDamage * t.m) * level/4);
        let minh = Math.round((baseItem.minHeal * t.m) * level/4);
        let maxh = Math.round((baseItem.maxHeal * t.m) * level/4);

        let emind = Math.round((enchant.minDamage * t.m) * level/4);
        let emaxd = Math.round((enchant.maxDamage * t.m) * level/4);
        let eminh = Math.round((enchant.minHeal * t.m) * level/4);
        let emaxh = Math.round((enchant.maxHeal * t.m) * level/4);

        let ar = Math.round((baseItem.armorRating * t.m) * level/4);
        let ear = Math.round((enchant.armorRating * t.m) * level/4);

        this.minDamage = mind + emind;
        this.maxDamage = maxd + emaxd;
        this.minHeal = minh + eminh;
        this.maxHeal = maxh + emaxh;
        this.armorRating = ar + ear;
        //console.log(mind,maxd,minh,maxh,emind,emaxd,eminh,emaxh,ar,ear);
    }
    if(baseItem){
        this.baseItem = baseItem;
        if(baseItem.itemType){ this.itemType = baseItem.itemType; }
        if(baseItem.itemSubType){ this.itemSubType = baseItem.itemSubType; }
        if(baseItem.slots){ this.slots = baseItem.slots; }
    } else {
        this.itemType = `Generic`;
    }
}

// Randomness
function getRandomLoot(level){
    level = level || 1;
    let range = Math.round((Math.pow(level,2)/level/4)+3);
    let l = getRandomFromProbability( loot ); // getRandomFromArray(loot);

    let avail_t = lootTypes.filter(function(type){
        if( type.level > level - range-1 && type.level < level + range+1 ){
            if( l.ignoreTypes == null && l.onlyTypes == null ){
                return type;
            } else if( l.onlyTypes != null && l.onlyTypes.indexOf(type.name) > -1 ){
                return type;
            } else if( l.ignoreTypes != null && l.ignoreTypes.indexOf(type.name) < 0 ){
                return type;
            } else if( l.ignoreTypes != null && l.onlyTypes != null && l.ignoreTypes.indexOf(type.name) < 0 && l.onlyTypes.indexOf(type.name) > -1 ){
                return type;
            }
        } else {
            //out of level range. level: ${level}, type level: ${type.level}, range: ${level-range}-${level+range}
            return null;
        }
        //did not match one of the statements.
        return null;
    });

    if(avail_t.length < 1){ return getLevelLoot(); }

    let t = getRandomFromProbability( avail_t );
    let avail_e = t.enchants.filter(function(enchant){
        if( enchant.onlyTypes == null && enchant.ignoreTypes == null ){
            return enchant;
        } else if( enchant.onlyTypes != null && enchant.onlyTypes.indexOf(l.itemType) > -1 ){
            return enchant;
        } else if( enchant.ignoreTypes != null && enchant.ignoreTypes.indexOf(l.itemType) < 0 ){
            return enchant;
        } else if( enchant.ignoreTypes != null && enchant.onlyTypes != null && enchant.ignoreTypes.indexOf(l.itemType) < 0 && enchant.onlyTypes.indexOf(l.itemType) > -1){
            return enchant;
        }
        return null;
    });
    let e = getRandomFromProbability( avail_e );

    let item = new Item(null, t, l, e, level, 1);
    return item;
}
function getLootChest(amt, level){
    let arr = [];

    for (var i = 0; i < amt; i++) {
        var l = getRandomLoot( getRandomFloat(Math.max(level - 5, 1), level + 2) );
        arr.push(l);
    }
    return arr;
}
function getLevelLootChest(amt){
    amt = amt || Math.round(Math.random() * 2.25) + 1 + Math.round(Math.random() * 1.25); //Math.round(Math.random() * 2.5) + 1
    return getLootChest(amt, Level);
}
function getRandomFromArray(arr){
    if(arr == null){
        //console.error(`<w>[getRandomFromArray]</w> Array specified cannot be null.`);
        return null;
    }
    return arr[Math.floor(Math.random(0, 1) * arr.length)];
}
function getRandomFromProbability(arr){
    if(arr == null){
        //console.error(`<w>[getRandomFromProbability]</w> Array specified cannot be null.`);
        return null;
    }

    //let new_arr = Array.from(arr); //arr.map((v, i) => Array(v[2]).fill(i.p)).reduce((c, v) => c.concat(v), []);
    let weights = arr.map((v, i) => Array(v).fill(arr[i].p));//.reduce((c, v) => c.concat(v), []);
    let new_arr = generateWeighedList( arr, weights );

    //${arr.length} => ${new_arr.length}
    return getRandomFromArray(new_arr);
}
function getLevelLoot(){
    return getRandomLoot( getRandomFloat(Math.max(Level - 5, 1), Math.min(Level + 3, 100)) );
}

// Items
function addItem(item){
    for (var i = 0; i < Inventory.length; i++) {
        if(Inventory[i] == null){
            continue;
        }
        if(Inventory[i].displayName == item.displayName){
            Inventory[i].count++;
            updateInventory();
            return;
        }
    }
    let l = getLootItem(item);
    for (var i = 0; i < Inventory.length; i++) {
        if(Inventory[i] == null){
            Inventory[i] = l;
            info(`<w>${l.displayName}</w> added.`);
            updateInventory();
            return;
        }
    }
    error(`Your inventory is already full. (<w>${Inventory.length} / ${Inventory.length}</w> slots occupied).`);
}
function addChestItems(items, chest){
    for (var i = 0; i < items.length; i++) {
        if(items[i] == null){
            continue;
        }
        let l = items[i];
        if(items[i].displayName != `Bronze` && items[i].displayName != `Silver` && items[i].displayName != `Gold`){
            let l = getLootItem(items[i]);
        }
        chest.push(l);
    }
	chest = removeDuplicates(chest, `displayName`);
}
function removeItem(item){
    for (var i = 0; i < Inventory.length; i++) {
        if(Inventory[i] == null){
            continue;
        }
        if(Inventory[i].displayName == item.displayName){
            Inventory[i].count--;
            if(Inventory[i].count < 1){
                Inventory.splice(i,1);
                //Inventory[i] = null;
                Inventory.push(null);
            }
            if(isEquipped(item)){
                toggleEquipItem(item);
            }
            info(`<w>${item.displayName}</w> removed.`);
            updateInventory();
            return;
        }
    }
}
function sellItem(item){
    let price = getItemValue(item) * Room.shop.sell;
    let val = getCurrencyAmountString(price);

    let g = val.split(/(\d+)g .+s .+b/gmi)[1];
    let s = val.split(/(\d+)s .+b/gmi)[1];
    let b = val.split(/(\d+)b/gmi)[1];

    if(b != null){ Bronze += Number(b); }
    if(s != null){ Silver += Number(s); }
    if(g != null){ Gold += Number(g); }

    removeItem(item);
}
function buyItem(item){
    let price = getItemValue(item) * Room.shop.buy;
    let val = getCurrencyAmountString(price);

    let our_total = Bronze + (Silver * 100) + (Gold * 10000);
    let item_total = getItemValue(item);

    if(our_total >= item_total){
        item.count = 1;
        our_total -= item_total;
        setCurrencyToTotal(our_total);
        addItem(item);
    } else {
        error(`You do not have enough to purchase this item. You need an additional <w>${getCurrencyAmountString(item_total-our_total)}</w>.`);
    }
}
function equipItem(item,slot){
    Equipped[slot] = item;

    updateAttributeValues();
    updateInventory();
    info(`<w>${item.displayName}</w> equipped in slot ${slot}.`);
}
function unequipItem(item){
    Equipped[Equipped.indexOf(item)] = null;

    updateAttributeValues();
    updateInventory();
    info(`<w>${item.displayName}</w> unequipped.`);
}
function toggleEquipItem(_item){
    if(isEquipped(_item)){
        unequipItem(_item);
        return;
    }
    let item = Inventory[Inventory.indexOf(_item)];
    //console.log(item.itemType,item.itemSubType,isEquipped(item));
    // 0 - weapon, 1 - shield, 2 - head, 3 - chest, 4 - hands, 5 - legs, 6 - feet, 7 - inventory
    if(Equipped[0] == null && item.itemType == `Weapon`){
        equipItem(item,0);
    } else if(Equipped[0] != null && item.itemType == `Weapon`){
        error(`You already have a weapon equipped. Make sure you <w>unequip it</w> before equipping another.`);
    } else if(Equipped[1] == null && item.itemSubType != null && item.itemSubType == `Shield`){
        equipItem(item,1);
    } else if(Equipped[1] != null && item.itemSubType != null && item.itemSubType == `Shield`){
        error(`You already have a shield equipped. Make sure you <w>unequip it</w> before equipping another.`);
    } else if(Equipped[2] == null && item.itemSubType != null && item.itemSubType == `Head`){
        equipItem(item,2);
    } else if(Equipped[2] != null && item.itemSubType != null && item.itemSubType == `Head`){
        error(`You already have a head item equipped. Make sure you <w>unequip it</w> before equipping another.`);
    } else if(Equipped[3] == null && item.itemSubType != null && item.itemSubType == `Chest`){
        equipItem(item,3);
    } else if(Equipped[3] != null && item.itemSubType != null && item.itemSubType == `Chest`){
        error(`You already have a chest item equipped. Make sure you <w>unequip it</w> before equipping another.`);
    } else if(Equipped[4] == null && item.itemSubType != null && item.itemSubType == `Hands`){
        equipItem(item,4);
    } else if(Equipped[4] != null && item.itemSubType != null && item.itemSubType == `Hands`){
        error(`You already have a hands item equipped. Make sure you <w>unequip it</w> before equipping another.`);
    } else if(Equipped[5] == null && item.itemSubType != null && item.itemSubType == `Legs`){
        equipItem(item,5);
    } else if(Equipped[5] != null && item.itemSubType != null && item.itemSubType == `Legs`){
        error(`You already have a legs item equipped. Make sure you <w>unequip it</w> before equipping another.`);
    } else if(Equipped[6] == null && item.itemSubType != null && item.itemSubType == `Feet`){
        equipItem(item,6);
    } else if(Equipped[6] != null && item.itemSubType != null && item.itemSubType == `Feet`){
        error(`You already have a feet item equipped. Make sure you <w>unequip it</w> before equipping another.`);
    } else if(Equipped[7] == null && item.itemType == `Inventory`){
        equipItem(item,7);
    } else if(Equipped[7] != null && item.itemType == `Inventory`){
        error(`You already have an inventory item equipped. Make sure you <w>unequip it</w> before equipping another.`);
    } else {
        error(`This item cannot be equipped.`);
    }
}
function showItemInfo(item){
    var info = document.getElementById("iteminfo");
    displayed = item;

    if (info.style.display != "block") {
        info.style.display = "block";
        info.innerHTML = `<p>${item.displayName}</p>
        Type: <w>${(item.itemSubType) ? `${applyUppercaseFirst(item.itemSubType)}` : `${applyUppercaseFirst(item.itemType)}`}</w><br>
        Level: <w>${item.level}</w>`;

		var same = Equipped.filter(function(a){ if(a != null && a.itemType == item.itemType && a.itemSubType == item.itemSubType){ return a; } })[0];

        if(item.maxDamage > 0 && item.minDamage >= 0){
            let same_min = 0;
            let same_max = 0;
            if(same == null){ same_min = 0; same_max = 0; } else { same_min = same.minDamage; same_max = same.maxDamage; }
            let range_diff = getItemDifferenceRange(same_min,same_max,item.minDamage,item.maxDamage); //.replace(/(\(|, )([^+-])/gm,`$1+$2`)
            info.innerHTML += `<br>Damage: <w>${item.minDamage}</w>-<w>${item.maxDamage}</w> HP ${range_diff}`;
        }
        if(item.maxHeal > 0 && item.minHeal >= 0){
            let same_min = 0;
            let same_max = 0;
            if(same == null){ same_min = 0; same_max = 0; } else { same_min = same.minHeal; same_max = same.maxHeal; }
            let range_diff = getItemDifferenceRange(same_min,same_max,item.minHeal,item.maxHeal);
            info.innerHTML += `<br>Heals: <w>${item.minHeal}</w>-<w>${item.maxHeal}</w> HP ${range_diff}`;
        }
        if(item.armorRating > 0){
            same = Equipped.filter(function(a){ if(a != null && a.itemType == item.itemType && a.itemSubType == item.itemSubType){ return a; } })[0];

            if(same == null){ same = 0; } else { same = same.armorRating; }
            info.innerHTML += `<br>Armor Rating: <w>${item.armorRating}</w> ${getItemDifference(same,item.armorRating)}`;
        }
        if(item.slots != null){
            same = Equipped.filter(function(a){ if(a != null && a.itemType == item.itemType){ return a; } })[0];

            if(same == null){ same = 0; } else { same = same.slots; }
            info.innerHTML += `<br>Slots: <w>${item.slots}</w> ${getItemDifference(same,item.slots)}`;
        }
        if(Room.shop != null && isSellable(item)){
            info.innerHTML += `<br>Sell for: <w>${getCurrencyAmountString(getItemValue(item) * Room.shop.sell)}</w><br><br>`;
        } else if(Room.shop != null && isBuyable(item)){
            info.innerHTML += `<br>Buy for: <w>${getCurrencyAmountString(getItemValue(item) * Room.shop.buy)}</w><br><br>`;
        } else {
            info.innerHTML += `<br>Value: <w>${getCurrencyAmountString(getItemValue(item))}</w><br><br>`;
        }

        if(isEquippable(item)){
            let equip_b = document.createElement(`button`);
            equip_b.id = `equip ${item.displayName}`;
            equip_b.className = `button`;
            if(isInInventory(item) && isEquipped(item)){ equip_b.innerHTML = `Unequip`; } else { equip_b.innerHTML = `Equip`; }
            equip_b.onclick = function(){ toggleEquipItem(item); hideItemInfo(); };
            info.appendChild(equip_b);
        }
        if(isSellable(item)){
            let sell_b = document.createElement(`button`);
            sell_b.id = `sell ${item.displayName}`;
            sell_b.className = `button`;
            sell_b.innerHTML = `Sell`;
            sell_b.onclick = function(){ sellItem(item); hideItemInfo(); };
            info.appendChild(sell_b);
            if(item.count > 1){
                let sell_b = document.createElement(`button`);
                let c = item.count;
                sell_b.id = `sellall ${item.displayName}`;
                sell_b.className = `button`;
                sell_b.innerHTML = `Sell all`;
                sell_b.onclick = function(){ for(var i = 0; i < c; i++){ sellItem(item); } hideItemInfo(); };
                info.appendChild(sell_b);
            }
        }
        let drop_b = document.createElement(`button`);
        drop_b.id = `drop ${item.displayName}`;
        drop_b.className = `button`;

        if(isInInventory(item)){
            drop_b.innerHTML = `Drop`;
            drop_b.onclick = function(){ removeItem(item); hideItemInfo(); };
        } else if(isBuyable(item)){
            drop_b.innerHTML = `Buy`;
            drop_b.onclick = function(){
				if( getFreeInventorySlots() > 0 ){
					buyItem(item); hideItemInfo(); updateChestInventory(Room.shop.items, true);
				} else {
					error(`Your inventory is already full. (<w>${Inventory.length} / ${Inventory.length}</w> slots occupied).`);
				}
			};
        } else {
            drop_b.innerHTML = `Take`;
            drop_b.onclick = function(){
				if( getFreeInventorySlots() > 0 ){
					displayedMenu.splice(displayedMenu.indexOf(item),1); addItem(item); hideItemInfo(); updateChestInventory(displayedMenu, false);
				} else {
					error(`Your inventory is already full. (<w>${Inventory.length} / ${Inventory.length}</w> slots occupied).`);
				}
			};
        }
        info.appendChild(drop_b);
    }
}
function hideItemInfo(){
    var info = document.getElementById("iteminfo");
    displayed = null;
    if (info.innerHTML != ``) {
        info.style.display = "none";
        info.innerHTML = ``;
    }
}
function toggleItemInfo(item){
    var info = document.getElementById("iteminfo");
    if(displayed == null){
        showItemInfo(item);
    } else if(displayed != item){
        hideItemInfo();
        showItemInfo(item);
    } else {
        hideItemInfo();
    }
}
function getLootItem(item){
    if(item.enchant == null){ item.enchant = enchantments[0]; }

    let l = new Item(item.displayName, item.baseMaterial, item.baseItem, item.enchant, item.level, item.count);
    return l;
}
function getItemFromName(material, item, enchant){
    let foundmat;
    let foundloot;
    let foundenchant;

    for (var i = 0; i < lootTypes.length; i++) {
        if(lootTypes[i].name == material){ foundmat = lootTypes[i]; break; }
    }
    for (var i = 0; i < loot.length; i++) {
        if(loot[i].name == item){ foundloot = loot[i]; break; }
    }
    if(enchant != null){
        for (var i = 0; i < foundmat.enchants.length; i++) {
            if(foundmat.enchants[i].name == enchant){ foundenchant = foundmat.enchants[i]; break; }
        }
    }
    if(foundenchant == null){ foundenchant = enchantments[0]; }

    let level = getRandomFloat(Math.max(Level - 5, 1), Level + 2);
    let found = new Item(null, foundmat, foundloot, foundenchant, level, 1);
    //console.log(found);
    return found;
}

// Get item parts from arrays
function getLootItemFromName(name){
	for (var i = 0; i < loot.length; i++) {
		if(loot[i].name == name){
			return loot[i];
		}
	}
}
function getLootMaterialFromName(name){
	for (var i = 0; i < lootTypes.length; i++) {
		if(lootTypes[i].name == name){
			return lootTypes[i];
		}
	}
}
function getLootEnchantFromName(name){
	let allenchants = enchantments.concat(leatherenchants,metalenchants,fiberenchants,platedenchants);
	for (var i = 0; i < allenchants.length; i++) {
		if(allenchants[i].name == null){
			continue;
		}
		if(allenchants[i].name == name){
			return allenchants[i];
		}
	}
}

// Checks
function isSellable(item){
    if(isInInventory(item) && item.itemType != `Quest` && Room.shop != null){ return true; }
    return false;
}
function isBuyable(item){
    if(Room.shop != null && Room.shop.items.indexOf(item) > -1){ return true; }
    return false;
}
function isEquippable(item){
    if(isInInventory(item) && item.itemType != `Junk` && item.itemType != `Material` && item.itemType != `Quest`){ return true; }
    return false;
}
function isInInventory(item){
    for (var i = 0; i < Inventory.length; i++) {
        if(Inventory[i] == null){ continue; }
        if(Inventory[i] == item){ return true; }
    }
    return false;
}
function isInChest(chest,item){
    for (var i = 0; i < chest.length; i++) {
        if(chest[i] == null){ continue; }
        if(chest[i].displayName == item.displayName){ return true; }
    }
    return false;
}
function getFromChest(chest,item){
    for (var i = 0; i < chest.length; i++) {
        if(chest[i] == null){ continue; }
        if(chest[i].displayName == item.displayName){ return chest[i]; }
    }
    return null;
}
function isEquipped(item){
    for (var i = 0; i < Equipped.length; i++) {
        if(Equipped[i] == item){ return true; }
    }
    return false;
}
