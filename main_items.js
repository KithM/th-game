// Randomness
function getRandomLoot(level){
    level = level || 1;
    let range = Math.round((Math.pow(level,2)/level/4)+3);
    let ranged = Math.round((Math.random() * range)+level/1.25);
    let l = getRandomFromProbability( loot, ranged ); // getRandomFromArray(loot);

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
    //finished filtering lootTypes. found ${avail_t.length} available types

    if(avail_t.length < 1){ return getLevelLoot(); }

    let t = getRandomFromProbability( avail_t, ranged );
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

    if(l.minDamage == null){ l.minDamage = 0; }
    if(l.maxDamage == null){ l.maxDamage = 0; }
    if(e.minDamage == null){ e.minDamage = 0; }
    if(e.maxDamage == null){ e.maxDamage = 0; }

    if(l.minHeal == null){ l.minHeal = 0; }
    if(l.maxHeal == null){ l.maxHeal = 0; }
    if(e.minHeal == null){ e.minHeal = 0; }
    if(e.maxHeal == null){ e.maxHeal = 0; }

    if(l.armorRating == null){ l.armorRating = 0; }
    if(e.armorRating == null){ e.armorRating = 0; }

    let mind = Math.round((l.minDamage * t.m) * level/4);
    let maxd = Math.round((l.maxDamage * t.m) * level/4);
    let minh = Math.round((l.minHeal * t.m) * level/4);
    let maxh = Math.round((l.maxHeal * t.m) * level/4);

    let emind = Math.round((e.minDamage * t.m) * level/4);
    let emaxd = Math.round((e.maxDamage * t.m) * level/4);
    let eminh = Math.round((e.minHeal * t.m) * level/4);
    let emaxh = Math.round((e.maxHeal * t.m) * level/4);

    let ar = Math.round((l.armorRating * t.m) * level/4);
    let ear = Math.round((e.armorRating * t.m) * level/4);
    let it = l.itemType;

    let dname = `${t.name} ${l.name}`;
    if(e.name != null){ dname = dname + ` of ${e.name}`; }

    let item = { displayName: dname, level: level, count: 1, itemType: it };

    if(ar > 0){ item.armorRating = ar; }
    if(mind + emind > 0){ item.minDamage = mind + emind; }
    if(maxd + emaxd > 0){ item.maxDamage = maxd + emaxd; }
    if(minh + eminh > 0){ item.minHeal = minh + eminh; }
    if(maxh + emaxh > 0){ item.maxHeal = maxh + emaxh; }
    if(e != null){ item.enchant = e; }
    if(ear > 0){ item.enchant.armorRating = ear; }
    if(l != null){ item.baseItem = l; }
    if(t != null){ item.baseMaterial = t; }
    if(l.itemSubType != null){ item.itemSubType = l.itemSubType; }
    if(l.slots != null){ item.slots = l.slots; }

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
function getLevelLootChest(){
    let amt = Math.round(Math.random() * 2.25) + 1 + Math.round(Math.random() * 1.25); //Math.round(Math.random() * 2.5) + 1
    return getLootChest(amt, Level);
}
function getRandomFromArray(arr){
    if(arr == null){
        error(`<w>[getRandomFromArray]</w> Array specified cannot be null.`);
        return null;
    }
    return arr[Math.floor(Math.random(0, 1) * arr.length)];
}
function getRandomFromProbability(arr, level){
    level = level || Infinity;
    if(arr == null){
        error(`<w>[getRandomFromProbability]</w> Array specified cannot be null.`);
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

    let l = { displayName: item.displayName, level: item.level, count: item.count, itemType: item.itemType, baseItem: item.baseItem, baseMaterial: item.baseMaterial };

    if(item.armorRating > 0){ l.armorRating = item.armorRating; }
    if(item.minDamage > 0){ l.minDamage = item.minDamage; }
    if(item.maxDamage > 0){ l.maxDamage = item.maxDamage; }
    if(item.minHeal > 0){ l.minHeal = item.minHeal; }
    if(item.maxHeal > 0){ l.maxHeal = item.maxHeal; }
    if(item.enchant != null){ l.enchant = item.enchant; }
    if(item.itemSubType != null){ l.itemSubType = item.itemSubType; }
    if(item.slots != null){ l.slots = item.slots; }

    for (var i = 0; i < Inventory.length; i++) {
        if(Inventory[i] == null){
            Inventory[i] = l;
            info(`<w>${l.displayName}</w> added.`);
            updateInventory();
            return;
        }
    }
    //TODO
    if(isInChest(Room.loot,l)){
        getFromChest(Room.loot,l).count++;
    } else {
        Room.loot.push(l);
    }
    error(`Your inventory is already full. (<w>${Inventory.length} / ${Inventory.length}</w> slots occupied).`);
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
    let val = getCurrencyAmountString(getItemValue(item));
    let g = val.split(/(\d+)g .+s .+b/gmi)[1];
    let s = val.split(/(\d+)s .+b/gmi)[1];
    let b = val.split(/(\d+)b/gmi)[1];

    if(b != null){ Bronze += Number(b); }
    if(s != null){ Silver += Number(s); }
    if(g != null){ Gold += Number(g); }

    removeItem(item);
}
function buyItem(item){
    let val = getCurrencyAmountString(getItemValue(item));

    let our_total = Bronze + (Silver * 100) + (Gold * 10000);
    let item_total = getItemValue(item);

    if(our_total >= item_total){
        our_total -= item_total;
        setCurrencyToTotal(our_total);
        addItem(item);
    } else {
        error(`You do not have enough to purchase this item.`);
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
    //delete Equipped[Equipped.indexOf(item)];

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
    if (info.style.display != "block" || info.innerHTML.includes(item.displayName) == false) {
        info.style.display = "block";
        info.innerHTML = `<p>${item.displayName}</p>
        Type: <w>${applyUppercaseFirst(item.itemType)}</w><br>
        Level: <w>${item.level}</w>`;

        if(item.maxDamage != null && item.minDamage != null){
            let same = Equipped.filter(function(a){ if(a != null && a.itemType == item.itemType && a.itemSubType == item.itemSubType){ return a; } })[0];
            let same_min = 0;
            let same_max = 0;
            if(same == null){ same_min = 0; same_max = 0; } else { same_min = same.minDamage; same_max = same.maxDamage; }
            //let range_diff = `${getItemDifference(same_min,item.minDamage)} ${getItemDifference(same_max,item.maxDamage)}`.replace(/\) \(/gm,`, `);
            let range_diff = getItemDifferenceRange(same_min,same_max,item.minDamage,item.maxDamage);
            info.innerHTML += `<br>Damage: <w>${item.minDamage}</w>-<w>${item.maxDamage}</w> HP ${range_diff}`;
        }
        if(item.maxHeal != null && item.minHeal != null){
            let same = Equipped.filter(function(a){ if(a != null && a.itemType == item.itemType && a.itemSubType == item.itemSubType){ return a; } })[0];
            let same_min = 0;
            let same_max = 0;
            if(same == null){ same_min = 0; same_max = 0; } else { same_min = same.minHeal; same_max = same.maxHeal; }
            // let range_diff = `${getItemDifference(same_min,item.minHeal)} ${getItemDifference(same_max,item.maxHeal)}`.replace(/\) \(/gm,`, `);
            let range_diff = getItemDifferenceRange(same_min,same_max,item.minHeal,item.maxHeal);
            info.innerHTML += `<br>Heals: <w>${item.minHeal}</w>-<w>${item.maxHeal}</w> HP ${range_diff}`;
        }
        if(item.armorRating != null){
            let same = Equipped.filter(function(a){ if(a != null && a.itemType == item.itemType && a.itemSubType == item.itemSubType){ return a; } })[0];
            if(same == null){ same = 0; } else { same = same.armorRating; }
            info.innerHTML += `<br>Armor Rating: <w>${item.armorRating}</w> ${getItemDifference(same,item.armorRating)}`;
        }
        if(item.slots != null){
            let same = Equipped.filter(function(a){ if(a != null && a.itemType == item.itemType){ return a; } })[0];
            if(same == null){ same = 0; } else { same = same.slots; }
            info.innerHTML += `<br>Slots: <w>${item.slots}</w> ${getItemDifference(same.slots,item.slots)}`;
        }
        info.innerHTML += `<br>Value: <w>${getCurrencyAmountString(getItemValue(item))}</w><br><br>`;

        if(isSellable(item)){
            let sell_b = document.createElement(`button`);
            sell_b.id = `sell ${item.displayName}`;
            sell_b.className = `button`;
            sell_b.innerHTML = `Sell`;
            sell_b.onclick = function(){ sellItem(item); hideItemInfo(); }
            info.appendChild(sell_b);
        }
        if(isEquippable(item)){
            let equip_b = document.createElement(`button`);
            equip_b.id = `equip ${item.displayName}`;
            equip_b.className = `button`;
            if(isInInventory(item) && isEquipped(item)){ equip_b.innerHTML = `Unequip`; } else { equip_b.innerHTML = `Equip`; }
            equip_b.onclick = function(){ toggleEquipItem(item); hideItemInfo(); }
            info.appendChild(equip_b);
        }
        let drop_b = document.createElement(`button`);
        drop_b.id = `drop ${item.displayName}`;
        drop_b.className = `button`;
        if(isInInventory(item)){
            drop_b.innerHTML = `Drop`;
            drop_b.onclick = function(){ removeItem(item); hideItemInfo(); }
        } else if(isBuyable(item)){
            drop_b.innerHTML = `Buy`;
            drop_b.onclick = function(){ buyItem(item); hideItemInfo(); updateChestInventory(Room.shop.items, true); }
        } else {
            drop_b.innerHTML = `Take`;
            drop_b.onclick = function(){ Room.loot.splice(Room.loot.indexOf(item),1); addItem(item); hideItemInfo(); updateChestInventory(Room.loot, false); }
        }
        info.appendChild(drop_b);
    }
}
function hideItemInfo(){
    var info = document.getElementById("iteminfo");
    if (info.innerHTML != ``) {
        info.style.display = "none";
        info.innerHTML = ``;
    }
}
function toggleItemInfo(item){
    var info = document.getElementById("iteminfo");
    if(info.innerHTML.includes(item.displayName) == false){
        showItemInfo(item);
    } else {
        hideItemInfo();
    }
}
function getItemFromName(material, item, enchant){
    let foundmat;
    let foundloot;
    let foundenchant;

    for (var i = 0; i < lootTypes.length; i++) {
        if(lootTypes[i].name == material){
            foundmat = lootTypes[i];
        }
    }
    for (var i = 0; i < loot.length; i++) {
        if(loot[i].name == item){
            foundloot = loot[i];
        }
    }
    if(enchant != null){
        for (var i = 0; i < foundmat.enchants.length; i++) {
            if(foundmat.enchants[i].name == enchant){
                foundenchant = foundmat.enchants[i];
            }
        }
    }
    if(foundenchant == null){
        foundenchant = enchantments[0];
    }

    if(foundloot.minDamage == null){ foundloot.minDamage = 0; }
    if(foundloot.maxDamage == null){ foundloot.maxDamage = 0; }
    if(foundenchant.minDamage == null){ foundenchant.minDamage = 0; }
    if(foundenchant.maxDamage == null){ foundenchant.maxDamage = 0; }

    if(foundloot.minHeal == null){ foundloot.minHeal = 0; }
    if(foundloot.maxHeal == null){ foundloot.maxHeal = 0; }
    if(foundenchant.minHeal == null){ foundenchant.minHeal = 0; }
    if(foundenchant.maxHeal == null){ foundenchant.maxHeal = 0; }

    if(foundloot.armorRating == null){ foundloot.armorRating = 0; }

    let mind = Math.round((foundloot.minDamage * foundmat.m) * Level/4);
    let maxd = Math.round((foundloot.maxDamage * foundmat.m) * Level/4);
    let minh = Math.round((foundloot.minHeal * foundmat.m) * Level/4);
    let maxh = Math.round((foundloot.maxHeal * foundmat.m) * Level/4);
    let emind = Math.round((foundenchant.minDamage * foundmat.m) * Level/4);
    let emaxd = Math.round((foundenchant.maxDamage * foundmat.m) * Level/4);
    let eminh = Math.round((foundenchant.minHeal * foundmat.m) * Level/4);
    let emaxh = Math.round((foundenchant.maxHeal * foundmat.m) * Level/4);
    let ar = Math.round((foundloot.armorRating * foundmat.m) * Level/4);
    let it = foundloot.itemType;

    let range = Math.round((Math.pow(Level,2)/Level/4)+3);
    let lvl = Math.round((Math.random() * range)+Level/1.25);

    let dname = `${foundmat.name} ${foundloot.name}`;
    if(foundenchant.name != null){ dname = dname + ` of ${foundenchant.name}`; }

    let found = { displayName: dname, level: lvl, count: 1, itemType: it };

    if(ar > 0){ found.armorRating = ar; }
    found.enchant = foundenchant;
    if(mind + emind > 0){ found.minDamage = mind + emind; }
    if(maxd + emaxd > 0){ found.maxDamage = maxd + emaxd; }
    if(minh + eminh > 0){ found.minHeal = minh + eminh; }
    if(maxh + emaxh > 0){ found.maxHeal = maxh + emaxh; }
    if(foundloot != null){ found.baseItem = foundloot; }
    if(foundmat != null){ found.baseMaterial = foundmat; }
    if(foundloot.itemSubType != null){ found.itemSubType = foundloot.itemSubType; }
    if(foundloot.slots != null){ found.slots = foundloot.slots; }

    return found;
}
