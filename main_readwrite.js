function Save(){
    // Note: Saves items as a string, so make sure to change them back to a number or object
    localStorage.setItem(`Room`, JSON.stringify(Room));

    localStorage.setItem(`Level`, JSON.stringify(Level));
    localStorage.setItem(`Health`, JSON.stringify(Health));
    localStorage.setItem(`Experience`, JSON.stringify(Experience));

    localStorage.setItem(`Inventory`, JSON.stringify(Inventory));
    localStorage.setItem(`Bronze`, Bronze);
    localStorage.setItem(`Silver`, Silver);
    localStorage.setItem(`Gold`, Gold);
}
function Load(){
    Room = JSON.parse( localStorage.getItem(`Room`) );

    Level = Number( localStorage.getItem(`Level`) );
    Health = Number( localStorage.getItem(`Health`) );
    Experience = Number( localStorage.getItem(`Experience`) );

    Inventory = JSON.parse(localStorage.getItem(`Inventory`));
    Bronze = Number( localStorage.getItem(`Bronze`) );
    Silver = Number( localStorage.getItem(`Silver`) );
    Gold = Number( localStorage.getItem(`Gold`) );
}
