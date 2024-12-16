var configSliders = document.getElementById("configSliders");
var configOuptput = document.getElementById("configOutput");

var all_configs = [];
var displayConfigDirty = false;
var displayConfigText = "";

function addConfig(config) {
    all_configs.push(config);
    var newSlider = document.createElement("input");
    newSlider.type = "range";
    newSlider.class = "slider";
    newSlider.value = config.value;
    newSlider.min = config.value / 2;
    newSlider.max = config.value * 2;
    newSlider.step = config.value / 1000;
    newSlider.id = "slider_" + config.name;
    configSliders.appendChild(newSlider);
    var label = document.createElement("label");
    label.innerText = "slider_" + config.name + "\tvalue: " + config.value;
    label.htmlFor = "slider_" + config.name;
    configSliders.appendChild(label);
    configSliders.append(document.createElement("br"));
    newSlider.onchange = (e) => {
        config.value = e.target.value;
        displayConfigDirty = true;
        label.innerText = "slider_" + config.name + "\tvalue: " + e.target.value;
    };
}

function displayConfigs() {
    if (!displayConfigDirty) {
        return;
    }
    configOuptput.innerText = "";
    for (let i = 0; i < all_configs.length; i++) {
        var cfg = all_configs[i];
        configOuptput.innerText += "var " + cfg.name + "={\n\tname: \"" + cfg.name + "\",\n\tvalue: " + cfg.value + "\n};\n";
    }
    displayConfigDirty = false;
}


var b_sq_waterContainmentMax = {
    name: "b_sq_waterContainmentMax",
    value: 0.2
};
var b_sq_nutrientValue = {
    name: "b_sq_nutrientValue",
    value: 0
};
var static_sq_waterContainmentMax = {
    name: "static_sq_waterContainmentMax",
    value: 0.0
}
var static_sq_waterContainmentTransferRate = {
    name: "static_sq_waterContainmentTransferRate",
    value: 0
}

var drain_sq_waterContainmentMax = {
    name: "drain_sq_waterContainmentMax",
    value: 1.01
}

var drain_sq_waterTransferRate = {
    name: "drain_sq_waterTransferRate",
    value: 0.5
}

var wds_sq_waterContainmentMax = {
    name: "wds_sq_waterContainmentMax",
    value: 2
};

var wds_sq_waterContainmentTransferRate = {
    name: "waterContainmentTransferRate",
    value: 0.15
};

var b_sq_waterContainmentTransferRate = {
    name: "b_sq_waterContainmentTransferRate",
    value: 0.15
};
var b_sq_waterContainmentEvaporationRate = {
    name: "b_sq_waterContainmentEvaporationRate",
    value: 0.000005
};
var b_sq_darkeningStrength = {
    name: "b_sq_darkeningStrength",
    value: 0.3
};
var d_sq_nutrientValue = {
    name: "d_sq_nutrientValue",
    value: 0.1
};
var rain_dropChance = {
    name: "rain_dropChance",
    value: 0.001
};
var heavyrain_dropChance = {
    name: "heavyrain_dropChance",
    value: 0.02
};
var rain_dropHealth = {
    name: "rain_dropHealth",
    value: 0.05
};
var water_evaporationRate = {
    name: "water_evaporationRate",
    value: 0
};
var water_viscocity = {
    name: "water_viscocity",
    value: 0.3
};
var water_darkeningStrength = {
    name: "water_darkeningStrength",
    value: 0.3
};
var po_airSuckFrac = {
    name: "po_airSuckFrac",
    value: 0.2
};
var po_waterSuckFrac = {
    name: "po_waterSuckFrac",
    value: 0.2
};
var po_rootSuckFrac = {
    name: "po_rootSuckFrac",
    value: 0.2
};
var po_perFrameCostFracPerSquare = {
    name: "po_perFrameCostFracPerSquare",
    value: 0.0002
};
var po_greenSquareSizeExponentCost = {
    name: "po_greenSquareSizeExponentCost",
    value: 1.5
};
var po_rootSquareSizeExponentCost = {
    name: "po_rootSquareSizeExponentCost",
    value: 1.5
};
var p_ls_airNutrientsPerExposedNeighborTick = {
    name: "p_ls_airNutrientsPerExposedNeighborTick",
    value: 0.05
};
var p_seed_ls_sproutGrowthRate = {
    name: "p_seed_ls_sproutGrowthRate",
    value: 0.01
};
var p_seed_ls_neighborWaterContainmentRequiredToGrow = {
    name: "p_seed_ls_neighborWaterContainmentRequiredToGrow",
    value: 0.3
};
var p_seed_ls_neighborWaterContainmentRequiredToDecay = {
    name: "p_seed_ls_neighborWaterContainmentRequiredToDecay",
    value: 0.05
};
var p_seed_ls_darkeningStrength = {
    name: "p_seed_ls_darkeningStrength",
    value: 0.3
};
var global_plantToRealWaterConversionFactor = {
    name: "global_plantToRealWaterConversionFactor",
    value: 20
}

addConfig(global_plantToRealWaterConversionFactor);
addConfig(b_sq_waterContainmentMax);
addConfig(b_sq_nutrientValue);
addConfig(static_sq_waterContainmentMax);
addConfig(static_sq_waterContainmentTransferRate);
addConfig(drain_sq_waterContainmentMax);
addConfig(drain_sq_waterTransferRate);
addConfig(wds_sq_waterContainmentMax);
addConfig(wds_sq_waterContainmentTransferRate);
addConfig(b_sq_waterContainmentTransferRate);
addConfig(b_sq_waterContainmentEvaporationRate);
addConfig(b_sq_darkeningStrength);
addConfig(d_sq_nutrientValue);
addConfig(rain_dropChance);
addConfig(heavyrain_dropChance);
addConfig(rain_dropHealth);
addConfig(water_evaporationRate);
addConfig(water_viscocity);
addConfig(water_darkeningStrength);
addConfig(po_airSuckFrac);
addConfig(po_waterSuckFrac);
addConfig(po_rootSuckFrac);
addConfig(po_perFrameCostFracPerSquare);
addConfig(po_greenSquareSizeExponentCost);
addConfig(po_rootSquareSizeExponentCost);
addConfig(p_ls_airNutrientsPerExposedNeighborTick);
addConfig(p_seed_ls_sproutGrowthRate);
addConfig(p_seed_ls_neighborWaterContainmentRequiredToGrow);
addConfig(p_seed_ls_neighborWaterContainmentRequiredToDecay);
addConfig(p_seed_ls_darkeningStrength);


setInterval(displayConfigs, 1);


export {
global_plantToRealWaterConversionFactor,
b_sq_waterContainmentMax,
b_sq_nutrientValue,
static_sq_waterContainmentMax,
static_sq_waterContainmentTransferRate,
drain_sq_waterContainmentMax,
drain_sq_waterTransferRate,
wds_sq_waterContainmentMax,
wds_sq_waterContainmentTransferRate,
b_sq_waterContainmentTransferRate,
b_sq_waterContainmentEvaporationRate,
b_sq_darkeningStrength,
d_sq_nutrientValue,
rain_dropChance,
heavyrain_dropChance,
rain_dropHealth,
water_evaporationRate,
water_viscocity,
water_darkeningStrength,
po_airSuckFrac,
po_waterSuckFrac,
po_rootSuckFrac,
po_perFrameCostFracPerSquare,
po_greenSquareSizeExponentCost,
po_rootSquareSizeExponentCost,
p_ls_airNutrientsPerExposedNeighborTick,
p_seed_ls_sproutGrowthRate,
p_seed_ls_neighborWaterContainmentRequiredToGrow,
p_seed_ls_neighborWaterContainmentRequiredToDecay,
p_seed_ls_darkeningStrength
}