// ATTRIBUTES
var Level = 1;
var MaxHealth = getMaxHealth();
var Health = MaxHealth;
var Experience = 0;
var ExperienceToNext = getExperienceToNext();

// ITEMS
var Inventory = Array(10).fill(null);
var Equipped = Array(8).fill(null);

// CURRENCY
var Bronze = 0;
var Silver = 0;
var Gold = 0;

// LOCATIONS
var Room = {};
var Discovered = [];
var ActiveQuests = [];

// MISC
var roomMoveCooldown = 0;
var attackCooldown = 0;
var inventorySlots = 10;

// System
function setup() {
    createCanvas(0,0);
    updateArrayItems();

    createHTMLButton("Max HP", function(){ Health = MaxHealth; }, "debug");
    createHTMLButton("Level Up", function(){ changeExperience(ExperienceToNext-Experience); }, "debug");
    createHTMLButton("+1 Bronze", function(){ Bronze += 1; }, "debug");
    createHTMLButton("+1 Silver", function(){ Silver += 1; }, "debug");
    createHTMLButton("+1 Gold", function(){ Gold += 1; }, "debug");
    createHTMLButton("Freemove", function(){ canMove = function(){ return true; }; }, "debug");

    setInterval(function(){ if(roomMoveCooldown > 0){ roomMoveCooldown--; } },1000);
    setInterval(function(){ if(attackCooldown > 0){ attackCooldown--; info(`This turn ends in <w>${attackCooldown}s</w>.`); } },1000);
    setInterval(function(){ if( Room.enemies.length < 1 && (Health / MaxHealth < 0.75) ){ changeHealth(Math.round(MaxHealth / 25)); } },5000);
    setInterval(function(){
        if(ActiveQuests.length > 0){
            for (var i = 0; i < ActiveQuests.length; i++) {
                if(isQuestComplete(ActiveQuests[i])){ completeQuest(ActiveQuests[i]); }
                if(isQuestProgressChanged(ActiveQuests[i])){ updateQuests(); }
            }
        }
    },1000);

    addQuest(quests[0]);
    moveTo(locations[1].name);
    updateDirections();
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
    if(document.getElementById(`a_health`).innerHTML != `<w>${getSmallNumberString(Health)}</w> / ${getSmallNumberString(MaxHealth)} HP`){ document.getElementById(`a_health`).innerHTML = `<w>${getSmallNumberString(Health)}</w> / ${getSmallNumberString(MaxHealth)} HP`; }
    if(document.getElementById(`a_experience`).innerHTML != `<w>${getSmallNumberString(Experience)}</w> / ${getSmallNumberString(ExperienceToNext)} XP`){ document.getElementById(`a_experience`).innerHTML = `<w>${getSmallNumberString(Experience)}</w> / ${getSmallNumberString(ExperienceToNext)} XP`; }

    if(document.getElementById(`bronze`).innerHTML != `<w>${Bronze}</w>b`){ document.getElementById(`bronze`).innerHTML = `<w>${Bronze}</w>b`; }
    if(document.getElementById(`silver`).innerHTML != `<w>${Silver}</w>s`){ document.getElementById(`silver`).innerHTML = `<w>${Silver}</w>s`; }
    if(document.getElementById(`gold`).innerHTML != `<w>${Gold}</w>g`){ document.getElementById(`gold`).innerHTML = `<w>${Gold}</w>g`; }

    if(document.getElementById(`bar`).style != `width: ${Math.round((Experience/ExperienceToNext)*318)}px`){ document.getElementById(`bar`).style = `width: ${Math.round((Experience/ExperienceToNext)*318)}px`; }

    if(document.getElementById(`actions`).style.display == `none` && ( Room.loot.length > 0 || Room.shop != null || Room.inn != null || Room.enemies.length > 0 )){
        updateActions();
    }
}

function createHTMLButton(name, e, parent){
    let b = document.createElement("button");

    b.className = "button";
    b.id = name;
    b.innerHTML = name;
    b.onclick = e;

    document.getElementById(parent).appendChild(b);
}

function updateArrayItems(){
    Discovered.push(continents[0],regions[0]);

    addItem(getItemFromName(`Wood`,`Sword`));
    addItem(getItemFromName(`Basic Leather`,`Shirt`));
    addItem(getItemFromName(`Basic Leather`,`Leggings`));
    equipItem(Inventory[0],0);
    equipItem(Inventory[1],3);
    equipItem(Inventory[2],5);

    addChestItems([
        getItemFromName(`Leather`,`Chestpiece`),
        getItemFromName(`Leather`,`Leggings`)
    ], getQuestFromName(`A New Journey`).rewards);

    addChestItems([getItemFromName(`Steel`,`Sword`,`Grasp`)], getQuestFromName(`Ironworks`).rewards);

    addChestItems(getRandomCurrency(0,125), getLocationByName(`PTW`).loot);
    addChestItems([
        getItemFromName(`Leather`,`Boots`),
        getLevelLoot(),
        getLevelLoot(),
        getLevelLoot()
    ], getLocationByName(`PTW`).loot);

    addChestItems([
        getItemFromName(`Basic Leather`,`Shoes`),
        getItemFromName(`Basic Leather`,`Shirt`),
        getItemFromName(`Basic Leather`,`Jacket`),
        getItemFromName(`Basic Leather`,`Leggings`),
        getItemFromName(`Basic Leather`,`Gauntlets`),
        getItemFromName(`Iron`,`Sword`),
        getItemFromName(`Iron`,`Axe`),
        getItemFromName(`Steel`,`Sword`),
        getItemFromName(`Cloth`,`Small Sack`),
        getLevelLoot(),
        getLevelLoot(),
        getLevelLoot(),
        getLevelLoot()
    ], getLocationByName(`WLC`).shop.items);

    addChestItems(getRandomCurrency(0,35), getLocationByName(`TRLF`).loot);

    addChestItems([getItemFromName(`Cloth`,`Rag`)], getLocationByName(`WTDI`).shop.items);

    for (var i = 0; i < locations.length; i++) {
        if(locations[i].loot.length > 0){ locations[i].loot = removeDuplicates(locations[i].loot, `displayName`); }
        if(locations[i].shop != null){ locations[i].shop.items = removeDuplicates(locations[i].shop.items, `displayName`); }
    }
}

// Checks
function canMove(dir){
    if(Room.enemies != null && Room.enemies.length > 0){
        error(`This area is unavailable. There are still <w>${Room.enemies.length} enemies</w> nearby.`);
        return false;
    }
    if(roomMoveCooldown < 1 && dir != null){
        roomMoveCooldown = 5;
        if(Level >= dir.region.level && Level >= dir.region.continent.level){
            return true;
        } else if(Level >= dir.region.continent.level){
            error(`This area is unavailable. The minimum required level for this region is <w>Level ${dir.region.level}</w>.`);
        } else {
            error(`This area is unavailable. The minimum required level for this continent is <w>Level ${dir.region.continent.level}</w>.`);
        }
    } else if(roomMoveCooldown > 0){
        error(`You cannot move to this area yet. Please wait <w>${roomMoveCooldown}s</w>.`);
    } else if(dir == null){
        error(`This area is unavailable.`);
    }
    return false;
}
function isSellable(item){
    if(isInInventory(item) && Room.shop != null){ return true; }
    return false;
}
function isBuyable(item){
    if(Room.shop != null && Room.shop.items.indexOf(item) > -1){ return true; }
    return false;
}
function isEquippable(item){
    if(isInInventory(item) && item.itemType != `Junk` && item.itemType != `Material`){ return true; }
    return false;
}
function isInInventory(item){
    for (var i = 0; i < Inventory.length; i++) {
        if(Inventory[i] == null){
            continue;
        }
        if(Inventory[i] == item){
            return true;
        }
    }
    return false;
}
function isInChest(chest,item){
    for (var i = 0; i < chest.length; i++) {
        if(chest[i] == null){
            continue;
        }
        if(chest[i].displayName == item.displayName){
            return true;
        }
    }
    return false;
}
function getFromChest(chest,item){
    for (var i = 0; i < chest.length; i++) {
        if(chest[i] == null){
            continue;
        }
        if(chest[i].displayName == item.displayName){
            return chest[i];
        }
    }
    return null;
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

    if(our_total < item_total){
        error(`You do not have enough to sleep here.`);
        return;
    }

    our_total -= item_total;
    Health = MaxHealth;
    setCurrencyToTotal(our_total);
    info(`Your health has been fully restored.`);
}

// Inventory
function toggleInventory(){
    var inv = document.getElementById("inventory");
    var invbutton = document.getElementById("toggleInventory");
    if (inv.style.display == "none") {
        inv.style.display = "block";
        invbutton.innerHTML = "Hide";
        updateInventory();
    } else {
        inv.style.display = "none";
        invbutton.innerHTML = "Show";
    }
}
function toggleChestInventory(chest, isStore){
    var chestinv = document.getElementById("chestinv");
    if(chestinv.style.display == "none"){
        chestinv.style.display = "block";
        //chest = removeDuplicates(chest, `displayName`);
        updateChestInventory(chest, isStore);
    } else {
        chestinv.style.display = "none";
        chestinv.innerHTML = ``;
    }
    updateActions();
}
function updateChestInventory(chest, isStore){
    var chestinv = document.getElementById("chestinv");
    if(chestinv.style.display == `block` && (Room.shop != null || Room.loot.length > 0)){
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
                button.style.borderColor = `#d0382d`;
                button.style.backgroundColor = `#d0382d`;
            } else if(chest[i].itemType == `Wearable`){
                button.style.borderColor = `#25b72b`;
                button.style.backgroundColor = `#25b72b`;
            } else if(chest[i].itemType == `Inventory`){
                button.style.borderColor = `#e2c322`;
                button.style.backgroundColor = `#e2c322`;
            } else if(chest[i].itemType == `Junk`){
                button.style.borderColor = `gray`;
                button.style.backgroundColor = `gray`;
            } else if(chest[i].itemType == `Material`){
                button.style.borderColor = `#a55234`;
                button.style.backgroundColor = `#a55234`;
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
                el_.onclick = function(){ Bronze += itm.count; chest.splice(chest.indexOf(itm),1); updateChestInventory(chest, false); };
                continue;
            } else if(itm.itemType == `Silver`){
                el_.onclick = function(){ Silver += itm.count; chest.splice(chest.indexOf(itm),1); updateChestInventory(chest, false); };
                continue;
            } else if(itm.itemType == `Gold`){
                el_.onclick = function(){ Gold += itm.count; chest.splice(chest.indexOf(itm),1); updateChestInventory(chest, false); };
                continue;
            }
            el_.onclick = function(){ toggleItemInfo(itm); };
        }
    } else {
        chestinv.style.display = `none`;
        updateActions();
    }
}
function updateInventory(){
    var inv = document.getElementById(`inventory`);
    for (var i = 0; i < Inventory.length; i++) {
        if(Inventory.length > inventorySlots){
            if(Inventory[Inventory.length-1] != null){
                Room.loot.push(Inventory[Inventory.length-1]);
                if(isEquipped(Inventory[Inventory.length-1])){
                    unequipItem(Inventory[Inventory.length-1]);
                }
            }
            Inventory.splice(Inventory.length-1,1);
        } else if(Inventory.length < inventorySlots){
            Inventory.push(null);
        }
    }
    if(Inventory.length > 0){
        let invHTML = `<p>Inventory</p>`;
        inv.innerHTML = invHTML;
        for (var i = 0; i < Inventory.length; i++) {
            if(Inventory[i] == null){
                continue;
            }
            let dname = Inventory[i].displayName;
            if(isEquipped(Inventory[i])){
                dname = `<w>${Inventory[i].displayName}</w>`;
            }
            if(Inventory[i].count > 1){
                dname += ` (${Inventory[i].count})`;
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
                button.style.borderColor = `#d0382d`; //red //#9c27b0
                button.style.backgroundColor = `#d0382d`;
            } else if(Inventory[i].itemType == `Wearable`){
                button.style.borderColor = `#25b72b`;
                button.style.backgroundColor = `#25b72b`;
            } else if(Inventory[i].itemType == `Inventory`){
                button.style.borderColor = `#e2c322`;
                button.style.backgroundColor = `#e2c322`;
            } else if(Inventory[i].itemType == `Junk`){
                button.style.borderColor = `gray`;
                button.style.backgroundColor = `gray`;
            } else if(Inventory[i].itemType == `Material`){
                button.style.borderColor = `#a55234`;
                button.style.backgroundColor = `#a55234`;
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
            if(Inventory[i] == null){
                continue;
            }
            let itm = Inventory[i];
            let index = i;
            let el_ = document.getElementById(`${itm.displayName}`);
            el_.onclick = function(){ toggleItemInfo(itm); };
        }
    } else {
        let invHTML = `<p>Inventory</p>`;
        inv.innerHTML = invHTML;
    }
}

// Attributes
function levelUp(){
    if(getExperienceToNext() == Infinity){
        return;
    }
    Level ++;
    MaxHealth = getMaxHealth();
    Health = MaxHealth;

    ExperienceToNext = getExperienceToNext();
    updateAttributeValues();

    important(`<big><w>Level Up!</w></big><br>
        You reached
        <w><d>Level ${Level}</d></w>!
        Your maximum health has been increased to <w>${getMaxHealth()} ${(MaxHealth > getMaxHealth())?`(+${MaxHealth - getMaxHealth()})`:``}</w>
        and your health has been fully restored.`
    );
}
function changeExperience(amt){
    if(Experience + amt < 1 || amt == Infinity){
        return;
    }
    Experience += amt;
    if(amt > 0){
        info(`You gained <w>${amt} XP</w>.`);
    } else if(amt < 0){
        error(`You lost <w>${-amt} XP</w>.`);
    }
}
function changeHealth(amt){
    if(Health + amt > MaxHealth){
        amt = MaxHealth - Health;
    }
    Health += amt;
}

// Direction
function moveTo(name){
    let newRoom = getLocationByName(name);

    if(canMove(newRoom) == false){
        return;
    }

    if(Discovered.indexOf(newRoom) < 0){
        if(newRoom.city == true){
            changeExperience(Math.round((ExperienceToNext/15)/10)+10);
        }
        if(Discovered.indexOf(newRoom.region.continent) < 0){
            changeExperience( Math.round(((ExperienceToNext/5)/10)+45)-(Level/newRoom.region.continent.level) );
            Discovered.push(newRoom.region.continent);
            important(`<big><w>Continent Discovered</w></big><br><w>${newRoom.region.continent.name}</w> discovered.`);
        }
        if(Discovered.indexOf(newRoom.region) < 0){
            changeExperience( Math.round(((ExperienceToNext/10)/10)+25)-(Level/newRoom.region.level) );
            Discovered.push(newRoom.region);
            important(`<big><w>Region Discovered</w></big><br><w>${newRoom.region.name}, ${newRoom.region.continent.name}</w> discovered.`);
        }
        Discovered.push(newRoom);
        info(`<w>${newRoom.displayName}, ${newRoom.region.name}</w> discovered.`);
    }

    Room = newRoom;
    updateDirections();
    updateActions();
    spawnEnemy();
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

    Room.directions.sort(function(a){ if(a.shop != null || a.inn != null || a.city != null){ return Room.directions.length-1; } return -1; });

    for (var i = 0; i < Room.directions.length; i++) {
        let dir = Room.directions[i];
        let loc = getLocationByName(dir);
        let n = getLocationByName(dir).displayName;
        if(dir != null){
            let b = document.createElement(`button`);
            b.innerHTML = n;//dir;
            if(Discovered.indexOf(loc) < 0){
                b.innerHTML = `Undiscovered location`;
            }
            b.className = `button`;
            b.id = dir;
            b.style.marginLeft = `0px`;
            b.style.fontSize = `14px`;
            if(loc.city == true || loc.shop != null || loc.inn != null){
                let b_ = document.createElement(`div`);
                let s_ = document.createElement(`span`);
                b_.style.position = `absolute`;
                b_.style.color = `white`;
                b_.style.fontSize = `10px`;
                b_.style.transform = `rotateZ(45deg)`;

                b_.style.left = `8px`;
                b_.style.width = `25px`;
                b_.style.height = `25px`;
                b_.style.display = `inline`;

                s_.style.marginRight = `25px`;
                b.appendChild(s_);
                if(loc.city == true){ b_.innerHTML = `City`; } else if(loc.inn != null) { b_.innerHTML = `Inn`; } else if (loc.shop != null){ b_.innerHTML = `Shop`; }

                b.appendChild(b_);
                b.style.borderLeft = `25px solid #0d4c7d25`;
            }
            b.style.width = `300px`;
            el.appendChild(b);
        }
    }
    for (var i = 0; i < Room.directions.length; i++) {
        let dir_ = Room.directions[i];
        let el_ = document.getElementById(Room.directions[i]);
        if(el_ != null){
            el_.onclick = function(){ moveTo(dir_); };
        }
    }
}
function updateActions(){
    let actionsHTML = `<p>Actions</p>`;
    let actions = document.getElementById(`actions`);
    let chestinv = document.getElementById(`chestinv`);
    actions.innerHTML = actionsHTML;

    if(Room.loot.length > 0){
        let b = document.createElement(`button`);
        b.className = `button`;
        b.id = `chest`;
        if(chestinv.style.display == `block`){
            b.innerHTML = `Close Chest`;
        } else {
            b.innerHTML = `Open Chest`;
        }
        actions.appendChild(b);

        b.onclick = function(){
            toggleChestInventory(Room.loot, false);
        };
    }
    if(Room.shop != null){
        let b = document.createElement(`button`);
        b.className = `button`;
        b.id = `buy`;
        b.innerHTML = `Buy (${Room.shop.name})`;
        actions.appendChild(b);

        b.onclick = function(){
            toggleChestInventory(Room.shop.items, true);
        };
    }
    if(Room.inn != null){
        let b = document.createElement(`button`);
        b.className = `button`;
        b.id = `sleep`;
        b.innerHTML = `Sleep (${getCurrencyAmountString(Room.inn.bedPrice)})`;
        actions.appendChild(b);

        b.onclick = function(){
            sleep();
        };
    }
    if(Room.enemies != null && Room.enemies.length > 0){
        for (var i = 0; i < Room.enemies.length; i++) {
            let enemy = Room.enemies[i];
            let b = document.createElement(`button`);

            b.className = `button`;
            b.id = `attack${i}`;
            b.innerHTML = `Attack ${enemy.name} (${Math.round((enemy.health / enemy.maxhealth)*100)}%)`;
            actions.appendChild(b);

            b.onclick = function(){
                attack(enemy);
            };
        }
    }

    if(actions.style.display == `none` && ( Room.loot.length > 0 || Room.inn != null || Room.shop != null || Room.enemies.length > 0 )){
        actions.style.display = `block`;
    } else {
        actions.style.display = `none`;
    }

    if(chestinv.style.display == `block` && ( Room.loot.length < 1 && Room.shop == null && Room.inn == null && Room.enemies.length < 1 )){
        chestinv.style.display = `none`;
    }

    //console.log(actions.style.display,chestinv.style.display);
}

// Events
function info(text){
    displayMessage(text, `#0181ff`);
}
function error(text){
    displayMessage(text, `#ef3232`);
}
function important(text){
    displayMessage(text, `#efa616`, Math.round((text.length / 26)+10));//#efa616
}
function displayMessage(text, color, dur){
    let _info = document.getElementById(`info`);
    let index = _info.childNodes.length;
    dur = dur || Math.round((text.length / 26)+5);

    let _infotext = document.createElement(`info`);
    _infotext.id = `info${index}`;
    _infotext.style.backgroundColor = `${color}25`;
    _infotext.style.borderLeft = `solid 5px ${color}`;
    _infotext.style.color = `${color}`;
    _infotext.innerHTML = text;

    _info.appendChild(_infotext);
    _infotext.style.animation = `none`;
    _infotext.style.animation = `fadeInOut ${dur}s`;
    setTimeout(function(){ _info.removeChild(document.getElementById(`info${index}`)); }, (dur*600)+575+dur);
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
