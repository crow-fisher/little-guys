# The Intergalactic Bank of Devin

This folder includes all "server" side components of the IBOD. 

## What is the 'IBOD'? 

Because everything is simulated in this game, we can directly form relationships between any pieces of data. 

In the context of the 'game', this really comes down to plants growing seeds.

When a plant is growing, it has some water saturation value, and some light level. These are (currently) the key factors that govern how well plants grow.

Then, consider the water saturation level of all of the roots of that plant. We know each of these - and, we know all the attributes that make that water level what it is. 

When you plot these data against each other, you'll see different clear pictures emerge. 

Some of these factors could be: 

* Plant Water Level (from organism)
* Could have data from each root assosicated soil square: 
    * Absolute water containment  
    * Soil water pressure 
    * Soil composition (sand, silt, clay)

We can also plot factors like growth light levels, and plot these data in 3D space. 

Obvious patterns should emerge based on the growth patterns of neighboring plants, and the movement of the sun and other light sources. 