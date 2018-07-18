function Save(){
    // Note: Saves items as a string, so make sure to change them back to a number or object
    localStorage.clear();

    localStorage.setItem(`ActiveQuests`, JSON.stringify(ActiveQuests));
    localStorage.setItem(`Discovered`, JSON.stringify(Discovered));
    localStorage.setItem(`Room`, JSON.stringify(Room));

    localStorage.setItem(`Level`, JSON.stringify(Level));
    localStorage.setItem(`Health`, JSON.stringify(Health));
    localStorage.setItem(`MaxHealth`, JSON.stringify(MaxHealth));
    localStorage.setItem(`Experience`, JSON.stringify(Experience));
    localStorage.setItem(`ExperienceToNext`, JSON.stringify(ExperienceToNext));

    localStorage.setItem(`inventorySlots`, JSON.stringify(inventorySlots));
    localStorage.setItem(`Inventory`, JSON.stringify(Inventory));
    localStorage.setItem(`Bronze`, Bronze);
    localStorage.setItem(`Silver`, Silver);
    localStorage.setItem(`Gold`, Gold);
}
function Load(){
    // TODO
    ActiveQuests = JSON.parse( localStorage.getItem(`ActiveQuests`) );
    Discovered = JSON.parse( localStorage.getItem(`Discovered`) );
    Room = JSON.parse( localStorage.getItem(`Room`) );

    Level = Number( localStorage.getItem(`Level`) );
    MaxHealth = Number( localStorage.getItem(`MaxHealth`) );
    Health = Number( localStorage.getItem(`Health`) );
    ExperienceToNext = Number( localStorage.getItem(`ExperienceToNext`) );
    Experience = Number( localStorage.getItem(`Experience`) );

    inventorySlots = Number( localStorage.getItem(`inventorySlots`) );
    Inventory = Array(inventorySlots).fill(null);
    _inv = JSON.parse(localStorage.getItem(`Inventory`));
    for (var i = 0; i < _inv.length; i++) {
        if(_inv[i] == null){
            continue;
        }
        addItem(_inv[i]);
    }

    Bronze = Number( localStorage.getItem(`Bronze`) );
    Silver = Number( localStorage.getItem(`Silver`) );
    Gold = Number( localStorage.getItem(`Gold`) );
}
