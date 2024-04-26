/* eslint-disable @typescript-eslint/no-unused-vars */
import { ControllerManager } from "./js/controllerManager";

export class MyApp {
    public gpController = new ControllerManager();

    attaching() {
        this.gpController.init();
    }
}