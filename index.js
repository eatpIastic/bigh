/// <reference types="../CTAutocomplete" />

import PogObject from "../PogData";
import config from "./config";

// "Click the button on time!"

const S08PacketPlayerPosLook = Java.type("net.minecraft.network.play.server.S08PacketPlayerPosLook");
const C09PacketHeldItemChange = Java.type("net.minecraft.network.play.client.C09PacketHeldItemChange");
const S32PacketConfirmTransaction = Java.type("net.minecraft.network.play.server.S32PacketConfirmTransaction");

const PatcherConfig = Java.type("club.sk1er.patcher.config.PatcherConfig")
const getInventoryScale = () => PatcherConfig?.["class"] instanceof java.lang.Class ? PatcherConfig.inventoryScale : null
const fixedScales = [
    1, // Default -> Feature disabled
    0.5, // Small
    1, // Normal
    1.5, // 3
    2 // 4
]

const data = new PogObject("bigh", {
    leapX: Renderer.screen.getWidth() / 2,
    leapY: Renderer.screen.getHeight() / 2
}, "pos.json");

const moveGUI = new Gui();

let tick = 0;
let lastTP = 0;
let tickStr = "";
let tickStrW = 0;
let onLeap = false;
let leapIsRegistered = false;
let fakeTickRegistered = false;

const leaptimerDisplay = register("renderOverlay", () => {
    Renderer.drawString(tickStr, data.leapX - tickStrW, data.leapY);
}).unregister();

const leaptimerGuiDisplay = register("guiRender", () => {
    let patcherScale = getInventoryScale()
    let scale = patcherScale
    ? fixedScales[patcherScale]
    : 1
    Tessellator.pushMatrix();
    Renderer.scale(scale ?? 2)
    Tessellator.translate((data.leapX - tickStrW) / scale, data.leapY / scale, 1000);
    Renderer.drawString(tickStr, 0, 0);
    Tessellator.popMatrix();




    // Tessellator.pushMatrix();
    // Tessellator.translate(data.leapX - tickStrW, data.leapY, 1000);
    // Renderer.drawString(tickStr, 0, 0);
    // Tessellator.popMatrix();
}).unregister();

moveGUI.registerMouseDragged( (mx, my, b, t) => {
    data.leapX = mx;
    data.leapY = my;
});

moveGUI.registerDraw( () => {
    Renderer.drawString("20", data.leapX - (Renderer.getStringWidth("20") / 2), data.leapY);
});

moveGUI.registerClosed( () => {
    data.save();
});

register("packetReceived", () => {
    lastTP = tick;
}).setFilteredClass(S08PacketPlayerPosLook);

register("packetReceived", () => {
    tickStuff();

    if (fakeTickRegistered) {
        fakeTick.unregister();
        fakeTickRegistered = false;
    }
}).setFilteredClass(S32PacketConfirmTransaction);

const fakeTick = register("tick", () => {
    tickStuff();
}).unregister();

const tickStuff = () => {
    tick++;
    tickStr = `${20 - (tick - lastTP)}`;
    tickStrW = Renderer.getStringWidth(tickStr) / 2;

    if (tick - lastTP >= 20 && leapIsRegistered) {
        leaptimerDisplay.unregister();
        leaptimerGuiDisplay.unregister();
        leapIsRegistered = false;
    }
}

register("worldLoad", () => {
    fakeTick.register();
    fakeTickRegistered = true;
});

register("packetSent", (packet, event) => {
    if (!config.leaptimer) return;

    onLeap = Player.getInventory().getStackInSlot(packet.func_149614_c())?.getName()?.removeFormatting() == "Infinileap";
    if (onLeap && tick - lastTP <= 20) {
        leaptimerDisplay.register();
        leaptimerGuiDisplay.register();
        leapIsRegistered = true;
    }
}).setFilteredClass(C09PacketHeldItemChange);

register("command", (...args) => {
    if (!args?.[0]) {
        config.openGUI();
        return;
    }

    switch (args[0].toLowerCase()) {
        case "move":
            moveGUI.open();
            break;
    }
}).setName("bigh");