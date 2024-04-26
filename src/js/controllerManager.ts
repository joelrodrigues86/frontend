/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/*
 * Gamepad API Test
 * Written in 2013 by Ted Mielczarek <ted@mielczarek.org>
 *
 * To the extent possible under law, the author(s) have dedicated all copyright and related and neighboring rights to this software to the public domain worldwide. This software is distributed without any warranty.
 *
 * You should have received a copy of the CC0 Public Domain Dedication along with this software. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
 */

import { WebApi } from "../services/api";

interface GameController extends Gamepad {
    isInUse: boolean;
}

export class ControllerManager {
    public gamepadHasEvents: boolean = false;
    public gamepadHasWebkitEvents: boolean = false;

    //Controllers registered in the system
    public systemControllers: GameController[] = [];
    //Active controllers
    public controllers: GameController[] = [];


//axes
//        (4)[-0.00831616693369952, -0.019974059662775545, 0.00019836728465705278, -0.019760433356221796]

//buttons
//    (17)[GamepadButton, GamepadButton, GamepadButton, GamepadButton, GamepadButton, GamepadButton, GamepadButton, GamepadButton, GamepadButton, GamepadButton, GamepadButton, GamepadButton, GamepadButton, GamepadButton, GamepadButton, GamepadButton, GamepadButton]

//connected
//true

//id
//:
//        "Controlador de jogos compatível com HID (STANDARD GAMEPAD Vendor: 045e Product: 0b13)"

//index
//    0

//mapping
//    "standard"

//timestamp
//    39816.20000000112

//vibrationActuator
//GamepadHapticActuator { type: 'dual-rumble' }

    init() {
        //INIT
        this.gamepadHasEvents = 'GamepadEvent' in window;
        this.gamepadHasWebkitEvents = 'WebKitGamepadEvent' in window;

        if (this.gamepadHasEvents) {
            window.addEventListener("gamepadconnected", function (e) { this.onControllerConnected(e); }.bind(this), false);
            window.addEventListener("gamepaddisconnected", function (e) { this.onControllerDisconnected(e); }.bind(this), false);
        } else if (this.gamepadHasWebkitEvents) {
            window.addEventListener("webkitgamepadconnected", function (e) { this.onControllerConnected(e); }.bind(this), false);
            window.addEventListener("webkitgamepaddisconnected", function (e) { this.onControllerDisconnected(e); }.bind(this), false);
        } else {
            setInterval(this.scanControllers, 500);
        }
    }

    //Event handlers
    onControllerConnected(controller: GameController) {
        console.log(`Controller '${controller.id}' connected!`);
        this.scanControllers();
    }
    onControllerDisconnected(controller: GameController) {
        console.log(`Controller '${controller.id}' disconnected!`);
        this.scanControllers();
    }


    //Add / Remove
    scanControllers() {
        this.systemControllers = navigator.getGamepads ? navigator.getGamepads() : (navigator['webkitGetGamepads'] ? navigator['webkitGetGamepads']() : []);
        this.controllers = navigator.getGamepads ? navigator.getGamepads() : (navigator['webkitGetGamepads'] ? navigator['webkitGetGamepads']() : []);
        this.controllers = this.controllers.filter(x => x != null && x.connected);
        console.log(`${this.controllers.filter(x => x.connected).length} controllers connected!`);

        this.controllers.forEach(c => this.handleControllerInput(c));
    }

    handleControllerInput(controller: GameController) {
        if (controller.isInUse) return;
        //this.scanGamepads();
        while (controller.connected) {
            controller.isInUse = true;

            const api = new WebApi();
            return api.post("Rc", controller.buttons)
                .then((data) => {
                    console.log(data); // JSON data parsed by `data.json()` call
                });

            for (let i = 0; i < controller.buttons.length; i++) {
                const button = controller.buttons[i];
                let buttonValue = button.value;
                let pressed = button.value == 1.0;
                let touched = false;
                if (typeof (button) == "object") {
                    pressed = button.pressed;
                    if ('touched' in button) {
                        touched = button.touched;
                    }
                    buttonValue = button.value;
                }
                const pct = Math.round(buttonValue * 100) + "%";
                console.log(`Button ${i} pressed with ${pct} value`);
            }

            for (let i = 0; i < controller.axes.length; i++) {
                console.log(controller.axes[i]);
                console.log(`Axis ${i} pressed with ${controller.axes[i]} value`);
            } 
        }
    }
}