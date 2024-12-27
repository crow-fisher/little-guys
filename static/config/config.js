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
    newSlider.min = config.value / 10;
    newSlider.max = config.value * 10;
    newSlider.step = config.value / 1000;
    newSlider.id = "slider_" + config.name;
    configSliders.appendChild(newSlider);
    var label = document.createElement("label");
    label.innerText = "slider_" + config.name + "\tvalue: " + config.value;
    label.htmlFor = "slider_" + config.name;
    configSliders.appendChild(label);
    configSliders.append(document.createElement("br"));
    newSlider.onchange = (e) => {
        config.value = parseFloat(e.target.value);
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

var airNutrientsPerEmptyNeighbor = {
    name: "airNutrientsPerEmptyNeighbor",
    value: 0.05
};

var dirtNutrientValuePerDirectNeighbor = {
    name: "dirtNutrientValuePerDirectNeighbor",
    value: 0.04
};

var noNutrientValuePerDirectNeighbor = {
    name: "noNutrientValuePerDirectNeighbor",
    value: 0
};

var base_waterContainmentMax = {
    name: "base_waterContainmentMax",
    value: 20
};  

var base_waterContainmentTransferRate = {
    name: "base_waterContainmentTransferRate",
    value: 5
};

var gravel_waterContainmentMax = {
    name: "gravel_waterContainmentMax",
    value: 25
};  

var gravel_waterContainmentTransferRate = {
    name: "gravel_waterContainmentTransferRate",
    value: 8
};

var sand_waterContainmentMax = {
    name: "sand_waterContainmentMax",
    value: 22
};  

var sand_waterContainmentTransferRate = {
    name: "sand_waterContainmentTransferRate",
    value: 6
};

var sand_nutrientValue = {
    name: "sand_nutrientValue",
    value: 0.01
}

var base_waterContainmentEvaporationRate = {
    name: "base_waterContainmentEvaporationRate",
    value: 0.0005
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
    value: 40
}

var drain_sq_waterTransferRate = {
    name: "drain_sq_waterTransferRate",
    value: 10
}

var wds_sq_waterContainmentMax = {
    name: "wds_sq_waterContainmentMax",
    value: 1000
};

var wds_sq_waterTransferRate = {
    name: "waterContainmentTransferRate",
    value: 50
};


var b_sq_darkeningStrength = {
    name: "b_sq_darkeningStrength",
    value: 0.5
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
    value: 0.5
};
var water_evaporationRate = {
    name: "water_evaporationRate",
    value: 0
};
var water_viscocity = {
    name: "water_viscocity",
    value: 0.6
};
var water_darkeningStrength = {
    name: "water_darkeningStrength",
    value: 0.3
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

var dirt_baseColorAmount = {
    name: "dirt_baseColorAmount",
    value: 10
};

var dirt_darkColorAmount = {
    name: "dirt_darkColorAmount",
    value: 370
};
var dirt_accentColorAmount = {
    name: "dirt_accentColorAmount",
    value: 5
};

var rock_baseColorAmount = {
    name: "rock_baseColorAmount",
    value: 10
};

var rock_darkColorAmount = {
    name: "rock_darkColorAmount",
    value: 370
};
var rock_accentColorAmount = {
    name: "rock_accentColorAmount",
    value: 5
};

var plant_initialWidth = {
    name: "plant_initialWidth",
    value: 0.338
};

var plant_deltaWidth = {
    name: "plant_deltaWidth",
    value: 0.003
};
addConfig(gravel_waterContainmentTransferRate);
addConfig(gravel_waterContainmentMax);


addConfig(plant_initialWidth);
addConfig(plant_deltaWidth);

addConfig(dirt_baseColorAmount);
addConfig(dirt_darkColorAmount);
addConfig(dirt_accentColorAmount);

addConfig(rock_baseColorAmount);
addConfig(rock_darkColorAmount);
addConfig(rock_accentColorAmount);

addConfig(global_plantToRealWaterConversionFactor);
addConfig(base_waterContainmentMax);
addConfig(b_sq_nutrientValue);
addConfig(static_sq_waterContainmentMax);
addConfig(static_sq_waterContainmentTransferRate);
addConfig(drain_sq_waterContainmentMax);
addConfig(drain_sq_waterTransferRate);
addConfig(wds_sq_waterContainmentMax);
addConfig(wds_sq_waterTransferRate);
addConfig(base_waterContainmentTransferRate);
addConfig(base_waterContainmentEvaporationRate);
addConfig(b_sq_darkeningStrength);
addConfig(dirtNutrientValuePerDirectNeighbor);
addConfig(rain_dropChance);
addConfig(heavyrain_dropChance);
addConfig(rain_dropHealth);
addConfig(water_evaporationRate);
addConfig(water_viscocity);
addConfig(water_darkeningStrength);
addConfig(po_perFrameCostFracPerSquare);
addConfig(po_greenSquareSizeExponentCost);
addConfig(po_rootSquareSizeExponentCost);
addConfig(airNutrientsPerEmptyNeighbor);
addConfig(p_seed_ls_sproutGrowthRate);
addConfig(p_seed_ls_neighborWaterContainmentRequiredToGrow);
addConfig(p_seed_ls_neighborWaterContainmentRequiredToDecay);
addConfig(p_seed_ls_darkeningStrength);


setInterval(displayConfigs, 1);


export {
    plant_initialWidth,
    plant_deltaWidth,
    dirt_baseColorAmount,
    dirt_darkColorAmount,
    dirt_accentColorAmount,
    rock_baseColorAmount,
    rock_darkColorAmount,
    rock_accentColorAmount,
    global_plantToRealWaterConversionFactor,
    base_waterContainmentMax,
    b_sq_nutrientValue,
    static_sq_waterContainmentMax,
    static_sq_waterContainmentTransferRate,
    drain_sq_waterContainmentMax,
    drain_sq_waterTransferRate,
    wds_sq_waterContainmentMax,
    wds_sq_waterTransferRate,
    base_waterContainmentTransferRate,
    base_waterContainmentEvaporationRate,
    b_sq_darkeningStrength,
    dirtNutrientValuePerDirectNeighbor,
    rain_dropChance,
    heavyrain_dropChance,
    rain_dropHealth,
    water_evaporationRate,
    water_viscocity,
    water_darkeningStrength,
    po_perFrameCostFracPerSquare,
    po_greenSquareSizeExponentCost,
    po_rootSquareSizeExponentCost,
    airNutrientsPerEmptyNeighbor,
    p_seed_ls_sproutGrowthRate,
    p_seed_ls_neighborWaterContainmentRequiredToGrow,
    p_seed_ls_neighborWaterContainmentRequiredToDecay,
    p_seed_ls_darkeningStrength,
    noNutrientValuePerDirectNeighbor,
    gravel_waterContainmentTransferRate,
    gravel_waterContainmentMax,
    sand_waterContainmentMax,
    sand_waterContainmentTransferRate,
    sand_nutrientValue

}