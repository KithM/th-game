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

    Room = locations[1];
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
        window.alert(`You've already reached the highest level!`);
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
    if(Room.shop != undefined){
        actionsHTML = actionsHTML + `<button class="button" id="buy">Buy</button>`;
    }

    if(document.getElementById("actions").innerHTML != actionsHTML){
        document.getElementById(`actions`).innerHTML = actionsHTML;
        document.getElementById(`actions`).style.display = "block";
        if(Room.loot.length > 0){
            document.getElementById(`chest`).onclick = function(){
                toggleChestInventory(Room.loot, false);
            }
        }
        if(Room.shop != undefined){
            document.getElementById(`buy`).onclick = function(){
                toggleChestInventory(Room.shop.items, true);
            }
        }
    } else if (Room.shop == undefined && Room.loot.length < 1 && document.getElementById(`actions`).style.display != `none` && document.getElementById(`chestinv`).style.display != `none`){
        document.getElementById(`actions`).style.display = `none`;
        document.getElementById(`actions`).innerHTML = ``;
        document.getElementById(`chestinv`).style.display = `none`;
        document.getElementById(`chestinv`).innerHTML = ``;
    } else if(actionsHTML == `<p>Actions</p>`){
        document.getElementById(`actions`).style.display = `none`;
    }

    if(Inventory.length > 0){
        let invHTML = `<p>Inventory</p>`;
        for (var i = 0; i < Inventory.length; i++) {
            let itemHTML = ``;
            let dname = Inventory[i].displayName;

            if(Inventory[i].count < 1){
                removeItem(Inventory[i]);
                continue;
            } else if(Inventory[i].count > 1){
                //dname = `${Inventory[i].displayName} x${Inventory[i].count}`;
                dname = `${Inventory[i].displayName} (${Inventory[i].count})`;
            }

            if(Inventory[i].itemType == `Weapon`){
                if(Inventory[i].enchant.name != undefined){
                    itemHTML = `<button class="button" id="${Inventory[i].displayName}" style="font-weight: normal; font-size: 11px; border-color:red; background-color:red; border-left-color:white; border-left-width:5px; border-left-style:solid;">${dname}</button>`;
                } else {
                    itemHTML = `<button class="button" id="${Inventory[i].displayName}" style="font-weight: normal; font-size: 11px; border-color:red; background-color:red;">${dname}</button>`;
                }
            } else if(Inventory[i].itemType == `Wearable`){
                if(Inventory[i].enchant.name != undefined){
                    itemHTML = `<button class="button" id="${Inventory[i].displayName}" style="font-weight: normal; font-size: 11px; border-color:#31c431; background-color:#31c431; border-left-color:white; border-left-width:5px; border-left-style:solid;">${dname}</button>`;
                } else {
                    itemHTML = `<button class="button" id="${Inventory[i].displayName}" style="font-weight: normal; font-size: 11px; border-color:#31c431; background-color:#31c431;">${dname}</button>`;
                }
            } else if(Inventory[i].itemType == `Inventory`){
                if(Inventory[i].enchant.name != undefined){
                    itemHTML = `<button class="button" id="${Inventory[i].displayName}" style="font-weight: normal; font-size: 11px; border-color:#e2c322; background-color:#e2c322; border-left-color:white; border-left-width:5px; border-left-style:solid;">${dname}</button>`;
                } else {
                    itemHTML = `<button class="button" id="${Inventory[i].displayName}" style="font-weight: normal; font-size: 11px; border-color:#e2c322; background-color:#e2c322;">${dname}</button>`;
                }
            } else if(Inventory[i].itemType == `Junk`){
                if(Inventory[i].enchant.name != undefined){
                    itemHTML = `<button class="button" id="${Inventory[i].displayName}" style="font-weight: normal; font-size: 11px; border-color:gray; background-color:gray; border-left-color:white; border-left-width:5px; border-left-style:solid;">${dname}</button>`;
                } else {
                    itemHTML = `<button class="button" id="${Inventory[i].displayName}" style="font-weight: normal; font-size: 11px; border-color:gray; background-color:gray;">${dname}</button>`;
                }
            }
            invHTML = invHTML + itemHTML;
        }
        if(document.getElementById("inventory").innerHTML != invHTML){
            document.getElementById("inventory").innerHTML = invHTML;
            for (var j = 0; j < Inventory.length; j++) {
                let itm = Inventory[j];
                document.getElementById(itm.displayName).onclick = function(){ toggleItemInfo(itm); }
            }
        }
    } else {
        if(document.getElementById("inventory").innerHTML != `<p>Inventory</p>`){
            document.getElementById("inventory").innerHTML = `<p>Inventory</p>`;
        }
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
            if( l.ignoreTypes == undefined && l.onlyTypes == undefined ){
                return type;
            } else if( l.onlyTypes != undefined && l.onlyTypes.indexOf(type.name) > -1 ){
                return type;
            } else if( l.ignoreTypes != undefined && l.ignoreTypes.indexOf(type.name) < 0 ){
                return type;
            } else if( l.ignoreTypes != undefined && l.onlyTypes != undefined && l.ignoreTypes.indexOf(type.name) < 0 && l.onlyTypes.indexOf(type.name) > -1 ){
                return type;
            }
        } else {
            //console.log(`out of level range. level: ${level}, type level: ${type.level}, range: ${level-range}-${level+range}`);
            return null;
        }
        //console.log(`did not match one of the statements.`);
        return null;
    });
    //console.log(`finished filtering lootTypes. found ${avail_t.length} available types.`);

    if(avail_t.length < 1){ return getLevelLoot(); }

    let t = getRandomFromProbability( avail_t, ranged );
    let avail_e = t.enchants.filter(function(enchant){
        if( enchant.onlyTypes == undefined && enchant.ignoreTypes == undefined ){
            return enchant;
        } else if( enchant.onlyTypes != undefined && enchant.onlyTypes.indexOf(l.itemType) > -1 ){
            return enchant;
        } else if( enchant.ignoreTypes != undefined && enchant.ignoreTypes.indexOf(l.itemType) < 0 ){
            return enchant;
        } else if( enchant.ignoreTypes != undefined && enchant.onlyTypes != undefined && enchant.ignoreTypes.indexOf(l.itemType) < 0 && enchant.onlyTypes.indexOf(l.itemType) > -1){
            return enchant;
        }
        return null;
    });
    let e = getRandomFromProbability( avail_e );
    //e = getRandomFromProbability(t.enchants);

    if(l.minDamage == undefined){ l.minDamage = 0; }
    if(l.maxDamage == undefined){ l.maxDamage = 0; }
    if(e.minDamage == undefined){ e.minDamage = 0; }
    if(e.maxDamage == undefined){ e.maxDamage = 0; }

    if(l.minHeal == undefined){ l.minHeal = 0; }
    if(l.maxHeal == undefined){ l.maxHeal = 0; }
    if(e.minHeal == undefined){ e.minHeal = 0; }
    if(e.maxHeal == undefined){ e.maxHeal = 0; }

    if(l.armorRating == undefined){ l.armorRating = 0; }
    if(e.armorRating == undefined){ e.armorRating = 0; }

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
    if(e.name != undefined){ dname = dname + ` of ${e.name}`; }

    let item = { displayName: dname, level: level, count: 1, itemType: it };

    if(ar > 0){ item.armorRating = ar; }
    if(ear > 0){ item.enchant.armorRating = ear; }
    if(mind + emind > 0){ item.minDamage = mind + emind; }
    if(maxd + emaxd > 0){ item.maxDamage = maxd + emaxd; }
    if(minh + eminh > 0){ item.minHeal = minh + eminh; }
    if(maxh + emaxh > 0){ item.maxHeal = maxh + emaxh; }
    if(e != undefined){ item.enchant = e; }
    if(l != undefined){ item.baseItem = l; }
    if(t != undefined){ item.baseMaterial = t; }

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
    if(arr == undefined){
        console.error(`[getRandomFromArray] Array specified cannot be undefined.`);
        return undefined;
    }
    return arr[Math.floor(Math.random(0, 1) * arr.length)];
}
function getRandomFromProbability(arr, level){
    level = level || Infinity;
    if(arr == undefined){
        console.error(`[getRandomFromProbability] Array specified cannot be undefined.`);
        return undefined;
    }

    //let new_arr = Array.from(arr); //arr.map((v, i) => Array(v[2]).fill(i.p)).reduce((c, v) => c.concat(v), []);
    let weights = arr.map((v, i) => Array(v).fill(arr[i].p));//.reduce((c, v) => c.concat(v), []);
    let new_arr = generateWeighedList( arr, weights );

    //console.log(`${arr.length} => ${new_arr.length}`);
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
            return;
        }
    }

    let l = { displayName: item.displayName, level: item.level, count: item.count, itemType: item.itemType, baseItem: item.baseItem, baseMaterial: item.baseMaterial };

    if(item.armorRating > 0){ l.armorRating = item.armorRating; }
    if(item.minDamage > 0){ l.minDamage = item.minDamage; }
    if(item.maxDamage > 0){ l.maxDamage = item.maxDamage; }
    if(item.minHeal > 0){ l.minHeal = item.minHeal; }
    if(item.maxHeal > 0){ l.maxHeal = item.maxHeal; }
    if(item.enchant != undefined){ l.enchant = item.enchant; }

    Inventory.push(l);
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
            return;
        }
    }
}
function sellItem(item){
    let val = getCurrencyAmountString(getItemValue(item));
    let g = val.split(/(\d+)g .+s .+b/gmi)[1];
    let s = val.split(/(\d+)s .+b/gmi)[1];
    let b = val.split(/(\d+)b/gmi)[1];

    if(b != undefined){ Bronze += Number(b); }
    if(s != undefined){ Silver += Number(s); }
    if(g != undefined){ Gold += Number(g); }

    removeItem(item);
}
function buyItem(item){
    let val = getCurrencyAmountString(getItemValue(item));

    let our_total = Bronze + (Silver * 100) + (Gold * 10000);
    let item_total = getItemValue(item);

    if(our_total >= item_total){
        our_total -= item_total;

        let val = getCurrencyAmountString(our_total);
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

        addItem(item);
    } else {
        window.alert(`You do not have enough to purchase this item.`);
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
        info.innerHTML = `
        <p>${item.displayName}</p>
        Type: <w>${applyUppercaseFirst(item.itemType)}</w><br>
        Level: <w>${item.level}</w>
        `;

        if(item.maxDamage != undefined && item.minDamage != undefined){
            info.innerHTML = info.innerHTML + `<br>Damage: <w>${item.minDamage}</w>-<w>${item.maxDamage}</w> HP`;
        }
        if(item.maxHeal != undefined && item.minHeal != undefined){
            info.innerHTML = info.innerHTML + `<br>Heals: <w>${item.minHeal}</w>-<w>${item.maxHeal}</w> HP`;
        }
        if(item.armorRating != undefined){
            info.innerHTML = info.innerHTML + `<br>Armor Rating: <w>${item.armorRating}</w>`;
        }
        info.innerHTML = info.innerHTML + `<br>Value: <w>${getCurrencyAmountString(getItemValue(item))}</w>`;

        info.innerHTML = info.innerHTML + `<br><br>`;
        if(isSellable(item)){ info.innerHTML = info.innerHTML + `<button class="button" id="sell ${item.displayName}">Sell</button>`; }
        if(isInInventory(item) && item.itemType != `Junk`){ info.innerHTML = info.innerHTML + `<button class="button" id="equip ${item.displayName}">Equip</button>`; }
        info.innerHTML = info.innerHTML + `<button class="button" id="drop ${item.displayName}">Drop</button>`;

        if(isSellable(item)){ document.getElementById(`sell ${item.displayName}`).onclick = function(){ sellItem(item); hideItemInfo(); } }
        if(isInInventory(item)){
            if(isEquipped(item)){ document.getElementById(`equip ${item.displayName}`).innerHTML = `Unequip`; } else { document.getElementById(`equip ${item.displayName}`).innerHTML = `Equip`; }
            document.getElementById(`drop ${item.displayName}`).innerHTML = `Drop`;
            document.getElementById(`drop ${item.displayName}`).onclick = function(){ removeItem(item); hideItemInfo(); }
            document.getElementById(`equip ${item.displayName}`).onclick = function(){ toggleEquipItem(item); hideItemInfo(); }
        } else {
            if(document.getElementById(`chestinv`).innerHTML.includes(`Chest`)){
                document.getElementById(`drop ${item.displayName}`).innerHTML = `Take`;
                document.getElementById(`drop ${item.displayName}`).onclick = function(){ Room.loot.splice(Room.loot.indexOf(item),1); addItem(item); hideItemInfo(); updateChestInventory(Room.loot, false); }
            } else {
                document.getElementById(`drop ${item.displayName}`).innerHTML = `Buy`;
                document.getElementById(`drop ${item.displayName}`).onclick = function(){ buyItem(item); hideItemInfo(); updateChestInventory(Room.shop.items, true); }
            }
        }
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
    if(enchant != undefined){
        for (var i = 0; i < enchantments.length; i++) {
            if(enchantments[i].name == enchant){
                foundenchant = enchantments[i];
            }
        }
    }
    if(foundenchant == undefined){
        foundenchant = enchantments[0];
    }

    if(foundloot.minDamage == undefined){ foundloot.minDamage = 0; }
    if(foundloot.maxDamage == undefined){ foundloot.maxDamage = 0; }
    if(foundenchant.minDamage == undefined){ foundenchant.minDamage = 0; }
    if(foundenchant.maxDamage == undefined){ foundenchant.maxDamage = 0; }

    if(foundloot.minHeal == undefined){ foundloot.minHeal = 0; }
    if(foundloot.maxHeal == undefined){ foundloot.maxHeal = 0; }
    if(foundenchant.minHeal == undefined){ foundenchant.minHeal = 0; }
    if(foundenchant.maxHeal == undefined){ foundenchant.maxHeal = 0; }

    if(foundloot.armorRating == undefined){ foundloot.armorRating = 0; }

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
    if(foundenchant.name != undefined){ dname = dname + ` of ${foundenchant.name}`; }

    let found = { displayName: dname, level: Level, count: 1, itemType: it };

    if(ar > 0){ found.armorRating = ar; }
    found.enchant = foundenchant;
    if(mind + emind > 0){ found.minDamage = mind + emind; }
    if(maxd + emaxd > 0){ found.maxDamage = maxd + emaxd; }
    if(minh + eminh > 0){ found.minHeal = minh + eminh; }
    if(maxh + emaxh > 0){ found.maxHeal = maxh + emaxh; }
    if(foundloot != undefined){ found.baseItem = foundloot; }
    if(foundmat != undefined){ found.baseMaterial = foundmat; }

    //console.dir( found );
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
        getItemFromName(`Iron`,`Sword`),
        getLevelLoot(),
        getLevelLoot(),
        getLevelLoot(),
        getLevelLoot()
    );
}

function isSellable(item){
    if(isInInventory(item)){ return true; }
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

// Inventory
function toggleInventory(){
    var inv = document.getElementById("inventory");
    if (inv.style.display == "none") {
        inv.style.display = "block";
        document.getElementById("toggleInventory").innerHTML = "Hide Inventory";
    } else {
        inv.style.display = "none";
        document.getElementById("toggleInventory").innerHTML = "Show Inventory";
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
        let itemHTML = ``;
        if(isStore == false){
            itemHTML = `<p>Chest Inventory</p>`;
        } else {
            itemHTML = `<p>Shop Inventory</p>`;
        }
        for (var i = 0; i < chest.length; i++) {
            let dname = chest[i].displayName;
            if(chest[i].count > 1){
                dname = `${chest[i].displayName} (${chest[i].count})`;
            }
            if(chest[i].itemType == `Weapon`){
                if(chest[i].enchant != undefined && chest[i].enchant.name != undefined){
                    itemHTML = itemHTML + `<button class="button" id="chest ${chest[i].displayName}" style="font-weight: normal; font-size: 11px; border-color:red; background-color:red; border-left-color:white; border-left-width:5px; border-left-style:solid;">${dname}</button>`;
                } else {
                    itemHTML = itemHTML + `<button class="button" id="chest ${chest[i].displayName}" style="font-weight: normal; font-size: 11px; border-color:red; background-color:red;">${dname}</button>`;
                }
            } else if(chest[i].itemType == `Wearable`){
                if(chest[i].enchant.name != undefined){
                    itemHTML = itemHTML + `<button class="button" id="chest ${chest[i].displayName}" style="font-weight: normal; font-size: 11px; border-color:#31c431; background-color:#31c431; border-left-color:white; border-left-width:5px; border-left-style:solid;">${dname}</button>`;
                } else {
                    itemHTML = itemHTML + `<button class="button" id="chest ${chest[i].displayName}" style="font-weight: normal; font-size: 11px; border-color:#31c431; background-color:#31c431;">${dname}</button>`;                }
            } else if(chest[i].itemType == `Inventory`){
                if(chest[i].enchant.name != undefined){
                    itemHTML = itemHTML + `<button class="button" id="chest ${chest[i].displayName}" style="font-weight: normal; font-size: 11px; border-color:#e2c322; background-color:#e2c322; border-left-color:white; border-left-width:5px; border-left-style:solid;">${dname}</button>`;
                } else {
                    itemHTML = itemHTML + `<button class="button" id="chest ${chest[i].displayName}" style="font-weight: normal; font-size: 11px; border-color:#e2c322; background-color:#e2c322;">${dname}</button>`;
                }
            } else if(chest[i].itemType == `Junk`){
                if(chest[i].enchant.name != undefined){
                    itemHTML = itemHTML + `<button class="button" id="chest ${chest[i].displayName}" style="font-weight: normal; font-size: 11px; border-color:gray; background-color:gray; border-left-color:white; border-left-width:5px; border-left-style:solid;">${dname}</button>`;
                } else {
                    itemHTML = itemHTML + `<button class="button" id="chest ${chest[i].displayName}" style="font-weight: normal; font-size: 11px; border-color:gray; background-color:gray;">${dname}</button>`;
                }
            } else if(chest[i].itemType == `Bronze`){
                 itemHTML = itemHTML + `<button class="button" id="chest ${chest[i].displayName}" style="font-weight: normal; font-size: 11px; border-color:#cd7f32; background-color:#cd7f32;">${dname}</button>`;
            } else if(chest[i].itemType == `Silver`){
                 itemHTML = itemHTML + `<button class="button" id="chest ${chest[i].displayName}" style="font-weight: normal; font-size: 11px; border-color:#c0c0c0; background-color:#c0c0c0;">${dname}</button>`;
            } else if(chest[i].itemType == `Gold`){
                 itemHTML = itemHTML + `<button class="button" id="chest ${chest[i].displayName}" style="font-weight: normal; font-size: 11px; border-color:#d8c250; background-color:#d8c250;">${dname}</button>`;
            }
        }
        chestinv.innerHTML = itemHTML;
        for (var i = 0; i < chest.length; i++) {
            let itm = chest[i];
            let index = i;
            if(itm.itemType == `Bronze`){
                document.getElementById(`chest ${itm.displayName}`).onclick = function(){ Bronze += itm.count; chest.splice(chest.indexOf(itm),1); updateChestInventory(chest, false); }
                continue;
            } else if(itm.itemType == `Silver`){
                document.getElementById(`chest ${itm.displayName}`).onclick = function(){ Silver += itm.count; chest.splice(chest.indexOf(itm),1); updateChestInventory(chest, false); }
                continue;
            } else if(itm.itemType == `Gold`){
                document.getElementById(`chest ${itm.displayName}`).onclick = function(){ Gold += itm.count; chest.splice(chest.indexOf(itm),1); updateChestInventory(chest, false); }
                continue;
            }
            document.getElementById(`chest ${itm.displayName}`).onclick = function(){ toggleItemInfo(itm); }
        }
    } else {

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
function moveTo(direction, oldRoom){
    let newRoom = getLocationInDirection(direction);

    Room = newRoom;
    updateDirections();
}
function getLocationInDirection(direction){
    let location = undefined;

    for (var i = 0; i < Room.directions.length; i++) {
        if(Room.directions[i].forward != undefined && direction == `forward`){
            location = getLocationByName(Room.directions[i].forward);
        } else if(Room.directions[i].backward != undefined && direction == `backward`){
            location = getLocationByName(Room.directions[i].backward);
        } else if(Room.directions[i].left != undefined && direction == `left`){
            location = getLocationByName(Room.directions[i].left);
        } else if(Room.directions[i].right != undefined && direction == `right`){
            location = getLocationByName(Room.directions[i].right);
        }
    }

    return location;
}
function getLocationByName(name){
    for (var i = 0; i < locations.length; i++) {
        if(locations[i].name == name){
            return locations[i];
        }
    }
    return location;
}
function updateDirections(){
    let dirsHTML = `<p>${Room.name} Locations</p>`;
    if(Room.directions == undefined){
        return;
    }

    for (var i = 0; i < Room.directions.length; i++) {
        let dirf = Room.directions[i].forward;
        let dirb = Room.directions[i].backward;
        let dirl = Room.directions[i].left;
        let dirr = Room.directions[i].right;
        if(dirf != undefined) dirsHTML = dirsHTML + `<button class="button" id="forward" style="margin-left: 0px; font-weight: normal; font-size: 14px; border-color:#63B1FF; background-color:#63B1FF; width: 300px;">${dirf}</button>`;//createHTMLButton( dirf, function(){ moveTo(`forward`, Room); }, "locations" );
        if(dirb != undefined) dirsHTML = dirsHTML + `<button class="button" id="backward" style="margin-left: 0px; font-weight: normal; font-size: 14px; border-color:#63B1FF; background-color:#63B1FF; width: 300px;">${dirb}</button>`;//createHTMLButton( dirb, function(){ moveTo(`backward`, Room); }, "locations" );
        if(dirl != undefined) dirsHTML = dirsHTML + `<button class="button" id="left" style="margin-left: 0px; font-weight: normal; font-size: 14px; border-color:#63B1FF; background-color:#63B1FF; width: 300px;">${dirl}</button>`;//createHTMLButton( dirl, function(){ moveTo(`left`, Room); }, "locations" );
        if(dirr != undefined) dirsHTML = dirsHTML + `<button class="button" id="right" style="margin-left: 0px; font-weight: normal; font-size: 14px; border-color:#63B1FF; background-color:#63B1FF; width: 300px;">${dirr}</button>`;//createHTMLButton( dirr, function(){ moveTo(`right`, Room); }, "locations" );
    }
    document.getElementById("locations").innerHTML = dirsHTML;
    if(document.getElementById("forward") != undefined){ document.getElementById("forward").onclick = function(){ moveTo(`forward`, Room)} }
    if(document.getElementById("backward") != undefined){ document.getElementById("backward").onclick = function(){ moveTo(`backward`, Room)} }
    if(document.getElementById("left") != undefined){ document.getElementById("left").onclick = function(){ moveTo(`left`, Room)} }
    if(document.getElementById("right") != undefined){ document.getElementById("right").onclick = function(){ moveTo(`right`, Room)} }
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
