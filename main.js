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

// CURRENCY
var Bronze = 0;
var Silver = 0;
var Gold = 0;

// LOCATION
var Room = {};
var previousRoom = undefined;
var previousDirection = undefined;

// System
function setup() {
    updateQuestItems();
    addItem(quests[0].items[0]);
    addItem(quests[0].items[1]);

    createHTMLButton("Max HP", function(){ Health = MaxHealth; }, "debug");
    createHTMLButton("Level Up", function(){ Experience += ExperienceToNext-Experience; }, "debug");
    createHTMLButton("+10% XP", function(){ Experience += Math.round(ExperienceToNext/10); }, "debug");
    createHTMLButton("+1 Bronze", function(){ Bronze += 1; }, "debug");
    createHTMLButton("+1 Silver", function(){ Silver += 1; }, "debug");
    createHTMLButton("+1 Gold", function(){ Gold += 1; }, "debug");

    Room = getRandomLocation();
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
}
function drawDocument(){
    if(document.getElementById(`a_level`).innerHTML != `Level <w>${Level}</w>`){ document.getElementById(`a_level`).innerHTML = `Level <w>${Level}</w>`; }
    if(document.getElementById(`a_health`).innerHTML != `<w>${Health}</w> / ${MaxHealth} HP`){ document.getElementById(`a_health`).innerHTML = `<w>${Health}</w> / ${MaxHealth} HP`; }
    if(document.getElementById(`a_experience`).innerHTML != `<w>${Experience}</w> / ${ExperienceToNext} XP`){ document.getElementById(`a_experience`).innerHTML = `<w>${Experience}</w> / ${ExperienceToNext} XP`; }

    if(document.getElementById(`bronze`).innerHTML != `<w>${Bronze}</w>b`){ document.getElementById(`bronze`).innerHTML = `<w>${Bronze}</w>b`; }
    if(document.getElementById(`silver`).innerHTML != `<w>${Silver}</w>s`){ document.getElementById(`silver`).innerHTML = `<w>${Silver}</w>s`; }
    if(document.getElementById(`gold`).innerHTML != `<w>${Gold}</w>g`){ document.getElementById(`gold`).innerHTML = `<w>${Gold}</w>g`; }

    if(document.getElementById(`bar`).style != `width: ${Math.round((Experience/ExperienceToNext)*318)}px`){ document.getElementById(`bar`).style = `width: ${Math.round((Experience/ExperienceToNext)*318)}px`; }

    if(Room.loot.length > 0 && document.getElementById("actions").innerHTML !=
    `<p>Actions</p><button class="button" id="chest">Open Chest</button>`){

        document.getElementById("actions").innerHTML =
        `<p>Actions</p><button class="button" id="chest">Open Chest</button>`;
        document.getElementById("chest").onclick = function(){
            for (var i = 0; i < Room.loot.length; i++) {
                addItem(Room.loot[i]);
            }
            Room.loot = [];
            Bronze += Math.round(Math.random() * 50);
        }
    } else if (Room.loot.length < 1 && document.getElementById("actions").innerHTML != `<p>Actions</p>`){
        document.getElementById("actions").innerHTML = `<p>Actions</p>`;
    }

    if(Inventory.length > 0){
        let invHTML = `<p>Inventory</p>`;
        for (var i = 0; i < Inventory.length; i++) {
            if(Inventory[i].count < 1){
                removeItem(Inventory[i]);
                continue;
            }
            let itemHTML = ``;
            if(Inventory[i].itemType == `Weapon`){
                itemHTML = `<div class="item" id="${Inventory[i].displayName}"><span style="color:red;">${Inventory[i].displayName}</span></div>`;
            } else if(Inventory[i].itemType == `Wearable`){
                itemHTML = `<div class="item" id="${Inventory[i].displayName}"><span style="color:#31c431;">${Inventory[i].displayName}</span></div>`;
            } else if(Inventory[i].itemType == `Inventory`){
                itemHTML = `<div class="item" id="${Inventory[i].displayName}"><span style="color:#e2c322;">${Inventory[i].displayName}</span></div>`;
            } else {
                itemHTML = `<div class="item" id="${Inventory[i].displayName}"><span style="color:gray;">${Inventory[i].displayName}</span></div>`;
            }
            invHTML = invHTML + itemHTML;
        }
        if(document.getElementById("inventory").innerHTML != invHTML){
            document.getElementById("inventory").innerHTML = invHTML;
        }
    } else {
        if(document.getElementById("inventory").innerHTML != `<p>Inventory</p>`){
            document.getElementById("inventory").innerHTML = `<p>Inventory</p>`;
        }
    }

    $("div.item").hover(
    function(event) {
        // The mouse has entered the element, can reference the element via 'this'
        let item_name = this.innerHTML.split(/.+>(.+)<.+/gmi)[1];
        let item = Inventory.filter(function(i){ if(i.displayName == item_name){ return i; } });
        showItemInfo(item[0]);
    },
    function (event) {
        // The mouse has left the element, can reference the element via 'this'
        let item_name = this.innerHTML.split(/.+>(.+)<.+/gmi)[1];
        let item = Inventory.filter(function(i){ if(i.displayName == item_name){ return i; } });
        let displaying = document.getElementById("iteminfo").innerHTML.includes(item_name);
        if( (item[0].display == undefined && displaying == true) ){ hideItemInfo(); }
    });

    $("div.item").mousedown(
    function(event) {
        let item_name = this.innerHTML.split(/.+>(.+)<.+/gmi)[1];
        let item = Inventory.filter(function(i){ if(i.displayName == item_name){ return i; } });
        if(item[0].display == undefined){ item[0].display = true; }
        else if(item[0].display == true){ item[0].display = undefined; }
    },
    function(event) {
        let item_name = this.innerHTML.split(/.+>(.+)<.+/gmi)[1];
        let item = Inventory.filter(function(i){ if(i.displayName == item_name){ return i; } });
        if(item[0].display == undefined){ item[0].display = true; }
        else if(item[0].display == true){ item[0].display = undefined; }
    });
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
    //let avail_e = t.enchants.filter();

    if(avail_t.length < 1){ return getLevelLoot(level); }

    let t = getRandomFromProbability( avail_t, ranged );
    let e;
    e = getRandomFromProbability(t.enchants);

    if(l.minDamage == undefined){ l.minDamage = 0; }
    if(l.maxDamage == undefined){ l.maxDamage = 0; }
    if(e.minDamage == undefined){ e.minDamage = 0; }
    if(e.maxDamage == undefined){ e.maxDamage = 0; }

    if(l.minHeal == undefined){ l.minHeal = 0; }
    if(l.maxHeal == undefined){ l.maxHeal = 0; }
    if(e.minHeal == undefined){ e.minHeal = 0; }
    if(e.maxHeal == undefined){ e.maxHeal = 0; }

    if(l.armorRating == undefined){ l.armorRating = 0; }

    let mind = Math.round((l.minDamage * t.m) * level/4);
    let maxd = Math.round((l.maxDamage * t.m) * level/4);
    let minh = Math.round((l.minHeal * t.m) * level/4);
    let maxh = Math.round((l.maxHeal * t.m) * level/4);

    let emind = Math.round((e.minDamage * t.m) * level/4);
    let emaxd = Math.round((e.maxDamage * t.m) * level/4);
    let eminh = Math.round((e.minHeal * t.m) * level/4);
    let emaxh = Math.round((e.maxHeal * t.m) * level/4);

    let ar = Math.round((l.armorRating * t.m) * level/4);
    let it = l.itemType;

    let dname = `${t.name} ${l.name}`;
    if(e.name != undefined){ dname = dname + ` of ${e.name}`; }

    let item = { displayName: dname, level: level, count: 1, itemType: it };

    if(ar > 0){ item.armorRating = ar; }
    if(mind + emind > 0){ item.minDamage = mind + emind; }
    if(maxd + emaxd > 0){ item.maxDamage = maxd + emaxd; }
    if(minh + eminh > 0){ item.minHeal = minh + eminh; }
    if(maxh + emaxh > 0){ item.maxHeal = maxh + emaxh; }
    if(e.name != undefined){ item.enchant = e; }
    if(l != undefined){ item.baseItem = l; }
    if(t != undefined){ item.baseMaterial = t; }

    return item;
}
function getLootChest(amt, level){
    let arr = [];
    let amtwait = Math.round(amt * 1.1);

    for (var i = 0; i < amt; i++) {
        var l = getRandomLoot( getRandomFloat(Math.max(level - 5, 1), level + 3) );
        arr.push(l);
    }
    return arr;
}
function getLevelLootChest(){
    return getLootChest(Math.round(Math.random() * 5) + 1, Level);
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
function getRandomLocation(){
    let dirs = [];
    let dirs_r_num = Math.round(Math.random() * 5);

    if(dirs_r_num > 4){
        dirs_r_num = 4;
    }

    for (var i = 0; i < dirs_r_num; i++) {
        let d = getRandomFromArray(directions);
        if(dirs.includes(d) == false){
            dirs.push(d);
        }
    }

    if(dirs.length < 1){
        let d = getRandomFromArray(directions);
        if(dirs.includes(d) == false){
            dirs.push(d);
        }
    }
    return { directions: dirs, enemies: [], loot: [] };
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
            return;
        }
    }
}
function showItemInfo(item){
    var info = document.getElementById("iteminfo");
    if (info.style.display != "block") {
        info.style.display = "block";
        info.innerHTML = `
        <p>${item.displayName}</p>
        Type: <w>${applyUppercaseFirst(item.itemType)}</w><br>
        Level: <w>${item.level}</w>
        `;

        if(item.maxDamage != undefined && item.minDamage != undefined){
            info.innerHTML = info.innerHTML + `<br>Damage: <w>${item.minDamage}</w>-<w>${item.maxDamage}</w>`;
        }
        if(item.maxHeal != undefined && item.minHeal != undefined){
            info.innerHTML = info.innerHTML + `<br>Heals: <w>${item.minHeal}</w>-<w>${item.maxHeal}</w>`;
        }
        if(item.armorRating != undefined){
            info.innerHTML = info.innerHTML + `<br>Armor Rating: <w>${item.armorRating}</w>`;
        }
        info.innerHTML = info.innerHTML + `<br>Value: <w>${getCurrencyAmountString(getItemValue(item))}</w>`;
    }
}
function hideItemInfo(){
    var info = document.getElementById("iteminfo");
    if (info.innerHTML != ``) {
        info.style.display = "none";
        info.innerHTML = ``;
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
function updateQuestItems(){
    quests[0].items.push(getItemFromName(`Basic Leather`,`Shirt`));
    quests[0].items.push(getItemFromName(`Basic Leather`,`Leggings`));
}

// Inventory
function toggleInventory(){
    var inv = document.getElementById("inventory");
    if (inv.style.display === "none") {
        inv.style.display = "block";
        document.getElementById("toggleInventory").innerHTML = "Hide Inventory";
    } else {
        inv.style.display = "none";
        document.getElementById("toggleInventory").innerHTML = "Show Inventory";
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
    let newRoom = getRandomLocation();
    newRoom.direction = direction;

    let c = Math.round(Math.random() * 1);
    if(c == 1){ newRoom.loot = getLevelLootChest(); }

    if(direction == `South`){
        if(newRoom.directions.includes(`North`) == false){ newRoom.directions.push(`North`); }
    } else if(direction == `West`){
        if(newRoom.directions.includes(`East`) == false){ newRoom.directions.push(`East`); }
    } else if(direction == `North`){
        if(newRoom.directions.includes(`South`) == false){ newRoom.directions.push(`South`); }
    } else if(direction == `East`){
        if(newRoom.directions.includes(`West`) == false){ newRoom.directions.push(`West`); }
    }

    previousRoom = oldRoom;
    previousDirection = oldRoom.direction;

    Room = newRoom;
    updateDirections();
}
function updateDirections(){
    document.getElementById("locations").innerHTML = `<p>Locations</p>`;

    for (var i = 0; i < Room.directions.length; i++) {
        let dir = Room.directions[i];
        createHTMLButton( applyUppercaseFirst(dir), function(){ moveTo(dir, Room); }, "locations" );
    }
}
function getOppositeDirection(dir){
    if(dir == `North`){ return `South`; }
    if(dir == `East`){ return `West`; }
    if(dir == `South`){ return `North`; }
    if(dir == `West`){ return `East`; }
    return undefined;
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
