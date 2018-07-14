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
var inventorySlots = 10;

// System
function setup() {
    updateArrayItems();

    createHTMLButton("Max HP", function(){ Health = MaxHealth; }, "debug");
    createHTMLButton("Level Up", function(){ changeExperience(ExperienceToNext-Experience); }, "debug");
    createHTMLButton("+10% XP", function(){ changeExperience(Math.round(ExperienceToNext/10)); }, "debug");
    createHTMLButton("+1 Bronze", function(){ Bronze += 1; }, "debug");
    createHTMLButton("+1 Silver", function(){ Silver += 1; }, "debug");
    createHTMLButton("+1 Gold", function(){ Gold += 1; }, "debug");

    setInterval(function(){ if(roomMoveCooldown > 0){ roomMoveCooldown--; } },1000);
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
    if(document.getElementById(`a_health`).innerHTML != `<w>${getSmallNumberString(Health)}</w> / ${getSmallNumberString(MaxHealth)} HP`){ document.getElementById(`a_health`).innerHTML = `<w>${getSmallNumberString(Health)}</w> / ${getSmallNumberString(MaxHealth)} HP`; }
    if(document.getElementById(`a_experience`).innerHTML != `<w>${getSmallNumberString(Experience)}</w> / ${getSmallNumberString(ExperienceToNext)} XP`){ document.getElementById(`a_experience`).innerHTML = `<w>${getSmallNumberString(Experience)}</w> / ${getSmallNumberString(ExperienceToNext)} XP`; }

    if(document.getElementById(`bronze`).innerHTML != `<w>${Bronze}</w>b`){ document.getElementById(`bronze`).innerHTML = `<w>${Bronze}</w>b`; }
    if(document.getElementById(`silver`).innerHTML != `<w>${Silver}</w>s`){ document.getElementById(`silver`).innerHTML = `<w>${Silver}</w>s`; }
    if(document.getElementById(`gold`).innerHTML != `<w>${Gold}</w>g`){ document.getElementById(`gold`).innerHTML = `<w>${Gold}</w>g`; }

    if(document.getElementById(`bar`).style != `width: ${Math.round((Experience/ExperienceToNext)*318)}px`){ document.getElementById(`bar`).style = `width: ${Math.round((Experience/ExperienceToNext)*318)}px`; }

    if(document.getElementById(`actions`).style.display == `none` && (Room.loot.length > 0 || Room.shop != null || Room.inn != null)){
        updateActions();
    }
}

function updateArrayItems(){
    Discovered.push(continents[0],regions[0]);

    quests[0].rewards.push(getItemFromName(`Basic Leather`,`Shirt`));
    quests[0].rewards.push(getItemFromName(`Basic Leather`,`Leggings`));

    quests[1].rewards.push(getItemFromName(`Steel`,`Sword`));

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
            el_.onclick = function(){ toggleItemInfo(itm); };
        }
    } else {
        let invHTML = `<p>Inventory</p>`;
        inv.innerHTML = invHTML;
    }
}

// Quests
function updateQuests(){
    let quests_ = document.getElementById(`quests`);
    let questsHTML = `<p>Quests</p>`;
    quests_.innerHTML = questsHTML;
    if(ActiveQuests.length > 0){
        for (var i = 0; i < ActiveQuests.length; i++) {
            let q_ = document.createElement(`button`);
            let id = ActiveQuests[i].name;
            let aq = getQuestFromName(id);
            q_.className = `button`;
            q_.id = id;
            q_.innerHTML = `<span style="padding:4px; display:block;"><w>${id}</w> (${getQuestProgress(aq)}%)</span>`;
            q_.style.fontSize = `14px`;
            q_.style.fontWeight = `normal`;
            q_.style.width = `100%`;
            q_.style.marginLeft = `0px`;
            q_.onclick = function(){ toggleQuestDisplay(id); };
            quests_.appendChild(q_);
        }
    } else {
        let q_ = document.createElement(`button`);
        q_.className = `button`;
        q_.id = `not-a-quest`;
        q_.innerHTML = `You currently have no active quests.`;
        q_.style.fontSize = `14px`;
        q_.style.fontWeight = `normal`;
        q_.style.marginLeft = `0px`;
        q_.style.width = `100%`;
        quests_.appendChild(q_);
    }
}
function toggleQuestDisplay(id){
    let q = document.getElementById(id);
    let aq = getQuestFromName(id);

    q.innerHTML = `<span style="padding:4px; display:block;"><w>${id}</w> (${getQuestProgress(aq)}%)</span>`;

    if(q.style.height == `90px`){
        q.style.height = `auto`;
    } else if(aq != null){
        q.style.height = `90px`;
        let d_ = getQuestDescription(aq);
        let desc = `<span style="font-size:${Math.max(Math.round(14-(d_.length/15)),11)}px;">${d_}</span>`;
        q.innerHTML += `${desc}`;
    }
}
function getQuestFromName(name){
    for (var i = 0; i < ActiveQuests.length; i++) {
        if(ActiveQuests[i].name == name){
            return ActiveQuests[i];
        }
    }
    for (var i = 0; i < quests.length; i++) {
        if(quests[i].name == name){
            return quests[i];
        }
    }
    return null;
}
function addQuest(quest){
    if(ActiveQuests.indexOf(quest) > -1){
        return;
    }
    ActiveQuests.push(quest);
    updateQuests();
}
function isQuestComplete(quest){
    let p = getQuestProgress(quest);
    if(p > 99){
        return true;
    }
    return false;
}
function isQuestProgressChanged(quest){
    let p = getQuestProgress(quest);
    if(quest == null){
        return;
    }
    let prev_p = document.getElementById(quest.name).innerHTML.split(/(\d+)%/gmi)[1];
    if(prev_p != p){
        return true;
    }
    return false;
}
function getQuestProgress(quest){
    let qr = quest.requirements;
    let tasks_done = 0;
    let tasks_required = qr.length;

    for (var i = 0; i < qr.length; i++) {
        if(qr[i].reachLevel != null && Level >= qr[i].reachLevel){
            tasks_done++;
        }
        if(qr[i].discover != null && Discovered.indexOf(getLocationByName(qr[i].discover)) > -1){
            tasks_done++;
        }
    }
    //console.log(tasks_done,tasks_required,level_prog,level_required);
    return Math.min(Math.round((tasks_done/tasks_required)*100),100);
}
function getQuestDescription(quest){
    let qrq = quest.requirements;
    let desc = ``;
    if(qrq != null){
        desc += `Requirements: `;
        for (var i = 0; i < qrq.length; i++) {
            if(i > 0 && i < qrq.length-1){
               desc += `, `
            }
            if(qrq[i].reachLevel != null){
                desc += `Reach <w>Level ${qrq[i].reachLevel}</w>`;
            }
            if(qrq[i].discover != null){
                desc += `Discover <w>${getLocationByName(qrq[i].discover).displayName}</w>`;
            }
            if(i == qrq.length-2){
                desc += `, and `
            }
        }
    }
    return `${desc}.`;
}
function completeQuest(quest){
    for (var i = 0; i < quest.rewards.length; i++) {
        addItem(quest.rewards[i]);
    }
    if(quest.xp != null){ changeExperience(quest.xp); }

    ActiveQuests.splice(ActiveQuests.indexOf(quest),1);
    important(`<w>Quest Completed</w>: ${quest.name}.`);
    updateQuests();
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
    }
    if(Room.shop != null){
        let b = document.createElement(`button`);
        b.className = `button`;
        b.id = `buy`;
        b.innerHTML = `Buy (${Room.shop.name})`;
        actions.appendChild(b);
    }
    if(Room.inn != null){
        let b = document.createElement(`button`);
        b.className = `button`;
        b.id = `sleep`;
        b.innerHTML = `Sleep (${getCurrencyAmountString(Room.inn.bedPrice)})`;
        actions.appendChild(b);
    }

    if(actions.style.display == `none` && (Room.loot.length > 0 || Room.inn != null || Room.shop != null)){
        actions.style.display = `block`;
        if(Room.loot.length > 0){
            document.getElementById(`chest`).onclick = function(){
                toggleChestInventory(Room.loot, false);
            };
        }
        if(Room.shop != null){
            document.getElementById(`buy`).onclick = function(){
                toggleChestInventory(Room.shop.items, true);
            };
        }
        if(Room.inn != null){
            document.getElementById(`sleep`).onclick = function(){
                sleep();
            };
        }
    } else {
        actions.style.display = `none`;
    }

    if(chestinv.style.display == `block` && (Room.loot.length < 1 && Room.shop == null && Room.inn == null)){
        chestinv.style.display = `none`;
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
