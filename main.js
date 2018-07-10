var w = window.innerWidth - 20;
var h = window.innerHeight - 60;

// ATTRIBUTES
var Level = 1;
var MaxHealth = getMaxHealth();
var Health = MaxHealth;
var Experience = 0;
var ExperienceToNext = getExperienceToNext();

// ITEMS
var Inventory = [];
var Equipped = [];

// CURRENCY
var Bronze = 0;
var Silver = 0;
var Gold = 0;

// LOCATION
var Room = {};

// System
function setup() {
    updateArrayItems();
    addItem(quests[0].items[0]);
    addItem(quests[0].items[1]);

    createHTMLButton("Max HP", function(){ Health = MaxHealth; }, "debug");
    createHTMLButton("Level Up", function(){ Experience += ExperienceToNext-Experience; }, "debug");
    createHTMLButton("+10% XP", function(){ Experience += Math.round(ExperienceToNext/10); }, "debug");
    createHTMLButton("+1 Bronze", function(){ Bronze += 1; }, "debug");
    createHTMLButton("+1 Silver", function(){ Silver += 1; }, "debug");
    createHTMLButton("+1 Gold", function(){ Gold += 1; }, "debug");

    moveTo(locations[1].name);
    updateDirections();
}

function createHTMLButton(name, e, id){
    let b = document.createElement("button");

    b.className = "button";
    b.id = name;
    b.innerHTML = name;
    b.onclick = e;

    document.getElementById(id).appendChild(b);
}

function draw() {
    drawDocument();

    if(Experience > ExperienceToNext - 1){
        Experience -= ExperienceToNext;
        levelUp();
    } else if(Experience < 0){
        Experience = 0;
    }

    if(Bronze > 99 || Silver > 99){
        getCurrencyAmounts();
    }

    if(Level > 100){
        Level = 100;
        error(`You've already reached the highest level!`);
    }
}
function drawDocument(){
    if(document.getElementById(`a_level`).innerHTML != `Level <w>${Level}</w>`){ document.getElementById(`a_level`).innerHTML = `Level <w>${Level}</w>`; }
    if(document.getElementById(`a_health`).innerHTML != `<w>${Health}</w> / ${MaxHealth} HP`){ document.getElementById(`a_health`).innerHTML = `<w>${Health}</w> / ${MaxHealth} HP`; }
    if(document.getElementById(`a_experience`).innerHTML != `<w>${Experience}</w> / ${ExperienceToNext} XP`){ document.getElementById(`a_experience`).innerHTML = `<w>${Experience}</w> / ${ExperienceToNext} XP`; }

    if(document.getElementById(`bronze`).innerHTML != `<w>${Bronze}</w>b`){ document.getElementById(`bronze`).innerHTML = `<w>${Bronze}</w>b`; }
    if(document.getElementById(`silver`).innerHTML != `<w>${Silver}</w>s`){ document.getElementById(`silver`).innerHTML = `<w>${Silver}</w>s`; }
    if(document.getElementById(`gold`).innerHTML != `<w>${Gold}</w>g`){ document.getElementById(`gold`).innerHTML = `<w>${Gold}</w>g`; }

    if(document.getElementById(`bar`).style != `width: ${Math.round((Experience/ExperienceToNext)*318)}px`){ document.getElementById(`bar`).style = `width: ${Math.round((Experience/ExperienceToNext)*318)}px`; }

    let actionsHTML = `<p>Actions</p>`;
    if(Room.loot.length > 0){
        actionsHTML = actionsHTML + `<button class="button" id="chest">Open Chest</button>`;
    }
    if(Room.shop != null){
        actionsHTML = actionsHTML + `<button class="button" id="buy">Buy (${Room.shop.name})</button>`;
    }
    if(Room.inn != null){
        actionsHTML = actionsHTML + `<button class="button" id="sleep">Sleep (${getCurrencyAmountString(Room.inn.bedPrice)})</button>`;
    }

    if(document.getElementById("actions").innerHTML != actionsHTML){
        document.getElementById(`actions`).innerHTML = actionsHTML;
        document.getElementById(`actions`).style.display = "block";
        if(Room.loot.length > 0){
            document.getElementById(`chest`).onclick = function(){
                toggleChestInventory(Room.loot, false);
            }
        }
        if(Room.shop != null){
            document.getElementById(`buy`).onclick = function(){
                toggleChestInventory(Room.shop.items, true);
            }
        }
        if(Room.inn != null){
            document.getElementById(`sleep`).onclick = function(){
                sleep();
            }
        }
    } else if (Room.shop == null && Room.loot.length < 1 && document.getElementById(`actions`).style.display != `none` && document.getElementById(`chestinv`).style.display != `none`){
        document.getElementById(`actions`).style.display = `none`;
        document.getElementById(`actions`).innerHTML = ``;
        document.getElementById(`chestinv`).style.display = `none`;
        document.getElementById(`chestinv`).innerHTML = ``;
    } else if(actionsHTML == `<p>Actions</p>`){
        document.getElementById(`actions`).style.display = `none`;
    }
}

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
    if(ear > 0){ item.enchant.armorRating = ear; }
    if(mind + emind > 0){ item.minDamage = mind + emind; }
    if(maxd + emaxd > 0){ item.maxDamage = maxd + emaxd; }
    if(minh + eminh > 0){ item.minHeal = minh + eminh; }
    if(maxh + emaxh > 0){ item.maxHeal = maxh + emaxh; }
    if(e != null){ item.enchant = e; }
    if(l != null){ item.baseItem = l; }
    if(t != null){ item.baseMaterial = t; }

    return item;
}
function getLootChest(amt, level){
    let arr = [];
    let amtwait = Math.round(amt * 1.1);

    for (var i = 0; i < amt; i++) {
        var l = getRandomLoot( getRandomFloat(Math.max(level - 5, 1), level + 2) );
        arr.push(l);
    }
    return arr;
}
function getLevelLootChest(){
    return getLootChest(Math.round(Math.random() * 1.5) + 1, Level);
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

    Inventory.push(l);
    info(`<w>${l.displayName}</w> added.`);
    updateInventory();
}
function removeItem(item){
    for (var i = 0; i < Inventory.length; i++) {
        if(Inventory[i].displayName == item.displayName){
            Inventory[i].count--;
            if(Inventory[i].count < 1){
                Inventory.splice(i,1);
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
function toggleEquipItem(item){
    if(isEquipped(item)){
        Equipped.splice(Equipped.indexOf(item),1);
        return;
    }
    Equipped.push(item);
}
function showItemInfo(item){
    var info = document.getElementById("iteminfo");
    if (info.style.display != "block" || info.innerHTML.includes(item.displayName) == false) {
        info.style.display = "block";
        info.innerHTML = `<p>${item.displayName}</p>
        Type: <w>${applyUppercaseFirst(item.itemType)}</w><br>
        Level: <w>${item.level}</w>`;

        if(item.maxDamage != null && item.minDamage != null){
            info.innerHTML += `<br>Damage: <w>${item.minDamage}</w>-<w>${item.maxDamage}</w> HP`;
        }
        if(item.maxHeal != null && item.minHeal != null){
            info.innerHTML += `<br>Heals: <w>${item.minHeal}</w>-<w>${item.maxHeal}</w> HP`;
        }
        if(item.armorRating != null){
            info.innerHTML += `<br>Armor Rating: <w>${item.armorRating}</w>`;
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
        } else if(Room.shop != null){
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
        for (var i = 0; i < enchantments.length; i++) {
            if(enchantments[i].name == enchant){
                foundenchant = enchantments[i];
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

    let dname = `${foundmat.name} ${foundloot.name}`;
    if(foundenchant.name != null){ dname = dname + ` of ${foundenchant.name}`; }

    let found = { displayName: dname, level: Level, count: 1, itemType: it };

    if(ar > 0){ found.armorRating = ar; }
    found.enchant = foundenchant;
    if(mind + emind > 0){ found.minDamage = mind + emind; }
    if(maxd + emaxd > 0){ found.maxDamage = maxd + emaxd; }
    if(minh + eminh > 0){ found.minHeal = minh + eminh; }
    if(maxh + emaxh > 0){ found.maxHeal = maxh + emaxh; }
    if(foundloot != null){ found.baseItem = foundloot; }
    if(foundmat != null){ found.baseMaterial = foundmat; }

    return found;
}
function updateArrayItems(){
    quests[0].items.push(getItemFromName(`Basic Leather`,`Shirt`));
    quests[0].items.push(getItemFromName(`Basic Leather`,`Leggings`));

    locations[2].loot = getLevelLootChest();
    locations[2].loot.splice(0,1);
    locations[2].loot.push(
        getItemFromName(`Hide`,`Shoes`),
        { displayName:`Bronze`, itemType:`Bronze`, count: Math.round((Math.random()*25)+75) },
        { displayName:`Silver`, itemType:`Silver`, count: 1 }
    );

    locations[5].shop.items.push(
        getItemFromName(`Basic Leather`,`Shoes`),
        getItemFromName(`Basic Leather`,`Shirt`),
        getItemFromName(`Basic Leather`,`Jacket`),
        getItemFromName(`Basic Leather`,`Leggings`),
        getItemFromName(`Basic Leather`,`Gauntlets`),
        getItemFromName(`Iron`,`Sword`),
        getItemFromName(`Iron`,`Dagger`),
        getLevelLoot(),
        getLevelLoot(),
        getLevelLoot(),
        getLevelLoot()
    );

    locations[4].shop.items.push(
        getItemFromName(`Cloth`,`Rag`)
    );
}

// Checks
function isSellable(item){
    if(isInInventory(item) && Room.shop != null){ return true; }
    return false;
}
function isEquippable(item){
    if(isInInventory(item) && item.itemType != `Junk`){ return true; }
    return false;
}
function isInInventory(item){
    for (var i = 0; i < Inventory.length; i++) {
        if(Inventory[i] == item){
            return true;
        }
    }
    return false;
}
function isEquipped(item){
    for (var i = 0; i < Equipped.length; i++) {
        if(Equipped[i] == item){
            return true;
        }
    }
    return false;
}

// Misc
function sleep(){
    let val = getCurrencyAmountString(Room.inn.bedPrice);

    let our_total = Bronze + (Silver * 100) + (Gold * 10000);
    let item_total = Room.inn.bedPrice;

    if(our_total >= item_total){
        our_total -= item_total;
        setCurrencyToTotal(our_total);
        Health = MaxHealth;
    } else {
        error(`You do not have enough to sleep here.`);
    }
}

// Inventory
function toggleInventory(){
    var inv = document.getElementById("inventory");
    var invbutton = document.getElementById("toggleInventory");
    if (inv.style.display == "none") {
        inv.style.display = "block";
        invbutton.innerHTML = "Hide Inventory";
        updateInventory();
    } else {
        inv.style.display = "none";
        invbutton.innerHTML = "Show Inventory";
    }
}
function toggleChestInventory(chest, isStore){
    var chestinv = document.getElementById("chestinv");
    if(chestinv.style.display == "none"){
        chestinv.style.display = "block";
        updateChestInventory(chest, isStore);
    } else {
        chestinv.style.display = "none";
        chestinv.innerHTML = ``;
    }
}
function updateChestInventory(chest, isStore){
    var chestinv = document.getElementById("chestinv");
    if(chestinv.style.display == `block`){
        let itemHTML = `<p>Chest Inventory</p>`;
        if(isStore == true){
            itemHTML = `<p>${Room.shop.name}</p>`;
        }
        chestinv.innerHTML = itemHTML;
        for (var i = 0; i < chest.length; i++) {
            let dname = chest[i].displayName;
            if(chest[i].count > 1){
                dname = `${chest[i].displayName} (${chest[i].count})`;
            }
            let button = document.createElement(`button`);
            button.className = `button`;
            button.id = `chest ${chest[i].displayName}`;
            button.innerHTML = dname;
            button.style.fontWeight = `normal`;
            button.style.fontSize = `11px`;
            button.style.borderColor = `black`;
            button.style.backgroundColor = `black`;
            if(chest[i].itemType == `Weapon`){
                button.style.borderColor = `red`;
                button.style.backgroundColor = `red`;
            } else if(chest[i].itemType == `Wearable`){
                button.style.borderColor = `#31c431`;
                button.style.backgroundColor = `#31c431`;
            } else if(chest[i].itemType == `Inventory`){
                button.style.borderColor = `#e2c322`;
                button.style.backgroundColor = `#e2c322`;
            } else if(chest[i].itemType == `Junk`){
                button.style.borderColor = `gray`;
                button.style.backgroundColor = `gray`;
            } else if(chest[i].itemType == `Bronze`){
                button.style.borderColor = `#cd7f32`;
                button.style.backgroundColor = `#cd7f32`;
            } else if(chest[i].itemType == `Silver`){
                button.style.borderColor = `#c0c0c0`;
                button.style.backgroundColor = `#c0c0c0`;
            } else if(chest[i].itemType == `Gold`){
                button.style.borderColor = `#d8c250`;
                button.style.backgroundColor = `#d8c250`;
            }
            if(chest[i].enchant != null && chest[i].enchant.name != null){
                button.style.borderLeft = `5px solid white`;
            }
            chestinv.appendChild(button);
        }
        for (var i = 0; i < chest.length; i++) {
            let itm = chest[i];
            let index = i;
            let el_ = document.getElementById(`chest ${itm.displayName}`);
            if(itm.itemType == `Bronze`){
                el_.onclick = function(){ Bronze += itm.count; chest.splice(chest.indexOf(itm),1); updateChestInventory(chest, false); }
                continue;
            } else if(itm.itemType == `Silver`){
                el_.onclick = function(){ Silver += itm.count; chest.splice(chest.indexOf(itm),1); updateChestInventory(chest, false); }
                continue;
            } else if(itm.itemType == `Gold`){
                el_.onclick = function(){ Gold += itm.count; chest.splice(chest.indexOf(itm),1); updateChestInventory(chest, false); }
                continue;
            }
            el_.onclick = function(){ toggleItemInfo(itm); }
        }
    }
}
function updateInventory(){
    var inv = document.getElementById(`inventory`);
    if(Inventory.length > 0){
        let invHTML = `<p>Inventory</p>`;
        inv.innerHTML = invHTML;
        for (var i = 0; i < Inventory.length; i++) {
            let dname = Inventory[i].displayName;
            if(Inventory[i].Inventory > 1){
                dname = `${Inventory[i].displayName} (${Inventory[i].count})`;
            }
            let button = document.createElement(`button`);
            button.className = `button`;
            button.id = `${Inventory[i].displayName}`;
            button.innerHTML = dname;
            button.style.fontWeight = `normal`;
            button.style.fontSize = `11px`;
            button.style.borderColor = `black`;
            button.style.backgroundColor = `black`;
            if(Inventory[i].itemType == `Weapon`){
                button.style.borderColor = `red`;
                button.style.backgroundColor = `red`;
            } else if(Inventory[i].itemType == `Wearable`){
                button.style.borderColor = `#31c431`;
                button.style.backgroundColor = `#31c431`;
            } else if(Inventory[i].itemType == `Inventory`){
                button.style.borderColor = `#e2c322`;
                button.style.backgroundColor = `#e2c322`;
            } else if(Inventory[i].itemType == `Junk`){
                button.style.borderColor = `gray`;
                button.style.backgroundColor = `gray`;
            } else if(Inventory[i].itemType == `Bronze`){
                button.style.borderColor = `#cd7f32`;
                button.style.backgroundColor = `#cd7f32`;
            } else if(Inventory[i].itemType == `Silver`){
                button.style.borderColor = `#c0c0c0`;
                button.style.backgroundColor = `#c0c0c0`;
            } else if(Inventory[i].itemType == `Gold`){
                button.style.borderColor = `#d8c250`;
                button.style.backgroundColor = `#d8c250`;
            }
            if(Inventory[i].enchant != null && Inventory[i].enchant.name != null){
                button.style.borderLeft = `5px solid white`;
            }
            inv.appendChild(button);
        }
        for (var i = 0; i < Inventory.length; i++) {
            let itm = Inventory[i];
            let index = i;
            let el_ = document.getElementById(`${itm.displayName}`);
            el_.onclick = function(){ toggleItemInfo(itm); }
        }
    } else {
        let invHTML = `<p>Inventory</p>`;
        inv.innerHTML = invHTML;
    }
}

// Level
function levelUp(){
    Level ++;
    MaxHealth = getMaxHealth();
    Health = MaxHealth;

    ExperienceToNext = getExperienceToNext();
}

// Direction
function moveTo(name){
    let newRoom = getLocationByName(name);

    if(discovered.indexOf(newRoom) < 0){
        info(`<w>${newRoom.displayName}, ${newRoom.region.name}</w> discovered.`);
        if(getLocationByName(name).city == true){
            info(`You gained <w>5 XP</w>.`);
            Experience += 5;
        }
        discovered.push(newRoom);
    }

    Room = newRoom;
    updateDirections();
}
function getLocationByName(name){
    for (var i = 0; i < locations.length; i++) {
        if(locations[i].name == name){
            return locations[i];
        }
    }
    return null;
}
function updateDirections(){
    let el = document.getElementById("locations");
    el.innerHTML = `<p>${Room.displayName} Locations</p>`;

    if(Room.directions == null){
        return;
    }
    for (var i = 0; i < Room.directions.length; i++) {
        let dir = Room.directions[i];
        let loc = getLocationByName(dir);
        if(dir != null){
            let b = document.createElement(`button`);
            b.innerHTML = `${getLocationByName(dir).displayName}`;//dir;
            b.className = `button`;
            b.id = dir;
            b.style.marginLeft = `0px`;
            b.style.fontSize = `14px`;
            b.style.borderColor = `#63B1FF`;
            if(loc.city == true || loc.shop != null || loc.inn != null){
                let b_ = document.createElement(`div`);
                let s_ = document.createElement(`span`);
                b_.style.position = `absolute`;
                b_.style.color = `#63B1FF`;
                b_.style.fontSize = `10px`;
                b_.style.transform = `rotateZ(45deg)`;

                b_.style.left = `5px`;
                b_.style.width = `25px`;
                b_.style.height = `25px`;
                b_.style.display = `inline`;

                s_.style.marginRight = `25px`;
                b.appendChild(s_);
                if(loc.city == true){ b_.innerHTML = `City`; } else if(loc.inn != null) { b_.innerHTML = `Inn`; } else if (loc.shop != null){ b_.innerHTML = `Shop`; }

                b.appendChild(b_);
                b.style.borderLeft = `25px solid white`;
            }
            b.style.backgroundColor = `#63B1FF`;
            b.style.width = `300px`;
            el.appendChild(b);
        }
    }
    for (var i = 0; i < Room.directions.length; i++) {
        let dir_ = Room.directions[i];
        let el_ = document.getElementById(Room.directions[i]);
        if(el_ != null){
            el_.onclick = function(){ moveTo(dir_); }
        }
    }
}

// Events
function info(text){
    displayMessage(text, `#0181ff`);
}
function error(text){
    displayMessage(text, `#ef3232`);
}
function displayMessage(text, color){
    let _info = document.getElementById(`info`);
    let index = _info.childNodes.length;
    let dur = Math.round((text.length / 26)+5);

    _infotext = document.createElement(`info`);
    _infotext.id = `info${index}`;
    _infotext.style.backgroundColor = `${color}25`;
    _infotext.style.borderLeft = `solid 5px ${color}`;
    _infotext.style.color = `${color}`;
    _infotext.innerHTML = text;

    _info.appendChild(_infotext);
    _infotext.style.animation = `none`;
    _infotext.style.animation = `fadeInOut ${dur}s`;
    setTimeout(function(){ _info.removeChild(document.getElementById(`info${index}`)); }, (dur*1000)+1);
}

// Formatting
function applyUppercaseFirst(str) {
    str = str + `.`;
    return str.replace(/.+?[\.\?\!](\s|$)/g, function (txt) {
        let a = txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        return a.substring(0,a.length-1);
    });
}
function applySentenceCase(str) {
    return str.replace(/.+?[\.\?\!](\s|$)/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}
