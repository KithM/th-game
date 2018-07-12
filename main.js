var w = window.innerWidth - 20;
var h = window.innerHeight - 60;

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

// LOCATION
var Room = {};

// MISC
var roomMoveCooldown = 0;
var inventorySlots = 10;

// System
function setup() {
    updateArrayItems();
    addItem(quests[0].items[0]);
    addItem(quests[0].items[1]);

    createHTMLButton("Max HP", function(){ Health = MaxHealth; }, "debug");
    createHTMLButton("Level Up", function(){ changeExperience(ExperienceToNext-Experience); }, "debug");
    createHTMLButton("+10% XP", function(){ changeExperience(Math.round(ExperienceToNext/10)); }, "debug");
    createHTMLButton("+1 Bronze", function(){ Bronze += 1; }, "debug");
    createHTMLButton("+1 Silver", function(){ Silver += 1; }, "debug");
    createHTMLButton("+1 Gold", function(){ Gold += 1; }, "debug");

    setInterval(function(){ if(roomMoveCooldown > 0){ roomMoveCooldown--; } },1000);

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
function canMove(dir){
    if(roomMoveCooldown < 1 && dir != null){
        roomMoveCooldown = 5;
        if(Level >= dir.region.level){
            return true;
        } else {
            error(`This area is unavailable. The minimum requirement is <w>Level ${dir.region.level}</w>.`);
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
    for (var i = 0; i < inventorySlots; i++) {
        if(Inventory.length > inventorySlots){
            if(Inventory[Inventory.length-1] != null){
                Room.loot.push(Inventory[Inventory.length-1]);
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
            el_.onclick = function(){ toggleItemInfo(itm); }
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

    important(`<big><w>Level Up!</w></big><br> You reached <w>Level ${Level}</w>! Your maximum health has been increased to <w>${getMaxHealth()}</w> and your health has been fully restored.`);
}
function changeExperience(amt){
    if(Experience + amt < 1){
        return;
    }
    Experience += amt;
    if(amt > 0){
        info(`You gained <w>${amt} XP</w>.`);
    } else if(amt < 0){
        error(`You lost <w>${-amt} XP</w>.`);
    }
}

// Direction
function moveTo(name){
    let newRoom = getLocationByName(name);

    if(canMove(newRoom) == false){
        return;
    }

    if(discovered.indexOf(newRoom) < 0){
        if(newRoom.city == true){
            changeExperience(Math.round(ExperienceToNext / 5)*(Level*Level));
        }
        if(discovered.indexOf(newRoom.region.continent) < 0){
            discovered.push(newRoom.region.continent);
            important(`<big><w>Continent Discovered</w></big><br><w>${newRoom.region.continent.name}</w> discovered.`);
        }
        if(discovered.indexOf(newRoom.region) < 0){
            discovered.push(newRoom.region);
            important(`<big><w>Region Discovered</w></big><br><w>${newRoom.region.name}, ${newRoom.region.continent.name}</w> discovered.`);
        }
        discovered.push(newRoom);
        info(`<w>${newRoom.displayName}, ${newRoom.region.name}</w> discovered.`);
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

    Room.directions.sort(function(a){ if(a.shop != null || a.inn != null || a.city != null){ return Room.directions.length-1; } return -1; });

    for (var i = 0; i < Room.directions.length; i++) {
        let dir = Room.directions[i];
        let loc = getLocationByName(dir);
        let n = getLocationByName(dir).displayName;
        if(dir != null){
            let b = document.createElement(`button`);
            b.innerHTML = n;//dir;
            if(discovered.indexOf(loc) < 0){
                b.innerHTML = `Undiscovered location`;
            }
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
