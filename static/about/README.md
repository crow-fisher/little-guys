# About `little guys`

`little guys` is not really a game. It's more like a place.

Some places can exist. Others can't, due to limitations of the current state of the engine. Others can't, and will never be able to exist, because the rules don't want them to.

Within those limitations, you can create and explore and play in any world you want, and do anything you want to do.
 
# A Detailed Explanation

`little guys` is a simulation game, written in Javascript. Everything is simulated, and real. 

The world starts with emptiness. Stars will load in shortly afterwards. And then, it's yours to fill.

## Core World Features 

### Soil and Rock

Soil is composed of three components: sand, silt, and clay. These represent different ranges of particle sizes. 

Note that the amount of water retained in soil is not linearly related to how plants will feel about it. Instead, this is modeled through **matric pressure**, which is derived based on the soil's water saturation and its composition. 

In short, sandy soils is bad at holding onto water, so it gets saturated with relatively less water than a clay-ey soil would need (to reach the same level of "wetness"). This is used both for waterflow between adjacent soils, and of course the waterflow interactions of plants with soils.

Water flows within soil at different speeds depending on its composition, where pure clay flows the slowest, and pure sand the fastest. 

Rock is like soil, except gravity doesn't apply to it, and waterflow is much much slower (equal to that of pure clay). 

Hue-shifted color variation is purely aesthetic for both materials. 

### Water

The long and short of how water flows is, "it flows like water". 

The waterflow algorithm follows a candidate-and-target algorithm, where:

1. Connected groups of water blocks are identified.
2. Based on these groups, the water pressure of each square is calculated. 
3. The lowest water pressure squares are identified as the 'candidate' squares. 
4. The open neighbors of the highest pressure squares are identified as 'target' locations.
5. 'candidate' squares are then moved to the 'target' locations.

This approach means water can flow upwards to equalize pressure, leading to more accurate water table simulations. 

### Light

Light is path-traced from light sources. Currently, this is simulated as a 2D plane. 

Each light source has some number of rays that divide the game space into slices. 

These slices are sorted in cartesian distance from the light source. Then, as light flows through each sequential block, it gets dimmer and dimmer.

Each light source also saves a reference to its' color function to each targeted square. 

### Wind

Currently, wind is simulated with a simple diffusion model. Effectively, high pressure flows to low pressure.

The net flow in and out of each square is used to compute the wind speed in that square. 

### Weather

Weather doesn't exist right now. It used to, but doesn't right now. Sorry. 

### Stars

Stars are loaded from external catalogues, such as Hipparcos, PASTEL, and Stellarium. 

Based on the stars' [B-V](https://en.wikipedia.org/wiki/Color_index), the approximate temperature of the star is determined. This is then used to calculate a color to display on-screen for each star.

Then, based on the star's relative magnitude, root distance,and the current distance to the camera, its brightness in lumens is determined.

This lumens value is then used to calculate the size and opacity of each rendered circular point. 

This is optimized by a chunking algorithm that sections stars into regions of space, and then buckets them by their luminance.

### `SunCalc`

[SunCalc](https://www.suncalc.org/) is used for calculating sunrise and sunset times. If the lighting model ever graduates to 3D, it will also be used for the position of the sun and moon in the sky. 

This runs off latitude and longitude. As long as it's set to your location, and the date and time lines up, sunrise and sunset in the game will line up with your sunrise and sunset. By default, Chicago's location is used. 

## Plants

### Basic Plant Mechanics

Currently, plants live based on two properties - their relative light level, and their moisture level. 

But really, that's a lie, because weather doesn't exist yet. So it's just light level. They used to care about water, but they don't right now, because it's inconvenient to have to manually water your plants so they don't die. 

Look, I'm about to rewrite a bunch of plant shit, okay? I'll update this section once `soup` is up and running. Don't worry about it. 

### The `soup` specification

This is a work in progress. 
