# The Soup Protocol

Soup is an array of floats, used to encode plant growth information.

The construction is based on array of floats, in range 0 to 1. 

A float is treated as a block of 17 numbers, like `0.10101010101010101`.

We call this a `tag`. 

The tag is comprised as follows: 

```js
// The maximum precision of a float in this range. 
`0.00000000000000000` // 17 decimal places

// Reserve the last 2 points for a tag type.
`0.000000000000000XX`

// A `tag type` is a number up to 64.
// A 'tag type' indicates what the tag is describing. 
// Use redundant tag types to indicate polarity. 

// The first four binary digits indicate the type.
// The last three digits are used up to the discretion of the tag type. 

// Some types: 
`1000000` // member 
`1001000` // member  (vec3)
`1010000` // member curve (vec3)
`1011000` // member offset (vec3)


/*

just thinking devin....

then...for actually setting up the growth nodes and stuff...we need 
to encode the: 
* height 
* width
* height 

of every individual square that grows. 

but maybe we should do this in blocks? how do we do this in blocks? 
like...maybe the "blocks" are just there because it feels like they're there? 

and how the *fuck* is color supposed to work? do we have a start color and end color?

we can reasonably encode hsv as 9 numbers. that leaves 6. 3 for height, 3 for width? 
then that's just a square? and we stack these on top of each other and just grow the fucker out? 

and then we'll have plants that grow from dna, so we can just fix the growth patterning from there. nice. i think that works 

*/

// E.g., the 'vec3' `01` tag may be: 
`0100000` // vec3, with all positive values 
`0100111` // vec3, with all negative values
`0100101` // vec3, with a negative X and Y value

```

Plants' DNA specifies encodes their specific construction, but not *necessarily* their exact growth pattern. Like, a bamboo grass in ideal and non-ideal conditions will grow eight nodes before reproducing, but those nodes may be smaller or larger depending on its' growth conditions.

The most basic unit of this life is a `plant`.

`plants` grow `members`, which are how individual elements of the plant are born. So, one grass `plant` may have three `memebers`, which are each a piece of grass coming out of the ground.


Various tag types are supported: 

**Key Identifier** 