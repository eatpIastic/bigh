import {
    @ButtonProperty,
    @CheckboxProperty,
    Color,
    @ColorProperty,
    @PercentSliderProperty,
    @SelectorProperty,
    @SwitchProperty,
    @TextProperty,
    @Vigilant,
} from "Vigilance";

@Vigilant("bigh", "§ebigh settings")
class Settings {
    @SwitchProperty({
        name: "norotate leap timer",
        description: "displays a timer when the guy happens",
    })
    leaptimer = true

    @ButtonProperty({
        name: "move leap timer",
        description: "move it. or do /bigh move"
    })
    action() {
        ChatLib.command(`bigh move`, true);
    }

    constructor() {
        this.initialize(this);
    }
}

export default new Settings();
