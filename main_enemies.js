function Enemy(name, maxhealth, weapon){
    var me = this;
    this.name = name || `Bandit`;

    this.maxhealth = maxhealth || 30;
    this.health = this.maxhealth;

    this.weapon = weapon || getItemFromName(`Iron`,`Sword`);
    this.mindamage = this.weapon.minDamage;
    this.maxdamage = this.weapon.maxDamage;

    this.setLocation(Room);
    this.inventory = getRandomCurrency(0,Math.round(this.maxhealth * 2.5));
    this.inventory.push(this.weapon);

    setTimeout(function(){ setInterval(function(){ me.attack(); }, 5000); }, Math.round(Math.random() * 1000));
    updateActions();
}

Enemy.prototype.attack = function (){
    if(this.health < 1){
        this.clear
        return;
    }
    this.dealDamage( Math.round(getRandomFloat(this.mindamage, this.maxdamage)) );
};
Enemy.prototype.dealDamage = function (amount){
    if(Health - amount < 1){
        Health = 0;
        return;
    }
    Health -= amount;
    error(`<w>${this.name}</w> dealt <w>${amount}</w> damage to you.`);
    updateActions();
};

Enemy.prototype.setLocation = function (location){
    this.location = location || Room;
    Room.enemies.push(this);
};

function attack(enemy){
    let wep = Equipped[0];

    if(Room.enemies.length < 1){ error(`There are <w>no enemies</w> nearby!`); return; }
    if(wep == null){ error(`You do not have any weapon <w>equipped</w>!`); return; }

    if(attackCooldown < 1){
        attackCooldown = 5;
        dealDamage( Math.round(getRandomFloat(wep.minDamage, wep.maxDamage)), enemy );
    }
}
function dealDamage(amount, enemy){
    if(enemy.health - amount < 1){
        enemy.health = 0;
        Room.enemies.splice(Room.enemies.indexOf(enemy),1);

        info(`<w>${enemy.name}</w> died.`);
        changeExperience(Math.round(((enemy.maxhealth * 10) / MaxHealth) * 2.5));
        addChestItems(enemy.inventory, Room.loot);
        updateActions();
        return;
    }
    enemy.health -= amount;
    info(`You dealt <w>${amount}</w> damage to <w>${enemy.name}</w>.`);
    updateActions();
}
